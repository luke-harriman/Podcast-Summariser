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
from image_similarity_test import get_image, compare_images, find_similar_images
import whisper
import subprocess
import sys
import logging
import matplotlib.pyplot as plt
import random 

# Environment and model setup
HF_TOKEN = os.getenv('HF_TOKEN')
model_weights_save_path = "luke-harriman/chart_object_detection"
image_processor_save_path = model_weights_save_path

# Initialize models
model = DetrForObjectDetection.from_pretrained(model_weights_save_path, use_auth_token=HF_TOKEN)
model.eval()
image_processor = DetrImageProcessor.from_pretrained(image_processor_save_path, use_auth_token=HF_TOKEN)


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
        os.path.join(output_folder, f'frame_{random.randint(1, 10000)}_{random.randint(1, 10000)}_%04d.png')
    ]

    # os.path.join(output_folder, 'frame_%04d.png')

    subprocess.run(command, check=True)

    # Calculate timestamps based on interval
    # frame_files = sorted(os.listdir(output_folder))
    # frames = [(int(f.split('_')[1].split('.')[0]) * interval, os.path.join(output_folder, f)) for f in frame_files]
    # return frames

def process_frames(frame_data):
    """Process extracted frames to find specific objects (charts), and show these objects."""
    chart_details = []
    previous_images = []
    for timestamp, frame_path in frame_data:
        with Image.open(frame_path) as pil_image:
            inputs = image_processor(images=pil_image, return_tensors="pt")
            outputs = model(**inputs)
            target_sizes = torch.tensor([pil_image.size[::-1]])
            results = image_processor.post_process_object_detection(outputs, threshold=0.5, target_sizes=target_sizes)[0]
            for score, label, box in zip(results["scores"], results["labels"], results["boxes"]):
                if score.item() > 0.95 and label.item() == 1:  # Chart label assumed to be 1
                    cropped_image = pil_image.crop(box.tolist())
                    cropped_img_array = np.array(cropped_image.convert('RGB'))
                    # Compare with previously detected images to avoid duplicates
                    if not any(compare_images(prev_img_array, cropped_img_array) > 0.95 for prev_img_array in previous_images):
                        previous_images.append(cropped_img_array)
                        # Show the image
                        plt.imshow(cropped_image)
                        plt.title(f'Timestamp: {timestamp} seconds')
                        plt.show()

        garbage_collection(frame_path)

    return chart_details

def garbage_collection(file_path):
    if os.path.exists(file_path):
        os.remove(file_path)
        return file_path


if __name__ == '__main__':
    yt_url_list = [
        'https://www.youtube.com/watch?v=HKtlezdPNAI',
        'https://www.youtube.com/watch?v=FALlhXl6CmA',
        'https://www.youtube.com/watch?v=1AvqcRPMt5Y',
        'https://www.youtube.com/watch?v=6ydFDwv-n8w',
        'https://www.youtube.com/watch?v=KdmDtqB46Jc',
        'https://www.youtube.com/watch?v=GGlZIkT2WLA',
        'https://www.youtube.com/watch?v=oITaI2kDIFI',
        'https://www.youtube.com/watch?v=q9icMJ48z6U',
        'https://www.youtube.com/watch?v=erDE2e69dlc',
        'https://www.youtube.com/watch?v=QRZ_l7cVzzU',
        'https://www.youtube.com/watch?v=F9cO3-MLHOM',
        'https://www.youtube.com/watch?v=t6ETJjVNP4M',
        'https://www.youtube.com/watch?v=8HrzoEvLWH0'
    ]
    for index, yt_url in enumerate(yt_url_list):
        entire_video_path = download_video_and_audio(yt_url)
        print('Entire Video Path:', entire_video_path)
        video_path, audio_path = split_audio_video(entire_video_path)
        print('Video Path:', video_path)
        print('Audio Path:', audio_path)

        print('Processing Video for Charts')
        frame_generator = extract_frames(video_path, 10, './frames')
        garbage_collection(entire_video_path)
        garbage_collection(video_path)
        garbage_collection(audio_path)
        print(f'Processed Video {index + 1}')

