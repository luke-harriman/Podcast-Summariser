from flask import Flask, request, render_template, send_from_directory
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
import time
import subprocess
import math 
from openai import OpenAI
from dotenv import load_dotenv


def find_first_element(array_of_arrays, value):
    """
    Searches through an array of arrays, looking to match the second element of any sub-array with a given value.
    If a match is found, it returns the first element of that sub-array. It returns None if no match is found.
    This function is build to search through the word_timings array, (i.e [timestamp, word_position]), to find the word position at a specific timestamp.
    """
    for sub_array in array_of_arrays:
        if sub_array[0] == value:
            return sub_array[1]
        elif value == 0:
            return 0
    return None

def generate_topic_headers(subtitles, yt_url, word_timing):
    """
    Analyzes video transcript and timings to generate structured topic headers.
    Each header encapsulates a section of the video, with start and end times, word positions, and a summary.
    """
    # Retrive video metadata
    file_contents_split = subtitles.split()
    result = subprocess.run(['yt-dlp', '--dump-single-json', '--', yt_url], capture_output=True, text=True)
    video_info = json.loads(result.stdout)
    structured_data = []

    # Use OpenAI's API to generate a concise summary of the video description
    load_dotenv()
    key = os.getenv('OPENAI_API_KEY')

    client = OpenAI(
        api_key=key
    )
    video_description = video_info.get('description')
    video_title = video_info.get('title')

    response = client.chat.completions.create(
    model = "gpt-4-turbo-preview",
    messages=[
        {"role": "system", "content": f"The input will be a podcast episode title and the corresponding description from the video. Your job is to respond with two things: outline who is in the podcast, including the hosts and guests, and write a clear, concise description of their background. Remove unnecessary words and phrases."},
        {"role": "user", "content": f"""Title: {video_title}, \n Description: {video_description} """},
        ]
    )
    video_description_summary = response.choices[0].message.content

    # Check if the video data contains chapters and that they are not empty
    if 'chapters' in video_info and video_info['chapters'] is not None:
        chapters = video_info['chapters']
        # Process each chapter found in the video data
        for chapter in chapters:
            # Convert chapter start and end times from string to integer
            start_time = int(chapter['start_time'])
            end_time = int(chapter['end_time'])

            # Round start time down and end time up to the nearest 10 seconds for alignment with word timings
            start_time_rnd = math.floor(start_time / 10) * 10
            end_time_rnd = math.ceil(end_time / 10) * 10

            # Locate the word position in the transcript corresponding to the rounded start and end times
            word_position_start = find_first_element(word_timing, start_time_rnd)
            word_position_end = find_first_element(word_timing, end_time_rnd)

            # If valid word positions are found, extract the corresponding text from the transcript
            if word_position_start is not None and word_position_end is not None:
                words = file_contents_split[word_position_start:word_position_end]
                text_data = ' '.join(words)
            # If an end word position isn't found, use the last word position available
            if word_position_start is not None and word_position_end is None:
                word_position_end = word_timing[-1][1]
                words = file_contents_split[word_position_start:word_position_end]
                text_data = ' '.join(words)
            
            # Retrieve and format the video's upload date
            upload_date = video_info.get('upload_date')
            if upload_date:
                year, month, day = upload_date[:4], upload_date[4:6], upload_date[6:]
                formatted_date = f"{year}-{month}-{day}"
            else:
                formatted_date = "Unknown"

            # Append structured chapter data to the list, including metadata and the extracted text
            structured_data.append({
                "release_date": formatted_date,
                "start_time": start_time, 
                "end_time": end_time,
                "word_position_start": word_position_start, 
                "word_position_end": word_position_end,
                "uploader": video_info.get('uploader'),
                "uploader_id": video_info.get('uploader_id'),
                "channel_id": video_info.get('channel_id'),
                "video_id": video_info.get('id'), 
                "video_title": video_title,
                "video_description_summary": video_description_summary,             
                "chapter": chapter['title'],
                "text_data": text_data
            })
    else:
        # Want summarises that are around 5-20 minutes or 300-1200 seconds. 
        duration = video_info['duration']
        half_duration = duration // 2   
        if half_duration < 600: 
            num_time_chunks = 1
        else:
            num_time_chunks = 2
            chunk_duration = duration // num_time_chunks
            while chunk_duration > 1200:
                chunk_duration = duration // num_time_chunks
                num_time_chunks += 1

        time_chunk_size = int(video_info['duration']) // num_time_chunks
        for i in range(num_time_chunks):
            start_time = int(i * time_chunk_size)
            end_time = int((start_time + time_chunk_size) if i < num_time_chunks - 1 else video_info['duration'])

            start_time_rnd = math.floor(start_time / 10) * 10
            end_time_rnd = math.ceil(end_time / 10) * 10

            # Attempt to find the starting and ending times for each chunk
            word_position_start = find_first_element(word_timing, start_time_rnd)
            word_position_end = find_first_element(word_timing, end_time_rnd)
            if start_time is None: 
                start_time = 0
            if end_time is None: 
                end_time = word_timing[-1][0]

            if word_position_start is not None and word_position_end is not None:
                words = file_contents_split[word_position_start:word_position_end]
                text_data = ' '.join(words)
            # If an end word position isn't found, use the last word position available
            if word_position_start is not None and word_position_end is None:
                word_position_end = word_timing[-1][1]
                words = file_contents_split[word_position_start:word_position_end]
                text_data = ' '.join(words)

            # Format upload date for each chunk
            upload_date = video_info.get('upload_date')
            if upload_date:
                year, month, day = upload_date[:4], upload_date[4:6], upload_date[6:]
                formatted_date = f"{year}-{month}-{day}"
            else:
                formatted_date = "Unknown"

            # Append structured data for each chunk to the list
            structured_data.append({
                "release_date": formatted_date,
                "start_time": start_time, 
                "end_time": end_time,
                "word_position_start": word_position_start, 
                "word_position_end": word_position_end,
                "uploader": video_info.get('uploader'),
                "uploader_id": video_info.get('uploader_id'),
                "channel_id": video_info.get('channel_id'),
                "video_id": video_info.get('id'), 
                "video_title": video_title,
                "video_description_summary": video_description_summary,             
                "chapter": "",
                "text_data": text_data
            })

    return structured_data

def save_to_json(data, file_path):
    """Saves the provided data into a JSON which is mainly used for testing and QA. """
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def save_word_timings_with_numpy(word_timings, file_path):
    """Saves the provided array into a numpy array which is mainly used for testing and QA. """
    np.save(file_path, np.array(word_timings))

def save_subtitles_to_txt(subtitles, file_path):
    """Saves the provided text into a .txt file which is mainly used for testing and QA. """
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(subtitles)
        
if __name__ == '__main__':
    yt_url = "https://www.youtube.com/watch?v=CVbCTkjpnPo"
    result = subprocess.run(['yt-dlp', '--dump-single-json', '--', yt_url], capture_output=True, text=True)
    video_info = json.loads(result.stdout)
    print(video_info['duration'])

