# import cv2
# from ultralytics import solutions

# model_path = '/home/aditya-kumar-mishra/Desktop/mini/disease/train7-20241208T212239Z-001/train7/weights/best(1).pt'


# def count_specific_classes(model_path, classes_to_count):
#     """Count specific classes of objects in a video and print the total count at the end."""
#     cap = cv2.VideoCapture(0)  # Capture video from webcam (0 is default camera)
#     assert cap.isOpened(), "Error opening video stream or file"
    
#     w, h, fps = (int(cap.get(x)) for x in (cv2.CAP_PROP_FRAME_WIDTH, cv2.CAP_PROP_FRAME_HEIGHT, cv2.CAP_PROP_FPS))

#     # Define the counting region (e.g., a line segment for tracking movements)
#     line_points = [(20, 400), (1080, 400)]
    
#     # Initialize the object counter with the model path and the classes to count
#     counter = solutions.ObjectCounter(show=True, region=line_points, model=model_path, classes=classes_to_count)

#     # Initialize a dictionary to track total counts per class
#     total_counts = {cls: {"IN": 0, "OUT": 0} for cls in classes_to_count}

#     while cap.isOpened():
#         success, im0 = cap.read()
#         if not success:
#             print("Video frame is empty or video processing has been successfully completed.")
#             break

#         # Process the frame with the object counter
#         im0 = counter.count(im0)

#         # Iterate over the class counts and update the total counts
#         for cls in classes_to_count:
#             class_name = counter.names[cls]  # Get the class name
#             if class_name in counter.classwise_counts:
#                 total_counts[cls]["IN"] = counter.classwise_counts[class_name]["IN"]
#                 total_counts[cls]["OUT"] = counter.classwise_counts[class_name]["OUT"]

#         # (Optional) Display the current frame with annotations
#         cv2.imshow("Object Counting", im0)

#         # Exit the loop if the 'q' key is pressed
#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             break

#     cap.release()
#     cv2.destroyAllWindows()

#     # Print the total counts for each class after processing all frames
#     print("Total counts for each class:")
#     for cls in classes_to_count:
#         class_name = counter.names[cls]
#         print(f"{class_name.capitalize()}: IN = {total_counts[cls]['IN']}, OUT = {total_counts[cls]['OUT']}")

# # Example usage:
# count_specific_classes(model_path, [0, 1, 2])  # Count classes 0, 1, 2 (adjust based on your model classes)
from flask import Flask, request, jsonify
from flask_cors import CORS
import pytesseract
from PIL import Image
import os

app = Flask(__name__)
CORS(app, resources={r"/upload": {"origins": "*"}}, supports_credentials=True)

# Configure upload folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:  # Match the frontend field name
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']  # Match the frontend field name
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)

        # Perform OCR
        text = extract_text_from_image(filepath)
        print(text)
        # Remove the file after processing
        os.remove(filepath)

        return jsonify({"text": text}), 200

def extract_text_from_image(image_path):
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == '__main__':
    app.run(debug=True)
