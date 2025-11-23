# QUICK FIX - Cara Cepat Test Login

## 1. Test Backend Berjalan

```bash
cd backend
node test-endpoints.js
```

Harus muncul:
- ✅ Health Check: PASS
- ✅ Admin Login: PASS (dengan adminmyc@gmail.com)

## 2. Test Manual di Browser

Buka browser console (F12) dan jalankan:

```javascript
// Test Admin Login
fetch('http://localhost:3000/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'adminmyc@gmail.com', 
    password: '12345678' 
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

Harus return:
```json
{
  "message": "Login berhasil",
  "user": { ... }
}
```

## 3. Cek Terminal Backend

Saat login dari frontend, terminal backend HARUS menampilkan:
```
=== CUSTOMER LOGIN REQUEST ===
Email: ...
Has password: true
...
✅ Login successful for: ...
```

Jika TIDAK ada log ini, berarti request TIDAK sampai ke backend!

## 4. Cek Browser Console

Buka browser console (F12) dan lihat:
- Apakah ada error CORS?
- Apakah ada error network?
- Apakah response kosong?

## 5. Pastikan Backend Restart

Setelah perubahan kode:
1. Stop backend (Ctrl+C)
2. Start lagi: `npm start`
3. Pastikan melihat output startup yang benar

