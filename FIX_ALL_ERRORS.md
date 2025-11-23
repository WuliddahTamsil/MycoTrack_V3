# 🚨 FIX SEMUA ERROR - Langkah Lengkap

## Masalah yang Terjadi

1. ❌ **Backend Error**: `Cannot find module 'axios'`
2. ❌ **ML Service Error**: 404 Not Found di `localhost:5000`
3. ❌ **Endpoint Error**: 500 Internal Server Error

## ✅ SOLUSI LENGKAP (Ikuti Urutan Ini!)

### Langkah 1: Install axios di Backend

**Di terminal backend (atau terminal baru), ketik:**

```cmd
cd backend
npm install axios form-data
```

**ATAU double-click:**
```
backend\install_axios.bat
```

### Langkah 2: Install Dependencies ML Service

**Di terminal baru, ketik:**

```powershell
cd "D:\RPL_Kelompok 4 - NOVA\machine learning\Project"

# Install semua dependencies (butuh 10-15 menit)
pip install flask flask-cors torch torchvision opencv-python numpy Pillow ultralytics
```

**ATAU double-click:**
```
machine learning\Project\install_all_dependencies.bat
```

**Tunggu sampai selesai!** (PyTorch besar, butuh waktu)

### Langkah 3: Jalankan ML Service

**Setelah dependencies terinstall, di terminal yang sama:**

```cmd
python ml_api_service.py
```

**ATAU double-click:**
```
machine learning\Project\start_ml_service.bat
```

**Verifikasi ML Service:**
- Buka browser: `http://localhost:5000/health`
- Harus muncul: `{"status": "healthy", "model_loaded": true}`

### Langkah 4: RESTART Backend (PENTING!)

**Di terminal backend:**

1. **Stop backend:** Tekan `CTRL+C`
2. **Start lagi:**
   ```cmd
   cd backend
   npm start
   ```

**Verifikasi Backend:**
- Buka browser: `http://localhost:3000/api/ml/health`
- Harus muncul status ML service

### Langkah 5: Test di Frontend

1. **Refresh browser** (F5)
2. **Upload foto** di dashboard monitoring
3. **Klik "Deteksi"**

## 📋 Checklist Final

Sebelum test, pastikan:

- [ ] ✅ **axios terinstall** di backend (`npm list axios`)
- [ ] ✅ **form-data terinstall** di backend (`npm list form-data`)
- [ ] ✅ **ML Service berjalan** (`http://localhost:5000/health` → OK)
- [ ] ✅ **Backend sudah di-restart** setelah install axios
- [ ] ✅ **Backend berjalan** (`http://localhost:3000/` → OK)
- [ ] ✅ **Frontend berjalan** (`http://localhost:5173/` → OK)

## 🔍 Verifikasi Semua Service

### Terminal 1 - ML Service:
```
==========================================================
ML Detection API Service
==========================================================
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

## ⚠️ Jika Masih Error

### Error: "Cannot find module 'axios'"
**Solusi:**
```cmd
cd backend
npm install axios form-data
# RESTART backend setelah install!
```

### Error: 404 di localhost:5000
**Solusi:**
- ML service belum jalan → Jalankan `python ml_api_service.py`
- Dependencies belum terinstall → Install dulu (Langkah 2)

### Error: 500 Internal Server Error
**Solusi:**
- Backend belum di-restart setelah install axios → **RESTART BACKEND!**
- ML service tidak berjalan → Jalankan ML service

## 🎯 Quick Commands

```cmd
# 1. Install axios (Backend)
cd backend
npm install axios form-data

# 2. Install ML dependencies (ML Service)
cd "machine learning\Project"
pip install flask flask-cors torch torchvision opencv-python numpy Pillow ultralytics

# 3. Jalankan ML Service
python ml_api_service.py

# 4. RESTART Backend (terminal baru)
cd backend
npm start
```

## 💡 Tips Penting

1. **Install axios dulu** sebelum restart backend
2. **Install semua ML dependencies** sebelum jalankan ML service
3. **RESTART backend** setelah install axios (PENTING!)
4. **Jangan tutup terminal** saat service berjalan
5. **Cek log** di terminal untuk melihat error detail

---

**Ikuti semua langkah di atas, terutama Langkah 1 dan 4 (install axios + restart backend)!** 🚀

