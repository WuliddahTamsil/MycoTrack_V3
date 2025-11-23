# 🚨 QUICK FIX - ML Detection Error

## Masalah yang Terjadi

1. ❌ **ML Service Error**: `ModuleNotFoundError: No module named 'flask_cors'`
2. ❌ **Backend 404 Error**: Endpoint `/api/ml/detect` tidak ditemukan

## ✅ SOLUSI CEPAT (Ikuti Urutan Ini!)

### Langkah 1: Install Dependencies ML Service

**Di PowerShell/CMD, ketik:**

```cmd
cd "D:\RPL_Kelompok 4 - NOVA\machine learning\Project"
pip install flask flask-cors torch torchvision opencv-python numpy Pillow ultralytics
```

**ATAU double-click file:**
```
machine learning\Project\install_dependencies.bat
```

**ATAU jika pakai venv:**
```cmd
# Deactivate venv lama dulu
deactivate

# Install langsung (tanpa venv)
pip install flask flask-cors torch torchvision opencv-python numpy Pillow ultralytics
```

### Langkah 2: Jalankan ML Service

**Setelah dependencies terinstall, jalankan:**

```cmd
cd "D:\RPL_Kelompok 4 - NOVA\machine learning\Project"
python ml_api_service.py
```

**ATAU double-click:**
```
machine learning\Project\start_ml_service.bat
```

**Verifikasi ML Service:**
- Buka browser: `http://localhost:5000/health`
- Harus muncul: `{"status": "healthy", "model_loaded": true}`

### Langkah 3: RESTART Backend Server

**PENTING: Backend HARUS di-restart!**

1. **Di terminal backend, tekan:** `CTRL+C` (stop backend)
2. **Start lagi:**
   ```cmd
   cd backend
   npm start
   ```

3. **Verifikasi Backend:**
   - Buka browser: `http://localhost:3000/`
   - Cek apakah endpoint `/api/ml/detect` ada di list
   - Atau test: `http://localhost:3000/api/ml/health`

### Langkah 4: Test di Frontend

1. Refresh browser (F5)
2. Upload foto di dashboard monitoring
3. Klik "Deteksi"

## 🔍 Verifikasi Semua Service Berjalan

### Terminal 1 - ML Service:
```
==========================================================
ML Detection API Service
==========================================================
Model path: weights/best.pt
[INFO] Model loaded successfully!
🚀 ML Detection Service is starting...
📍 Service URL: http://localhost:5000
```

### Terminal 2 - Backend:
```
✅ Backend server running on http://localhost:3000
```

### Terminal 3 - Frontend:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

## ⚠️ Jika Masih Error 404

### Cek di Terminal Backend:

Saat upload foto, harus muncul log:
```
[ML DETECT] Received detection request
[ML DETECT] Has file: true
[ML DETECT] ML Service URL: http://localhost:5000
```

**Jika log TIDAK muncul:**
- Backend belum di-restart → **RESTART BACKEND!**
- Endpoint tidak terdaftar → Cek `backend/server.js` line 3391

### Test Endpoint Manual:

**Di browser console (F12), ketik:**
```javascript
fetch('http://localhost:3000/api/ml/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

Harus muncul status ML service.

## 📋 Checklist Final

Sebelum test, pastikan:

- [ ] ✅ Dependencies ML terinstall (`pip list | findstr flask`)
- [ ] ✅ ML Service berjalan (`http://localhost:5000/health` → OK)
- [ ] ✅ Backend sudah di-restart setelah perubahan
- [ ] ✅ Backend berjalan (`http://localhost:3000/` → OK)
- [ ] ✅ Frontend berjalan (`http://localhost:5173/` → OK)
- [ ] ✅ Model file ada (`weights/best.pt` → OK)

## 🎯 Urutan Menjalankan (PENTING!)

**Jalankan dalam urutan ini:**

1. **ML Service** (Terminal 1)
   ```cmd
   cd "machine learning\Project"
   python ml_api_service.py
   ```

2. **Backend** (Terminal 2) - **RESTART SETELAH PERUBAHAN!**
   ```cmd
   cd backend
   npm start
   ```

3. **Frontend** (Terminal 3) - Sudah berjalan
   ```cmd
   npm run dev
   ```

## 💡 Tips

- **Jangan tutup terminal** saat service berjalan
- **Restart backend** setiap kali ada perubahan di `server.js`
- **Cek log** di terminal untuk melihat error detail
- Jika port 5000 terpakai, ubah di `ml_api_service.py` dan `server.js`

---

**Coba langkah-langkah di atas, lalu test lagi!** 🚀

