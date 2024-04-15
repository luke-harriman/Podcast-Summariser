from flask import Flask, request, render_template, send_from_directory
from stream_video import process_video
from transcribe_video import download_audio, transcribe_audio, garbage_collection
from openai import OpenAI
from structure_text import generate_topic_headers
from llm import apply_llm
from insert import insert_data
from config import config 
from transformers import DetrImageProcessor, AutoModelForObjectDetection
from yt_dlp import YoutubeDL
from PIL import Image, ImageDraw, ImageFont
import os
import cv2
import random
import numpy as np
import torch
import torch.nn.functional as F
import whisper
import json
import io
import uuid
import time
import subprocess
import math
import tempfile
import time
from dotenv import load_dotenv
from image_similarity import get_image, compare_images, find_similar_images


app = Flask(__name__)

# Ensure the output directary for screenshots and charts exists

with open('/Users/lukeh/Desktop/python_projects/youtube_scraper/yt_stream_endpoint/endpoint/finetuning/prompts/prompt_v4_shortened.txt', 'r') as prompt:
    prompt = prompt.read()

load_dotenv()
key = os.getenv('OPENAI_API_KEY')

client = OpenAI(
    api_key=key
)


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        start_time = time.time()
        yt_url = request.form.get('youtube_url')
        if yt_url:
            # Adjust process_video_stream to return the binary data for each frame and the frame number
            chart_details = process_video(yt_url, 10)  

            # audio_stream_process = capture_audio_stream(yt_url)
            # subtitles, word_timing = transcribe_audio(audio_stream_process)

            audio_file_path = download_audio(yt_url)
            try:
                subtitles, word_timing = transcribe_audio(audio_file_path)
            finally:
                deleted_file_path = garbage_collection(audio_file_path)

            structured_data = generate_topic_headers(subtitles, yt_url, word_timing)
            with open('./structured_data.json', 'w') as file:
                json.dump(structured_data, file, indent=4)

            llm_generated_data = apply_llm(structured_data)

            # Attach array of bytea binary images. llm_generated_data is a dictionary.
            for item in llm_generated_data:
                charts_in_chapter = []

                for chart in chart_details:
                    chapter_start = item['start_time']
                    chapter_end = item['end_time']
                    chart_timestamp = chart[0]
                    if chapter_start <= chart_timestamp <= chapter_end:
                        charts_in_chapter.append(chart[1])
                
                item['images'] = charts_in_chapter

            # Insert in postgres. 
            for item in llm_generated_data:
                insert_data(item)

            end_time = time.time()
            total_time = end_time - start_time
            return {"Status": f"Successfully loaded data into postgres. Process took {total_time}. Deleted audio file at {deleted_file_path}"}
if __name__ == "__main__":
    app.run(debug=True)