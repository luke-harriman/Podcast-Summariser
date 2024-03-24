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


os.environ['PAFY_BACKEND'] = 'internal'

# Load the fine-tuned model and image processor. The test for this model is in test.py
CHECKPOINT_DIR = '/Users/lukeh/Desktop/python_projects/youtube_scraper/model/tb_logs/my_model/version_2/checkpoints/epoch=49-step=200.ckpt'
num_labels = 1
model = DetrForObjectDetection.from_pretrained(
    'facebook/detr-resnet-50', 
    num_labels=num_labels,
    ignore_mismatched_sizes=True
)
checkpoint = torch.load(CHECKPOINT_DIR, map_location='cpu')
adjusted_state_dict = {key.replace("model.", ""): value for key, value in checkpoint['state_dict'].items()}
model.load_state_dict(adjusted_state_dict, strict=False)
model.eval()
image_processor = DetrImageProcessor.from_pretrained('facebook/detr-resnet-50')

def get_random_timestamps(duration, num_screenshots=100):
    timestamps = sorted(random.sample(range(int(duration)), num_screenshots))
    return timestamps

def detect_and_save_charts(frame, output_dir, screenshot_index):
    """Detect charts in an image and save the cropped chart images."""
    # Convert frame from numpy array to PIL Image
    image = Image.fromarray(frame)
    
    # Process the image through the model
    inputs = image_processor(images=image, return_tensors="pt").to(model.device)
    with torch.no_grad():
        outputs = model(**inputs)


    # Since there's no 'pred_logits', use 'logits' and 'pred_boxes' directly from the model's output
    scores = outputs.logits.squeeze(-1).softmax(-1)[:, :, 1]  # Assuming index 1 represents charts
    boxes = outputs.pred_boxes.squeeze(0).detach().cpu().numpy()

    # Threshold for determining chart detections
    detection_threshold = 0.51

    # Process each detection
    for i, (score, box) in enumerate(zip(scores.squeeze(0), boxes)):
        if score > detection_threshold:
            x_min, y_min, box_width, box_height = box
            x_max = x_min + box_width
            y_max = y_min + box_height

            x_min = max(0, np.floor(x_min * image.width).astype(int))
            y_min = max(0, np.floor(y_min * image.height).astype(int))
            x_max = min(image.width, np.ceil(x_max * image.width).astype(int))
            y_max = min(image.height, np.ceil(y_max * image.height).astype(int))

            cropped_image = image.crop((x_min, y_min, x_max, y_max))
            cropped_image_path = os.path.join(output_dir, f'chart_{screenshot_index}_{i}.png')
            cropped_image.save(cropped_image_path)
            print(f"Chart saved: {cropped_image_path}")

def process_video_stream(url, output_dir, screenshot_interval):
    ydl_opts = {
        'format': 'bestvideo',
        'simulate': True,
        'quiet': True,
        'skip_download': True,
    }
    
    with YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(url, download=False)
        video_url = info_dict.get("url", None)
        duration = info_dict.get("duration", None)
    
    if not video_url or duration is None:
        print("Failed to fetch video URL or duration.")
        return

    cap = cv2.VideoCapture(video_url)
    fps = cap.get(cv2.CAP_PROP_FPS)

    # Calculate the number of frames to skip to adhere to the screenshot_interval
    frames_to_skip = int(fps * screenshot_interval)

    captured_screenshots = 0
    current_frame = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Take a screenshot at the specified interval
        if current_frame % frames_to_skip == 0:
            # Save Frame
            frame_path = os.path.join(output_dir, f'frame_{current_frame // frames_to_skip}.png')
            cv2.imwrite(frame_path, frame)
            print(f"Frame saved: {frame_path}")

            # Save Object
            detect_and_save_charts(frame, output_dir, current_frame // frames_to_skip)
            captured_screenshots += 1

        current_frame += 1

    cap.release()
