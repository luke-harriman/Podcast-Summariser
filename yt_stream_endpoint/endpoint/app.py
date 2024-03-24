from flask import Flask, request, render_template, send_from_directory
from stream_video import process_video_stream
from transcribe_video import capture_audio_stream, transcribe_audio
import os
import cv2
import random
from yt_dlp import YoutubeDL
from transformers import DetrImageProcessor, AutoModelForObjectDetection
from PIL import Image
import numpy as np
import torch
import whisper
import json
import torch.nn.functional as F

app = Flask(__name__)

# Ensure the output directory for screenshots and charts exists
output_dir = "./static/frames"
os.makedirs(output_dir, exist_ok=True)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        yt_url = request.form.get('youtube_url')
        if yt_url:
            # Assume process_video_stream saves charts in a folder inside 'static'
            process_video_stream(yt_url, 'static/frames', 10)  # Adjusted for example purposes

            audio_stream_process = capture_audio_stream(yt_url)
            subtitles, word_timing = transcribe_audio(audio_stream_process)
            
            # Assuming charts are saved in 'static/frames'
            charts_path = '/Users/lukeh/Desktop/python_projects/youtube_scraper/app/static/frames' 
            charts = [f for f in os.listdir('static/frames') if f.startswith('chart_0_')]
            print(charts)
            return render_template('results.html', subtitles=subtitles, word_timing=word_timing, charts=charts)
    return render_template('index.html')

@app.route('/outputs/<path:filename>')
def download_file(filename):
    return send_from_directory(output_dir, filename, as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True)


# https://www.youtube.com/watch?v=sVx1mJDeUjY
