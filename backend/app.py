# backend/app.py
import os
# Quiet TF logs (optional)
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from werkzeug.utils import secure_filename

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS, exist_ok=True)

ALLOWED_EXT = {"png", "jpg", "jpeg"}
IMAGE_SIZE = int(os.environ.get("IMAGE_SIZE", "150"))

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB to be safe

# CORS via env var: ALLOW_ORIGINS="https://your-frontend.vercel.app,https://your-node.onrender.com"
allow = os.environ.get("ALLOW_ORIGINS", "*")  # comma-separated or "*"
if allow == "*":
    CORS(app, resources={r"/*": {"origins": "*"}})
else:
    origins = [o.strip() for o in allow.split(",") if o.strip()]
    CORS(app, resources={r"/*": {"origins": origins}})

# Model path and labels
MODEL_PATH = os.path.join(BASE_DIR, "advanced_rice_leaf_disease_model.h5")
CLASS_NAMES = ["Bacterial Blight", "Blast", "Brown Spot", "Tungro"]

# Lazy-load the model on first use (reduces boot time/memory spikes)
_model = None
def get_model():
    global _model
    if _model is None:
        # compile=False speeds up load and avoids unnecessary optimizer state
        _model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    return _model

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXT

def predict_image(path: str):
    model = get_model()
    img = tf.keras.utils.load_img(path, target_size=(IMAGE_SIZE, IMAGE_SIZE))
    arr = tf.keras.utils.img_to_array(img) / 255.0
    arr = np.expand_dims(arr, axis=0)
    probs = model.predict(arr, verbose=0)[0]  # softmax probs
    idx = int(np.argmax(probs))
    return {
        "result": CLASS_NAMES[idx] if idx < len(CLASS_NAMES) else f"class_{idx}",
        "index": idx,
        "confidence": float(probs[idx]),
        "probs": [float(x) for x in probs.tolist()],
    }

@app.route("/", methods=["GET"])
def root():
    return jsonify({"service": "ks-ml", "ok": True})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True})

@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        return ("", 204)

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
        host = request.url_root.rstrip("/")
        image_url = f"{host}/uploads/{name}"
        return jsonify({**out, "image_url": image_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/uploads/<path:fname>", methods=["GET"])
def serve_upload(fname):
    return send_from_directory(UPLOADS, fname)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5001"))
    app.run(host="0.0.0.0", port=port, debug=True)