import os
import numpy as np
import cv2
from tensorflow.keras.models import Model, Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, UpSampling2D, concatenate, Input
from tensorflow.keras.preprocessing.image import img_to_array, load_img
from sklearn.model_selection import train_test_split
from tensorflow.keras.optimizers import Adam
import matplotlib.pyplot as plt

def unet(input_size=(256, 256, 1)):
    inputs = Input(input_size)
    # Downsample
    conv1 = Conv2D(64, 3, activation='relu', padding='same', kernel_initializer='he_normal')(inputs)
    conv1 = Conv2D(64, 3, activation='relu', padding='same', kernel_initializer='he_normal')(conv1)
    pool1 = MaxPooling2D(pool_size=(2, 2))(conv1)
    # Assume there are additional downsample layers here...
    
    # Bottom of U-Net
    conv7 = Conv2D(1024, 3, activation='relu', padding='same', kernel_initializer='he_normal')(pool1)  # Placeholder for the bottom layer
    conv7 = Conv2D(1024, 3, activation='relu', padding='same', kernel_initializer='he_normal')(conv7)

    # Upsample
    up8 = UpSampling2D(size=(2,2))(conv7)
    up8 = Conv2D(512, 2, activation='relu', padding='same', kernel_initializer='he_normal')(up8)
    merge8 = concatenate([conv1, up8], axis=3)  # Example of matching dimensions for a correct merge
    conv8 = Conv2D(512, 3, activation='relu', padding='same', kernel_initializer='he_normal')(merge8)
    conv8 = Conv2D(512, 3, activation='relu', padding='same', kernel_initializer='he_normal')(conv8)
    
    # Final layer
    conv9 = Conv2D(2, 3, activation='relu', padding='same', kernel_initializer='he_normal')(conv8)
    conv9 = Conv2D(1, 1, activation='sigmoid')(conv9)

    model = Model(inputs=inputs, outputs=conv9)
    model.compile(optimizer=Adam(learning_rate=1e-4), loss='binary_crossentropy', metrics=['accuracy'])
    # model.save('unet_model.h5')
    return model

def simple_cnn(input_size=(256, 256, 3)):
    model = Sequential()
    model.add(Conv2D(32, (3, 3), activation='relu', padding='same', input_shape=input_size))
    model.add(MaxPooling2D((2, 2)))
    model.add(Conv2D(64, (3, 3), activation='relu', padding='same'))
    model.add(MaxPooling2D((2, 2)))
    # Add more convolutional and max pooling layers as needed here
    
    # Upsampling
    model.add(UpSampling2D((2, 2)))
    model.add(Conv2D(32, (3, 3), activation='relu', padding='same'))
    model.add(UpSampling2D((2, 2)))
    model.add(Conv2D(1, (3, 3), activation='sigmoid', padding='same'))
    
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    
    return model

def save_results(test_images, test_masks, predictions, results_dir='results'):
    if not os.path.exists(results_dir):
        os.makedirs(results_dir)

    for i in range(len(test_images)):
        test_dir = os.path.join(results_dir, f"test{i+1}")
        os.makedirs(test_dir, exist_ok=True)

        # Normalize images for displaying
        input_image = (test_images[i] * 255).astype(np.uint8)
        label_image = (test_masks[i] * 255).astype(np.uint8)
        prediction_image = (predictions[i] * 255).astype(np.uint8)

        # Save input image
        cv2.imwrite(os.path.join(test_dir, "input.png"), input_image)
        
        # Save label image
        cv2.imwrite(os.path.join(test_dir, "label.png"), label_image)
        
        # Save prediction image
        cv2.imwrite(os.path.join(test_dir, "prediction.png"), prediction_image)

def load_data(data_dir, target_size=(256, 256)):
    images = []
    masks = []
    input_dir = os.path.join(data_dir, 'input')
    label_dir = os.path.join(data_dir, 'label')

    for img_name in os.listdir(input_dir):
        if img_name.endswith('.jpg'):
            img_path = os.path.join(input_dir, img_name)
            mask_path = os.path.join(label_dir, img_name.replace('.jpg', '_mask.png'))
            
            img = load_img(img_path, color_mode='rgb', target_size=target_size)
            mask = load_img(mask_path, color_mode='grayscale', target_size=target_size)
            
            img = img_to_array(img) / 255.
            mask = img_to_array(mask) / 255.

            images.append(img)
            masks.append(mask)

    return np.array(images), np.array(masks)

# Load datasets
train_images, train_masks = load_data('synthetic_dataset/train')
val_images, val_masks = load_data('synthetic_dataset/validate')
test_images, test_masks = load_data('synthetic_dataset/test')

# Initialize U-Net model
model = simple_cnn()

# Train the model
model.fit(train_images, train_masks, batch_size=2, epochs=10, validation_data=(val_images, val_masks))

# Evaluate the model on the test set
test_loss, test_acc = model.evaluate(test_images, test_masks)
print(f"Test accuracy: {test_acc*100:.2f}%, Test loss: {test_loss}")


# Generate predictions
predictions = model.predict(test_images)

# Reshape predictions if necessary and ensure it's in the same format as 'test_masks'
predictions = np.squeeze(predictions, axis=-1)  # Remove channel dimension if it exists

# Call the function to save results
save_results(test_images, test_masks, predictions)

# Save the model
# model.save('unet_model_for_chart_extraction.h5')