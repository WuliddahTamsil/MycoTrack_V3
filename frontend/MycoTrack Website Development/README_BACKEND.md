# 🚀 CARA MENJALANKAN BACKEND - PENTING!

## ⚠️ BACKEND HARUS BERJALAN SEBELUM MENGGUNAKAN APLIKASI!

Jika Anda melihat error: **"Backend tidak berjalan atau endpoint tidak ditemukan"**, itu berarti backend belum berjalan.

---

## ✅ CARA TERMUDAH (RECOMMENDED)

### Windows:
**Double-click file ini:** `START_BACKEND.bat`

File akan otomatis:
- ✅ Cek Node.js terinstall
- ✅ Install dependencies
- ✅ Jalankan backend

---

## 📋 CARA MANUAL

### 1. Buka Terminal Baru
Buka terminal/PowerShell baru (jangan tutup terminal frontend)

### 2. Masuk ke Folder Backend
```bash
cd "D:\RPL_Kelompok 4 - NOVA\backend"
```

### 3. Install Dependencies (jika belum)
```bash
npm install
```

### 4. Jalankan Backend
```bash
npm start
```

### 5. Pastikan Melihat Output Ini:
```
==================================================
✅ Backend server running on http://localhost:3000
✅ Health check: http://localhost:3000/api/health
==================================================
```

---

## ✅ VERIFIKASI BACKEND BERJALAN

### Test 1: Cek Terminal
Harus muncul: `✅ Backend server running on http://localhost:3000`

### Test 2: Buka Browser
Akses: **http://localhost:3000/api/health**

Harus muncul:
```json
{"status":"ok","message":"Backend is running"}
```

### Test 3: Cek Frontend
Jika backend berjalan, error akan hilang dan produk bisa dimuat.

---

## ❌ TROUBLESHOOTING

### Error: "Port 3000 is already in use"
**Solusi:**
1. Cari proses yang menggunakan port 3000:
   ```bash
   netstat -ano | findstr :3000
   ```
2. Kill proses tersebut (ganti <PID> dengan nomor yang muncul):
   ```bash
   taskkill /PID <PID> /F
   ```
3. Jalankan backend lagi: `npm start`

### Error: "Cannot find module"
**Solusi:**
```bash
cd "D:\RPL_Kelompok 4 - NOVA\backend"
rm -rf node_modules
npm install
npm start
```

### Error: "Node.js tidak terinstall"
**Solusi:**
1. Download Node.js: https://nodejs.org/
2. Install Node.js
3. Restart terminal
4. Jalankan backend lagi

### Backend berjalan tapi frontend masih error
1. ✅ Pastikan backend benar-benar berjalan (cek terminal)
2. ✅ Test di browser: `http://localhost:3000/api/health` → harus muncul JSON
3. ✅ Pastikan tidak ada firewall yang memblokir
4. ✅ Restart frontend (Ctrl+C lalu `npm run dev` lagi)

---

## 📝 CATATAN PENTING

- ⚠️ **JANGAN tutup terminal backend** saat menggunakan aplikasi
- ⚠️ Backend harus berjalan terus di background
- ⚠️ Jika ada perubahan di `server.js`, restart backend (Ctrl+C lalu npm start)
- ✅ Cek terminal backend untuk melihat log setiap request

---

## 🎯 CHECKLIST

Sebelum menggunakan aplikasi, pastikan:

- [ ] Backend berjalan di terminal (lihat output "✅ Backend server running")
- [ ] Test health check di browser: `http://localhost:3000/api/health` → OK
- [ ] Frontend berjalan di terminal (lihat output "Local: http://localhost:5173")
- [ ] Tidak ada error "Backend tidak berjalan" di frontend

---

## 💡 TIPS

1. **Gunakan 2 terminal:**
   - Terminal 1: Backend (`npm start`)
   - Terminal 2: Frontend (`npm run dev`)

2. **Jika lupa apakah backend berjalan:**
   - Buka browser: `http://localhost:3000/api/health`
   - Jika muncul JSON → Backend berjalan ✅
   - Jika error → Backend tidak berjalan ❌

3. **Quick restart backend:**
   - Di terminal backend: Tekan `Ctrl+C` untuk stop
   - Lalu ketik: `npm start` untuk start lagi

