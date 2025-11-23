"""
Check Project Status
"""

import os
from pathlib import Path

def check_file(path, desc):
    """Check if file exists"""
    exists = os.path.exists(path)
    status = "✅" if exists else "❌"
    print(f"{status} {desc:30} {path}")
    return exists

def check_dir(path, desc):
    """Check if directory exists and count files"""
    if os.path.exists(path):
        count = len(list(Path(path).rglob("*")))
        print(f"✅ {desc:30} {path} ({count} files)")
        return True
    else:
        print(f"❌ {desc:30} {path}")
        return False

def main():
    print("="*70)
    print("PROJECT STATUS")
    print("="*70)
    print()
    
    # Check main files
    print("Main Files:")
    check_file("detect_jamur_pc.py", "Main program")
    check_file("config.py", "Config file")
    check_file("test_setup.py", "Setup test")
    check_file("run_all.py", "Auto workflow")
    print()
    
    # Check scripts
    print("Scripts:")
    check_file("scripts/setup_yolov5.py", "Setup YOLOv5")
    check_file("scripts/1_download_dataset.py", "Download dataset")
    check_file("scripts/2_train_model.py", "Train model")
    check_file("scripts/3_copy_model.py", "Copy model")
    check_file("scripts/4_test_model.py", "Test model")
    print()
    
    # Check directories
    print("Directories:")
    check_dir("yolov5", "YOLOv5 repo")
    check_dir("dataset", "Dataset")
    check_dir("weights", "Weights")
    check_dir("runs", "Training runs")
    print()
    
    # Check critical files
    print("Critical Files:")
    has_model = check_file("weights/best.pt", "Trained model")
    has_data = check_file("dataset/data.yaml", "Dataset config")
    print()
    
    # Status summary
    print("="*70)
    print("STATUS SUMMARY")
    print("="*70)
    
    if not os.path.exists("yolov5"):
        print("⚠️  YOLOv5 belum di-setup")
        print("   Run: python scripts/setup_yolov5.py")
    elif not has_data:
        print("⚠️  Dataset belum di-download")
        print("   Run: python scripts/1_download_dataset.py")
    elif not has_model:
        print("⚠️  Model belum di-training")
        print("   Run: python scripts/2_train_model.py")
    else:
        print("✅ SIAP DEMO WEBCAM!")
        print("   Run: python detect_jamur_pc.py")
    
    print("="*70)

if __name__ == "__main__":
    main()
