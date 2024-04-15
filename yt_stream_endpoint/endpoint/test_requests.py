import requests
import numpy as np
import math 


# The URL where your Flask app is running
flask_url = "http://127.0.0.1:5000/"

# The YouTube URL you want to send
youtube_url = "https://www.youtube.com/watch?v=QAAfDQx8DDQ"

# Prepare the data payload as a dictionary
data = {"youtube_url": youtube_url}

# Send a POST request
response = requests.post(flask_url, data=data)

# Print the response from the server
print("Status Code:", response.status_code)
print("Response Text:", response.text)

# def find_first_element(array_of_arrays, value):
#     """
#     Find the first sub-array in an array of arrays where the second element matches the value.
#     Return the first element of that sub-array.

#     :param array_of_arrays: Array of arrays to search through.
#     :param value: Value to find.
#     :return: The first element of the found sub-array or None if not found.
#     """
#     for sub_array in array_of_arrays:
#         if sub_array[0] == value:
#             return sub_array[1]
#         elif value == 0:
#             return 0
#     return None

# chapters = [
# [0, 77],
# [77, 1347],
# [1347, 2023],
# [2023, 2937],
# [2937, 3797],
# [3797, 4946],
# [4946, 5171],
# [5171, 5759]]

# with open('/Users/lukeh/Desktop/python_projects/youtube_scraper/yt_stream_endpoint/endpoint/subtitles.txt', 'r') as f:
#     subtitles = f.read()
#     file_contents_split = subtitles.split()

# word_timing = np.load('/Users/lukeh/Desktop/python_projects/youtube_scraper/yt_stream_endpoint/endpoint/word_timings.npy')

# for array in chapters:
#     start_time = array[0]
#     end_time = array[1]

#     start_time_rnd = math.floor(start_time / 10) * 10
#     end_time_rnd = math.ceil(end_time / 10) * 10

#     word_position_start = find_first_element(word_timing, start_time_rnd)
#     word_position_end = find_first_element(word_timing, end_time_rnd)


#     if word_position_start is not None and word_position_end is not None:
#         words = file_contents_split[word_position_start:word_position_end]
#         text_data = ' '.join(words)
#     if word_position_start is not None and word_position_end is None:
#         word_position_end = word_timing[-1][1]
#         words = file_contents_split[word_position_start:word_position_end]
#         text_data = ' '.join(words)
    
#     print(word_position_start)
#     print(word_position_end)