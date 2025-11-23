# MycoTrack_V2

MycoTrack - Sistem Monitoring dan Manajemen Budidaya Jamur Kuping

## Struktur Project

- **backend/** - Backend API server (Node.js/Express)
- **frontend/** - Frontend web application (React/TypeScript/Vite)
- **machine learning/** - Machine Learning service untuk deteksi jamur (Python/Flask/YOLOv5)

## Setup

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Machine Learning
```bash
cd "machine learning/Project"
pip install -r requirements_ml_api.txt
python ml_api_service.py
```

## Dokumentasi

Lihat folder masing-masing untuk dokumentasi lengkap:
- `backend/README.md` - Dokumentasi backend
- `frontend/README.md` - Dokumentasi frontend
- `machine learning/Project/README_ML_INTEGRATION.md` - Dokumentasi ML service
