import cv2
import numpy as np
import torch
from torchvision.models.detection import fasterrcnn_resnet50_fpn
from torchvision.transforms import functional as F

# Load the pre-trained Faster R-CNN model
model = fasterrcnn_resnet50_fpn(pretrained=True)
model.eval()

# Define a function to perform object detection
def detect_objects(image):
    # Transform the image to a tensor
    image_tensor = F.to_tensor(image).unsqueeze(0)
    
    # Get the predictions from the model
    with torch.no_grad():
        prediction = model(image_tensor)
    
    # Extract the bounding boxes and labels
    boxes = prediction[0]['boxes']
    labels = prediction[0]['labels']
    return boxes, labels

# Define a function to create a binary mask
def create_mask(boxes, image_shape):
    mask = np.zeros(image_shape[:2], dtype=np.uint8)
    for box in boxes:
        x1, y1, x2, y2 = box.int().numpy()
        cv2.rectangle(mask, (x1, y1), (x2, y2), color=1, thickness=-1)  # Fill the rectangle
    return mask

# Load your image
image = cv2.imread('your_image.jpg')

# Detect objects in the image
boxes, labels = detect_objects(image)

# Create a binary mask for detected objects
mask = create_mask(boxes, image.shape)

# Apply the mask to the image
masked_image = cv2.bitwise_and(image, image, mask=mask)

# Save or display the masked image
cv2.imwrite('masked_image.png', masked_image)
