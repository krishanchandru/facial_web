from flask import Flask, request, jsonify, redirect, url_for
from flask_cors import CORS
import cv2
import numpy as np
import base64
import os
import mediapipe as mp

app = Flask(__name__)
CORS(app)

# Initialize Mediapipe Face Detection
mp_face_detection = mp.solutions.face_detection
face_detection = mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.5)

# Folder to store registered images
IMAGE_DIR = "images"
os.makedirs(IMAGE_DIR, exist_ok=True)

# In-memory storage for user data (replace with a database in production)
users = {}

def decode_base64_image(image_data):
    """Convert base64 image to OpenCV format"""
    image_bytes = base64.b64decode(image_data.split(',')[1])
    np_arr = np.frombuffer(image_bytes, np.uint8)
    return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

@app.route('/register', methods=['POST'])
def register():
    """Register a new user with email, password, and face image"""
    data = request.json
    email = data.get("email")
    password = data.get("password")
    image_data = data.get("image")

    if not email or not password or not image_data:
        return jsonify({"error": "Missing email, password, or image"}), 400

    if email in users:
        return jsonify({"error": "User already exists"}), 400

    img = decode_base64_image(image_data)
    face_detected = face_detection.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

    if not face_detected.detections:
        return jsonify({"error": "No face detected"}), 400

    # Save user data
    users[email] = {
        "password": password,
        "image": image_data
    }

    # Save the image to the images folder
    image_path = os.path.join(IMAGE_DIR, f"{email}.jpg")
    cv2.imwrite(image_path, img)

    return jsonify({"message": "User registered successfully"}), 200

@app.route('/login', methods=['POST'])
def login():
    """Authenticate user using email, password, and face recognition"""
    data = request.json
    email = data.get("email")
    password = data.get("password")
    image_data = data.get("image")

    if not email or not password or not image_data:
        return jsonify({"error": "Missing email, password, or image"}), 400

    if email not in users:
        return jsonify({"error": "User not found"}), 404

    if users[email]["password"] != password:
        return jsonify({"error": "Incorrect password"}), 401

    img = decode_base64_image(image_data)
    face_detected = face_detection.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

    if not face_detected.detections:
        return jsonify({"error": "No face detected"}), 400

    # Compare with registered image
    registered_img = decode_base64_image(users[email]["image"])
    if registered_img.shape == img.shape:
        difference = cv2.absdiff(registered_img, img)
        if np.mean(difference) < 10:  # Simple similarity check
            return jsonify({"message": "Login successful"}), 200

    return jsonify({"error": "Authentication failed"}), 401

if __name__ == '__main__':
    app.run(debug=True)