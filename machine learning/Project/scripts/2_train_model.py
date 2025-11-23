"""
Script 2: Training YOLOv5
"""

import os
import subprocess
import sys

# ============================================================
# KONFIGURASI TRAINING
# ============================================================
DATA_YAML = "dataset/data.yaml"
MODEL_SIZE = "yolov5n"              
IMG_SIZE = 640
BATCH_SIZE = 8                      # ✅ Kurangi batch size untuk CPU
EPOCHS = 200                        # ✅ Ubah dari 50 ke 150-200
DEVICE = "cpu"                      # ✅ UBAH DARI "0" KE "cpu"

PROJECT_DIR = "runs/train"
EXPERIMENT_NAME = "jamur_detector"

# ============================================================

def check_yolov5():
    """Cek apakah YOLOv5 sudah di-clone"""
    if not os.path.exists("yolov5"):
        print("❌ YOLOv5 belum ada!")
        print("\nJalankan:")
        print("  git clone https://github.com/ultralytics/yolov5")
        print("  cd yolov5")
        print("  pip install -r requirements.txt")
        print("  cd ..")
        return False
    return True

def train_yolov5():
    print("="*70)
    print("STEP 2: Training YOLOv5")
    print("="*70)
    
    # Cek YOLOv5
    if not check_yolov5():
        return
    
    # Cek data.yaml
    if not os.path.exists(DATA_YAML):
        print(f"❌ {DATA_YAML} tidak ditemukan!")
        print("\nJalankan dulu: python scripts/1_download_dataset.py")
        return
    
    print(f"\n[CONFIG]")
    print(f"  Dataset  : {DATA_YAML}")
    print(f"  Model    : {MODEL_SIZE}")
    print(f"  Image    : {IMG_SIZE}x{IMG_SIZE}")
    print(f"  Batch    : {BATCH_SIZE}")
    print(f"  Epochs   : {EPOCHS}")
    print(f"  Device   : {DEVICE}")
    
    # Command training
    cmd = [
        sys.executable, "yolov5/train.py",
        "--img", str(IMG_SIZE),
        "--batch", str(BATCH_SIZE),
        "--epochs", str(EPOCHS),
        "--data", DATA_YAML,
        "--weights", f"{MODEL_SIZE}.pt",
        "--device", DEVICE,
        "--project", PROJECT_DIR,
        "--name", EXPERIMENT_NAME,
        "--exist-ok"
    ]
    
    print(f"\n[COMMAND] {' '.join(cmd)}")
    print("\n" + "="*70)
    print("Training dimulai...")
    print("="*70 + "\n")
    
    try:
        subprocess.run(cmd, check=True)
        
        print("\n" + "="*70)
        print("✅ TRAINING SELESAI!")
        print("="*70)
        
        best_model = f"{PROJECT_DIR}/{EXPERIMENT_NAME}/weights/best.pt"
        print(f"\nBest model: {best_model}")
        print(f"\nNext: python scripts/3_copy_model.py")
        
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Training error: {e}")
    except KeyboardInterrupt:
        print("\n\n⚠️ Training dihentikan")

if __name__ == "__main__":
    train_yolov5()
