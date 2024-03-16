from yt_dlp import YoutubeDL
import re
import requests

def extract_text_correctly(webvtt_content):
    clean_content = re.sub(r"WEBVTT.*?\n\n", "", webvtt_content, flags=re.DOTALL)
    cleaned_texts = []

    pattern = re.compile(r'(?:(\S+)<\d{2}:\d{2}:\d{2}\.\d{3}>)?(<c>.*?</c>)')
    blocks = re.split(r"\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}", clean_content)
    for block in blocks:
        block = block.strip()
        if block:
            matches = pattern.findall(block)
            for leading_text, c_text in matches:
                if leading_text:
                    cleaned_texts.append(leading_text)
                text_within_c = re.sub(r"<.?c>", "", c_text).strip()
                cleaned_texts.append(text_within_c)

    return " ".join(cleaned_texts)

# Video URL
video_url = "https://www.youtube.com/watch?v=SoTOF-plFwc"

# Options for yt-dlp: Just extract subtitles information
opts = {
    'writesubtitles': True,
    'writeautomaticsub': True,
    'subtitleslangs': ['en'],
    'skip_download': True,
}

# Using YoutubeDL with options
with YoutubeDL(opts) as yt:
    info_dict = yt.extract_info(video_url, download=False)
    
    subtitles_info = info_dict.get('requested_subtitles', {})
    en_subtitles_url = subtitles_info.get('en', {}).get('url') if subtitles_info.get('en') else None

if en_subtitles_url:
    subtitles_text = requests.get(en_subtitles_url).text
    final_text = extract_text_correctly(subtitles_text)
    # print(final_text)
    print(en_subtitles_url)
else:
    print("Subtitles not available for this video.")