# Struktur Folder MycoTrack

## 📁 Struktur Proyek

```
RPL_Kelompok 4 - NOVA/
├── backend/                    # Backend API Server
│   ├── src/                    # Source code
│   │   └── server.js          # Main server file
│   ├── data/                  # Database files (JSON)
│   │   ├── admin.json
│   │   ├── customers.json
│   │   ├── petanis.json
│   │   ├── products.json
│   │   ├── orders.json
│   │   ├── carts.json
│   │   ├── forum.json
│   │   ├── articles.json
│   │   ├── chats.json
│   │   ├── notifications.json
│   │   ├── ledger.json
│   │   ├── analytics.json
│   │   └── logs.json
│   ├── uploads/               # Uploaded files
│   ├── tests/                 # Test files
│   │   ├── payment.test.js
│   │   └── notifications.test.js
│   ├── scripts/              # Utility scripts
│   │   ├── test-endpoints.js
│   │   ├── test-login.js
│   │   └── test-server.js
│   ├── docs/                 # Documentation
│   │   ├── API_DOCUMENTATION.md
│   │   ├── DATABASE_STRUCTURE.md
│   │   ├── FARMER_PRODUCT_CUSTOMER_FLOW.md
│   │   └── ...
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── frontend/                  # Frontend React Application
│   └── MycoTrack Website Development/
│       ├── src/              # Source code
│       │   ├── components/   # React components
│       │   │   ├── admin/
│       │   │   ├── customer/
│       │   │   ├── farmer/
│       │   │   ├── shared/
│       │   │   └── ui/
│       │   ├── pages/        # Page components
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── index.css
│       ├── public/           # Static files
│       ├── docs/            # Documentation
│       ├── package.json
│       ├── vite.config.ts
│       └── README.md
│
└── machine-learning/         # Machine Learning Project
    └── Project V3/
        └── Project/
            ├── dataset/      # Training dataset
            ├── weights/      # Model weights
            ├── output/       # Output results
            ├── runs/         # Training runs
            ├── scripts/      # ML scripts
            ├── yolov5/       # YOLOv5 framework
            └── *.py          # Python scripts
```

## 🔧 Perubahan yang Akan Dilakukan

### Backend
1. ✅ Pindahkan semua file dokumentasi ke `docs/`
2. ✅ Pindahkan test files ke `tests/` (beberapa sudah ada)
3. ✅ Pindahkan script files ke `scripts/`
4. ✅ Hapus folder `frontend/` yang ada di dalam `backend/`
5. ✅ Hapus `venv/` dari backend (tidak diperlukan)

### Frontend
1. ✅ Hapus folder `frontend/` yang duplikat di dalam `frontend/MycoTrack Website Development/`
2. ✅ Hapus file backend yang tidak perlu (server.js, data/, dll)
3. ✅ Pindahkan dokumentasi ke `docs/`
4. ✅ Hapus `venv/` dari frontend (tidak diperlukan)

### Machine Learning
1. ✅ Struktur sudah cukup baik, tidak perlu perubahan besar

## ⚠️ Catatan Penting

- **JANGAN** menghapus folder `data/` dan `uploads/` di backend
- **JANGAN** menghapus `node_modules/` (akan di-regenerate dengan `npm install`)
- Path di `server.js` menggunakan `__dirname`, jadi relatif terhadap lokasi file
- Setelah reorganisasi, pastikan semua path masih benar

