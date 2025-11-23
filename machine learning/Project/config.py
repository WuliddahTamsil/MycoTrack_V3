"""
Konfigurasi untuk Deteksi Jamur
"""

import os
from pathlib import Path

# ============================================================
# PATH CONFIGURATION
# ============================================================

# Project root
PROJECT_ROOT = Path(__file__).parent.resolve()

# Model path
MODEL_PATH = str(PROJECT_ROOT / "weights" / "best.pt")

# ============================================================
# DETECTION CONFIGURATION
# ============================================================

# Webcam
WEBCAM_INDEX = 0  # 0 = default webcam, 1 = external webcam

# Image size for inference
IMG_SIZE = 640  # 640x640 (default YOLOv5)

# Confidence threshold
CONFIDENCE_THRESHOLD = 0.20  # ✅ Turunkan untuk deteksi lebih sensitif (semakin rendah = lebih banyak deteksi)

# ============================================================
# CLASS CONFIGURATION
# ============================================================

# Class names (sesuai urutan di model)
CLASS_NAMES = ['Primordia', 'Muda', 'Matang']

# Harvest estimation (dalam hari)
HARVEST_ESTIMATION = {
    'Primordia': 4,  # +4 hari
    'Muda': 2,       # +2 hari
    'Matang': 0      # Siap panen
}

# Class colors (BGR format untuk OpenCV)
CLASS_COLORS = {
    'Primordia': (0, 255, 255),   # Yellow
    'Muda': (0, 165, 255),         # Orange
    'Matang': (0, 255, 0)          # Green
}

# ============================================================
# DISPLAY CONFIGURATION
# ============================================================

# FPS display
SHOW_FPS = True

# Info panel
SHOW_INFO_PANEL = True

# Bounding box thickness
BBOX_THICKNESS = 2

# Font scale
FONT_SCALE = 0.6

# ============================================================
# RASPBERRY PI 4 CONFIGURATION (Future)
# ============================================================

# Set to True when running on Raspberry Pi 4
USE_PI_MODE = False

# TFLite model path (for Pi 4)
TFLITE_MODEL_PATH = str(PROJECT_ROOT / "weights" / "best.tflite")

# Pi 4 optimizations
PI_IMG_SIZE = 320  # Smaller size for faster inference on Pi
PI_CONFIDENCE_THRESHOLD = 0.30

# ============================================================
# LOGGING CONFIGURATION
# ============================================================

# Enable logging
ENABLE_LOGGING = False

# Log directory
LOG_DIR = str(PROJECT_ROOT / "logs")

# Save detection frames
SAVE_FRAMES = False
FRAMES_DIR = str(PROJECT_ROOT / "output" / "frames")

# ============================================================
# ADVANCED SETTINGS
# ============================================================

# IOU threshold for NMS (Non-Maximum Suppression)
IOU_THRESHOLD = 0.45

# Max detections per frame
MAX_DETECTIONS = 100

# Device ('cpu', 'cuda', '0', '1', etc.)
DEVICE = 'cpu'  # Auto-detect: will use GPU if available

# Half precision (FP16) - only for GPU
HALF_PRECISION = False

# ============================================================
# VALIDATION
# ============================================================

def validate_config():
    """Validate configuration"""
    errors = []
    
    # Check MODEL_PATH exists
    if not Path(MODEL_PATH).exists():
        errors.append(f"Model not found: {MODEL_PATH}")
    
    # Check WEBCAM_INDEX is valid
    if not isinstance(WEBCAM_INDEX, int) or WEBCAM_INDEX < 0:
        errors.append(f"Invalid WEBCAM_INDEX: {WEBCAM_INDEX}")
    
    # Check IMG_SIZE
    if IMG_SIZE not in [320, 416, 512, 640]:
        errors.append(f"IMG_SIZE should be 320, 416, 512, or 640. Got: {IMG_SIZE}")
    
    # Check CONFIDENCE_THRESHOLD
    if not 0.0 <= CONFIDENCE_THRESHOLD <= 1.0:
        errors.append(f"CONFIDENCE_THRESHOLD should be 0.0-1.0. Got: {CONFIDENCE_THRESHOLD}")
    
    # Check CLASS_NAMES
    if len(CLASS_NAMES) != 3:
        errors.append(f"CLASS_NAMES should have 3 classes. Got: {len(CLASS_NAMES)}")
    
    return errors

# ============================================================
# AUTO VALIDATION (Optional)
# ============================================================

if __name__ == "__main__":
    print("="*70)
    print("CONFIG VALIDATION")
    print("="*70)
    
    errors = validate_config()
    
    if errors:
        print("\n❌ Configuration errors:")
        for error in errors:
            print(f"  - {error}")
    else:
        print("\n✅ Configuration OK!")
    
    print("\n" + "="*70)
    print("CURRENT CONFIGURATION")
    print("="*70)
    print(f"MODEL_PATH          : {MODEL_PATH}")
    print(f"WEBCAM_INDEX        : {WEBCAM_INDEX}")
    print(f"IMG_SIZE            : {IMG_SIZE}")
    print(f"CONFIDENCE_THRESHOLD: {CONFIDENCE_THRESHOLD}")
    print(f"CLASS_NAMES         : {CLASS_NAMES}")
    print(f"HARVEST_ESTIMATION  : {HARVEST_ESTIMATION}")
    print(f"DEVICE              : {DEVICE}")