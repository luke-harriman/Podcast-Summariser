import json
import os 
from openai import OpenAI
from dotenv import load_dotenv
import logging

# with open('/Users/lukeh/Desktop/python_projects/youtube_scraper/yt_stream_endpoint/endpoint/finetuning/prompts/prompt_v4_shortened.txt', 'r') as prompt:
#     prompt = prompt.read()
with open('/app/finetuning/prompts/prompt_v4_shortened.txt', 'r') as prompt:
    prompt = prompt.read()
load_dotenv()
key = os.getenv('OPENAI_API_KEY')
try:
    client = OpenAI(
        api_key=key
    )
    logging.info("OpenAI client initialized successfully.")
except Exception as e:
    logging.error("Failed to initialize OpenAI client.", exc_info=True)


def apply_llm(dictionary):
    for item in dictionary:
        input = f'Topic Header: {item["chapter"]} \n {item["text_data"]}'  # Assuming keys "topic_header" and "text_data"
        response = client.chat.completions.create(
        model = "gpt-4-turbo-preview",
        messages=[
            {"role": "system", "content": f"{prompt}"},
            {"role": "user", "content": f"""Apply the principles I have outlined in the system prompt to transform the following text. Remove unnecessary words. Do not include paragraphs that act as a summary and start with phrases such as 'In summary', 'To conclude', 'Summarizing the conversation', etc. For added context, here is the podcast title, {item['video_title']} , and description, {item['video_description_summary']}. The response needs to be in full sentences with a short Topic Header that starts with 'Topic Header: '. The full sentences should include quotes, anecdotes and data points just like the examples in the system prompt.\n Input: {input} """},
            {"role": "system", "content": f"Remove unnecessary words and phrases. Make sure to include quotes, data points and numbers that back up the points made. Make sure the podcast title is not mentioned in the response and the response does not end with a summary."}
            ]
        )
        item['text_data'] = response.choices[0].message.content
    return dictionary 

