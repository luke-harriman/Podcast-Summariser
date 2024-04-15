import os
import json
import cv2
import random
from yt_dlp import YoutubeDL
from transformers import DetrImageProcessor, AutoModelForObjectDetection, DetrForObjectDetection
from PIL import Image, ImageDraw, ImageFont
from PIL import Image
import numpy as np
import torch
import torch.nn.functional as F
import io
import uuid 

os.environ['PAFY_BACKEND'] = 'internal'

# Load the fine-tuned model and image processor. The test for this model is in test.py
model_weights_save_path = "/Users/lukeh/Desktop/python_projects/youtube_scraper/yt_stream_endpoint/model/model"
model = DetrForObjectDetection.from_pretrained(model_weights_save_path)
model.eval()

image_processor_save_path = "/Users/lukeh/Desktop/python_projects/youtube_scraper/yt_stream_endpoint/model/image_processor"
image_processor = DetrImageProcessor.from_pretrained(image_processor_save_path)

def get_random_timestamps(duration, num_screenshots=100):
    timestamps = sorted(random.sample(range(int(duration)), num_screenshots))
    return timestamps

def detect_and_save_charts(frame, timestamp, screenshot_index):
    """Detect charts in an image and save the raw binary data."""
    # Convert frame from numpy array to PIL Image
    image = Image.fromarray(frame)
    chart_details = []  # List to hold details of detected charts
    
    with torch.no_grad():
        inputs = image_processor(images=image, return_tensors="pt")
        outputs = model(**inputs)
        target_sizes = torch.tensor([image.size[::-1]])
        results = image_processor.post_process_object_detection(outputs, threshold=0.5, target_sizes=target_sizes)[0]
    
    for score, label, box in zip(results["scores"], results["labels"], results["boxes"]):
        if score.item() > 0.8 and label.item() == 1:  # Assuming label 1 is for charts
            box = box.tolist()
            x, y, x_w, y_w = box

            # Calculate the chart bounding box in pixel coordinates
            width, height = image.size
            x_min, x_max = max(0, x), min(width, x + x_w)
            y_min, y_max = max(0, y), min(height, y + y_w)

            cropped_image = image.crop((x_min, y_min, x_max, y_max))

            # Convert cropped image to bytes
            img_byte_arr = io.BytesIO()
            cropped_image.save(img_byte_arr, format='PNG')  # Save image to bytes array in PNG format
            img_byte_arr = img_byte_arr.getvalue()  # Get binary data
            
            chart_details.append([timestamp, img_byte_arr])
    
    return chart_details

def process_video_stream(url, screenshot_interval):
    ydl_opts = {
        'format': 'bestvideo',
        'simulate': True,
        'quiet': True,
        'skip_download': True,
    }

    charts_data = []  # This will hold the nested array of chart details

    with YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(url, download=False)
        video_url = info_dict.get("url", None)
        duration = info_dict.get("duration", None)

    if not video_url or duration is None:
        print("Failed to fetch video URL or duration.")
        return [] 


    cap = cv2.VideoCapture(video_url)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frames_to_skip = int(fps * screenshot_interval)

    captured_screenshots = 0
    current_frame = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if current_frame % frames_to_skip == 0:
            timestamp = current_frame / fps  # Calculate timestamp based on current_frame and fps

            chart_details = detect_and_save_charts(frame, timestamp, current_frame // frames_to_skip)
            if chart_details:
                charts_data.extend(chart_details)

            captured_screenshots += 1

        current_frame += 1

    cap.release()
    return charts_data

if __name__ == '__main__':
    chart_data_1 = process_video_stream('https://www.youtube.com/watch?v=QAAfDQx8DDQ', 10)
    # chart_data_2 = process_video_stream('https://www.youtube.com/watch?v=ck7Krz7QcxU', 10)

    all_chart_data = chart_data_1 # + chart_data_2

    # Directory where images will be saved
    output_dir = 'images/'

    # Ensure the output directory exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for index, chart in enumerate(all_chart_data):
        timestamp, binary_image = chart
        # Convert binary data back into an image
        image = Image.open(io.BytesIO(binary_image))
        
        # Generate a unique filename for each image
        filename = f"{output_dir}chart_{timestamp}_{uuid.uuid4()}.png"
        
        # Save the image to disk
        image.save(filename)
        
        # Optionally, display the image
        # image.show(title=str(timestamp))

        print(f"Saved chart image {index + 1} at timestamp {timestamp} to {filename}")


    # for chart in all_chart_data:
    #     timestamp, binary_image = chart
    #     # Convert binary data back into an image
    #     image = Image.open(io.BytesIO(binary_image))
    #     # Display the image
    #     image.show(title=str(timestamp))