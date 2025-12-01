# 🚀 Cara Menggunakan npm run dev:all

## 📋 Deskripsi

Script `npm run dev:all` akan menjalankan **SEMUA** service secara bersamaan:
- ✅ **ML Service** (Python Flask) - Port 5000
- ✅ **Backend** (Node.js/Express) - Port 3000  
- ✅ **Frontend** (React/Vite) - Port 5173

## 🎯 Cara Menggunakan

### 1. Install Dependencies (Pertama Kali)
```bash
npm run install:all
```

### 2. Bersihkan Port yang Terpakai (Jika Perlu)
```bash
npm run kill:3000  # Backend
npm run kill:5000  # ML Service
npm run kill:5173  # Frontend
```

### 3. Jalankan Semua Service
```bash
npm run dev:all
```

## ✅ Verifikasi Service Berjalan

Setelah menjalankan `npm run dev:all`, buka terminal **BARU** dan jalankan:

```bash
npm run test:services
```

Ini akan mengecek apakah semua service berjalan dengan benar.

### Atau Test Manual di Browser:

1. **Backend**: http://localhost:3000/api/health
   - Harus muncul: `{"status":"ok","message":"Backend is running"}`

2. **ML Service**: http://localhost:5000/health
   - Harus muncul: `{"status":"healthy","model_loaded":true}`

3. **Frontend**: http://localhost:5173
   - Harus muncul halaman website

## 📊 Output yang Diharapkan

Saat menjalankan `npm run dev:all`, Anda akan melihat output seperti ini:

```
[ml] ======================================================================
[ml] Starting ML Detection Service (Python Flask)
[ml] ======================================================================
[ml] Path: D:\MycoTrack_V3\machine learning\Project
[ml] ======================================================================

[backend] ======================================================================
[backend] Starting Backend Server (Node.js/Express)
[backend] ======================================================================
[backend] Path: D:\MycoTrack_V3\backend
[backend] ======================================================================

[frontend] VITE v6.3.5  ready in 500 ms
[frontend] ➜  Local:   http://localhost:5173/
[frontend] ➜  Network: use --host to expose
```

## ⚠️ Troubleshooting

### Error: "Tidak dapat terhubung ke server. Pastikan backend berjalan di localhost:3000"

**Langkah 1: Cek Apakah Backend Berjalan**
```bash
# Di terminal baru, jalankan:
npm run test:services
```

**Langkah 2: Cek Port 3000**
```bash
npm run kill:3000
npm run dev:all
```

**Langkah 3: Test Backend Manual**
```bash
npm run dev:backend
```

Jika backend start dengan benar, Anda akan melihat:
```
==================================================
✅ Backend server running on http://localhost:3000
✅ Health check: http://localhost:3000/api/health
==================================================
```

**Langkah 4: Cek Error di Terminal**
Saat menjalankan `npm run dev:all`, perhatikan output dari `[backend]`. 
Cari error message yang muncul.

### Error: "ML service tidak dapat diakses"

**Langkah 1: Cek Python Terinstall**
```bash
python --version
```

**Langkah 2: Install Dependencies Python**
```bash
cd "machine learning\Project"
pip install -r requirements_ml_api.txt
```

**Langkah 3: Test ML Service Manual**
```bash
npm run dev:ml
```

### Error: Port Already in Use

Gunakan script helper untuk membersihkan port:
```bash
npm run kill:3000  # Backend
npm run kill:5000  # ML Service  
npm run kill:5173  # Frontend
```

## 🔧 Script yang Tersedia

| Script | Deskripsi |
|--------|-----------|
| `npm run dev:all` | Jalankan semua service (ML + Backend + Frontend) |
| `npm run dev:backend` | Hanya Backend |
| `npm run dev:ml` | Hanya ML Service |
| `npm run dev:frontend` | Hanya Frontend |
| `npm run test:services` | Test apakah semua service berjalan |
| `npm run kill:3000` | Membersihkan port 3000 |
| `npm run kill:5000` | Membersihkan port 5000 |
| `npm run kill:5173` | Membersihkan port 5173 |
| `npm run install:all` | Install semua dependencies |

## 📝 Catatan Penting

1. **Jangan tutup terminal** saat `npm run dev:all` berjalan
2. **Tunggu beberapa detik** setelah start untuk semua service ready
3. **Gunakan terminal baru** untuk test service dengan `npm run test:services`
4. **Jika ada error**, cek output di terminal untuk detail error

## 🎯 Quick Start

```bash
# 1. Install dependencies
npm run install:all

# 2. Bersihkan port (jika perlu)
npm run kill:3000
npm run kill:5000
npm run kill:5173

# 3. Jalankan semua service
npm run dev:all

# 4. Di terminal baru, test service
npm run test:services
```

## ❓ Masih Error?

1. Baca file `TROUBLESHOOTING_DEV_ALL.md` untuk detail troubleshooting
2. Cek apakah semua dependencies terinstall
3. Pastikan Python 3.8+ terinstall untuk ML service
4. Pastikan Node.js terinstall untuk Backend dan Frontend

