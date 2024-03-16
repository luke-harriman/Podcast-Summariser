import cv2
import os
import numpy as np
from sklearn.model_selection import train_test_split

def create_directories(base_dir):
    """Create required subdirectories for training, validation, and testing."""
    for sub_dir in ['train', 'test', 'validate']:
        input_dir = os.path.join(base_dir, sub_dir, 'input')
        label_dir = os.path.join(base_dir, sub_dir, 'label')
        os.makedirs(input_dir, exist_ok=True)
        os.makedirs(label_dir, exist_ok=True)

def generate_mask(overlay_shape, background_shape, x_offset, y_offset):
    """Generate a mask for the overlay image with the same size as the background image."""
    mask = np.zeros(background_shape[:2], dtype=np.uint8)
    mask[y_offset:y_offset+overlay_shape[0], x_offset:x_offset+overlay_shape[1]] = 255
    return mask

def overlay_images(background_img_path, overlay_img_path, output_path, scale_percent_range=(0.5, 1.5), include_chart=True):
    # Load the background image
    background = cv2.imread(background_img_path)

    # Initialize an empty mask with the same dimensions as the background
    mask = np.zeros(background.shape[:2], dtype=np.uint8)

    if include_chart:
        # Load the overlay image
        overlay = cv2.imread(overlay_img_path, cv2.IMREAD_UNCHANGED)

        # Calculate the scale for resizing the overlay
        scale_percent = np.random.uniform(*scale_percent_range)
        overlay_width = int(overlay.shape[1] * scale_percent)
        overlay_height = int(overlay.shape[0] * scale_percent)

        # Ensure the resized overlay does not exceed background dimensions
        overlay_width = min(overlay_width, background.shape[1])
        overlay_height = min(overlay_height, background.shape[0])

        # Resize the overlay image
        resized_overlay = cv2.resize(overlay, (overlay_width, overlay_height), interpolation=cv2.INTER_AREA)

        # Calculate a random position that allows the overlay to fit within the background
        max_x_offset = max(1, background.shape[1] - overlay_width)
        max_y_offset = max(1, background.shape[0] - overlay_height)
        x_offset = np.random.randint(0, max_x_offset)
        y_offset = np.random.randint(0, max_y_offset)

        # Update the mask for where the overlay is positioned
        mask[y_offset:y_offset+overlay_height, x_offset:x_offset+overlay_width] = 255

        # Extract the area of the background where the overlay will be placed
        background_area = background[y_offset:y_offset+overlay_height, x_offset:x_offset+overlay_width]

        if overlay.shape[2] == 4:  # If the overlay image has an alpha channel
            overlay_color = resized_overlay[..., :3]  # RGB channels
            overlay_alpha = resized_overlay[..., 3] / 255.0  # Normalize the alpha channel

            # Perform alpha blending
            background_area = overlay_color * overlay_alpha[..., None] + background_area * (1 - overlay_alpha[..., None])

            # Place the blended area back into the original background
            background[y_offset:y_offset+overlay_height, x_offset:x_offset+overlay_width] = background_area
        else:
            background[y_offset:y_offset+overlay_height, x_offset:x_offset+overlay_width] = resized_overlay

    # Save the resulting image and the mask
    cv2.imwrite(output_path, background)
    mask_path = output_path.replace('input', 'label').replace('.jpg', '_mask.png')
    cv2.imwrite(mask_path, mask)

    if include_chart:
        mask_path = output_path.replace('input', 'label').replace('.jpg', '_mask.png')
        cv2.imwrite(mask_path, mask)
    else:
        mask_path = output_path.replace('input', 'label').replace('.jpg', '_mask.png')
        cv2.imwrite(mask_path, np.zeros_like(mask))

def split_data_and_generate(base_dir, random_images_dir, chart_images_dir, num_images_with_chart, num_images_without_chart):
    # Create directories for training, validation, and testing sets
    create_directories(base_dir)
    
    # Get all images from directories and filter for appropriate extensions
    all_random_images = [img for img in os.listdir(random_images_dir) if img.lower().endswith(('.png', '.jpg'))]
    all_chart_images = [img for img in os.listdir(chart_images_dir) if img.lower().endswith(('.png', '.jpg'))]

    if not all_random_images:
        raise ValueError(f"No .jpg or .png files found in directory {random_images_dir}.")
    if not all_chart_images:
        raise ValueError(f"No .png or .jpg files found in directory {chart_images_dir}.")

    # Split data into train, validate, and test
    train_charts, test_charts = train_test_split(all_chart_images, test_size=0.2, random_state=42)
    validate_charts, test_charts = train_test_split(test_charts, test_size=0.5, random_state=42)
    train_randoms, test_randoms = train_test_split(all_random_images, test_size=0.2, random_state=42)
    validate_randoms, test_randoms = train_test_split(test_randoms, test_size=0.5, random_state=42)

    # Generate synthetic images and masks for each set
    for set_name, chart_set, random_set in [('train', train_charts, train_randoms), ('validate', validate_charts, validate_randoms), ('test', test_charts, test_randoms)]:
        print(f"Creating {set_name} data...")
        set_input_dir = os.path.join(base_dir, set_name, 'input')
        set_label_dir = os.path.join(base_dir, set_name, 'label')

        # Generate images with charts
        for i in range(num_images_with_chart):
            chart_image = chart_set[i % len(chart_set)]  # Use modulo to cycle through charts if num_images > number of charts
            background_image = random_set[i % len(random_set)]  # Similarly cycle through backgrounds
            background_img_path = os.path.join(random_images_dir, background_image)
            overlay_img_path = os.path.join(chart_images_dir, chart_image)
            output_path = os.path.join(set_input_dir, f'synthetic_chart_{set_name}_{i}.jpg')
            overlay_images(background_img_path, overlay_img_path, output_path, include_chart=True)

        # Generate images without charts
        for i in range(num_images_without_chart):
            background_image = np.random.choice(random_set)
            background_img_path = os.path.join(random_images_dir, background_image)
            output_path = os.path.join(set_input_dir, f'synthetic_no_chart_{set_name}_{i}.jpg')
            
            # Save the background image as input
            background = cv2.imread(background_img_path)
            cv2.imwrite(output_path, background)
            
            # Create an all-black mask for the label
            black_mask = np.zeros(background.shape[:2], dtype=np.uint8)
            mask_path = output_path.replace('input', 'label').replace('.jpg', '_mask.png')
            cv2.imwrite(mask_path, black_mask)


# Example usage
base_dir = './synthetic_dataset'
random_images_dir = './random_images'
chart_images_dir = './chart_images'
num_images_with_chart = 100  # Number of synthetic images with charts to generate per set (train, test, validate)
num_images_without_chart = 200  # Number of synthetic images without charts to generate per set (train, test, validate)

split_data_and_generate(base_dir, random_images_dir, chart_images_dir, num_images_with_chart, num_images_without_chart)