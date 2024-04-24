import requests
# import google.auth.transport.requests
# from google.oauth2 import service_account
import subprocess

# The lines below are not needed if you have already set access token and authenticated your enviroment. 
# key_path = "/Users/lukeh/Desktop/Keys/podcast-summariser-2020-3b7218ef915d.json"

# credentials = service_account.Credentials.from_service_account_file(
#     key_path,
#     scopes=["https://www.googleapis.com/auth/cloud-platform"],
# )

# request = google.auth.transport.requests.Request()
# credentials.refresh(request)
# access_token = credentials.token


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