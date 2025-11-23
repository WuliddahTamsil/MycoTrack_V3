# Cara Menjalankan Backend

## Langkah-langkah:

### 1. Buka Terminal Baru
Buka terminal/PowerShell baru (jangan tutup terminal frontend jika sedang berjalan)

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

### 5. Pastikan Anda Melihat Output Ini:
```
==================================================
✅ Backend server running on http://localhost:3000
✅ Health check: http://localhost:3000/api/health
==================================================
Endpoints available:
  POST /api/customer/register
  POST /api/customer/login
  POST /api/petani/register
  POST /api/petani/login
  POST /api/admin/login
  GET  /api/health
==================================================
```

### 6. Test Backend (di Terminal Baru Lain)
```bash
cd "D:\RPL_Kelompok 4 - NOVA\backend"
node test-server.js
```

Harus muncul: `✅ Backend is running!`

### 7. Test di Browser
Buka browser dan akses: `http://localhost:3000/api/health`

Harus muncul JSON:
```json
{"status":"ok","message":"Backend is running"}
```

## Troubleshooting

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
3. Atau ubah PORT di `server.js` ke port lain (misalnya 3001)

### Error: "Cannot find module"
**Solusi:**
```bash
cd backend
rm -rf node_modules
npm install
npm start
```

### Backend berjalan tapi frontend tidak bisa connect
1. Pastikan backend benar-benar berjalan (cek terminal)
2. Pastikan tidak ada firewall yang memblokir
3. Cek apakah ada error di terminal backend saat request masuk
4. Test dengan browser: `http://localhost:3000/api/health`

### Backend crash saat startup
1. Cek error message di terminal
2. Pastikan semua file ada:
   - `backend/data/admin.json`
   - `backend/data/customers.json`
   - `backend/data/petanis.json`
3. Pastikan Node.js terinstall: `node --version`

## Catatan Penting

- **JANGAN tutup terminal backend** saat menggunakan aplikasi
- Backend harus berjalan terus di background
- Jika ada perubahan di `server.js`, restart backend (Ctrl+C lalu npm start)
- Cek terminal backend untuk melihat log setiap request

