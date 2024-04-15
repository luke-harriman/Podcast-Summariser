import json
import os 
from openai import OpenAI
from dotenv import load_dotenv


with open('/Users/lukeh/Desktop/python_projects/youtube_scraper/yt_stream_endpoint/endpoint/finetuning/prompts/prompt_v4_shortened.txt', 'r') as prompt:
    prompt = prompt.read()


load_dotenv()
key = os.getenv('OPENAI_API_KEY')

client = OpenAI(
    api_key=key
)

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

if __name__ == '__main__':
    example_data = [
        {
            "topic_header": "Header",
            "text_data": "Dam, fuck!"
        }, 
        {
            "topic_header": "Header",
            "text_data": "Dam, fuck!"
        }
    ]
    result = apply_llm(example_data)


    with open('/Users/lukeh/Desktop/python_projects/youtube_scraper/yt_stream_endpoint/endpoint/example/transformed_data.json', 'w') as f:
        json.dump(result, f)


