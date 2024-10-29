import requests
# import google.auth.transport.requests
# from google.oauth2 import service_account
import subprocess

flask_url = "http://127.0.0.1:5000"

# The YouTube URL you want to send
youtube_url = "https://www.youtube.com/watch?v=CVbCTkjpnPo"

# Prepare the data payload as a dictionary
data = {"youtube_url": youtube_url}

# Send a POST request
response = requests.post(flask_url, json=data)

# Print the response from the server
print("Status Code:", response.status_code)
print("Response Text:", response.text)
