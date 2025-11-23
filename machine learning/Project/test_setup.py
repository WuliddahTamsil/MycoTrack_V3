"""
Test Setup - Verifikasi semua dependency dan hardware
"""

import sys
import os
from pathlib import Path

def test_python():
    """Test Python version"""
    print("="*70)
    print("1. Python Version")
    print("="*70)
    version = sys.version_info
    print(f"Python {version.major}.{version.minor}.{version.micro}")
    if version.major >= 3 and version.minor >= 8:
        print("✅ Python version OK")
        return True
    else:
        print("❌ Python 3.8+ required")
        return False

def test_dependencies():
    """Test required packages"""
    print("\n" + "="*70)
    print("2. Dependencies")
    print("="*70)
    
    packages = {
        'torch': 'PyTorch',
        'cv2': 'OpenCV',
        'numpy': 'NumPy',
        'PIL': 'Pillow',
        'yaml': 'PyYAML'
    }
    
    all_ok = True
    for module, name in packages.items():
        try:
            __import__(module)
            print(f"✅ {name:20} installed")
        except ImportError:
            print(f"❌ {name:20} NOT installed")
            all_ok = False
    
    return all_ok

def test_cuda():
    """Test CUDA availability"""
    print("\n" + "="*70)
    print("3. CUDA/GPU")
    print("="*70)
    
    try:
        import torch
        cuda_available = torch.cuda.is_available()
        if cuda_available:
            print(f"✅ CUDA available")
            print(f"   GPU: {torch.cuda.get_device_name(0)}")
            print(f"   CUDA version: {torch.version.cuda}")
        else:
            print("⚠️  CUDA not available (akan pakai CPU)")
        return True
    except Exception as e:
        print(f"❌ Error checking CUDA: {e}")
        return False

def test_webcam():
    """Test webcam"""
    print("\n" + "="*70)
    print("4. Webcam")
    print("="*70)
    
    try:
        import cv2
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            ret, frame = cap.read()
            if ret:
                h, w = frame.shape[:2]
                print(f"✅ Webcam accessible")
                print(f"   Resolution: {w}x{h}")
                cap.release()
                return True
            else:
                print("❌ Cannot read from webcam")
                cap.release()
                return False
        else:
            print("❌ Cannot open webcam")
            return False
    except Exception as e:
        print(f"❌ Webcam error: {e}")
        return False

def test_model():
    """Test model file"""
    print("\n" + "="*70)
    print("5. Model File")
    print("="*70)
    
    model_path = Path("weights/best.pt")
    if model_path.exists():
        size_mb = model_path.stat().st_size / (1024**2)
        print(f"✅ Model exists: {model_path}")
        print(f"   Size: {size_mb:.2f} MB")
        return True
    else:
        print(f"❌ Model not found: {model_path}")
        print("   Run training first: python scripts/2_train_model.py")
        return False

def test_yolov5():
    """Test YOLOv5 loading"""
    print("\n" + "="*70)
    print("6. YOLOv5 Loading")
    print("="*70)
    
    try:
        import torch
        print("Loading YOLOv5...")
        
        # Test load pretrained model (yolov5n)
        model = torch.hub.load('ultralytics/yolov5', 'yolov5n', pretrained=True, verbose=False)
        print("✅ YOLOv5 can be loaded")
        return True
    except Exception as e:
        print(f"❌ YOLOv5 loading error: {e}")
        return False

def main():
    print("\n" + "="*70)
    print("SETUP VERIFICATION")
    print("="*70)
    
    results = []
    results.append(("Python", test_python()))
    results.append(("Dependencies", test_dependencies()))
    results.append(("CUDA", test_cuda()))
    results.append(("Webcam", test_webcam()))
    results.append(("Model", test_model()))
    results.append(("YOLOv5", test_yolov5()))
    
    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)
    
    for name, status in results:
        icon = "✅" if status else "❌"
        print(f"{icon} {name}")
    
    all_passed = all(status for _, status in results)
    
    print("\n" + "="*70)
    if all_passed:
        print("✅ ALL TESTS PASSED - READY TO GO!")
        print("="*70)
        print("\nNext: python detect_jamur_pc.py")
    else:
        print("⚠️  SOME TESTS FAILED")
        print("="*70)
        print("\nFix the issues above before running detection")

if __name__ == "__main__":
    main()