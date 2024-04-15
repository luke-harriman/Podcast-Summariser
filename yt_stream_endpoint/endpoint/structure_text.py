from flask import Flask, request, render_template, send_from_directory
from stream_video import process_video
from transcribe_video import download_audio, transcribe_audio, garbage_collection
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
    Find the first sub-array in an array of arrays where the second element matches the value.
    Return the first element of that sub-array.

    :param array_of_arrays: Array of arrays to search through.
    :param value: Value to find.
    :return: The first element of the found sub-array or None if not found.
    """
    for sub_array in array_of_arrays:
        if sub_array[0] == value:
            return sub_array[1]
        elif value == 0:
            return 0
    return None

def generate_topic_headers(subtitles, yt_url, word_timing):
    """
    Generate structured data from YouTube video subtitles. The data is structured into
    topic headers with associated time frames, word positions, and text content. If no chapters
    are found, the subtitles are divided into 12 equal chunks.

    :param subtitles: The transcribed subtitles as a string.
    :param yt_url: The YouTube video link.
    :param word_timing: An array of word timings.
    :return: A list of lists, each containing [[start time, end time], [starting word position, ending word position], [structured_text]].
    """
    # Retrive metadata
    file_contents_split = subtitles.split()
    result = subprocess.run(['yt-dlp', '--dump-single-json', '--', yt_url], capture_output=True, text=True)
    video_info = json.loads(result.stdout)
    structured_data = []

    # LLM
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

    # Structure Text
    if 'chapters' in video_info and video_info['chapters'] is not None:
        chapters = video_info['chapters']
        for chapter in chapters:
            start_time = int(chapter['start_time'])
            end_time = int(chapter['end_time']) # Minus 10 to add a buffer between the different in end times from metadata and word timings. 

            start_time_rnd = math.floor(start_time / 10) * 10
            end_time_rnd = math.ceil(end_time / 10) * 10

            word_position_start = find_first_element(word_timing, start_time_rnd)
            word_position_end = find_first_element(word_timing, end_time_rnd)

            if word_position_start is not None and word_position_end is not None:
                words = file_contents_split[word_position_start:word_position_end]
                text_data = ' '.join(words)
            if word_position_start is not None and word_position_end is None:
                word_position_end = word_timing[-1][1]
                words = file_contents_split[word_position_start:word_position_end]
                text_data = ' '.join(words)
            
            upload_date = video_info.get('upload_date')

            if upload_date:
                year, month, day = upload_date[:4], upload_date[4:6], upload_date[6:]
                formatted_date = f"{year}-{month}-{day}"
            else:
                formatted_date = "Unknown"

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
        # Divide subtitles into 12 chunks
        num_chunks = 12
        chunk_size = len(file_contents_split) // num_chunks
        for i in range(num_chunks):
            start_idx = int(i * chunk_size)
            end_idx = int((start_idx + chunk_size) if i < num_chunks - 1 else len(file_contents_split))

            start_time = find_first_element(word_timing, start_idx)
            end_time = find_first_element(word_timing, end_idx)
            if start_time is None: start_time = 0
            if end_time is None: end_time = word_timing[-1][0]

            text_data = ' '.join(file_contents_split[start_idx:end_idx])

            upload_date = video_info.get('upload_date')

            if upload_date:
                year, month, day = upload_date[:4], upload_date[4:6], upload_date[6:]
                formatted_date = f"{year}-{month}-{day}"
            else:
                formatted_date = "Unknown"

            structured_data.append({
                "release_date": formatted_date,
                "start_time": start_time, 
                "end_time": end_time,
                "word_position_start": start_idx, 
                "word_position_end": end_idx,
                "uploader": video_info.get('uploader'),
                "uploader_id": video_info.get('uploader_id'),
                "channel_id": video_info.get('channel_id'),
                "video_id": video_info.get('id'), 
                "video_title": video_title,
                "video_description_summary": video_description_summary,             
                "chapter": "",
                "text_data": text_data
            })

    # file_path = '/Users/lukeh/Desktop/python_projects/youtube_scraper/yt_stream_endpoint/endpoint/example_data.json'
    # save_to_json(structured_data, file_path)

    return structured_data

def save_to_json(data, file_path):
    """
    Save the given data to a JSON file.

    :param data: The data to save.
    :param file_path: The path of the file where the data should be saved.
    """
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def save_word_timings_with_numpy(word_timings, file_path):
    np.save(file_path, np.array(word_timings))

def save_subtitles_to_txt(subtitles, file_path):
    """
    Save the given subtitles to a text file.

    :param subtitles: The subtitles text to save.
    :param file_path: The path of the text file where the subtitles should be saved.
    """
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(subtitles)

if __name__ == '__main__':
    yt_url = 'https://www.youtube.com/watch?v=oYXmY5axC2I&t=1s'
    audio_file_path = download_audio(yt_url)
    try:
        subtitles, word_timing = transcribe_audio(audio_file_path)
    finally:
        deleted_file_path = garbage_collection(audio_file_path)
    save_word_timings_with_numpy(word_timing, '/Users/lukeh/Desktop/python_projects/youtube_scraper/yt_stream_endpoint/endpoint/example/word_timings.npy')
    save_subtitles_to_txt(subtitles, '/Users/lukeh/Desktop/python_projects/youtube_scraper/yt_stream_endpoint/endpoint/example/subtitles.txt')
    llm_generated_data = generate_topic_headers(subtitles, yt_url, word_timing)


