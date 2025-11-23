import cv2
import numpy as np
from detect_jamur_pc import draw_info_panel, LABEL_MAP

# Create blank frame
frame = np.zeros((480, 640, 3), dtype=np.uint8)

# Sample detections simulating YOLO output names
raw_detections = [
    {'class': LABEL_MAP.get('primordia', 'primordia'), 'confidence': 0.88, 'bbox': (10,10,50,50), 'harvest_days': 4},
    {'class': LABEL_MAP.get('Fase Muda', 'Fase Muda'), 'confidence': 0.76, 'bbox': (60,10,100,50), 'harvest_days': 2},
    {'class': LABEL_MAP.get('Matang', 'Matang'), 'confidence': 0.91, 'bbox': (110,10,160,50), 'harvest_days': 0},
    {'class': LABEL_MAP.get('primordia', 'primordia'), 'confidence': 0.67, 'bbox': (10,60,50,100), 'harvest_days': 4},
]

try:
    out = draw_info_panel(frame.copy(), raw_detections)
    print("Panel rendered without KeyError. Shape:", out.shape)
except Exception as e:
    print("Test failed:", e)
