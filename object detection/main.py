from flask import Flask, request, send_file
from flask_cors import CORS
from roboflow import Roboflow
import supervision as sv
import cv2
import numpy as np
from io import BytesIO
import logging

app = Flask(__name__)
CORS(app)

# Initialize Roboflow
rf = Roboflow(api_key="mDsdGC6RAeJ5k3wdKY8T")
project = rf.workspace().project("circuit_different_component_classes")
model = project.version(1).model

@app.route('/detect', methods=['POST'])
def detect():
    try:
        logging.info("Received detection request")
        
        if 'image' not in request.files:
            return "No image file provided", 400
            
        file = request.files['image']
        
        # Read image directly from file
        image_stream = file.read()
        image_array = np.frombuffer(image_stream, np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError("Failed to decode image")
        
        # Save image to a temporary file for Roboflow prediction
        temp_path = "temp_image.jpg"
        cv2.imwrite(temp_path, image)
        
        # Get predictions
        logging.info("Making predictions")
        result = model.predict(temp_path, confidence=40, overlap=30).json()
        logging.info(f"Prediction result: {result}")

        # Extract labels and create detections object
        boxes = []
        confidences = []
        class_ids = []
        class_name_to_id = {name: idx for idx, name in enumerate(set(pred["class"] for pred in result["predictions"]))}
        
        for pred in result["predictions"]:
            x = pred["x"] - pred["width"] / 2
            y = pred["y"] - pred["height"] / 2
            boxes.append([x, y, x + pred["width"], y + pred["height"]])
            confidences.append(pred["confidence"])
            class_ids.append(class_name_to_id[pred["class"]])
        
        detections = sv.Detections(
            xyxy=np.array(boxes),
            confidence=np.array(confidences),
            class_id=np.array(class_ids)
        )
        
        # Initialize annotators
        box_annotator = sv.BoxAnnotator()
        label_annotator = sv.LabelAnnotator()
        
        # Draw annotations
        annotated_image = box_annotator.annotate(
            scene=image, 
            detections=detections
        )
        annotated_image = label_annotator.annotate(
            scene=annotated_image, 
            detections=detections, 
            labels=[pred["class"] for pred in result["predictions"]]
        )
        
        # Save annotated image to file
        result_path = "result.png"
        cv2.imwrite(result_path, annotated_image)
        
        # Convert to PNG for response
        is_success, buffer = cv2.imencode(".png", annotated_image)
        if not is_success:
            return "Failed to encode image", 500
            
        # Return image
        byte_io = BytesIO(buffer.tobytes())
        byte_io.seek(0)
        
        logging.info("Sending annotated image")
        return send_file(
            byte_io,
            mimetype='image/png',
            as_attachment=True,
            download_name='result.png'
        )
        
    except Exception as e:
        logging.error(f"Error in detection: {str(e)}", exc_info=True)
        return str(e), 500

if __name__ == "__main__":
    app.run(port=3001, debug=True)
