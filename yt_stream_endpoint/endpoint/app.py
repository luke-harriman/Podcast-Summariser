from flask import Flask, request, jsonify
from media_processing import download_video_and_audio, split_audio_video, process_frames, extract_frames, transcribe_audio, garbage_collection
from structure_text import generate_topic_headers
from llm import apply_llm
from insert import insert_data
import os
import time
from dotenv import load_dotenv
from openai import OpenAI
import atexit
# from memory_profiler import profile

app = Flask(__name__)

# with open('/Users/lukeh/Desktop/python_projects/youtube_scraper/yt_stream_endpoint/endpoint/finetuning/prompts/prompt_v4_shortened.txt', 'r') as prompt:
#     prompt = prompt.read()

with open('/app/finetuning/prompts/prompt_v4_shortened.txt', 'r') as prompt:
    prompt = prompt.read()

load_dotenv()
key = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=key)


@app.route('/', methods=['POST'])
def index():
    if request.method == 'POST':
        try:
            start_time = time.time()

            content = request.get_json(silent=True)
            if not content or 'youtube_url' not in content:
                return jsonify({"error": "YouTube URL is required"}), 400
            yt_url = content['youtube_url']

            # Download video and audio together
            print('Downloading Video and Audio')
            entire_video_path = download_video_and_audio(yt_url)
            video_path, audio_path = split_audio_video(entire_video_path)

            # Process video to extract frames and detect charts
            download_time = time.time() 
            print(f'Processing Video for Charts: {download_time - start_time} seconds')
            frames = extract_frames(video_path, 10, './frames')
            chart_details = process_frames(frames)

            # Transcribe audio
            process_chart_time = time.time() 
            print(f'Transcribe Audio: {process_chart_time - download_time} seconds')
            subtitles, word_timing = transcribe_audio(audio_path)

            # Generate structured data for summaries
            transcribe_audio_time = time.time() 
            print(f'Generating Topic Headers: {transcribe_audio_time - process_chart_time} seconds')
            structured_data = generate_topic_headers(subtitles, yt_url, word_timing)

            # Generate summaries using LLM
            print('Applying LLM')
            llm_generated_data = apply_llm(structured_data)

            # Append charts to the discussion data
            print('Appending Charts to Data')
            for item in llm_generated_data:
                charts_in_chapter = []
                for chart in chart_details:
                    chapter_start = item['start_time']
                    chapter_end = item['end_time']
                    chart_timestamp = chart[0]
                    if chapter_start <= chart_timestamp <= chapter_end:
                        charts_in_chapter.append(chart[1])
                item['images'] = charts_in_chapter
            
            print('Performing Garbage Collection')
            garbage_collection(entire_video_path)
            garbage_collection(video_path)
            garbage_collection(audio_path)

            # Insert data into PostgreSQL
            print('Inserting Data into Postgres')
            for item in llm_generated_data:
                insert_data(item)

            # Garbage collection for video and audio files

            end_time = time.time()
            total_time = end_time - start_time
            return jsonify({"Status": f"Successfully loaded data into postgres. Process took {total_time} seconds."}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"message": "Method Not Allowed"}), 405

if __name__ == "__main__":
    app.run(debug=True)
