# 🚀 Deploy Backend & ML Service ke Vercel

Panduan lengkap deploy Backend (Node.js) dan ML Service (Python) ke Vercel.

---

## ⚠️ Catatan Penting

### Limit Vercel Free Tier:
- ✅ **100GB bandwidth/bulan** (cukup)
- ✅ **100 hours execution time/bulan** (cukup untuk development)
- ⚠️ **10 detik max execution time per function** (PENTING!)
- ⚠️ **50MB max function size** (termasuk dependencies)
- ⚠️ **Ephemeral storage** (file hilang setelah function selesai)

### Tantangan:
1. **ML Service dengan PyTorch**:
   - Model files (`.pt`) sangat besar (>100MB)
   - PyTorch library besar (~1GB)
   - **Solusi**: Gunakan cloud storage (AWS S3, Cloudinary) untuk model files
   - **Solusi**: Gunakan Vercel Pro untuk limit lebih besar

2. **Backend Express**:
   - Perlu refactor ke serverless functions atau gunakan adapter
   - **Solusi**: Gunakan `@vercel/node` dengan Express adapter

3. **Execution Time**:
   - ML inference bisa >10 detik
   - **Solusi**: Optimize model atau gunakan Vercel Pro (60 detik limit)

---

## 📋 Prerequisites

1. **Vercel Account**: https://vercel.com (gratis)
2. **Vercel CLI** (optional):
```bash
npm i -g vercel
```

---

## 1️⃣ Setup Backend untuk Vercel

### Opsi A: Menggunakan Express Adapter (Recommended)

Vercel support Express app dengan adapter. Kita perlu membuat wrapper.

### Step 1: Install Dependencies

```bash
cd backend
npm install @vercel/node
```

### Step 2: Buat Vercel Entry Point

File sudah dibuat: `api/index.js` (wrapper untuk Express app)

### Step 3: Update vercel.json

Konfigurasi sudah ada di `vercel.json`, tapi perlu update untuk support backend.

---

## 2️⃣ Setup ML Service untuk Vercel

### Step 1: Buat Python Serverless Functions

Vercel support Python runtime untuk serverless functions.

### Step 2: Upload Model ke Cloud Storage

**PENTING**: Model files (`.pt`) terlalu besar untuk Vercel. Gunakan:
- AWS S3
- Cloudinary
- Supabase Storage
- Google Cloud Storage

---

## 3️⃣ Konfigurasi Vercel

### Update vercel.json:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    },
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    },
    {
      "src": "api/**/*.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/backend/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/api/ml/(.*)",
      "dest": "/api/ml/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "rewrites": [
    {
      "source": "/api/backend/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/api/ml/(.*)",
      "destination": "/api/ml/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/frontend/index.html"
    }
  ]
}
```

---

## ⚠️ Rekomendasi: JANGAN Deploy ML Service ke Vercel

### Alasan:
1. **Model files terlalu besar** (>100MB)
2. **PyTorch dependencies besar** (~1GB)
3. **Execution time bisa >10 detik** (limit free tier)
4. **Cold start lambat** (load model setiap kali)

### Solusi Alternatif:
- **Render** (gratis, support Python, persistent storage)
- **Railway** (gratis, support Python)
- **Fly.io** (gratis, support Python)
- **PythonAnywhere** (gratis, khusus Python)

---

## ✅ Rekomendasi Setup

### Frontend → Vercel ✅
- Perfect untuk React/Vite
- Auto-deploy dari GitHub
- CDN global

### Backend → Vercel ⚠️ (Bisa, tapi ada limit)
- Bisa dengan Express adapter
- Perlu refactor untuk optimal
- Limit 10 detik execution time

### ML Service → Render/Railway ✅ (Recommended)
- Support Python dengan baik
- Persistent storage untuk model
- No execution time limit
- Bisa handle model files besar

---

## 📝 Alternatif: Deploy Backend ke Vercel (Jika Tetap Ingin)

### Step 1: Install Vercel Adapter

```bash
cd backend
npm install @vercel/node
```

### Step 2: Buat api/index.js

File sudah dibuat, tapi perlu update untuk handle semua routes.

### Step 3: Update vercel.json

Tambah konfigurasi untuk backend routes.

### Step 4: Deploy

```bash
vercel --prod
```

---

## 🎯 Kesimpulan

**Bisa deploy backend dan ML service ke Vercel?**
- ✅ **Backend**: Bisa, tapi ada limit (10 detik execution)
- ⚠️ **ML Service**: **TIDAK DISARANKAN** karena:
  - Model files terlalu besar
  - PyTorch dependencies besar
  - Execution time bisa >10 detik
  - Cold start lambat

**Rekomendasi:**
- Frontend → Vercel ✅
- Backend → Vercel atau Render/Railway ✅
- ML Service → Render/Railway ✅

---

## 📚 Resources

- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Vercel Python Runtime](https://vercel.com/docs/functions/serverless-functions/runtimes/python)
- [Vercel Limits](https://vercel.com/docs/platform/limits)

---

**TL;DR: Backend bisa, ML Service tidak disarankan. Gunakan Render/Railway untuk ML Service.**

