import cv2
import numpy as np
from tensorflow.keras.models import load_model
from matplotlib import pyplot as plt

def load_image(image_path, target_size=(256, 256)):
    """Load and preprocess the image."""
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    img = cv2.resize(img, target_size)
    img = img / 255.0  # Normalize to [0, 1]
    img = np.expand_dims(img, axis=-1)  # Add channel dimension
    img = np.expand_dims(img, axis=0)  # Add batch dimension
    return img

def predict_and_plot(model, image_path):
    """Load an image, predict the mask, and plot both."""
    img = load_image(image_path)
    pred_mask = model.predict(img)
    pred_mask = pred_mask.squeeze()  # Remove batch dimension

    plt.figure(figsize=(10, 5))

    plt.subplot(1, 2, 1)
    plt.imshow(img.squeeze(), cmap='gray')
    plt.title('Original Image')

    plt.subplot(1, 2, 2)
    plt.imshow(pred_mask, cmap='gray')
    plt.title('Predicted Mask')

    plt.show()

if __name__ == "__main__":
    # Load the saved model
    model_path = 'unet_model.h5'
    model = load_model(model_path)

    # Path to the image you want to test
    test_image_path = 'path_to_your_test_image.jpg'

    predict_and_plot(model, test_image_path)
