# 🚨 SOLUSI LENGKAP - Fix Semua Error

## ⚠️ Error yang Terjadi

1. ❌ **404 Not Found** - Endpoint tidak ditemukan
2. ❌ **500 Error** - Cannot find module 'axios'
3. ❌ **500 Error** - No module named 'tqdm'
4. ❌ **Connection Refused** - ML service tidak dapat diakses
5. ❌ **Connection Refused** - Backend tidak berjalan

## ✅ SOLUSI LENGKAP (Ikuti Urutan Ini!)

### Opsi 1: Setup Otomatis (PALING MUDAH!)

**Double-click file:**
```
SETUP_ALL.bat
```

Script ini akan install semua dependencies secara otomatis.

**Setelah setup selesai, double-click:**
```
START_ALL_SERVICES.bat
```

Ini akan start ML service dan backend secara otomatis.

### Opsi 2: Manual Setup (Step by Step)

#### Langkah 1: Install Backend Dependencies

**Di terminal baru, ketik:**

```cmd
cd backend
npm install axios form-data
```

**VERIFIKASI:**
```cmd
npm list axios
```
Harus muncul versi axios.

#### Langkah 2: Install ML Service Dependencies

**Di terminal baru, ketik:**

```cmd
cd "machine learning\Project"
pip install flask flask-cors torch torchvision opencv-python numpy Pillow ultralytics tqdm pandas matplotlib seaborn
```

**Tunggu sampai selesai!** (10-15 menit untuk PyTorch)

**VERIFIKASI:**
```cmd
python -c "import torch; import flask; import tqdm; print('OK')"
```

#### Langkah 3: Start ML Service

**Di terminal baru (Terminal 1):**

```cmd
cd "machine learning\Project"
python ml_api_service.py
```

**Biarkan terminal ini terbuka!**

**VERIFIKASI:**
- Buka browser: `http://localhost:5000/health`
- Harus muncul: `{"status": "healthy", "model_loaded": true}`

#### Langkah 4: Start Backend

**Di terminal baru (Terminal 2):**

```cmd
cd backend
npm start
```

**Biarkan terminal ini terbuka!**

**VERIFIKASI:**
- Buka browser: `http://localhost:3000/`
- Harus muncul list endpoints

#### Langkah 5: Test di Frontend

1. **Refresh browser** (F5)
2. **Login sebagai Petani**
3. **Masuk ke Dashboard Monitoring**
4. **Upload foto**
5. **Klik "Deteksi"**

## 📋 Checklist Final

Sebelum test, pastikan:

- [ ] ✅ **axios terinstall** di backend (`cd backend` → `npm list axios`)
- [ ] ✅ **ML dependencies terinstall** (`python -c "import torch; print('OK')"`)
- [ ] ✅ **ML Service berjalan** (`http://localhost:5000/health` → OK)
- [ ] ✅ **Backend berjalan** (`http://localhost:3000/` → OK)
- [ ] ✅ **Frontend berjalan** (`http://localhost:5173/` → OK)

## 🔍 Troubleshooting

### Error: "Cannot find module 'axios'"
**Solusi:**
```cmd
cd backend
npm install axios form-data
# RESTART backend setelah install!
```

### Error: "No module named 'tqdm'"
**Solusi:**
```cmd
cd "machine learning\Project"
pip install tqdm pandas matplotlib seaborn
# RESTART ML service setelah install!
```

### Error: "ML service tidak dapat diakses"
**Solusi:**
- Pastikan ML service berjalan (`http://localhost:5000/health`)
- Cek terminal ML service untuk error
- Pastikan port 5000 tidak digunakan aplikasi lain

### Error: "Connection refused"
**Solusi:**
- Backend tidak berjalan → Start backend (`cd backend` → `npm start`)
- ML service tidak berjalan → Start ML service (`python ml_api_service.py`)

## 🎯 Quick Commands (Copy-Paste)

```cmd
# 1. Install Backend Dependencies
cd backend
npm install axios form-data

# 2. Install ML Dependencies
cd "machine learning\Project"
pip install flask flask-cors torch torchvision opencv-python numpy Pillow ultralytics tqdm pandas matplotlib seaborn

# 3. Start ML Service (Terminal 1)
cd "machine learning\Project"
python ml_api_service.py

# 4. Start Backend (Terminal 2)
cd backend
npm start
```

## 💡 Tips Penting

1. **Install dependencies dulu** sebelum start service
2. **RESTART service** setelah install dependencies
3. **Jangan tutup terminal** saat service berjalan
4. **Cek log** di terminal untuk melihat error detail
5. **Test satu per satu** - ML service dulu, lalu backend

## 🚀 Urutan Menjalankan

1. **Setup** (sekali saja):
   - Double-click: `SETUP_ALL.bat`
   - Atau install manual (lihat Opsi 2)

2. **Start Services**:
   - Double-click: `START_ALL_SERVICES.bat`
   - Atau start manual (lihat Opsi 2 Langkah 3-4)

3. **Test**:
   - Refresh browser
   - Upload foto
   - Klik "Deteksi"

---

**Coba pakai `SETUP_ALL.bat` dulu, lalu `START_ALL_SERVICES.bat`!** 🚀

