"""
Flask API Service untuk ML Detection
Endpoint untuk deteksi fase pertumbuhan jamur menggunakan YOLOv5
"""

from flask import Flask, request, jsonify  # type: ignore
try:
    from flask_cors import CORS  # type: ignore
    cors_available = True
except ImportError:
    print("[WARNING] flask_cors not installed. CORS may not work properly.")
    print("[INFO] Install with: pip install flask-cors")
    cors_available = False
import torch  # type: ignore
import cv2  # type: ignore
import numpy as np  # type: ignore
from pathlib import Path
import base64
from datetime import datetime, timedelta
import sys
import os

# Import config
try:
    from config import *
except ImportError:
    # Default config jika config.py tidak ada
    # Cari file model yang tersedia
    weights_dir = Path("weights")
    model_candidates = [
        weights_dir / "best.pt",
        weights_dir / "best - Copy.pt",
        weights_dir / "best-Copy.pt"
    ]
    
    MODEL_PATH = None
    for candidate in model_candidates:
        if candidate.exists():
            MODEL_PATH = str(candidate)
            break
    
    if MODEL_PATH is None:
        MODEL_PATH = "weights/best.pt"
    
    CONFIDENCE_THRESHOLD = 0.40
    CLASS_NAMES = ['Primordia', 'Muda', 'Matang']
    HARVEST_ESTIMATION = {'Primordia': 4, 'Muda': 2, 'Matang': 0}
    CLASS_COLORS = {
        'Primordia': (0, 255, 255),   # Yellow
        'Muda': (0, 165, 255),         # Orange
        'Matang': (0, 255, 0)          # Green
    }

# Label mapping
LABEL_MAP = {
    'primordia': 'Primordia',
    'Primordia': 'Primordia',
    'Fase Muda': 'Muda',
    'Muda': 'Muda',
    'Matang': 'Matang',
    'matang': 'Matang'
}

app = Flask(__name__)
if cors_available:
    CORS(app)  # Enable CORS for all routes
else:
    # Manual CORS headers if flask_cors not available
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response

# Global model variable
model = None

def load_model():
    """Load YOLOv5 model"""
    global model
    if model is None:
        model_path_obj = Path(MODEL_PATH)
        print(f"[INFO] Loading model: {MODEL_PATH}")
        print(f"[INFO] Model file exists: {model_path_obj.exists()}")
        
        if not model_path_obj.exists():
            # Coba cari alternatif
            weights_dir = model_path_obj.parent
            print(f"[INFO] Searching for alternative model files in: {weights_dir}")
            alt_files = list(weights_dir.glob("*.pt"))
            if alt_files:
                print(f"[INFO] Found alternative model files: {[f.name for f in alt_files]}")
                print(f"[INFO] Try renaming one of these files to 'best.pt' or update config.py")
            raise FileNotFoundError(f"Model not found: {MODEL_PATH}")
        
        print(f"[INFO] Model file size: {model_path_obj.stat().st_size / (1024*1024):.2f} MB")
        print(f"[INFO] Starting model load (this may take 10-30 seconds)...")
        
        try:
            model = torch.hub.load('ultralytics/yolov5', 'custom', 
                                  path=MODEL_PATH, force_reload=False)
            model.conf = CONFIDENCE_THRESHOLD
            model.iou = 0.45  # IoU threshold untuk NMS
            print(f"[INFO] ✅ Model loaded successfully!")
            print(f"[INFO] Model path: {MODEL_PATH}")
            print(f"[INFO] Confidence threshold: {CONFIDENCE_THRESHOLD}")
            print(f"[INFO] IoU threshold: 0.45")
            print(f"[INFO] Model classes: {model.names}")
            print(f"[INFO] Model device: {next(model.parameters()).device}")
        except Exception as e:
            error_msg = f"Error loading model: {str(e)}"
            print(f"❌ {error_msg}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Gagal memuat model: {error_msg}. Pastikan file model valid dan dependencies terinstall.")
    else:
        print(f"[INFO] Model already loaded")
    return model

def base64_to_image(base64_string):
    """Convert base64 string to OpenCV image"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64
        image_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print(f"Error decoding base64: {e}")
        raise

def image_to_base64(image):
    """Convert OpenCV image to base64 string"""
    _, buffer = cv2.imencode('.jpg', image)
    image_base64 = base64.b64encode(buffer).decode('utf-8')
    return image_base64

def draw_detections(image, detections):
    """Draw bounding boxes and labels on image"""
    img_with_boxes = image.copy()
    
    for det in detections:
        x1, y1, x2, y2 = det['bbox']
        cls_name = det['class']
        conf = det['confidence']
        color = CLASS_COLORS.get(cls_name, (255, 255, 255))
        
        # Draw bounding box
        cv2.rectangle(img_with_boxes, (x1, y1), (x2, y2), color, 2)
        
        # Prepare label
        label = f"{cls_name} {conf:.2f}"
        harvest_days = HARVEST_ESTIMATION.get(cls_name, 0)
        harvest_label = f"Panen: +{harvest_days} hari" if harvest_days > 0 else "Siap Panen"
        
        # Draw label background
        (label_w, label_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        cv2.rectangle(img_with_boxes, (x1, y1 - label_h - 10), (x1 + label_w, y1), color, -1)
        
        # Draw label text
        cv2.putText(img_with_boxes, label, (x1, y1 - 5), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
        
        # Draw harvest estimation
        cv2.putText(img_with_boxes, harvest_label, (x1, y2 + 20),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
    
    return img_with_boxes

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint - fast response, doesn't wait for model"""
    model_status = 'loaded' if model is not None else 'loading'
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'model_status': model_status,
        'model_path': MODEL_PATH,
        'service': 'ML Detection API',
        'port': 5000
    }), 200

@app.route('/detect', methods=['POST'])
def detect():
    """
    Detect mushroom growth phases from image
    
    Request body:
    {
        "image": "base64_encoded_image_string",
        "return_image": true/false  // optional, default false
    }
    
    Response:
    {
        "success": true,
        "detections": [
            {
                "class": "Primordia",
                "confidence": 0.85,
                "bbox": [x1, y1, x2, y2],
                "harvest_days": 4
            }
        ],
        "summary": {
            "Primordia": 2,
            "Muda": 1,
            "Matang": 0
        },
        "image_with_detections": "base64_string"  // if return_image=true
    }
    """
    try:
        # Check if model is loaded
        if model is None:
            print("[DETECT] Model not loaded, attempting to load...")
            try:
                load_model()
            except Exception as e:
                error_msg = f"Model tidak dapat di-load: {str(e)}"
                print(f"[DETECT] ERROR: {error_msg}")
                return jsonify({
                    'success': False,
                    'error': error_msg,
                    'details': 'Pastikan file model ada di folder weights/ dan ML service sudah di-restart'
                }), 500
        
        # Get request data
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'error': 'Image data is required'
            }), 400
        
        image_base64 = data['image']
        return_image = data.get('return_image', False)
        
        # Convert base64 to image
        try:
            image = base64_to_image(image_base64)
        except Exception as e:
            error_msg = f"Gagal memproses gambar: {str(e)}"
            print(f"[DETECT] ERROR: {error_msg}")
            return jsonify({
                'success': False,
                'error': error_msg,
                'details': 'Format gambar tidak valid atau corrupt'
            }), 400
        
        # Run detection
        print(f"[DETECT] Running inference on image shape: {image.shape}")
        try:
            results = model(image)
            df = results.pandas().xyxy[0]
        except Exception as e:
            error_msg = f"Error saat menjalankan deteksi: {str(e)}"
            print(f"[DETECT] ERROR: {error_msg}")
            import traceback
            traceback.print_exc()
            return jsonify({
                'success': False,
                'error': error_msg,
                'details': 'Model mungkin tidak ter-load dengan benar atau gambar tidak valid'
            }), 500
        
        print(f"[DETECT] Raw detections from model: {len(df)} detections")
        if len(df) > 0:
            print(f"[DETECT] Detection details:")
            print(df[['name', 'confidence', 'xmin', 'ymin', 'xmax', 'ymax']].head())
        
        # Process detections
        detections = []
        summary = {name: 0 for name in CLASS_NAMES}
        
        for idx, row in df.iterrows():
            x1, y1, x2, y2 = int(row['xmin']), int(row['ymin']), int(row['xmax']), int(row['ymax'])
            conf = float(row['confidence'])
            raw_name = row['name']
            cls_name = LABEL_MAP.get(raw_name, raw_name)
            
            print(f"[DETECT] Processing: {raw_name} -> {cls_name}, conf: {conf:.3f}, bbox: [{x1}, {y1}, {x2}, {y2}]")
            
            harvest_days = HARVEST_ESTIMATION.get(cls_name, 0)
            
            detections.append({
                'class': cls_name,
                'confidence': conf,
                'bbox': [x1, y1, x2, y2],
                'harvest_days': harvest_days
            })
            
            if cls_name in summary:
                summary[cls_name] += 1
        
        print(f"[DETECT] Processed {len(detections)} detections")
        print(f"[DETECT] Summary: {summary}")
        
        # Prepare response
        response = {
            'success': True,
            'detections': detections,
            'summary': summary,
            'total_detections': len(detections)
        }
        
        # Add image with detections if requested
        if return_image:
            img_with_boxes = draw_detections(image, detections)
            response['image_with_detections'] = image_to_base64(img_with_boxes)
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in detection: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/detect/upload', methods=['POST'])
def detect_upload():
    """
    Detect from uploaded file (multipart/form-data)
    """
    try:
        model = load_model()
        
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read image
        image_bytes = file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return jsonify({'error': 'Invalid image file'}), 400
        
        # Run detection
        print(f"[DETECT/UPLOAD] Running inference on image shape: {image.shape}")
        results = model(image)
        df = results.pandas().xyxy[0]
        
        print(f"[DETECT/UPLOAD] Raw detections from model: {len(df)} detections")
        if len(df) > 0:
            print(f"[DETECT/UPLOAD] Detection details:")
            print(df[['name', 'confidence', 'xmin', 'ymin', 'xmax', 'ymax']].head())
        
        # Process detections
        detections = []
        summary = {name: 0 for name in CLASS_NAMES}
        
        for idx, row in df.iterrows():
            x1, y1, x2, y2 = int(row['xmin']), int(row['ymin']), int(row['xmax']), int(row['ymax'])
            conf = float(row['confidence'])
            raw_name = row['name']
            cls_name = LABEL_MAP.get(raw_name, raw_name)
            
            print(f"[DETECT/UPLOAD] Processing: {raw_name} -> {cls_name}, conf: {conf:.3f}, bbox: [{x1}, {y1}, {x2}, {y2}]")
            
            harvest_days = HARVEST_ESTIMATION.get(cls_name, 0)
            
            detections.append({
                'class': cls_name,
                'confidence': conf,
                'bbox': [x1, y1, x2, y2],
                'harvest_days': harvest_days
            })
            
            if cls_name in summary:
                summary[cls_name] += 1
        
        print(f"[DETECT/UPLOAD] Processed {len(detections)} detections")
        print(f"[DETECT/UPLOAD] Summary: {summary}")
        
        # Draw detections on image
        img_with_boxes = draw_detections(image, detections)
        image_base64 = image_to_base64(img_with_boxes)
        
        return jsonify({
            'success': True,
            'detections': detections,
            'summary': summary,
            'total_detections': len(detections),
            'image_with_detections': image_base64
        })
        
    except FileNotFoundError as e:
        error_msg = str(e)
        print(f"[DETECT] ERROR: {error_msg}")
        return jsonify({
            'success': False,
            'error': error_msg,
            'details': 'File model tidak ditemukan. Pastikan file model ada di folder weights/'
        }), 500
    except Exception as e:
        error_msg = str(e)
        print(f"[DETECT] ERROR: {error_msg}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': error_msg,
            'details': 'Terjadi error saat memproses deteksi. Cek log ML service untuk detail.'
        }), 500

def load_model_async():
    """Load model in background thread"""
    import threading
    def _load():
        try:
            print("[INFO] Starting model load in background...")
            load_model()
            print("[INFO] ✅ Model loaded successfully in background!")
        except Exception as e:
            print(f"[ERROR] Failed to load model in background: {e}")
            import traceback
            traceback.print_exc()
    
    thread = threading.Thread(target=_load, daemon=True)
    thread.start()
    return thread

if __name__ == '__main__':
    print("="*70)
    print("ML Detection API Service")
    print("="*70)
    print(f"Model path: {MODEL_PATH}")
    print(f"Confidence threshold: {CONFIDENCE_THRESHOLD}")
    print("="*70)
    
    # Start Flask app first (non-blocking)
    print("\n" + "="*70)
    print("[INFO] ML Detection Service is starting...")
    print("="*70)
    print(f"[INFO] Service URL: http://localhost:5000")
    print(f"[INFO] Health check: http://localhost:5000/health")
    print("="*70)
    print("\n[INFO] Model will be loaded in background...")
    print("[WARNING] IMPORTANT: Keep this window open while using detection feature!")
    print("   Press CTRL+C to stop the service\n")
    print("="*70 + "\n")
    
    # Load model in background thread (non-blocking)
    load_model_async()
    
    # Run Flask app (this will start immediately)
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)

