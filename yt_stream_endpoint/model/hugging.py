from huggingface_hub import HfApi, HfFolder
import os 
def upload_files(directory, repo_name, repo_type="model"):
    api = HfApi()
    token = HfFolder.get_token()  # Ensure you have authenticated previously and have a token

    # Create or get repo URL
    repo_url = api.create_repo(repo_name, token=token, exist_ok=True)
    print(f"Repository URL: {repo_url}")

    # Upload files directly using HTTP
    for file_name in os.listdir(directory):
        file_path = os.path.join(directory, file_name)
        if os.path.isfile(file_path):
            response = api.upload_folder(
                token=token,
                path_or_fileobj=file_path,
                path_in_repo=file_name,
                repo_id=repo_name,
                repo_type=repo_type,
            )
            print(f"Uploaded {file_name} to {response}")

model_weights_dir = "/Users/lukeh/Desktop/python_projects/youtube_scraper/yt_stream_endpoint/model/model"
image_processor_dir = "/Users/lukeh/Desktop/python_projects/youtube_scraper/yt_stream_endpoint/model/image_processor"

# upload_files(model_weights_dir, 'luke-harriman/chart_object_detection', repo_type='model')
# upload_files(image_processor_dir, 'luke-harriman/chart_object_detection', repo_type='model')
api = HfApi()

api.upload_folder(
    folder_path=model_weights_dir,
    repo_id='luke-harriman/chart_object_detection',
    repo_type="model",
)
