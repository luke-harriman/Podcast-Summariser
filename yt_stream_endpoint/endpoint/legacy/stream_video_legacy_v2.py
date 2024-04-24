import os
import cv2
from yt_dlp import YoutubeDL
from transformers import DetrImageProcessor, DetrForObjectDetection, AutoConfig
from io import BytesIO
from PIL import Image
import numpy as np
import torch
import io
import tempfile
import shutil
import uuid
import time
from image_similarity import get_image, compare_images, find_similar_images


hf_token = os.getenv('HF_TOKEN')

model_weights_save_path = "luke-harriman/chart_object_detection"
model = DetrForObjectDetection.from_pretrained(model_weights_save_path, use_auth_token=hf_token)
model.eval()

image_processor_save_path = "luke-harriman/chart_object_detection"
image_processor = DetrImageProcessor.from_pretrained(image_processor_save_path, use_auth_token=hf_token)

def image_to_byte(image: Image) -> bytes:
    """Function to convert a PIL Image to a byte array for Postgres."""
    imgByteArr = BytesIO()
    image.save(imgByteArr, format='PNG')
    imgByteArr.seek(0)
    return imgByteArr.getvalue()

def download_video(url):
    """Function to download a video from a given URL using youtube-dl. 
    'bestvideo' means it's pulling the best video quality with no audio as it's not needed. 
    Downloading without audio signifcantly decreases the size of the file.
    """
    ydl_opts = {'format': 'bestvideo', 'outtmpl': tempfile.mktemp(dir='/tmp', suffix='.mp4')}
    with YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(url, download=True)
    return info_dict['requested_downloads'][0]['filepath'], info_dict['duration']

def extract_frames(video_path, interval):
    """Generator function to extract frames from the video at a specified interval."""
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frames_to_skip = int(fps * interval)
    current_frame = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if current_frame % frames_to_skip == 0:
            timestamp = current_frame / fps
            yield timestamp, frame
        current_frame += 1
    cap.release()

def process_frames(frame_generator):
    """Function to process extracted frames to find specific objects (charts) one by one."""
    chart_details = []
    previous_images = []

    for timestamp, image in frame_generator:
        # Convert the frame to a PIL Image for processing
        pil_image = Image.fromarray(image)

        # Prepare the image for the DETR Model
        inputs = image_processor(images=pil_image, return_tensors="pt")
        
        # Generate predictions with the DETR Model
        outputs = model(**inputs)
        
        # Determine the size of the original image
        target_sizes = torch.tensor([pil_image.size[::-1]])
        
        # Post-process the outputs to obtain bounding boxes and labels
        results = image_processor.post_process_object_detection(outputs, threshold=0.5, target_sizes=target_sizes)[0]
        
        # Iterate through the detected objects and process them
        for score, label, box in zip(results["scores"], results["labels"], results["boxes"]):
            # Only consider detections with high confidence
            if score.item() > 0.95 and label.item() == 1:
                # Crop the image to the bounding box
                cropped_image = pil_image.crop(box.tolist())
                cropped_img_array = np.array(cropped_image.convert('RGB'))

                # Check if the cropped image is similar to any previously processed images
                is_duplicate = False
                for prev_img_array in previous_images:
                    if compare_images(prev_img_array, cropped_img_array) > 0.95:
                        is_duplicate = True
                        break
                # If it's not a duplicate, save the image and its timestamp
                if not is_duplicate:
                    previous_images.append(cropped_img_array)
                    image_bytes = image_to_byte(cropped_image)
                    chart_details.append([timestamp, image_bytes])
        
        # Once the frame has been processed and is no longer needed, delete it to save memory
        del image
    
    # Return the details of the charts found in the video
    return chart_details


def process_video(url, screenshot_interval):
    video_path, _ = download_video(url)
    frame_generator = extract_frames(video_path, screenshot_interval)
    charts_data = process_frames(frame_generator)
    os.remove(video_path)  # Garbage collection for the video file
    return charts_data

if __name__ == '__main__':
    start_time = time.time()
    url = 'https://www.youtube.com/watch?v=iZRbD7q1n-U'
    charts_data = process_video(url, 40)

    end_time = time.time() 
    total_time = end_time - start_time

    for index, (timestamp, img) in enumerate(charts_data):
        if isinstance(img, np.ndarray):
            img = Image.fromarray(img.astype('uint8'), 'RGB')
        filename = f"images/chart_{timestamp}_{uuid.uuid4()}.png"
        img.save(filename)
        print(f"Saved chart image {index + 1} at timestamp {timestamp} to {filename}")

    print(f'Total Time: {total_time}')

