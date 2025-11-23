"""
Script 4: Test Model dengan Sample Image
"""

import torch
import cv2
import os
from pathlib import Path

# ============================================================
# KONFIGURASI
# ============================================================
MODEL_PATH = "weights/best.pt"
TEST_IMAGE = "dataset/test/images"  # Folder test images
OUTPUT_DIR = "output/test_results"

# ============================================================

def test_model():
    print("="*70)
    print("STEP 4: Test Model dengan Sample Image")
    print("="*70)
    
    # Cek model
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Model tidak ditemukan: {MODEL_PATH}")
        print("\nJalankan: python scripts/3_copy_model.py")
        return
    
    # Load model
    print(f"\n[INFO] Loading model: {MODEL_PATH}")
    model = torch.hub.load('ultralytics/yolov5', 'custom', path=MODEL_PATH, force_reload=False)
    print(f"[INFO] Model loaded!")
    
    # Create output dir
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Get test images
    test_path = Path(TEST_IMAGE)
    if not test_path.exists():
        print(f"❌ Test images tidak ditemukan: {TEST_IMAGE}")
        return
    
    image_files = list(test_path.glob("*.jpg")) + list(test_path.glob("*.png"))
    
    if not image_files:
        print(f"❌ Tidak ada image di: {TEST_IMAGE}")
        return
    
    print(f"\n[INFO] Found {len(image_files)} test images")
    print(f"[INFO] Testing first 5 images...\n")
    
    # Test first 5 images
    for i, img_path in enumerate(image_files[:5]):
        print(f"Testing {i+1}/5: {img_path.name}")
        
        # Read image
        img = cv2.imread(str(img_path))
        
        # Inference
        results = model(img)
        
        # Get detections
        detections = results.pandas().xyxy[0]
        print(f"  Detections: {len(detections)}")
        
        # Render results
        results.render()
        
        # Save output
        output_path = f"{OUTPUT_DIR}/{img_path.stem}_result.jpg"
        cv2.imwrite(output_path, results.ims[0])
        print(f"  Saved: {output_path}\n")
    
    print("="*70)
    print("✅ TEST SELESAI!")
    print("="*70)
    print(f"\nHasil test tersimpan di: {OUTPUT_DIR}")
    print(f"\nNext: python detect_jamur_pc.py (demo webcam)")

if __name__ == "__main__":
    test_model()
