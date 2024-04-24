import os
from skimage.metrics import structural_similarity as ssim
import numpy as np
from PIL import Image
from skimage.transform import resize

def get_image(path):
    """Load an image and prepare it for SSIM comparison, ensuring it is returned as a numpy array."""
    img = Image.open(path)
    # Resize to maintain detail and use RGB to keep color information
    img = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    img = img.convert('RGB')
    img_array = np.array(img) 
    return img_array

def compare_images(img1, img2, target_size=(256, 256)):
    """Compare two images using SSIM on RGB after resizing them to the same dimensions."""
    # Ensure both images are numpy arrays
    if isinstance(img1, Image.Image): 
        img1 = np.array(img1.convert('RGB'))
    if isinstance(img2, Image.Image): 
        img2 = np.array(img2.convert('RGB'))
    
    # Resize images to a common size
    img1 = resize(img1, target_size, anti_aliasing=True)
    img2 = resize(img2, target_size, anti_aliasing=True)

    # Compute SSIM over each color channel
    ssim_scores = [ssim(img1[:, :, i], img2[:, :, i], data_range=img2[:, :, i].max() - img2[:, :, i].min()) for i in range(3)]
    return np.mean(ssim_scores)  

def find_similar_images(folder_path, threshold=0.95):
    """Find similar images in a folder based on SSIM."""
    files = [os.path.join(folder_path, f) for f in os.listdir(folder_path) if f.endswith(('png', 'jpg', 'jpeg'))]
    similar_pairs = []
    
    for i in range(len(files)):
        for j in range(i + 1, len(files)):
            score = compare_images(files[i], files[j])
            if score > threshold:
                similar_pairs.append((files[i], files[j], score))
    
    return similar_pairs

if __name__ == "__main__":
    folder_path = './images'
    similar_images = find_similar_images(folder_path)
    for pair in similar_images:
        print(f"Similar images: {pair[0]} and {pair[1]} - SSIM: {pair[2]:.2f}")