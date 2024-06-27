# Podcast Summariser

1. [Introdiction](#introduction)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Data Generation & DETR Model Training](#data-generation--detr-model-training)


## Introduction
The Podcast Summariser leverages ChatGPT's API, the open sourced Whisper model and a fine-tuned DETR model to summarize YouTube podcast transcripts into a clean, concise newsletter. The transcripts are transcribed using the Whisper model for improved quality as opposed to just using the trascript provided by the `yt_dlp` library. Additionally, the DETR model is used to capture useful screenshots from the video, such as charts and headlines (although this functionality can be extended much further).

## Technology Stack
1. **Next.js**: For building the frontend.
2. **Python**: For backend, model training and data processing.
3. **DETR Model**: For object detection and image extraction.
4. **Whisper**: For transcribing audio with high accuracy.
5. **OpenCV**: For image processing tasks.
6. **yt-dlp**: For downloading YouTube videos.
7. **DatoCMS**: For storing all newsletter summaries and managing CDN/caching.
8. **Docker**: For containerizing the app.
9. **Google Cloud Platform (GCP)**: For hosting backend services.
10. **Raspberry Pi 4 (8GiB)**: For running the PostgreSQL database. Here is a great video on [setting up PostgreSQL on a raspberrp Pi](https://www.youtube.com/watch?v=DZlxuf2kzEU)
11. **PostgreSQL**: For storing transcriptions, summaries, and user data.

## Installation
To set up the project locally, follow these steps:

1. Clone the repository:
```sh
git clone https://github.com/luke-harriman/Podcast-Summariser.git
```
2. Navigate to the project directory:
```sh
cd Podcast-Summariser
```
3. Install the necessary dependencies for the backend and frontend using the requirements.txt files.

(Note: The python driver for postgres can be quite sensitive so it may take a little bit to get it working.)

## Usage
### Transcribing YouTube Videos
The `get_latest_episode.py` script fetches the latest video from a YouTube channel using `yt-dlp`. Then, the youtube audio is downloadeded into a temperary file and passed to the Whisper model for higher quality. The `yt-dlp` provides access to the youtube transcript but the quality is very poor. 

### Summarization
The transcriptions are summarized using ChatGPT's API. All the system and user prompts for the API can be found in the `prompts/` folder.

### Screenshot Extraction
The DETR model processes video frames to extract important screenshots like charts and data tables. See more about the model is the section called [Data Generation & DETR Model Training](#data-generation--detr-model-training). 

### Postgres 
All the extracted data is then uploaded to a PostgreSQL database running on a Raspberry Pi 4 using the `/insert.py` script.

### DatoCMS
The data stored in postgres is imported into DatoCMS using the `datocms_post_common.js` script.

### Frontend
The frontend is deployed using Vercel, which also handles user authentication. All of the newsletters are rendered from DatoCMS.

### GCP
The Flask app (`app.py`) is containerized with Docker and pushed to GCR (Google Cloud Registry) before being deployed on GCP (Google Cloud Platform). The endpoint is then passed youtube URLs and the process begins. 


## Data Generation & DETR Model Training
The `data_bb_generator.py` script synthetically generates data to fine-tune the DETR model.

1. Downloaded a large repository of charts from Microsoft.
2. Captured hundreds of screenshots from podcasts using python scripts.
3. Used OpenCV to superimpose the charts onto random images in various positions, sizes, and orientations.
4. Logged the position (x, y, width, height) and added it to an annotations dictionary to fine-tune the DETR model.

The `detr_model_training.py` script is then used to fine-tune the DETR model from huggingface on the data so it can extract images like:

<p align="center">
  <img src="readme_images/Screenshot 2024-06-27 at 7.09.14 PM.png" alt="Diagram" width="350"/>
  <img src="readme_images/Screenshot 2024-06-27 at 7.10.09 PM.png" alt="Diagram" width="350"/>
</p>