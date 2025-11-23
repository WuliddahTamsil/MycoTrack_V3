"""
Script 1: Download Dataset dari Roboflow
"""

from roboflow import Roboflow
import os
from pathlib import Path
import shutil
import yaml

# ============================================================
# KONFIGURASI - SESUAI DENGAN KODE ROBOFLOW ANDA
# ============================================================
API_KEY = "3TWytzWFv8IAg6xADbaC"
WORKSPACE = "test-for-robot-vision"
PROJECT = "mushroom-detection-emhqk-g6rjm"
VERSION = 8

DOWNLOAD_PATH = "dataset"

# ============================================================

def count_images(path):
    """Count images in a directory"""
    if not Path(path).exists():
        return 0
    return len(list(Path(path).glob("*.jpg"))) + len(list(Path(path).glob("*.png")))

def fix_data_yaml(dataset_location):
    """Fix data.yaml dengan absolute path"""
    data_yaml = Path(dataset_location) / "data.yaml"
    
    if not data_yaml.exists():
        print(f"⚠️  data.yaml tidak ditemukan di: {data_yaml}")
        return
    
    print("\n🔧 Memperbaiki data.yaml...")
    
    with open(data_yaml, 'r') as f:
        data = yaml.safe_load(f)
    
    # Convert ke absolute path
    base_path = Path(dataset_location).resolve()
    
    # Update paths - PENTING: gunakan absolute path
    data['path'] = str(base_path)  # ✅ Tambah root path
    data['train'] = 'train/images'  # ✅ Relative dari path
    data['val'] = 'valid/images'    # ✅ Relative dari path
    
    # Tambahkan test jika ada
    test_path = base_path / 'test' / 'images'
    if test_path.exists():
        data['test'] = 'test/images'
    
    # Save fixed yaml
    with open(data_yaml, 'w') as f:
        yaml.dump(data, f, default_flow_style=False, sort_keys=False)
    
    print(f"✅ data.yaml diperbaiki:")
    print(f"   path : {data['path']}")
    print(f"   train: {data['train']}")
    print(f"   val  : {data['val']}")

def download_dataset():
    print("="*70)
    print("STEP 1: Download Dataset dari Roboflow")
    print("="*70)
    
    print(f"\n📌 Dataset Info:")
    print(f"   Workspace: {WORKSPACE}")
    print(f"   Project  : {PROJECT}")
    print(f"   Version  : {VERSION}")
    print()
    
    try:
        # Hapus dataset lama jika ada
        if Path(DOWNLOAD_PATH).exists():
            response = input("⚠️  Dataset sudah ada. Hapus dan download ulang? (y/n): ").lower()
            if response == 'y':
                print(f"🗑️  Menghapus dataset lama...")
                shutil.rmtree(DOWNLOAD_PATH)
                print("✅ Dataset lama dihapus")
            else:
                print("❌ Download dibatalkan")
                return None
        
        # Initialize Roboflow
        print("\n🔗 Connecting to Roboflow...")
        rf = Roboflow(api_key=API_KEY)
        print(f"✅ Connected")
        
        # Get project
        project = rf.workspace(WORKSPACE).project(PROJECT)
        print(f"✅ Project loaded")
        
        # Get version
        version = project.version(VERSION)
        print(f"✅ Version {VERSION} loaded")
        
        # Download dataset
        print(f"\n📥 Downloading dataset...")
        print("   This may take a few minutes...")
        
        dataset = version.download("yolov5", location=DOWNLOAD_PATH)
        
        print("\n" + "="*70)
        print("✅ DOWNLOAD BERHASIL!")
        print("="*70)
        
        # Fix data.yaml
        fix_data_yaml(dataset.location)
        
        # Show dataset info
        print("\n📊 Dataset Statistics:")
        dataset_path = Path(dataset.location)
        
        total = 0
        for split in ['train', 'valid', 'test']:
            split_path = dataset_path / split / 'images'
            if split_path.exists():
                count = count_images(split_path)
                total += count
                print(f"   {split.upper():6s}: {count:4d} images")
        
        print(f"   {'TOTAL':6s}: {total:4d} images")
        print(f"\n✅ Dataset location: {dataset.location}")
        print(f"✅ Next: python scripts/2_train_model.py")
        
        return dataset.location
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nTroubleshooting:")
        print("1. Cek API_KEY di script ini")
        print("2. Pastikan version 8 tersedia")
        print("3. Cek koneksi internet")
        return None

if __name__ == "__main__":
    download_dataset()
