"""
Script Setup: Clone dan Install YOLOv5
"""

import subprocess
import os
import sys

def setup_yolov5():
    print("="*70)
    print("Setup YOLOv5")
    print("="*70)
    
    # Check if yolov5 already exists
    if os.path.exists("yolov5"):
        print("✅ YOLOv5 sudah ada")
        update = input("\nUpdate YOLOv5? (y/n): ").lower()
        if update == 'y':
            print("\n[INFO] Updating YOLOv5...")
            os.chdir("yolov5")
            subprocess.run(["git", "pull"], check=True)
            os.chdir("..")
            print("✅ YOLOv5 updated!")
        return
    
    # Clone YOLOv5
    print("\n[INFO] Cloning YOLOv5...")
    try:
        subprocess.run(
            ["git", "clone", "https://github.com/ultralytics/yolov5.git"],
            check=True
        )
        print("✅ YOLOv5 cloned!")
    except subprocess.CalledProcessError:
        print("❌ Git error!")
        print("\nManual clone:")
        print("  git clone https://github.com/ultralytics/yolov5.git")
        return
    except FileNotFoundError:
        print("❌ Git tidak terinstall!")
        print("\nInstall Git: https://git-scm.com/downloads")
        return
    
    # Install requirements
    print("\n[INFO] Installing YOLOv5 requirements...")
    try:
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", "yolov5/requirements.txt"],
            check=True
        )
        print("✅ Requirements installed!")
    except subprocess.CalledProcessError:
        print("❌ Installation error!")
        print("\nManual install:")
        print("  pip install -r yolov5/requirements.txt")
        return
    
    print("\n" + "="*70)
    print("✅ YOLOV5 SETUP SELESAI!")
    print("="*70)
    print("\nNext: python scripts/1_download_dataset.py")

if __name__ == "__main__":
    setup_yolov5()
