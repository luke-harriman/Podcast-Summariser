import os
import json
import random
from PIL import Image
from concurrent.futures import ProcessPoolExecutor
from random import randint, uniform
from concurrent.futures import Future
import random 

def superimpose_image(background_img, overlay_img, position=(0, 0), resize_factor=1.0):
    # Calculate the new size, maintaining the aspect ratio
    original_width, original_height = overlay_img.size
    new_width = int(original_width * resize_factor)
    new_height = int(original_height * resize_factor)

    # Resize the overlay image
    overlay_img_resized = overlay_img.resize((new_width, new_height), Image.Resampling.LANCZOS)

    # Paste the resized overlay image onto the background image
    background_img.paste(overlay_img_resized, position, overlay_img_resized)

    return background_img

def process_combination(args, image_id):
    random_image_path, chart_image_path, output_dir = args
    random_image = Image.open(random_image_path)
    
    if chart_image_path is not None:
        chart_image = Image.open(chart_image_path).convert("RGBA")
        
        # Random coverage factor between two percentages, e.g., between 10% and 20%
        lower_bound_coverage = 0.3  # 10%
        upper_bound_coverage = 0.85  # 20%
        desired_coverage = uniform(lower_bound_coverage, upper_bound_coverage)

        # Calculate the area for the chart image based on random coverage
        target_area = random_image.width * random_image.height * desired_coverage
        original_width, original_height = chart_image.size
        chart_area = original_width * original_height

        # Calculate the resize factor needed to achieve the target area
        resize_factor = (target_area / chart_area) ** 0.5
        resize_factor = min(resize_factor, random_image.width / original_width, random_image.height / original_height)
        
        # Apply the calculated resize factor to get new dimensions
        new_width = int(original_width * resize_factor)
        new_height = int(original_height * resize_factor)
        
        # Calculate position to paste the chart image
        x_pos = randint(0, max(random_image.width - new_width, 0))
        y_pos = randint(0, max(random_image.height - new_height, 0))
        
        # Superimpose the chart image onto the random background image
        modified_image = superimpose_image(random_image, chart_image, (x_pos, y_pos), resize_factor)
        bbox_width, bbox_height = float(new_width), float(new_height)
        area = bbox_width * bbox_height
        category = 1
    else:
        # When not superimposing a chart, make the bounding box represent the entire image
        modified_image = random_image
        x_pos, y_pos = 0, 0
        bbox_width, bbox_height = float(random_image.width), float(random_image.height)
        area = bbox_width * bbox_height
        category = 0

    output_image_name = f'modified_{random.randint(1, 10000)}_{image_id}.png'
    output_image_path = os.path.join(output_dir, output_image_name)
    modified_image.save(output_image_path)

    return {
        'image_id': image_id,
        'image_path': output_image_name,
        'width': modified_image.width,
        'height': modified_image.height,
        'bbox': [[float(x_pos), float(y_pos), bbox_width, bbox_height]],
        'category': category,
        'area': area
    }

# def process_combination(args, image_id):
#     random_image_path, chart_image_path, output_dir = args
#     random_image = Image.open(random_image_path)
    
#     if chart_image_path is not None:
#         chart_image = Image.open(chart_image_path).convert("RGBA")
#         resize_factor = uniform(0.5, 1.5)  # Random resize factor
#         original_width, original_height = chart_image.size
#         new_width = int(original_width * resize_factor)
#         new_height = int(original_height * resize_factor)
#         new_width = min(new_width, random_image.width)
#         new_height = min(new_height, random_image.height)
#         x_pos = randint(0, max(random_image.width - new_width, 0))
#         y_pos = randint(0, max(random_image.height - new_height, 0))
        
#         modified_image = superimpose_image(random_image, chart_image, (x_pos, y_pos), resize_factor)
#         bbox_width, bbox_height = float(new_width), float(new_height)
#         area = bbox_width * bbox_height
#         category = 1
#     else:
#         # When not superimposing a chart, make the bounding box represent the entire image
#         modified_image = random_image
#         x_pos, y_pos = 0, 0
#         bbox_width, bbox_height = float(random_image.width), float(random_image.height)
#         area = bbox_width * bbox_height
#         category = 0

#     output_image_name = f'modified_{random.randint(1, 10000)}_{random.randint(1, 10000)}.png'
#     output_image_path = os.path.join(output_dir, output_image_name)
#     modified_image.save(output_image_path)

#     return {
#         'image_id': image_id,
#         'image_path': output_image_name,
#         'width': modified_image.width,
#         'height': modified_image.height,
#         'bbox': [[float(x_pos), float(y_pos), bbox_width, bbox_height]],
#         'category': category,
#         'area': area
#     }

def generate_combinations_concurrently(random_images_dir, chart_images_dir, base_output_dir, dataset_type, sample_size, max_workers=4):
    # Filter for image files only
    valid_extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.gif')  # Add or remove file types as needed
    random_images = [os.path.join(random_images_dir, f) for f in os.listdir(random_images_dir) if os.path.isfile(os.path.join(random_images_dir, f)) and f.lower().endswith(valid_extensions)]
    chart_images = [os.path.join(chart_images_dir, f) for f in os.listdir(chart_images_dir) if os.path.isfile(os.path.join(chart_images_dir, f)) and f.lower().endswith(valid_extensions)]
    
    output_dir = os.path.join(base_output_dir, dataset_type)
    json_filename = os.path.join(output_dir, "image_data_coco_format.json")
    os.makedirs(output_dir, exist_ok=True)

    # Ensure unique combinations by adjusting how combinations are selected
    combinations = random.sample([(ri, ci, output_dir) for ri in random_images for ci in chart_images], sample_size)

    # Initialize the structure for COCO format
    coco_format = {
        "images": [],
        "annotations": [],
        "categories": [
            {
                "id": 1,
                "name": "category_name",
                "supercategory": "supercategory_name",
            }
        ]
    }
    
    annotation_id = 1
    with ProcessPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(process_combination, combination, idx + 1) for idx, combination in enumerate(combinations)]

        for future in futures:
            item = future.result()
            # Add the image information
            coco_format["images"].append({
                "id": item["image_id"],
                "file_name": item["image_path"],
                "width": item["width"],
                "height": item["height"]
            })

            # Add annotation information
            for bbox in item.get("bbox", []):
                coco_format["annotations"].append({
                    "id": annotation_id,
                    "image_id": item["image_id"],
                    "category_id": item["category"],
                    "bbox": bbox,
                    "area": item["area"],
                    "segmentation": [],
                    "iscrowd": 0
                })
                annotation_id += 1

    with open(json_filename, 'w') as f:
        json.dump(coco_format, f, indent=4)

if __name__ == '__main__':
    base_output_dir = 'output_images_coco_format'
    random_images_dir = '/Users/lukeh/Desktop/python_projects/youtube_scraper/yt_stream_endpoint/model/random_images'
    chart_images_dir = '/Users/lukeh/Desktop/python_projects/youtube_scraper/yt_stream_endpoint/model/chart_images'
    
    # Generate training, validation, and testing datasets
    for dataset_type, sample_size in [('train', 10000), ('val', 2500), ('test', 500)]:
        generate_combinations_concurrently(random_images_dir + '/' + dataset_type, chart_images_dir + '/' + dataset_type, base_output_dir, dataset_type, sample_size)