import numpy as np
import json 
from openai import OpenAI
import requests
import os
from yt_dlp import YoutubeDL
import whisper
import tempfile
import time

def download_audio(video_url):
    """Download the best available audio stream from a YouTube video. This function doesn't download the video, just the audio."""
    # Set options for youtube-dl: only download audio, suppress console output, avoid downloading playlists
    ydl_opts = {
        'format': 'bestaudio',
        'quiet': True,
        'noplaylist': True,
        'outtmpl': tempfile.mktemp(suffix='.%(ext)s')  # Create a temporary file with audio extension
    }
    
    # Download audio using youtube-dl library
    with YoutubeDL(ydl_opts) as ydl:
        result = ydl.extract_info(video_url, download=True)
        # Return the file path where the audio file is saved
        return result['requested_downloads'][0]['filepath']

def save_subtitles(subtitles, filename='subtitles.txt'):
    """Save subtitles text to a file. This can be used for testing and QA."""
    with open(filename, 'w', encoding='utf-8') as file:
        file.write(subtitles)

def save_word_timings(timings, filename='word_timings.npy'):
    """Save word timings as a numpy array to a file. This can be used for testing and QA."""
    np.save(filename, np.array(timings))

def transcribe_audio(audio_file_path):
    """Transcribe audio to text using OpenAI's Whisper model and generate word timings. Word timings are used to find the word position at a specific timestamp (in my case every 10 seconds)."""
    model = whisper.load_model("base")
    result = model.transcribe(audio_file_path)

    word_timing = []
    word_count = 0
    next_time_mark = 10  # In seconds

    # Extract timing and word count information for each segment in the transcription
    if 'segments' in result:
        for segment in result['segments']:
            start_time = segment['start']
            segment_word_count = len(segment['text'].split())
            word_count += segment_word_count
            
            # Append timing and word count to the list at every 10 second interval
            while start_time >= next_time_mark:
                word_timing.append([next_time_mark, word_count])
                next_time_mark += 10

    return result["text"], word_timing

def garbage_collection(file_path):
    """Delete a file from the file system if it exists. This is used for cleaning up temporary files."""
    if os.path.exists(file_path):
        os.remove(file_path)
        return file_path

if __name__ == '__main__':
    start_time = time.time()
    yt_url = 'https://www.youtube.com/watch?v=QAAfDQx8DDQ'
    audio_file_path = download_audio(yt_url)
    try:
        subtitles, word_timings = transcribe_audio(audio_file_path)
        save_subtitles(subtitles)
        save_word_timings(word_timings)
    finally:
        garbage_collection(audio_file_path)

    end_time = time.time()
    elapsed_time = end_time - start_time
    print("Elapsed time: {:.2f} seconds".format(elapsed_time))
