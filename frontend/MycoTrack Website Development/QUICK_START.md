# 🚀 QUICK START - Jalankan Backend dengan Mudah

## ⚡ Cara TERMUDAH (Recommended)

### Windows:
**Double-click file:** `START_BACKEND.bat`

File ini akan:
- ✅ Cek Node.js terinstall
- ✅ Install dependencies otomatis (jika belum)
- ✅ Jalankan backend server

### Hasil yang Diharapkan:
```
==========================================
✅ Backend server running on http://localhost:3000
✅ Health check: http://localhost:3000/api/health
==========================================
```

---

## 📋 Cara Manual (Jika BAT file tidak bekerja)

### 1. Buka Terminal/PowerShell
Buka terminal baru (jangan tutup terminal frontend)

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

---

## ✅ Verifikasi Backend Berjalan

### Test 1: Cek di Terminal
Harus muncul:
```
✅ Backend server running on http://localhost:3000
```

### Test 2: Buka Browser
Akses: `http://localhost:3000/api/health`

Harus muncul JSON:
```json
{"status":"ok","message":"Backend is running"}
```

### Test 3: Cek di Frontend
Jika backend berjalan, error "Backend tidak berjalan" akan hilang.

---

## ❌ Troubleshooting

### Error: "Port 3000 is already in use"
**Solusi:**
1. Cari proses yang menggunakan port 3000:
   ```bash
   netstat -ano | findstr :3000
   ```
2. Kill proses tersebut (ganti PID dengan nomor yang muncul):
   ```bash
   taskkill /PID <PID> /F
   ```
3. Jalankan backend lagi

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
1. Download Node.js dari: https://nodejs.org/
2. Install Node.js
3. Restart terminal
4. Jalankan backend lagi

### Backend berjalan tapi frontend masih error
1. Pastikan backend benar-benar berjalan (cek terminal)
2. Test di browser: `http://localhost:3000/api/health`
3. Pastikan tidak ada firewall yang memblokir
4. Restart frontend (Ctrl+C lalu npm run dev lagi)

---

## 📝 Catatan Penting

- ⚠️ **JANGAN tutup terminal backend** saat menggunakan aplikasi
- ⚠️ Backend harus berjalan terus di background
- ⚠️ Jika ada perubahan di `server.js`, restart backend (Ctrl+C lalu npm start)
- ✅ Cek terminal backend untuk melihat log setiap request

---

## 🎯 Checklist Sebelum Menggunakan Aplikasi

- [ ] Backend berjalan di terminal (lihat output "✅ Backend server running")
- [ ] Test health check di browser: `http://localhost:3000/api/health` → OK
- [ ] Frontend berjalan di terminal (lihat output "Local: http://localhost:5173")
- [ ] Tidak ada error "Backend tidak berjalan" di frontend

---

## 💡 Tips

1. **Gunakan 2 terminal:**
   - Terminal 1: Backend (npm start)
   - Terminal 2: Frontend (npm run dev)

2. **Jika lupa apakah backend berjalan:**
   - Buka browser: `http://localhost:3000/api/health`
   - Jika muncul JSON → Backend berjalan ✅
   - Jika error → Backend tidak berjalan ❌

3. **Quick restart backend:**
   - Di terminal backend: Tekan `Ctrl+C` untuk stop
   - Lalu ketik: `npm start` untuk start lagi

