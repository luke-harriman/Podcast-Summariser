# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED True
ENV APP_HOME /app

# Set the working directory to /app
WORKDIR $APP_HOME

# Copy the current directory contents into the container at /app
COPY . ./

# Install any needed packages specified in requirements.txt
RUN apt-get update && apt-get install -y \
    git \
    ffmpeg \
    libpq-dev \
    gcc \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \ 
    && rm -rf /var/lib/apt/lists/*

RUN git config --global http.postBuffer 5242880000  # 500MB
RUN pip3.11 install --default-timeout=120 --no-cache-dir -r requirements.txt 
# Making default time for pip install 2 minutes because my wifi is trash. 

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Define environment variable
ENV PROJECT_ID=podcast-summariser-2020

# Run app.py via Gunicorn when the container launches
CMD exec gunicorn --bind :${PORT:-8080} --workers 4 --threads 1 --timeout 3600 app:app