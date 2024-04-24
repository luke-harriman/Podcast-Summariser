import os
import cv2
from yt_dlp import YoutubeDL
from transformers import DetrImageProcessor, DetrForObjectDetection
from io import BytesIO
from PIL import Image
import numpy as np
import torch
import tempfile
import uuid
import time
from image_similarity import get_image, compare_images, find_similar_images
import whisper
import subprocess
import sys
import logging


# Environment and model setup
hf_token = os.getenv('HF_TOKEN')
model_weights_save_path = "luke-harriman/chart_object_detection"
image_processor_save_path = model_weights_save_path

# Initialize models
model = DetrForObjectDetection.from_pretrained(model_weights_save_path, use_auth_token=hf_token)
model.eval()
image_processor = DetrImageProcessor.from_pretrained(image_processor_save_path, use_auth_token=hf_token)


def download_video_and_audio(url, download_directory='.'):
    # Ensure the download directory exists
    os.makedirs(download_directory, exist_ok=True)

    combined_file_path = os.path.join(download_directory, 'combined_video_audio.webm')


    ydl_opts = {
        'format': 'bestvideo+bestaudio/best',  # Ensure you get the best video and audio available
        'quiet': True,
        'verbose': False,
        'noplaylist': True,
        'outtmpl': combined_file_path,  # Path for the combined video and audio file
        'socket_timeout': 600, 
        'retries': 10
    }

    # Download video and audio using yt-dlp
    with YoutubeDL(ydl_opts) as ydl:
        result = ydl.extract_info(url, download=True)
        print(result['requested_downloads'][0]['filepath'])
        return result['requested_downloads'][0]['filepath']
    
def split_audio_video(webm_path, output_directory='.'):
    video_path = os.path.join(output_directory, 'video.mp4')
    audio_path = os.path.join(output_directory, 'audio.webm')

    # Command to extract video
    video_command = [
        'ffmpeg', '-i', webm_path, '-c:v', 'copy', '-an', # Copy video codec, no audio
        video_path
    ]
    
    # Command to extract audio
    audio_command = [
        'ffmpeg', '-i', webm_path, '-vn', '-c:a', 'copy', # No video, copy audio codec
        audio_path
    ]
    
    try:
        # Execute video extraction
        subprocess.run(video_command, check=True)
        # Execute audio extraction
        subprocess.run(audio_command, check=True)
    except subprocess.CalledProcessError as e:
        print("An error occurred while splitting:", e)
        return None, None
    
    print(video_path)
    print(audio_path)

    return video_path, audio_path

def extract_frames(video_path, interval, output_folder):
    """Extract frames from video at a specified interval using FFmpeg, including timestamps."""
    os.makedirs(output_folder, exist_ok=True)
    command = [
        'ffmpeg',
        '-i', video_path,
        '-vf', f'fps=1/{interval}',  # Extracts one frame every 'interval' seconds
        '-q:v', '2',  # Set the quality of extracted frames
        os.path.join(output_folder, 'frame_%04d.png')
    ]
    subprocess.run(command, check=True)

    # Calculate timestamps based on interval
    frame_files = sorted(os.listdir(output_folder))
    frames = [(int(f.split('_')[1].split('.')[0]) * interval, os.path.join(output_folder, f)) for f in frame_files]
    return frames

def process_frames(frame_data):
    """Process extracted frames to find specific objects (charts) one by one, including timestamps."""
    chart_details = []
    previous_images = []
    for timestamp, frame_path in frame_data:
        with Image.open(frame_path) as pil_image:
            inputs = image_processor(images=pil_image, return_tensors="pt")
            outputs = model(**inputs)
            target_sizes = torch.tensor([pil_image.size[::-1]])
            results = image_processor.post_process_object_detection(outputs, threshold=0.5, target_sizes=target_sizes)[0]
            for score, label, box in zip(results["scores"], results["labels"], results["boxes"]):
                if score.item() > 0.95 and label.item() == 1:
                    cropped_image = pil_image.crop(box.tolist())
                    cropped_img_array = np.array(cropped_image.convert('RGB'))
                    if not any(compare_images(prev_img_array, cropped_img_array) > 0.95 for prev_img_array in previous_images):
                        previous_images.append(cropped_img_array)
                        chart_details.append([timestamp, image_to_byte(cropped_image)])

        garbage_collection(frame_path)

    return chart_details

def transcribe_audio(audio_file_path):
    """Transcribe audio to text using OpenAI's Whisper model."""
    model = whisper.load_model("base")
    result = model.transcribe(audio_file_path)
    word_timing = []
    word_count = 0
    next_time_mark = 10
    if 'segments' in result:
        for segment in result['segments']:
            start_time = segment['start']
            segment_word_count = len(segment['text'].split())
            word_count += segment_word_count
            while start_time >= next_time_mark:
                word_timing.append([next_time_mark, word_count])
                next_time_mark += 10
    return result["text"], word_timing

def image_to_byte(image):
    imgByteArr = BytesIO()
    image.save(imgByteArr, format='PNG')
    imgByteArr.seek(0)
    return imgByteArr.getvalue()

def garbage_collection(file_path):
    if os.path.exists(file_path):
        os.remove(file_path)
        return file_path


if __name__ == '__main__':
    yt_url = 'https://www.youtube.com/watch?v=CVbCTkjpnPo'
    entire_video_path = download_video_and_audio(yt_url)
    print('Entire Video Path:', entire_video_path)
    video_path, audio_path = split_audio_video(entire_video_path)
    print('Video Path:', video_path)
    print('Audio Path:', audio_path)

    print('Processing Video for Charts')
    frame_generator = extract_frames(video_path, 10)
    chart_details = process_frames(frame_generator)
    size_of_list = sys.getsizeof(chart_details)  # Size of list structure
    total_size = size_of_list + sum(sys.getsizeof(item) for item in chart_details)  # Total size including elements
    print("Size of list structure:", size_of_list, "bytes")
    print("Total size of list with elements:", total_size, "bytes")

