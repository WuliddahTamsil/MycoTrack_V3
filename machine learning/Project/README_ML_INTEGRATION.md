# ML Integration dengan Frontend - Panduan Setup

Dokumen ini menjelaskan cara mengintegrasikan model YOLOv5 untuk deteksi fase pertumbuhan jamur ke dalam dashboard petani.

## 📋 Prerequisites

1. Python 3.8+ dengan PyTorch dan YOLOv5 sudah terinstall
2. Model YOLOv5 sudah di-training (`weights/best.pt` sudah ada)
3. Node.js backend sudah berjalan
4. Frontend React sudah berjalan

## 🚀 Setup

### 1. Install Dependencies untuk ML API Service

```bash
cd "machine learning/Project"
pip install -r requirements_ml_api.txt
```

### 2. Jalankan ML API Service (Flask)

```bash
cd "machine learning/Project"
python ml_api_service.py
```

Service akan berjalan di `http://localhost:5000`

**Verifikasi:**
```bash
curl http://localhost:5000/health
```

### 3. Install Dependencies untuk Backend

```bash
cd backend
npm install axios form-data
```

### 4. Jalankan Backend Server

```bash
cd backend
npm start
```

Backend akan berjalan di `http://localhost:3000`

**Verifikasi ML Service Connection:**
```bash
curl http://localhost:3000/api/ml/health
```

### 5. Jalankan Frontend

```bash
cd "frontend/MycoTrack Website Development"
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## 🔧 Konfigurasi

### ML Service URL

Jika ML service berjalan di port/URL berbeda, edit di `backend/server.js`:

```javascript
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';
```

Atau set environment variable:
```bash
export ML_SERVICE_URL=http://localhost:5000
```

## 📝 Cara Penggunaan

### Di Dashboard Monitoring (Petani)

1. **Upload Foto:**
   - Klik tombol "Upload Foto"
   - Pilih gambar jamur dari komputer

2. **Deteksi:**
   - Klik tombol "Deteksi"
   - Sistem akan mengirim gambar ke ML service
   - Hasil deteksi akan ditampilkan dengan bounding boxes

3. **Simpan ke Galeri:**
   - Setelah deteksi, klik "Simpan ke Galeri"
   - Isi informasi (judul, deskripsi, baglog, tags)
   - Foto dengan hasil deteksi akan tersimpan

### Di Galeri Pertumbuhan

- Semua foto yang disimpan dari dashboard monitoring akan muncul di galeri
- Foto dengan hasil deteksi AI akan menampilkan badge "AI: X" (X = jumlah deteksi)
- Klik foto untuk melihat detail dan hasil deteksi lengkap

## 🎯 Fitur yang Terintegrasi

1. ✅ **Upload & Deteksi** - Upload foto dan dapatkan hasil deteksi real-time
2. ✅ **Visualisasi Bounding Boxes** - Tampilkan hasil deteksi dengan bounding boxes berwarna
3. ✅ **Summary Deteksi** - Tampilkan jumlah per fase (Primordia, Muda, Matang)
4. ✅ **Estimasi Panen** - Tampilkan estimasi waktu panen berdasarkan fase
5. ✅ **Simpan ke Galeri** - Simpan hasil deteksi ke galeri pertumbuhan
6. ✅ **Tampil di Galeri** - Foto dengan hasil deteksi muncul di galeri dengan metadata lengkap

## 🔍 API Endpoints

### ML Service (Flask - Port 5000)

- `GET /health` - Health check
- `POST /detect` - Deteksi dari base64 image
- `POST /detect/upload` - Deteksi dari uploaded file

### Backend (Node.js - Port 3000)

- `GET /api/ml/health` - Check ML service connection
- `POST /api/ml/detect` - Proxy ke ML service
- `GET /api/gallery/images?farmerId=xxx` - Get gallery images
- `POST /api/gallery/images` - Save image dengan deteksi
- `DELETE /api/gallery/images/:id` - Delete image

## 🐛 Troubleshooting

### ML Service tidak bisa diakses

1. Pastikan Flask service berjalan:
   ```bash
   python ml_api_service.py
   ```

2. Cek apakah model file ada:
   ```bash
   ls weights/best.pt
   ```

3. Cek log error di terminal Flask

### Backend tidak bisa connect ke ML Service

1. Pastikan ML_SERVICE_URL benar di `backend/server.js`
2. Cek apakah port 5000 tidak digunakan aplikasi lain
3. Test koneksi:
   ```bash
   curl http://localhost:5000/health
   ```

### Deteksi gagal

1. Pastikan gambar format valid (JPG, PNG)
2. Cek confidence threshold di `config.py` (default: 0.40)
3. Pastikan model sudah di-training dengan baik

### Foto tidak muncul di galeri

1. Cek apakah farmerId benar
2. Cek console browser untuk error
3. Cek apakah file tersimpan di `backend/uploads/`

## 📊 Struktur Data

### Gallery Image Object

```json
{
  "id": "gallery-1234567890-abc123",
  "farmerId": "f1",
  "url": "/uploads/image-123.jpg",
  "annotatedUrl": "/uploads/annotated-image-123.jpg",
  "title": "Deteksi Jamur - 15/01/2025",
  "description": "Hasil deteksi fase pertumbuhan",
  "date": "2025-01-15",
  "baglogId": "Baglog #1",
  "stage": "Pertumbuhan",
  "tags": ["pertumbuhan", "optimal"],
  "detections": {
    "summary": {
      "Primordia": 2,
      "Muda": 1,
      "Matang": 0
    },
    "total": 3,
    "details": [
      {
        "class": "Primordia",
        "confidence": 0.85,
        "bbox": [100, 150, 200, 250],
        "harvest_days": 4
      }
    ]
  },
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

## 🎨 Warna Deteksi

- **Primordia**: Kuning (Yellow) - Estimasi panen: +4 hari
- **Muda**: Orange - Estimasi panen: +2 hari  
- **Matang**: Hijau (Green) - Siap panen

## 📝 Catatan

- ML service harus berjalan sebelum backend bisa melakukan deteksi
- Model akan di-load sekali saat service start (lazy loading)
- Foto yang di-upload akan otomatis dianalisis jika disimpan ke galeri
- Hasil deteksi disimpan sebagai metadata di database JSON

