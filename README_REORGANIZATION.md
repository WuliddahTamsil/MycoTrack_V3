# 📁 Reorganisasi Struktur Folder MycoTrack

## 🎯 Tujuan

Merapihkan struktur folder proyek MycoTrack agar lebih terorganisir dan mudah dikelola.

## 📋 Struktur Baru

### Backend
```
backend/
├── src/
│   └── server.js          # Main server file
├── data/                  # Database files (JSON)
├── uploads/               # Uploaded files
├── tests/                 # Test files
├── scripts/               # Utility scripts
│   ├── test-endpoints.js
│   ├── test-login.js
│   ├── test-server.js
│   ├── START_BACKEND.bat
│   ├── START_BACKEND.ps1
│   └── RESTART_BACKEND.bat
├── docs/                  # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_STRUCTURE.md
│   └── ...
├── package.json
└── README.md
```

### Frontend
```
frontend/
└── MycoTrack Website Development/
    ├── src/               # Source code
    │   ├── components/
    │   ├── pages/
    │   └── ...
    ├── docs/              # Documentation
    ├── public/            # Static files
    ├── package.json
    └── vite.config.ts
```

### Machine Learning
```
machine-learning/
└── Project V3/
    └── Project/
        ├── dataset/
        ├── weights/
        ├── output/
        ├── scripts/
        └── yolov5/
```

## 🚀 Cara Menjalankan Reorganisasi

### Opsi 1: Menggunakan PowerShell Script (Recommended)
```powershell
powershell -ExecutionPolicy Bypass -File reorganize-structure.ps1
```

### Opsi 2: Manual
Ikuti langkah-langkah di file `STRUCTURE.md`

## ⚠️ Catatan Penting

1. **Backup dulu!** Pastikan semua perubahan sudah di-commit ke Git
2. **Jangan hapus** folder `data/` dan `uploads/` di backend
3. **Jangan hapus** `node_modules/` (akan di-regenerate)
4. Setelah reorganisasi, jalankan:
   ```bash
   cd backend
   npm install
   
   cd ../frontend/MycoTrack Website Development
   npm install
   ```

## ✅ Checklist Setelah Reorganisasi

- [ ] Semua file dokumentasi sudah di `docs/`
- [ ] Semua script sudah di `scripts/`
- [ ] Folder duplikat sudah dihapus
- [ ] Path di `server.js` masih benar
- [ ] Backend server masih bisa jalan
- [ ] Frontend masih bisa jalan
- [ ] Test masih bisa jalan

## 📝 Perubahan Path

Tidak ada perubahan path yang diperlukan karena:
- `server.js` menggunakan `__dirname` untuk path relatif
- Path `data/` dan `uploads/` tetap di root backend
- Frontend tidak terpengaruh karena menggunakan path relatif

## 🔄 Rollback

Jika ada masalah, gunakan Git untuk rollback:
```bash
git checkout HEAD -- .
```

