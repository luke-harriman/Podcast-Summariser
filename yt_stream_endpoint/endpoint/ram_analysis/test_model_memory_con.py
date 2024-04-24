import torch
import psutil
from transformers import DetrForObjectDetection, DetrImageProcessor

def load_models_and_measure_memory():
    # Initial memory usage
    process = psutil.Process()
    initial_mem = process.memory_info().rss / (1024 ** 2)  # Convert bytes to MB
    
    # Model loading code
    model_weights_save_path = "luke-harriman/chart_object_detection"
    model = DetrForObjectDetection.from_pretrained(model_weights_save_path)
    model.eval()
    
    image_processor_save_path = "luke-harriman/chart_object_detection"
    image_processor = DetrImageProcessor.from_pretrained(image_processor_save_path)
    
    # Memory usage after model loading
    final_mem = process.memory_info().rss / (1024 ** 2)  # Convert bytes to MB
    
    # Calculate the memory used by the model and processor
    memory_used = final_mem - initial_mem
    
    # Free memory if necessary (optional, for resource management in interactive sessions)
    del model
    del image_processor
    torch.cuda.empty_cache()  # If using GPU
    
    return memory_used

# Usage
memory_used = load_models_and_measure_memory()
print(f"Memory used by models: {memory_used} MB")

# Model takes up 123.015625 MB of RAM