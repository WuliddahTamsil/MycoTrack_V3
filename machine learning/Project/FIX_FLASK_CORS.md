# 🔧 Fix: ModuleNotFoundError: No module named 'flask_cors'

## ✅ Solusi Cepat

### Opsi 1: Install di Venv yang Aktif (Jika Venv Masih Bisa Dipakai)

Di PowerShell yang sama, ketik:

```powershell
# Pastikan venv aktif (harus ada (venv) di prompt)
pip install flask flask-cors
```

### Opsi 2: Keluar dari Venv dan Install Global (RECOMMENDED)

```powershell
# 1. Deactivate venv
deactivate

# 2. Install dependencies secara global
pip install flask flask-cors torch torchvision opencv-python numpy Pillow ultralytics

# 3. Jalankan service (tanpa venv)
python ml_api_service.py
```

### Opsi 3: Buat Venv Baru (Jika Venv Rusak)

```powershell
# 1. Deactivate venv lama
deactivate

# 2. Hapus venv lama (opsional)
cd "D:\RPL_Kelompok 4 - NOVA\machine learning\Project"
# rmdir /s /q venv  # Hapus jika ada

# 3. Buat venv baru
python -m venv venv_ml

# 4. Aktifkan venv baru
venv_ml\Scripts\activate

# 5. Install dependencies
pip install flask flask-cors torch torchvision opencv-python numpy Pillow ultralytics

# 6. Jalankan service
python ml_api_service.py
```

## 🚀 Cara Paling Mudah (Tanpa Venv)

**Langsung install dan jalankan tanpa venv:**

```powershell
# 1. Deactivate venv
deactivate

# 2. Masuk ke folder project
cd "D:\RPL_Kelompok 4 - NOVA\machine learning\Project"

# 3. Install dependencies (tanpa venv)
pip install flask flask-cors torch torchvision opencv-python numpy Pillow ultralytics

# 4. Jalankan service
python ml_api_service.py
```

## ✅ Verifikasi

Setelah install, test:

```powershell
python -c "import flask_cors; print('flask_cors OK')"
```

Harus muncul: `flask_cors OK`

## 📝 Catatan

- Jika error "pip tidak ditemukan", gunakan `python -m pip install ...`
- Jika masih error, coba install satu per satu:
  ```powershell
  pip install flask
  pip install flask-cors
  pip install torch
  pip install torchvision
  pip install opencv-python
  pip install numpy
  pip install Pillow
  pip install ultralytics
  ```

