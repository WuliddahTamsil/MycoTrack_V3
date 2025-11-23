# 🚀 Cara Menjalankan ML Service

Panduan lengkap untuk menjalankan ML Detection Service agar fitur deteksi di dashboard bisa berfungsi.

## ⚡ Cara Cepat (Windows)

### Opsi 1: Menggunakan Batch File (Paling Mudah)
1. Buka folder: `machine learning\Project`
2. Double-click file: `start_ml_service.bat`
3. Terminal akan terbuka dan service mulai berjalan
4. Biarkan terminal terbuka selama menggunakan fitur deteksi

### Opsi 2: Manual via Command Prompt
1. Buka Command Prompt (CMD)
2. Masuk ke folder project:
   ```cmd
   cd "D:\RPL_Kelompok 4 - NOVA\machine learning\Project"
   ```
3. Install dependencies (jika belum):
   ```cmd
   pip install -r requirements_ml_api.txt
   ```
4. Jalankan service:
   ```cmd
   python ml_api_service.py
   ```

## 🐧 Cara Cepat (Linux/Mac)

### Opsi 1: Menggunakan Shell Script
1. Buka Terminal
2. Masuk ke folder project:
   ```bash
   cd "machine learning/Project"
   ```
3. Berikan permission:
   ```bash
   chmod +x start_ml_service.sh
   ```
4. Jalankan:
   ```bash
   ./start_ml_service.sh
   ```

### Opsi 2: Manual
1. Buka Terminal
2. Masuk ke folder project
3. Install dependencies:
   ```bash
   pip3 install -r requirements_ml_api.txt
   ```
4. Jalankan:
   ```bash
   python3 ml_api_service.py
   ```

## ✅ Verifikasi Service Berjalan

Setelah menjalankan service, Anda akan melihat output seperti ini:

```
==========================================================
ML Detection API Service
==========================================================
Model path: weights/best.pt
Confidence threshold: 0.4
==========================================================
[INFO] Loading model: weights/best.pt
[INFO] Model loaded successfully!
 * Running on http://127.0.0.1:5000
```

### Test Service dengan Browser
Buka browser dan kunjungi:
```
http://localhost:5000/health
```

Seharusnya muncul response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_path": "weights/best.pt"
}
```

## 🔧 Troubleshooting

### 1. Error: Python tidak ditemukan
**Solusi:**
- Install Python 3.8+ dari [python.org](https://www.python.org/downloads/)
- Pastikan "Add Python to PATH" dicentang saat install
- Restart terminal/command prompt

### 2. Error: Model tidak ditemukan
**Solusi:**
- Pastikan file `weights/best.pt` ada
- Jika belum ada, jalankan training:
  ```cmd
  python scripts\2_train_model.py
  ```

### 3. Error: Module tidak ditemukan (flask, torch, dll)
**Solusi:**
```cmd
pip install -r requirements_ml_api.txt
```

### 4. Error: Port 5000 sudah digunakan
**Solusi:**
- Tutup aplikasi lain yang menggunakan port 5000
- Atau ubah port di `ml_api_service.py`:
  ```python
  app.run(host='0.0.0.0', port=5001, debug=True)  # Ubah ke 5001
  ```
- Dan ubah di `backend/server.js`:
  ```javascript
  const ML_SERVICE_URL = 'http://localhost:5001';
  ```

### 5. Service jalan tapi deteksi gagal
**Periksa:**
- Apakah model file ada dan valid?
- Cek log di terminal Flask untuk error detail
- Pastikan gambar yang diupload format valid (JPG, PNG)

## 📋 Checklist Sebelum Menggunakan

- [ ] Python 3.8+ sudah terinstall
- [ ] Dependencies sudah diinstall (`pip install -r requirements_ml_api.txt`)
- [ ] Model `weights/best.pt` sudah ada
- [ ] ML Service berjalan di port 5000
- [ ] Backend berjalan di port 3000
- [ ] Frontend berjalan di port 5173

## 🎯 Alur Kerja Lengkap

1. **Jalankan ML Service** (di Terminal 1)
   ```cmd
   cd "machine learning\Project"
   python ml_api_service.py
   ```

2. **Jalankan Backend** (di Terminal 2)
   ```cmd
   cd backend
   npm start
   ```

3. **Jalankan Frontend** (di Terminal 3)
   ```cmd
   cd "frontend\MycoTrack Website Development"
   npm run dev
   ```

4. **Buka Browser**
   - Frontend: http://localhost:5173
   - Login sebagai Petani
   - Masuk ke Dashboard Monitoring
   - Upload foto dan klik "Deteksi"

## 💡 Tips

- **Biarkan ML Service berjalan** selama Anda menggunakan fitur deteksi
- Jika service error, cek log di terminal untuk detail error
- Jika model belum ada, training dulu dengan `python scripts\2_train_model.py`
- Untuk development, gunakan `debug=True` di Flask (sudah ada di kode)

## 🔗 Port yang Digunakan

- **ML Service (Flask)**: Port 5000
- **Backend (Node.js)**: Port 3000
- **Frontend (React)**: Port 5173

Pastikan semua port tidak digunakan aplikasi lain!

