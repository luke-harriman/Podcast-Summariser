import os
import cv2
from yt_dlp import YoutubeDL
from transformers import DetrImageProcessor, DetrForObjectDetection
from PIL import Image
import numpy as np
import torch
import io
import tempfile
import shutil
import uuid
import time
from image_similarity import get_image, compare_images, find_similar_images


os.environ['PAFY_BACKEND'] = 'internal'

model_weights_save_path = "/Users/lukeh/Desktop/python_projects/youtube_scraper/yt_stream_endpoint/model/model"
model = DetrForObjectDetection.from_pretrained(model_weights_save_path)
model.eval()

image_processor_save_path = "/Users/lukeh/Desktop/python_projects/youtube_scraper/yt_stream_endpoint/model/image_processor"
image_processor = DetrImageProcessor.from_pretrained(image_processor_save_path)

def download_video(url):
    ydl_opts = {'format': 'bestvideo', 'outtmpl': tempfile.mktemp(dir='/tmp', suffix='.mp4')}
    with YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(url, download=True)
    return info_dict['requested_downloads'][0]['filepath'], info_dict['duration']

def extract_frames(video_path, interval):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frames_to_skip = int(fps * interval)
    current_frame = 0
    timestamps = []
    images = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if current_frame % frames_to_skip == 0:
            timestamp = current_frame / fps
            timestamps.append(timestamp)
            images.append(frame)
        current_frame += 1
    cap.release()
    return timestamps, images

def process_frames(images, timestamps):
    chart_details = []
    previous_images = []  # Store numpy arrays of previous images for comparison
    for image, timestamp in zip(images, timestamps):
        pil_image = Image.fromarray(image)
        inputs = image_processor(images=pil_image, return_tensors="pt")
        outputs = model(**inputs)
        target_sizes = torch.tensor([pil_image.size[::-1]])
        results = image_processor.post_process_object_detection(outputs, threshold=0.5, target_sizes=target_sizes)[0]
        
        for score, label, box in zip(results["scores"], results["labels"], results["boxes"]):
            if score.item() > 0.95 and label.item() == 1:  # Assuming label 1 is for charts
                cropped_image = pil_image.crop(box.tolist())
                cropped_img_array = np.array(cropped_image.convert('RGB'))  # Convert to numpy array

                # Check for similarity with previous images
                is_duplicate = False
                for prev_img_array in previous_images:
                    if compare_images(prev_img_array, cropped_img_array) > 0.95:
                        is_duplicate = True
                        break
                if not is_duplicate:
                    previous_images.append(cropped_img_array)
                    chart_details.append([timestamp, cropped_image])
    return chart_details

def process_video(url, screenshot_interval):
    video_path, _ = download_video(url)
    timestamps, frames = extract_frames(video_path, screenshot_interval)
    charts_data = process_frames(frames, timestamps)
    os.remove(video_path)  # Cleanup downloaded video
    return charts_data

if __name__ == '__main__':
    start_time = time.time()
    url = 'https://www.youtube.com/watch?v=QAAfDQx8DDQ'
    charts_data = process_video(url, 10)

    # Here we ensure all processing is done before calculating end_time
    end_time = time.time()  # Define end_time immediately after the process
    total_time = end_time - start_time

    for index, (timestamp, img) in enumerate(charts_data):
        if isinstance(img, np.ndarray):  # Check if the image is a numpy array
            img = Image.fromarray(img.astype('uint8'), 'RGB')
        filename = f"images/chart_{timestamp}_{uuid.uuid4()}.png"
        img.save(filename)
        print(f"Saved chart image {index + 1} at timestamp {timestamp} to {filename}")

    print(f'Total Time: {total_time}')

