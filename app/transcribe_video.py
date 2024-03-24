import os
import json
import cv2
import random
from yt_dlp import YoutubeDL
from transformers import DetrImageProcessor, AutoModelForObjectDetection
from PIL import Image
import numpy as np
import torch
import torch.nn.functional as F
import subprocess
import whisper
import io
import tempfile

transcribe_model = whisper.load_model("base")


def get_direct_stream_url(video_url):
    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'simulate': True,
        'geturl': True,
    }
    
    with YoutubeDL(ydl_opts) as ydl:
        result = ydl.extract_info(video_url, download=False)
        if 'url' in result:
            return result['url']
    return None

def capture_audio_stream(video_url):
    direct_url = get_direct_stream_url(video_url)
    if not direct_url:
        print("Failed to obtain direct stream URL.")
        return None

    command = [
        'ffmpeg',
        '-i', direct_url,  # Use the direct stream URL
        '-f', 'wav',
        '-ar', '16000',
        'pipe:1'
    ]
    return subprocess.Popen(command, stdout=subprocess.PIPE)

def transcribe_audio(audio_stream_process):
    # Create an in-memory buffer to hold the audio data
    audio_buffer = io.BytesIO()

    # Read audio data from ffmpeg stdout and store it in the buffer
    while True:
        chunk = audio_stream_process.stdout.read(4096)
        if not chunk:
            break
        audio_buffer.write(chunk)

    # Move the buffer's pointer to the beginning so it can be read from the start
    audio_buffer.seek(0)

    # Since Whisper needs a file, write the buffer to a temp file
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as tmpfile:
        tmpfile.write(audio_buffer.getvalue())
        tmpfile.flush()

        # Load and use the Whisper model to transcribe the audio file
        model = whisper.load_model("base")
        result = model.transcribe(tmpfile.name)

        word_timing = []
        word_count = 0
        next_time_mark = 10  # Initialize the next time mark to check for

        # Check if 'segments' is in the result to ensure compatibility
        if 'segments' in result:
            for segment in result['segments']:
                start_time = segment['start']
                segment_word_count = len(segment['text'].split())
                # Check if the segment's start time is at or past the next time mark
                if start_time >= next_time_mark:
                    word_timing.append([word_count, next_time_mark])
                    # Update the next_time_mark to the next 10-second interval
                    # It assumes continuous speech; if there are long pauses, this might skip some 10-second marks
                    while next_time_mark <= start_time:
                        next_time_mark += 10
                word_count += segment_word_count

        return result["text"], word_timing