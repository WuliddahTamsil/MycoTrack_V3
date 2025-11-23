# 🚀 Setup Vercel untuk Backend & ML Service

Panduan praktis deploy Backend dan ML Service ke Vercel (dengan catatan limit).

---

## ⚠️ PENTING: Limit Vercel

Sebelum mulai, perlu tahu limit Vercel Free Tier:

| Limit | Free Tier | Pro ($20/bulan) |
|-------|-----------|-----------------|
| **Execution Time** | 10 detik | 60 detik |
| **Function Size** | 50MB | 250MB |
| **Bandwidth** | 100GB/bulan | 1TB/bulan |
| **Storage** | Ephemeral | Ephemeral |

### Masalah dengan ML Service:
- ❌ Model files (`.pt`) >100MB (melebihi limit)
- ❌ PyTorch library ~1GB (terlalu besar)
- ❌ ML inference bisa >10 detik (melebihi limit free tier)
- ❌ Cold start lambat (load model setiap kali)

**Kesimpulan**: ML Service **TIDAK COCOK** untuk Vercel Free Tier.

---

## ✅ Yang Bisa Deploy ke Vercel

### 1. Frontend ✅
- Perfect untuk React/Vite
- Static files, no limit
- CDN global

### 2. Backend (Node.js) ⚠️
- Bisa dengan Express adapter
- **Limit**: 10 detik execution time
- **Solusi**: Optimize endpoints atau gunakan Pro

### 3. ML Service (Python) ❌
- **TIDAK DISARANKAN** untuk Vercel
- Gunakan Render/Railway/Fly.io

---

## 📋 Setup Backend di Vercel

### Step 1: Install Dependencies

```bash
cd backend
npm install @vercel/node
```

### Step 2: Update vercel.json

Gunakan `vercel-complete.json` sebagai referensi, atau update `vercel.json`:

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
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/frontend/index.html"
    }
  ],
  "functions": {
    "api/**/*.js": {
      "maxDuration": 10
    }
  }
}
```

### Step 3: Deploy

```bash
# Via CLI
vercel --prod

# Atau via Dashboard
# 1. Login ke vercel.com
# 2. Import project dari GitHub
# 3. Set root directory (jika perlu)
# 4. Deploy
```

---

## 🎯 Rekomendasi Setup (Optimal)

### Opsi 1: Semua di Vercel (Tidak Recommended untuk ML)

```
Frontend  → Vercel ✅
Backend   → Vercel ⚠️ (ada limit 10 detik)
ML Service → Vercel ❌ (tidak cocok)
```

**Masalah**: ML Service tidak akan work dengan baik.

---

### Opsi 2: Hybrid (Recommended) ⭐

```
Frontend  → Vercel ✅
Backend   → Vercel atau Render/Railway ✅
ML Service → Render/Railway ✅
```

**Keuntungan**:
- Frontend optimal di Vercel
- Backend bisa di Vercel (jika endpoints cepat) atau Render (jika butuh lebih lama)
- ML Service optimal di Render/Railway (no limit, persistent storage)

---

### Opsi 3: Semua di Render (Paling Mudah)

```
Frontend  → Render ✅
Backend   → Render ✅
ML Service → Render ✅
```

**Keuntungan**:
- Semua di satu platform
- Mudah manage
- No execution time limit
- Persistent storage

**Kekurangan**:
- Frontend tidak se-optimal Vercel (tapi masih bagus)

---

## 📝 Step-by-Step: Deploy Backend ke Vercel

### 1. Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### 2. Login

```bash
vercel login
```

### 3. Deploy

```bash
# Dari root project
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (pilih account)
# - Link to existing project? N
# - Project name? mycotrack-backend
# - Directory? ./
# - Override settings? N
```

### 4. Update Routes

Setelah deploy, Vercel akan generate URL. Update:
- Frontend environment variable: `VITE_API_URL`
- Backend CORS origin

---

## 🔧 Troubleshooting

### Error: Function timeout
- **Penyebab**: Execution >10 detik
- **Solusi**: Optimize endpoint atau upgrade ke Pro

### Error: Function too large
- **Penyebab**: Dependencies >50MB
- **Solusi**: 
  - Remove unused dependencies
  - Use external APIs untuk heavy operations
  - Upgrade ke Pro (250MB limit)

### Error: Module not found
- **Penyebab**: Dependencies tidak terinstall
- **Solusi**: Pastikan `package.json` ada di root atau folder yang benar

---

## ✅ Checklist

- [ ] Backend dependencies terinstall (`@vercel/node`)
- [ ] `vercel.json` sudah dikonfigurasi
- [ ] `api/index.js` sudah dibuat
- [ ] Test local dengan `vercel dev`
- [ ] Deploy ke production
- [ ] Update environment variables
- [ ] Test endpoints
- [ ] Monitor logs untuk error

---

## 🎯 Kesimpulan

**Bisa deploy backend dan ML service ke Vercel?**

- ✅ **Backend**: Bisa, tapi ada limit 10 detik
- ❌ **ML Service**: **TIDAK DISARANKAN** karena:
  - Model files terlalu besar
  - Execution time bisa >10 detik
  - Dependencies terlalu besar

**Rekomendasi Terbaik:**
- Frontend → **Vercel** ✅
- Backend → **Vercel** (jika endpoints cepat) atau **Render** (jika butuh lebih lama) ✅
- ML Service → **Render/Railway** ✅

---

**TL;DR: Backend bisa di Vercel dengan limit, ML Service lebih baik di Render/Railway.**

