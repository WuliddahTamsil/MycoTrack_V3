# 📦 Install Dependencies - ML Service

## ⚠️ Error: ModuleNotFoundError

Jika mendapat error seperti:
- `ModuleNotFoundError: No module named 'torch'`
- `ModuleNotFoundError: No module named 'flask_cors'`
- `ModuleNotFoundError: No module named 'cv2'`

## ✅ Solusi: Install Semua Dependencies

### Cara 1: Menggunakan Script (PALING MUDAH)

**Double-click file:**
```
install_all_dependencies.bat
```

Script ini akan install semua dependencies secara otomatis.

**ATAU untuk install cepat:**
```
install_dependencies_quick.bat
```

### Cara 2: Manual Install (Step by Step)

**Di PowerShell/CMD, ketik:**

```cmd
cd "D:\RPL_Kelompok 4 - NOVA\machine learning\Project"

# Install semua sekaligus (RECOMMENDED)
pip install flask flask-cors torch torchvision opencv-python numpy Pillow ultralytics
```

**ATAU install satu per satu:**

```cmd
# 1. Flask
pip install flask flask-cors

# 2. NumPy & Pillow (kecil, cepat)
pip install numpy Pillow

# 3. OpenCV
pip install opencv-python

# 4. PyTorch (BESAR, butuh 10-15 menit!)
pip install torch torchvision

# 5. Ultralytics (YOLOv5)
pip install ultralytics
```

### Cara 3: Install dari Requirements File

```cmd
cd "D:\RPL_Kelompok 4 - NOVA\machine learning\Project"
pip install -r requirements_ml_api.txt
```

## ⏱️ Waktu Install

- Flask, flask-cors: ~30 detik
- NumPy, Pillow: ~1 menit
- OpenCV: ~2 menit
- **PyTorch: ~10-15 menit** (package besar!)
- Ultralytics: ~2 menit

**Total: ~15-20 menit**

## ✅ Verifikasi Install

Setelah install selesai, test:

```cmd
python -c "import torch; print('PyTorch:', torch.__version__)"
python -c "import flask; import flask_cors; print('Flask OK')"
python -c "import cv2; print('OpenCV:', cv2.__version__)"
python -c "import numpy; print('NumPy OK')"
```

Semua harus muncul tanpa error.

## 🚀 Setelah Install Selesai

1. **Jalankan ML Service:**
   ```cmd
   python ml_api_service.py
   ```

2. **Verifikasi:**
   - Buka browser: `http://localhost:5000/health`
   - Harus muncul: `{"status": "healthy"}`

3. **Restart Backend** (di terminal lain):
   ```cmd
   cd backend
   npm start
   ```

4. **Test di Frontend:**
   - Upload foto
   - Klik "Deteksi"

## ⚠️ Troubleshooting

### Error: "pip is not recognized"
**Solusi:**
```cmd
python -m pip install flask flask-cors torch torchvision opencv-python numpy Pillow ultralytics
```

### Error: "Permission denied"
**Solusi:**
```cmd
# Windows: Run as Administrator
# Atau install untuk user:
pip install --user flask flask-cors torch torchvision opencv-python numpy Pillow ultralytics
```

### Error: PyTorch install terlalu lama
**Solusi:**
- Ini normal! PyTorch adalah package besar (~2GB)
- Biarkan proses berjalan sampai selesai
- Jangan tutup terminal

### Error: "No space left on device"
**Solusi:**
- PyTorch butuh ~5GB space
- Free up disk space terlebih dahulu

## 💡 Tips

- **Install saat koneksi internet stabil** (PyTorch besar)
- **Jangan tutup terminal** saat install berjalan
- **Install sekali saja**, setelah itu bisa langsung pakai
- Jika error, coba install satu per satu untuk tahu yang bermasalah

---

**Setelah semua dependencies terinstall, jalankan `python ml_api_service.py`!** 🚀

