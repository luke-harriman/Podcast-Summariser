import subprocess
import json

def get_latest_videos(channel_name, max_results):
    command = [
        'yt-dlp',
        '--dump-single-json',
        f'https://www.youtube.com/{channel_name}/videos',
        '--playlist-end', str(max_results)
    ]
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode == 0:
        data = json.loads(result.stdout)
        for entry in data['entries']:
            video_url = f'https://www.youtube.com/watch?v={entry["id"]}'
            video_date = entry.get('upload_date', 'Unknown date')
            video_year = video_date[0:4]
            video_month = video_date[4:6]
            video_day = video_date[6:8]
            return [channel_name, video_url, f'{video_day}-{video_month}-{video_year}']
    else:
        print("Error retrieving video information")

if __name__ == '__main__':
    latest_episode = get_latest_videos('@lexfriedman', 1)
    print(latest_episode)
