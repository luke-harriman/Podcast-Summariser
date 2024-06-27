# Podcast Summariser

1. [Introdiction](#introduction)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Data Generation](#data-generation)
6. [Backend Services](#backend-services)
7. [Frontend](#frontend)
8. [Deployment](#deployment)


## Introduction
The Podcast Summariser leverages ChatGPT's API, the open sources Whisper model and a fine-tuned DETR model to summarize YouTube podcast transcripts into a clean, concise newsletter. The transcripts are transcribed using the Whisper model for improved quality over the yt_dlp library. Additionally, the DETR model is used to capture useful screenshots from the video, such as charts and headlines (although this functionality can be extended much further).

## Technology Stack
1. Next.js: For building the frontend.
2. Python: For backend, model training and data processing.
3. DETR Model: For object detection and image extraction.
4. Whisper: For transcribing audio with high accuracy.
5. OpenCV: For image processing tasks.
6. yt-dlp: For downloading YouTube videos.
7. DatoCMS: For storing all newsletter summaries and managing CDN/caching.
8. Docker: For containerizing the app.
9. Google Cloud Platform (GCP): For hosting backend services.
10. Raspberry Pi 4 (8GiB): For running the PostgreSQL database.
11. PostgreSQL: For storing transcriptions, summaries, and user data.

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
The get_latest_episode.py script fetches the latest video from a YouTube channel using yt-dlp. Then, the youtube audio is downloadeded into a temperary file and passed to the Whisper model for higher quality. The yt-dlp provides access to the youtube transcript but the quality is very poor. 

### Summarization
The transcriptions are summarized using ChatGPT's API. All the system and user prompts for the API can be found in the `yt_stream_endpoint/endpoint/finetuning/prompts/` folder.

### Screenshot Extraction
The DETR model processes video frames to extract important screenshots like charts and data tables. See more about the model is the section called [Data Generate and Model Training](#data-generation). 

### Postgres 
All the extracted data is then uploaded to a PostgreSQL database using the yt_stream_endpoint/endpoint/insert.py file. This data is then imported into DatoCMS using the frontend/pages/api/dato/datocms_post_common.js file.


## Data Generation
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

## Deployment

### Step 0: Configure GCP Project
```sh
gcloud config get-value project
gcloud config set project $PROJECT_ID
```

### Step 1: Build and Push Docker Image
Authenticate with GCP and configure Docker:

```sh
gcloud auth login
gcloud auth configure-docker
```

Build and push the Docker image:

```sh
docker buildx build --platform linux/amd64,linux/arm64 --tag gcr.io/$PROJECT_ID/{name} --push .
docker buildx imagetools inspect gcr.io/$PROJECT_ID/{name}:latest
```

### Step 2: Deploy to Google Cloud Run
```sh
gcloud run deploy {name}-service --image gcr.io/$PROJECT_ID/{name} --platform managed --region us-central1 --no-allow-unauthenticated
```

### Step 3: Check Deployment Status
```sh
gcloud run services list
```

### Step 4: Using the Endpoint
Authenticate your environment:

```sh
gcloud auth activate-service-account --key-file=/path/to/keyfile.json
ACCESS_TOKEN="$(gcloud auth print-access-token)"
```