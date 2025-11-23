# Troubleshooting Backend

## Masalah: "Server mengembalikan response kosong"

### Langkah-langkah untuk mengatasi:

1. **Pastikan backend berjalan:**
   ```bash
   cd backend
   npm start
   ```
   
   Anda harus melihat pesan:
   ```
   Backend server running on http://localhost:3000
   Health check: http://localhost:3000/api/health
   ```

2. **Cek apakah port 3000 sudah digunakan:**
   - Jika ada error "EADDRINUSE", berarti port 3000 sudah digunakan
   - Tutup aplikasi lain yang menggunakan port 3000
   - Atau ubah PORT di server.js ke port lain (misalnya 3001)

3. **Test health check endpoint:**
   Buka browser dan akses: `http://localhost:3000/api/health`
   
   Harus muncul JSON:
   ```json
   {"status":"ok","message":"Backend is running"}
   ```

4. **Cek error di terminal backend:**
   - Jika ada error saat startup, akan muncul di terminal
   - Pastikan semua dependencies terinstall: `npm install`

5. **Cek CORS:**
   - Backend sudah dikonfigurasi untuk CORS
   - Pastikan frontend mengakses dari `http://localhost:5173` atau port yang sesuai

6. **Cek firewall/antivirus:**
   - Kadang firewall memblokir koneksi localhost
   - Coba disable sementara untuk testing

### Test Manual:

1. **Test dengan curl atau Postman:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Test login endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/customer/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"test123"}'
   ```

### Jika masih error:

1. Restart backend:
   - Tekan `Ctrl+C` di terminal backend
   - Jalankan lagi `npm start`

2. Cek file data:
   - Pastikan folder `backend/data/` ada
   - Pastikan file `admin.json`, `customers.json`, `petanis.json` ada

3. Cek node_modules:
   ```bash
   cd backend
   rm -rf node_modules
   npm install
   npm start
   ```

