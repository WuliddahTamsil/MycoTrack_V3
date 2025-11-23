"""
Program Utama: Deteksi Real-time Jamur dengan YOLOv5
"""

import torch
import cv2
import numpy as np
import time
from pathlib import Path

# Import config
try:
    from config import *
except ImportError:
    # Default config jika config.py tidak ada
    MODEL_PATH = "C:\\Users\\USER\\Documents\\SCHOOL STUFF\\Semester 5\\Pembelajaran Mesin\\Project\\weights\\best.pt"
    WEBCAM_INDEX = 0
    IMG_SIZE = 640
    CONFIDENCE_THRESHOLD = 0.25
    CLASS_NAMES = ['Primordia', 'Muda', 'Matang']
    HARVEST_ESTIMATION = {'Primordia': 4, 'Muda': 2, 'Matang': 0}
    CLASS_COLORS = {
        'Primordia': (0, 255, 255),  # Yellow
        'Muda': (0, 165, 255),        # Orange
        'Matang': (0, 255, 0)         # Green
    }

# Mapping nama kelas dari model (hasil training) ke nama tampilan yang konsisten.
# Dataset memiliki variasi penulisan seperti 'primordia' (lowercase) dan 'Fase Muda'.
# Dengan mapping ini, seluruh alur (warna, estimasi panen, panel info) tetap konsisten.
LABEL_MAP = {
    'primordia': 'Primordia',
    'Primordia': 'Primordia',
    'Fase Muda': 'Muda',
    'Muda': 'Muda',
    'Matang': 'Matang',
    'matang': 'Matang'
}

# ============================================================
# FUNGSI UTAMA
# ============================================================

def load_model(model_path=MODEL_PATH):
    """
    Load YOLOv5 model dari file .pt
    
    Args:
        model_path: Path ke file model (.pt)
        
    Returns:
        model: YOLOv5 model yang sudah di-load
    """
    print(f"[INFO] Loading model: {model_path}")
    
    if not Path(model_path).exists():
        print(f"❌ Model tidak ditemukan: {model_path}")
        print("Jalankan training dulu: python scripts/2_train_model.py")
        return None
    
    try:
        # Load model dengan torch.hub
        model = torch.hub.load('ultralytics/yolov5', 'custom', 
                              path=model_path, force_reload=False)
        model.conf = CONFIDENCE_THRESHOLD
        print(f"[INFO] Model loaded successfully!")
        print(f"[INFO] Confidence threshold: {CONFIDENCE_THRESHOLD}")
        return model
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return None

def preprocess_frame(frame, img_size=IMG_SIZE):
    """
    Preprocessing frame sebelum inferensi
    
    Args:
        frame: Frame dari webcam (BGR)
        img_size: Ukuran input model
        
    Returns:
        frame: Frame original (untuk display)
    """
    # YOLOv5 akan handle preprocessing secara otomatis
    # Frame tetap dalam format BGR (OpenCV)
    return frame

def infer_and_postprocess(model, frame):
    """
    Inferensi dan post-processing
    
    Args:
        model: YOLOv5 model
        frame: Frame input
        
    Returns:
        results: Hasil deteksi dari YOLOv5
    """
    # Inferensi
    results = model(frame)
    return results

def draw_results(frame, results):
    """
    Draw bounding box, label, dan estimasi panen
    
    Args:
        frame: Frame untuk di-draw
        results: Hasil deteksi dari YOLOv5
        
    Returns:
        frame: Frame dengan bounding box dan label
        detections: List informasi deteksi
    """
    detections = []
    
    # Parse results
    df = results.pandas().xyxy[0]  # Pandas dataframe
    
    for idx, row in df.iterrows():
        # Get detection info
        x1, y1, x2, y2 = int(row['xmin']), int(row['ymin']), int(row['xmax']), int(row['ymax'])
        conf = row['confidence']
        raw_name = row['name']
        cls_name = LABEL_MAP.get(raw_name, raw_name)  # Normalisasi nama kelas
        
        # Get color
        color = CLASS_COLORS.get(cls_name, (255, 255, 255))
        
        # Get harvest estimation
        harvest_days = HARVEST_ESTIMATION.get(cls_name, 0)
        
        # Draw bounding box
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        
        # Prepare label
        label = f"{cls_name} {conf:.2f}"
        harvest_label = f"Panen: +{harvest_days} hari" if harvest_days > 0 else "Siap Panen"
        
        # Draw label background
        (label_w, label_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        cv2.rectangle(frame, (x1, y1 - label_h - 10), (x1 + label_w, y1), color, -1)
        
        # Draw label text
        cv2.putText(frame, label, (x1, y1 - 5), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
        
        # Draw harvest estimation
        cv2.putText(frame, harvest_label, (x1, y2 + 20),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        # Save detection info
        detections.append({
            'class': cls_name,
            'confidence': conf,
            'bbox': (x1, y1, x2, y2),
            'harvest_days': harvest_days
        })
    
    return frame, detections

def draw_fps(frame, fps):
    """
    Draw FPS counter
    
    Args:
        frame: Frame untuk di-draw
        fps: FPS value
        
    Returns:
        frame: Frame dengan FPS counter
    """
    # FPS background
    cv2.rectangle(frame, (10, 10), (120, 40), (0, 0, 0), -1)
    
    # FPS text
    cv2.putText(frame, f"FPS: {fps:.1f}", (15, 30),
               cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
    
    return frame

def draw_info_panel(frame, detections):
    """
    Draw info panel dengan jumlah deteksi per kelas
    
    Args:
        frame: Frame untuk di-draw
        detections: List deteksi
        
    Returns:
        frame: Frame dengan info panel
    """
    h, w = frame.shape[:2]
    
    # Count detections per class
    counts = {name: 0 for name in CLASS_NAMES}
    for det in detections:
        cls = det['class']
        # Jika kelas belum ada di CLASS_NAMES (mis-match), normalisasi dan/atau tambahkan sementara
        if cls not in counts:
            # Cegah KeyError dengan menambahkan kunci baru (untuk debugging atau kelas tak terduga)
            counts[cls] = 0
        counts[cls] += 1
    
    # Draw panel background
    panel_h = 120
    cv2.rectangle(frame, (w - 200, 10), (w - 10, panel_h), (0, 0, 0), -1)
    
    # Draw title
    cv2.putText(frame, "DETEKSI", (w - 190, 30),
               cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    
    # Draw counts
    y_offset = 55
    for cls_name in CLASS_NAMES:
        count = counts[cls_name]
        color = CLASS_COLORS[cls_name]
        text = f"{cls_name}: {count}"
        cv2.putText(frame, text, (w - 190, y_offset),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        y_offset += 25

    # Jika ada kelas tambahan yang tidak terdaftar di CLASS_NAMES tetapi muncul (misalnya typo di dataset), tampilkan di bawah.
    extra_classes = [k for k in counts.keys() if k not in CLASS_NAMES]
    for extra in extra_classes:
        text = f"{extra}: {counts[extra]}"
        cv2.putText(frame, text, (w - 190, y_offset),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        y_offset += 25
    
    return frame

# ============================================================
# MAIN LOOP
# ============================================================

def main():
    """
    Main loop untuk webcam detection
    """
    print("="*70)
    print("DETEKSI REAL-TIME JAMUR")
    print("="*70)
    print("\nTekan 'q' untuk keluar")
    print("="*70 + "\n")
    
    # Load model
    model = load_model()
    if model is None:
        return
    
    # Open webcam
    print(f"[INFO] Opening webcam (index: {WEBCAM_INDEX})...")
    cap = cv2.VideoCapture(WEBCAM_INDEX)
    
    if not cap.isOpened():
        print(f"❌ Cannot open webcam {WEBCAM_INDEX}")
        print("Try: Edit config.py → WEBCAM_INDEX = 1")
        return
    
    print("[INFO] Webcam opened!")
    print("[INFO] Starting detection...\n")
    
    # FPS calculation
    fps = 0
    frame_count = 0
    start_time = time.time()
    
    # Main loop
    try:
        while True:
            # Read frame
            ret, frame = cap.read()
            if not ret:
                print("❌ Cannot read frame")
                break
            
            # Preprocess
            frame = preprocess_frame(frame)
            
            # Inference
            results = infer_and_postprocess(model, frame)
            
            # Draw results
            frame, detections = draw_results(frame, results)
            
            # Calculate FPS
            frame_count += 1
            if frame_count % 10 == 0:
                end_time = time.time()
                fps = 10 / (end_time - start_time)
                start_time = time.time()
            
            # Draw FPS
            frame = draw_fps(frame, fps)
            
            # Draw info panel
            frame = draw_info_panel(frame, detections)
            
            # Display
            cv2.imshow("Deteksi Jamur", frame)
            
            # Check for quit
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
    
    except KeyboardInterrupt:
        print("\n[INFO] Interrupted by user")
    
    finally:
        # Cleanup
        cap.release()
        cv2.destroyAllWindows()
        print("\n[INFO] Program selesai")

# ============================================================
# TODO: Implementasi Pi 4 menggunakan TFLite (future work)
# Untuk Raspberry Pi 4:
# 1. Export model ke TFLite: python export_to_tflite.py
# 2. Gunakan TFLite interpreter
# 3. Optimasi untuk ARM processor
# ============================================================

if __name__ == "__main__":
    main()