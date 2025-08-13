# backend/app.py
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

# CORS via env var: ALLOW_ORIGINS="https://your-frontend.vercel.app,https://your-node.onrender.com"
allow = os.environ.get("ALLOW_ORIGINS", "*")  # comma-separated or "*"
if allow == "*":
    CORS(app, resources={r"*": {"origins": "*"}})
else:
    origins = [o.strip() for o in allow.split(",") if o.strip()]
    CORS(app, resources={r"*": {"origins": origins}})

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS, exist_ok=True)

ALLOWED = {"png", "jpg", "jpeg"}

# Model file is in the backend folder (same directory as this file)
MODEL_PATH = os.path.join(BASE_DIR, "advanced_rice_leaf_disease_model.h5")

CLASS_NAMES = ["Bacterial Blight", "Blast", "Brown Spot", "Tungro"]

# Load model once at startup
model = tf.keras.models.load_model(MODEL_PATH)

def allowed_file(name: str) -> bool:
    return "." in name and name.rsplit(".", 1)[1].lower() in ALLOWED

def predict_image(path: str):
    img = tf.keras.preprocessing.image.load_img(path, target_size=(150, 150))
    arr = tf.keras.preprocessing.image.img_to_array(img) / 255.0
    arr = np.expand_dims(arr, axis=0)
    probs = model.predict(arr, verbose=0)[0]  # softmax
    idx = int(np.argmax(probs))
    return {
        "result": CLASS_NAMES[idx] if idx < len(CLASS_NAMES) else "Unknown",
        "confidence": float(probs[idx]),
        "probs": [float(x) for x in probs.tolist()],
    }

@app.get("/health")
def health():
    return jsonify({"ok": True})

@app.post("/predict")
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded (field name: file)"}), 400

    f = request.files["file"]
    if f.filename == "":
        return jsonify({"error": "Empty filename"}), 400
    if not allowed_file(f.filename):
        return jsonify({"error": "Allowed file types: png, jpg, jpeg"}), 400

    safe = secure_filename(f.filename)
    base, ext = os.path.splitext(safe)
    name = safe
    path = os.path.join(UPLOADS, name)
    i = 1
    while os.path.exists(path):
        name = f"{base}_{i}{ext}"
        path = os.path.join(UPLOADS, name)
        i += 1

    f.save(path)

    try:
        out = predict_image(path)
        image_url = request.host_url.rstrip("/") + f"/uploads/{name}"
        return jsonify({**out, "image_url": image_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.get("/uploads/<path:fname>")
def serve_upload(fname):
    return send_from_directory(UPLOADS, fname)

if __name__ == "__main__":
    # Local development run
    app.run(host="0.0.0.0", port=5001, debug=True)