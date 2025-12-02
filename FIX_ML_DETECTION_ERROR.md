# 🔧 Fix ML Detection Error - Timeout & 500 Error

## ✅ Perbaikan yang Sudah Dilakukan

### 1. **Error Handling yang Lebih Baik**
- ML service sekarang memberikan error message yang lebih jelas
- Error dari ML service diteruskan dengan benar ke frontend
- Validasi model saat startup dengan pesan error yang informatif

### 2. **Timeout Diperpanjang**
- Timeout backend ke ML service: **30 detik → 60 detik**
- Memberikan waktu lebih lama untuk load model pertama kali

### 3. **Validasi Model**
- Kode sekarang mencari file model secara otomatis (`best.pt`, `best - Copy.pt`, dll)
- Error message jelas jika model tidak ditemukan
- Informasi detail saat load model

## 🚀 Cara Mengatasi Error

### Langkah 1: Pastikan Semua Service Berjalan

```bash
# Test semua service
npm run test:services
```

Jika ada service yang tidak berjalan:
```bash
# Kill semua port
npm run kill:all

# Start semua service
npm run dev:all
```

### Langkah 2: Cek ML Service

Buka browser dan cek:
- **Health Check**: http://localhost:5000/health
- Harus muncul: `{"status": "healthy", "model_loaded": true}`

Jika `model_loaded: false`, berarti model tidak ter-load. Cek terminal ML service untuk error.

### Langkah 3: Cek File Model

Pastikan file model ada:
```bash
cd "machine learning\Project\weights"
dir
```

Harus ada file `best.pt` atau `best - Copy.pt`.

Jika tidak ada, copy file model ke folder tersebut.

### Langkah 4: Cek Log ML Service

Saat menjalankan `npm run dev:all`, perhatikan output dari `[ml]`:

**✅ Berhasil:**
```
[INFO] ✅ Model loaded successfully!
[INFO] Model path: ...
[INFO] Model classes: ...
```

**❌ Error:**
```
❌ Error loading model: ...
Model not found: ...
```

### Langkah 5: Restart Semua Service

Jika masih error, restart semua service:

```bash
# 1. Stop semua service (CTRL+C di terminal)
# 2. Kill semua port
npm run kill:all

# 3. Start lagi
npm run dev:all

# 4. Tunggu 10-30 detik untuk ML service load model
# 5. Test lagi
npm run test:services
```

## 🔍 Troubleshooting Detail

### Error: "Model not found"

**Penyebab:** File model tidak ada di folder `weights/`

**Solusi:**
1. Pastikan file model ada di `machine learning/Project/weights/`
2. File bisa bernama `best.pt` atau `best - Copy.pt`
3. Jika tidak ada, copy file model ke folder tersebut

### Error: "timeout of 60000ms exceeded"

**Penyebab:** 
- ML service tidak berjalan
- Model sedang di-load (pertama kali bisa butuh 10-30 detik)
- ML service crash saat load model

**Solusi:**
1. Cek apakah ML service berjalan: http://localhost:5000/health
2. Cek terminal ML service untuk error
3. Pastikan model ter-load dengan benar (lihat log `[ml]`)
4. Jika model tidak ter-load, cek error di terminal ML service

### Error: "500 Internal Server Error"

**Penyebab:**
- ML service error saat processing
- Model tidak ter-load
- Format gambar tidak valid

**Solusi:**
1. Cek log backend di terminal (cari `[ML DETECT]`)
2. Cek log ML service di terminal (cari `[DETECT]`)
3. Pastikan ML service berjalan dan model ter-load
4. Cek apakah gambar yang dikirim valid

## 📋 Checklist

Sebelum menggunakan deteksi, pastikan:

- [ ] ML service berjalan di port 5000
- [ ] Backend berjalan di port 3000
- [ ] File model ada di `machine learning/Project/weights/best.pt`
- [ ] Model ter-load dengan benar (cek log `[ml]`)
- [ ] Health check ML service: http://localhost:5000/health → `model_loaded: true`
- [ ] Tidak ada error di terminal ML service
- [ ] Tidak ada error di terminal backend

## 🎯 Quick Fix

Jika masih error setelah semua langkah di atas:

```bash
# 1. Kill semua
npm run kill:all

# 2. Cek file model
cd "machine learning\Project\weights"
dir

# 3. Jika tidak ada best.pt, copy best - Copy.pt menjadi best.pt
copy "best - Copy.pt" "best.pt"

# 4. Start semua service
cd ..\..\..
npm run dev:all

# 5. Tunggu 30 detik untuk model load

# 6. Test
npm run test:services

# 7. Cek health
# Buka: http://localhost:5000/health
# Harus: {"status": "healthy", "model_loaded": true}
```

## 💡 Tips

1. **Saat pertama kali start**, model loading bisa butuh 10-30 detik. Tunggu sampai log `[ml]` menunjukkan "Model loaded successfully!"

2. **Cek terminal ML service** untuk melihat error detail jika ada masalah

3. **Gunakan `npm run test:services`** untuk quick check apakah semua service berjalan

4. **Jika timeout**, cek apakah ML service benar-benar berjalan dan model sudah ter-load

## 📞 Masih Error?

Jika masih error setelah semua langkah:

1. **Cek log terminal ML service** - cari error message
2. **Cek log terminal backend** - cari `[ML DETECT]` error
3. **Cek browser console** - lihat error detail dari frontend
4. **Pastikan semua dependencies terinstall:**
   ```bash
   cd "machine learning\Project"
   pip install -r requirements_ml_api.txt
   ```

