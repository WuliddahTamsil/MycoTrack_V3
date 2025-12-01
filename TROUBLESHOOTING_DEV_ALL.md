# 🔧 Troubleshooting: npm run dev:all

## Error: "Tidak dapat terhubung ke server. Pastikan backend berjalan di localhost:3000"

### Gejala
- Error message: "Tidak dapat terhubung ke server. Pastikan backend berjalan di localhost:3000"
- Frontend tidak bisa connect ke backend
- Backend tidak start atau crash saat startup

### Solusi

#### 1. Kill Port 3000 yang Terpakai
Port 3000 mungkin sudah digunakan oleh proses lain. Gunakan script untuk membersihkan:
```bash
npm run kill:3000
```

Atau manual:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### 2. Test Backend Secara Manual
Jalankan backend secara terpisah untuk melihat error:
```bash
npm run dev:backend
```

Atau:
```bash
cd backend
npm start
```

Harus muncul output:
```
==================================================
✅ Backend server running on http://localhost:3000
✅ Health check: http://localhost:3000/api/health
==================================================
```

#### 3. Cek Dependencies Backend
Pastikan semua dependencies terinstall:
```bash
cd backend
npm install
```

#### 4. Test Backend di Browser
Buka browser dan akses:
```
http://localhost:3000/api/health
```

Harus muncul:
```json
{"status":"ok","message":"Backend is running"}
```

#### 5. Cek Log Error Backend
Saat menjalankan `npm run dev:all`, perhatikan output dari backend.
Cari bagian yang dimulai dengan `[backend]` untuk melihat error.

#### 6. Cek Database Connection
Backend mungkin crash karena database connection error.
Cek file `backend/database/db.js` dan pastikan konfigurasi database benar.

### Alternatif: Jalankan Backend Terpisah

Jika `npm run dev:all` tidak bekerja untuk backend, jalankan secara terpisah:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - ML + Frontend:**
```bash
npm run dev:ml
npm run dev:frontend
```

---

## Error: "ML service tidak dapat diakses"

### Gejala
- Error message: "ML service tidak dapat diakses. Pastikan ML service berjalan di port 5000 dan backend di port 3000."
- Backend tidak bisa connect ke ML service

### Solusi

#### 1. Cek ML Service Berjalan
Jalankan command ini di terminal terpisah untuk test ML service:
```bash
cd "machine learning\Project"
python ml_api_service.py
```

Jika ML service start dengan benar, Anda akan melihat:
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

#### 2. Cek Dependencies Python
Pastikan semua dependencies terinstall:
```bash
cd "machine learning\Project"
pip install -r requirements_ml_api.txt
```

Atau install manual:
```bash
pip install flask flask-cors torch torchvision opencv-python numpy Pillow ultralytics
```

#### 3. Cek Model File (Optional)
Model file tidak wajib untuk start service, tapi diperlukan untuk detection:
```bash
# Cek apakah model ada
dir "machine learning\Project\weights\best.pt"
```

Jika tidak ada, service tetap bisa start tapi detection akan gagal.

#### 4. Cek Port 5000 Tidak Terpakai
```bash
netstat -ano | findstr :5000
```

Jika port terpakai, kill proses tersebut atau ubah port di `ml_api_service.py`.

#### 5. Test ML Service Manual
Buka browser dan akses:
```
http://localhost:5000/health
```

Harus muncul:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_path": "weights/best.pt"
}
```

#### 6. Cek Log Output
Saat menjalankan `npm run dev:all`, perhatikan output dari ML service. 
Cari bagian yang dimulai dengan `[ml]` untuk melihat error ML service.

### Alternatif: Jalankan ML Service Terpisah

Jika `npm run dev:all` tidak bekerja untuk ML service, jalankan secara terpisah:

**Terminal 1 - ML Service:**
```bash
cd "machine learning\Project"
python ml_api_service.py
```

**Terminal 2 - Backend + Frontend:**
```bash
npm run dev:all
```

Atau gunakan file batch:
```bash
# Double-click file ini
START_DEV_ALL.bat
```

### Checklist Debugging

- [ ] Python 3.8+ terinstall dan ada di PATH
- [ ] Dependencies Python terinstall (flask, flask-cors, dll)
- [ ] File `ml_api_service.py` ada di `machine learning/Project/`
- [ ] Port 5000 tidak digunakan aplikasi lain
- [ ] ML service bisa start manual dengan `python ml_api_service.py`
- [ ] Health check `http://localhost:5000/health` berhasil

### Error Lainnya

#### "Python tidak ditemukan"
- Install Python 3.8+ dari https://www.python.org/downloads/
- Pastikan "Add Python to PATH" dicentang saat install
- Restart terminal setelah install

#### "ModuleNotFoundError: No module named 'flask'"
```bash
pip install flask flask-cors
```

#### "Port 5000 already in use"
```bash
# Gunakan script helper
npm run kill:5000

# Atau manual
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

#### "Port 3000 already in use"
```bash
# Gunakan script helper
npm run kill:3000

# Atau manual
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### "Port 5173 already in use" (Frontend)
```bash
# Gunakan script helper
npm run kill:5173

# Atau manual
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

## Script Helper yang Tersedia

- `npm run kill:3000` - Kill proses di port 3000 (Backend)
- `npm run kill:5000` - Kill proses di port 5000 (ML Service)
- `npm run kill:5173` - Kill proses di port 5173 (Frontend)
- `npm run kill:port <port>` - Kill proses di port tertentu

