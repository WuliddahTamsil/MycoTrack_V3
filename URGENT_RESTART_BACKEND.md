# 🚨 URGENT: RESTART BACKEND SEKARANG!

## ⚠️ MASALAH

Error 403 Forbidden masih muncul karena **BACKEND BELUM DI-RESTART**!

Kode sudah benar, tapi perubahan hanya aktif setelah restart.

## ✅ SOLUSI CEPAT

### Cara 1: Gunakan Script (Paling Mudah)

**Double-click file ini:**
```
FORCE_RESTART_BACKEND.bat
```

Script akan:
1. Kill semua Node.js processes
2. Kill port 3000
3. Start backend server

### Cara 2: Manual

**Langkah 1: Stop Backend**
- Di terminal backend, tekan: `CTRL + C`
- Atau close terminal backend

**Langkah 2: Kill Port 3000**
```bash
npm run kill:3000
```

**Langkah 3: Start Backend**
```bash
cd backend
npm start
```

Atau dari root:
```bash
npm run dev:backend
```

## 🔍 VERIFIKASI

Setelah backend start, cek terminal harus muncul:
```
✅ Backend server running on http://localhost:3000
```

**JANGAN tutup terminal ini!**

## 🧪 TEST LOGIN

Setelah backend running:
1. Buka browser: http://localhost:5173
2. Login dengan customer/petani
3. Harus bisa masuk tanpa error 403!

## ❌ JIKA MASIH ERROR

1. **Cek terminal backend** - lihat error message
2. **Cek apakah backend benar-benar running:**
   ```bash
   curl http://localhost:3000/api/health
   ```
3. **Clear browser cache** atau gunakan Incognito mode

## 📋 CHECKLIST

- [ ] Backend sudah di-stop (CTRL+C)
- [ ] Port 3000 sudah di-kill
- [ ] Backend sudah di-start lagi
- [ ] Terminal menunjukkan "Backend server running"
- [ ] Test login → harus bisa masuk!

---

**RESTART BACKEND SEKARANG!** 🔄

