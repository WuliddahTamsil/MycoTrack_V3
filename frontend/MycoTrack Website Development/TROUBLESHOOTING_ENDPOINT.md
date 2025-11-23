# Troubleshooting Endpoint 404

## Masalah: Endpoint `/api/petani/products` mengembalikan 404

### Solusi 1: Pastikan Backend Berjalan

1. Buka terminal baru
2. Masuk ke folder backend:
   ```bash
   cd "D:\RPL_Kelompok 4 - NOVA\backend"
   ```
3. Jalankan backend:
   ```bash
   npm start
   ```
4. Pastikan melihat output:
   ```
   ✅ Backend server running on http://localhost:3000
   ```

### Solusi 2: Cek Endpoint di Backend

Endpoint yang tersedia:
- `GET /api/petani/products?farmerId={id}` - Get products by farmer
- `POST /api/petani/products` - Create product
- `PUT /api/petani/products/:id` - Update product
- `DELETE /api/petani/products/:id` - Delete product

### Solusi 3: Test Endpoint Manual

Buka browser dan akses:
```
http://localhost:3000/api/health
```

Harus muncul:
```json
{"status":"ok","message":"Backend is running"}
```

### Solusi 4: Cek Port

Jika port 3000 sudah digunakan:
1. Cek proses yang menggunakan port 3000:
   ```bash
   netstat -ano | findstr :3000
   ```
2. Kill proses tersebut atau ubah PORT di `server.js`

### Solusi 5: Restart Backend

Jika backend sudah berjalan tapi masih error:
1. Stop backend (Ctrl+C)
2. Start ulang:
   ```bash
   npm start
   ```

## Error yang Sering Terjadi

### "Endpoint not found"
- **Penyebab:** Backend tidak berjalan atau endpoint salah
- **Solusi:** Pastikan backend berjalan di `http://localhost:3000`

### "Failed to load resource: 404"
- **Penyebab:** Endpoint tidak ditemukan di backend
- **Solusi:** Cek apakah endpoint sudah terdaftar di `server.js`

### "Network Error" atau "CORS Error"
- **Penyebab:** CORS tidak dikonfigurasi dengan benar
- **Solusi:** Backend sudah dikonfigurasi untuk menerima request dari `localhost:5173`

## Catatan Penting

- Backend HARUS berjalan sebelum menggunakan aplikasi
- Jangan tutup terminal backend saat menggunakan aplikasi
- Jika ada perubahan di `server.js`, restart backend

