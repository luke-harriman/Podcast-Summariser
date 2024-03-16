import os
os.environ['PAFY_BACKEND'] = 'internal'

import cv2
import random
from yt_dlp import YoutubeDL

def get_random_timestamps(duration, num_screenshots=100):
    """Generate 'num_screenshots' random timestamps within the video duration."""
    timestamps = sorted(random.sample(range(int(duration)), num_screenshots))
    return timestamps

def process_video_stream(url, output_dir='./random_images', num_screenshots=100):
    # Configure yt-dlp to fetch video information
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
    
    if not video_url:
        print("Failed to fetch video URL.")
        return

    # Open the video stream with OpenCV
    cap = cv2.VideoCapture(video_url)
    fps = cap.get(cv2.CAP_PROP_FPS)

    # Calculate frame numbers for screenshots based on random timestamps
    random_timestamps = get_random_timestamps(duration, num_screenshots)
    screenshot_frames = [int(ts * fps) for ts in random_timestamps]

    captured_screenshots = 0
    current_frame = 0
    while captured_screenshots < num_screenshots:
        ret, frame = cap.read()
        if not ret:
            break

        if current_frame in screenshot_frames:
            # Construct file path
            screenshot_path = os.path.join(output_dir, f'screenshot_{current_frame}.png')
            
            # Save the screenshot to a file
            cv2.imwrite(screenshot_path, frame)
            captured_screenshots += 1
            print(f'Screenshot saved: {screenshot_path}')
        
        current_frame += 1

    cap.release()

if __name__ == "__main__":
    youtube_url = "https://www.youtube.com/watch?v=OfHhFy4p0qw"
    wd = os.getcwd()
    output_dir = f"{wd}/random_images"
    process_video_stream(youtube_url, output_dir)
