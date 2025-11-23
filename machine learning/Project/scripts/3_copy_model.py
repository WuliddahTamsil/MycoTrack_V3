"""
Script 3: Copy Model ke Folder Weights
"""

import os
import shutil

# ============================================================
# KONFIGURASI
# ============================================================
SOURCE_MODEL = "runs/train/jamur_detector/weights/best.pt"
DEST_DIR = "weights"
DEST_MODEL = f"{DEST_DIR}/best.pt"

# ============================================================

def copy_model():
    print("="*70)
    print("STEP 3: Copy Model ke Weights Folder")
    print("="*70)
    
    # Cek source model
    if not os.path.exists(SOURCE_MODEL):
        print(f"❌ Model tidak ditemukan: {SOURCE_MODEL}")
        print("\nJalankan dulu: python scripts/2_train_model.py")
        return
    
    # Create dest dir jika belum ada
    os.makedirs(DEST_DIR, exist_ok=True)
    
    # Copy model
    try:
        shutil.copy2(SOURCE_MODEL, DEST_MODEL)
        
        # Get file size
        size_mb = os.path.getsize(DEST_MODEL) / (1024 * 1024)
        
        print(f"✅ Model copied!")
        print(f"   From: {SOURCE_MODEL}")
        print(f"   To  : {DEST_MODEL}")
        print(f"   Size: {size_mb:.2f} MB")
        
        print("\n" + "="*70)
        print("✅ MODEL SIAP DIGUNAKAN!")
        print("="*70)
        print(f"\nNext: python detect_jamur_pc.py")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    copy_model()
