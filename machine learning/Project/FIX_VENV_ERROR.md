# 🔧 Fix Virtual Environment Error

## Masalah
Error: `Fatal error in launcher: Unable to create process using '"D:\Asli Bogor Project\...'`

Ini terjadi karena virtual environment (venv) mengarah ke path lama yang tidak ada.

## ✅ Solusi Cepat

### Opsi 1: Setup Baru (Recommended)

1. **Jalankan setup script:**
   ```cmd
   cd "machine learning\Project"
   setup_ml_service.bat
   ```
   
   Script ini akan:
   - Membuat virtual environment baru (`venv_ml`)
   - Install semua dependencies
   - Setup siap pakai

2. **Setelah setup selesai, jalankan service:**
   ```cmd
   start_ml_service.bat
   ```

### Opsi 2: Manual Fix

1. **Deactivate venv yang bermasalah:**
   ```powershell
   deactivate
   ```

2. **Hapus venv lama (jika ada):**
   ```cmd
   cd "D:\RPL_Kelompok 4 - NOVA"
   rmdir /s /q venv
   ```

3. **Buat venv baru di folder ML Project:**
   ```cmd
   cd "machine learning\Project"
   python -m venv venv_ml
   ```

4. **Aktifkan venv baru:**
   ```cmd
   venv_ml\Scripts\activate.bat
   ```

5. **Install dependencies:**
   ```cmd
   pip install -r requirements_ml_api.txt
   ```

6. **Jalankan service:**
   ```cmd
   python ml_api_service.py
   ```

### Opsi 3: Gunakan Python Global (Tanpa Venv)

Jika tidak ingin pakai venv:

1. **Deactivate venv:**
   ```powershell
   deactivate
   ```

2. **Install dependencies langsung:**
   ```cmd
   cd "machine learning\Project"
   pip install -r requirements_ml_api.txt
   ```

3. **Jalankan service:**
   ```cmd
   python ml_api_service.py
   ```

## 🚀 Quick Start (Setelah Fix)

1. **Setup (hanya sekali):**
   ```cmd
   cd "machine learning\Project"
   setup_ml_service.bat
   ```

2. **Jalankan service:**
   ```cmd
   start_ml_service.bat
   ```

3. **Biarkan terminal terbuka** dan gunakan fitur deteksi di dashboard

## ⚠️ Catatan Penting

- **Jangan tutup terminal** saat ML service berjalan
- Jika error "port 5000 already in use", tutup aplikasi lain yang menggunakan port tersebut
- Pastikan model `weights/best.pt` sudah ada sebelum menjalankan service

## 🔍 Verifikasi

Setelah service berjalan, test di browser:
```
http://localhost:5000/health
```

Atau test dari backend:
```cmd
cd backend
node check_ml_service.js
```

