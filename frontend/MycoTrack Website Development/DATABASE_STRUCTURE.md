# Struktur Database MycoTrack

Dokumen ini menjelaskan struktur database yang digunakan dalam sistem MycoTrack. Database menggunakan file JSON untuk penyimpanan data.

## 📁 Lokasi File Database

Semua file database berada di folder `backend/data/`:
- `admin.json` - Data admin
- `customers.json` - Data customer
- `petanis.json` - Data petani
- `products.json` - Data produk
- `carts.json` - Data keranjang belanja
- `orders.json` - Data pesanan
- `forum.json` - Data forum diskusi
- `logs.json` - Log aktivitas admin

---

## 1. Admin (`admin.json`)

```json
{
  "id": "admin-1234567890",
  "name": "Admin MycoTrack",
  "email": "admin@mycotrack.com",
  "password": "admin123",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Field:**
- `id` (string, required): Unique identifier admin
- `name` (string, required): Nama admin
- `email` (string, required): Email admin (unique, case-insensitive)
- `password` (string, required): Password admin
- `role` (string, required): Selalu "admin"
- `createdAt` (string, required): Timestamp pembuatan akun

---

## 2. Customer (`customers.json`)

```json
{
  "id": "customer-1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "address": "Jl. Contoh No. 123",
  "phoneNumber": "081234567890",
  "profilePhoto": "http://localhost:3000/uploads/profilePhoto-123.jpg",
  "role": "customer",
  "balance": 0,
  "status": "accepted",
  "adminMessage": null,
  "reviewedAt": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Field:**
- `id` (string, required): Unique identifier customer
- `name` (string, required): Nama lengkap customer
- `email` (string, required): Email customer (unique, case-insensitive)
- `password` (string, required): Password customer
- `address` (string, required): Alamat customer
- `phoneNumber` (string, required): Nomor telepon customer
- `profilePhoto` (string, nullable): URL foto profil
- `role` (string, required): Selalu "customer"
- `balance` (number, default: 0): Saldo MycoTrack
- `status` (string, required): Status akun - "pending" | "accepted" | "rejected" | "suspended"
- `adminMessage` (string, nullable): Pesan dari admin (jika ditolak)
- `reviewedAt` (string, nullable): Timestamp review admin
- `createdAt` (string, required): Timestamp registrasi

---

## 3. Petani (`petanis.json`)

```json
{
  "id": "petani-1234567890",
  "name": "Budi Petani",
  "email": "budi@example.com",
  "password": "password123",
  "phoneNumber": "081234567890",
  "address": "Jl. Pertanian No. 456",
  "ktpPhoto": "http://localhost:3000/uploads/ktpPhoto-123.jpg",
  "role": "petani",
  "balance": 0,
  "status": "accepted",
  "adminMessage": null,
  "reviewedAt": "2024-01-01T00:00:00.000Z",
  "shop": {
    "name": "Toko Jamur Budi",
    "description": "Toko jamur terpercaya",
    "photo": "http://localhost:3000/uploads/shopPhoto-123.jpg"
  },
  "farm": {
    "landArea": 1000,
    "landPhoto": "http://localhost:3000/uploads/landPhoto-123.jpg",
    "mushroomType": "Jamur Tiram",
    "rackCount": 50,
    "baglogCount": 500,
    "harvestCapacity": 100
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Field:**
- `id` (string, required): Unique identifier petani
- `name` (string, required): Nama lengkap petani
- `email` (string, required): Email petani (unique, case-insensitive)
- `password` (string, required): Password petani
- `phoneNumber` (string, required): Nomor telepon petani
- `address` (string, required): Alamat petani
- `ktpPhoto` (string, nullable): URL foto KTP
- `role` (string, required): Selalu "petani"
- `balance` (number, default: 0): Saldo MycoTrack
- `status` (string, required): Status akun - "pending" | "accepted" | "rejected" | "suspended"
- `adminMessage` (string, nullable): Pesan dari admin
- `reviewedAt` (string, nullable): Timestamp review admin
- `shop` (object, required): Data toko
  - `name` (string): Nama toko
  - `description` (string): Deskripsi toko
  - `photo` (string, nullable): URL foto toko
- `farm` (object, required): Data farm
  - `landArea` (number): Luas lahan (m²)
  - `landPhoto` (string, nullable): URL foto lahan
  - `mushroomType` (string): Jenis jamur
  - `rackCount` (number): Jumlah rak
  - `baglogCount` (number): Jumlah baglog
  - `harvestCapacity` (number): Kapasitas panen (kg)
- `createdAt` (string, required): Timestamp registrasi

---

## 4. Products (`products.json`)

```json
{
  "id": "product-1234567890",
  "farmerId": "petani-1234567890",
  "farmerName": "Budi Petani",
  "name": "Jamur Tiram Segar",
  "description": "Jamur tiram organik segar dari kebun sendiri",
  "price": 25000,
  "stock": 100,
  "unit": "kg",
  "category": "Jamur Segar",
  "image": "http://localhost:3000/uploads/image-123.jpg",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Field:**
- `id` (string, required): Unique identifier produk
- `farmerId` (string, required): ID petani pemilik produk
- `farmerName` (string, required): Nama petani (denormalized untuk performa)
- `name` (string, required): Nama produk
- `description` (string, required): Deskripsi produk
- `price` (number, required): Harga per unit (Rupiah)
- `stock` (number, required): Stok tersedia
- `unit` (string, required): Satuan (kg, pcs, pack, dll)
- `category` (string, required): Kategori produk
- `image` (string, nullable): URL gambar produk (file upload atau URL eksternal)
- `createdAt` (string, required): Timestamp pembuatan produk
- `updatedAt` (string, required): Timestamp update terakhir

**Catatan:**
- Produk langsung muncul di marketplace setelah dibuat
- Stok otomatis berkurang saat checkout
- Hanya petani dengan status "accepted" yang bisa membuat produk

---

## 5. Carts (`carts.json`)

```json
{
  "id": "cart-1234567890",
  "customerId": "customer-1234567890",
  "productId": "product-1234567890",
  "productName": "Jamur Tiram Segar",
  "productImage": "http://localhost:3000/uploads/image-123.jpg",
  "farmerId": "petani-1234567890",
  "farmerName": "Budi Petani",
  "price": 25000,
  "unit": "kg",
  "quantity": 2,
  "subtotal": 50000,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Field:**
- `id` (string, required): Unique identifier item keranjang
- `customerId` (string, required): ID customer pemilik keranjang
- `productId` (string, required): ID produk
- `productName` (string, required): Nama produk (denormalized)
- `productImage` (string, nullable): URL gambar produk (denormalized)
- `farmerId` (string, required): ID petani (denormalized)
- `farmerName` (string, required): Nama petani (denormalized)
- `price` (number, required): Harga per unit saat ditambahkan ke keranjang
- `unit` (string, required): Satuan produk
- `quantity` (number, required): Jumlah yang dipesan
- `subtotal` (number, required): Total harga (price × quantity)
- `createdAt` (string, required): Timestamp ditambahkan ke keranjang
- `updatedAt` (string, required): Timestamp update terakhir

**Catatan:**
- Data keranjang tersimpan permanen di database (bukan hanya state frontend)
- Jika produk yang sama ditambahkan lagi, quantity akan ditambah (bukan item baru)
- Validasi stok dilakukan saat menambah/update quantity

---

## 6. Orders (`orders.json`)

```json
{
  "id": "order-1234567890-abc123",
  "customerId": "customer-1234567890",
  "customerName": "John Doe",
  "farmerId": "petani-1234567890",
  "farmerName": "Budi Petani",
  "products": [
    {
      "productId": "product-1234567890",
      "productName": "Jamur Tiram Segar",
      "productImage": "http://localhost:3000/uploads/image-123.jpg",
      "price": 25000,
      "quantity": 2,
      "unit": "kg",
      "subtotal": 50000
    }
  ],
  "total": 50000,
  "status": "pending",
  "paymentStatus": "pending",
  "paymentMethod": "Saldo MycoTrack",
  "shippingAddress": "Jl. Contoh No. 123, Jakarta",
  "tracking": [
    {
      "status": "pending",
      "message": "Pesanan dibuat",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Field:**
- `id` (string, required): Unique identifier pesanan
- `customerId` (string, required): ID customer pemesan
- `customerName` (string, required): Nama customer (denormalized)
- `farmerId` (string, required): ID petani penjual
- `farmerName` (string, required): Nama petani (denormalized)
- `products` (array, required): Array produk dalam pesanan
  - `productId` (string): ID produk
  - `productName` (string): Nama produk
  - `productImage` (string, nullable): URL gambar produk
  - `price` (number): Harga per unit saat checkout
  - `quantity` (number): Jumlah yang dipesan
  - `unit` (string): Satuan
  - `subtotal` (number): Total harga item
- `total` (number, required): Total harga keseluruhan pesanan
- `status` (string, required): Status pesanan - "pending" | "processing" | "shipped" | "delivered" | "cancelled"
- `paymentStatus` (string, required): Status pembayaran - "pending" | "paid" | "failed"
- `paymentMethod` (string, required): Metode pembayaran
- `shippingAddress` (string, required): Alamat pengiriman
- `tracking` (array, required): Array tracking status pesanan
  - `status` (string): Status pada saat itu
  - `message` (string): Pesan tracking
  - `timestamp` (string): Waktu perubahan status
- `createdAt` (string, required): Timestamp pembuatan pesanan
- `updatedAt` (string, required): Timestamp update terakhir

**Catatan:**
- Satu checkout bisa menghasilkan multiple orders (jika produk dari petani berbeda)
- Stok produk otomatis berkurang saat checkout
- Item keranjang otomatis dihapus setelah checkout
- Tracking history tersimpan untuk audit trail

---

## 7. Forum (`forum.json`)

```json
{
  "id": "post-1234567890",
  "authorId": "customer-1234567890",
  "authorName": "John Doe",
  "authorRole": "customer",
  "title": "Tips Budidaya Jamur Tiram",
  "content": "Berikut adalah tips untuk budidaya jamur tiram...",
  "image": "http://localhost:3000/uploads/post-image-123.jpg",
  "likes": [
    {
      "userId": "customer-1111111111",
      "userName": "Jane Doe",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "comments": [
    {
      "id": "comment-1234567890",
      "userId": "petani-1234567890",
      "userName": "Budi Petani",
      "userRole": "petani",
      "content": "Terima kasih atas tipsnya!",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "views": 150,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Field:**
- `id` (string, required): Unique identifier postingan
- `authorId` (string, required): ID penulis postingan
- `authorName` (string, required): Nama penulis (denormalized)
- `authorRole` (string, required): Role penulis - "customer" | "petani" | "admin"
- `title` (string, required): Judul postingan
- `content` (string, required): Isi/konten postingan
- `image` (string, nullable): URL gambar postingan (file upload atau URL eksternal)
- `likes` (array, default: []): Array user yang like postingan
  - `userId` (string): ID user yang like
  - `userName` (string): Nama user
  - `timestamp` (string): Waktu like
- `comments` (array, default: []): Array komentar
  - `id` (string): Unique identifier komentar
  - `userId` (string): ID user yang komentar
  - `userName` (string): Nama user
  - `userRole` (string): Role user
  - `content` (string): Isi komentar
  - `createdAt` (string): Timestamp komentar dibuat
  - `updatedAt` (string): Timestamp komentar diupdate
- `views` (number, default: 0): Jumlah views (auto-increment saat dibuka)
- `createdAt` (string, required): Timestamp postingan dibuat
- `updatedAt` (string, required): Timestamp update terakhir

**Catatan:**
- Views otomatis bertambah saat postingan dibuka (GET /api/forum/posts/:id)
- Like bersifat toggle (bisa like/unlike)
- Komentar bisa diedit/dihapus oleh pemilik atau admin
- Postingan bisa diedit/dihapus oleh penulis atau admin

---

## 8. Logs (`logs.json`)

```json
{
  "action": "accepted",
  "role": "customer",
  "userEmail": "john@example.com",
  "adminEmail": "admin@mycotrack.com",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "oldStatus": "pending",
  "newStatus": "accepted",
  "adminMessage": null
}
```

**Field:**
- `action` (string, required): Aksi yang dilakukan - "accepted" | "rejected" | "suspended" | "delete"
- `role` (string, required): Role user yang di-aksi - "customer" | "petani"
- `userEmail` (string, required): Email user yang di-aksi
- `adminEmail` (string, required): Email admin yang melakukan aksi
- `timestamp` (string, required): Timestamp aksi
- `oldStatus` (string, optional): Status lama (jika update status)
- `newStatus` (string, optional): Status baru (jika update status)
- `adminMessage` (string, optional): Pesan admin

---

## 📊 Relasi Database

```
Admin ──┐
        │
Customer ──┐
           │
Petani ────┼──→ Products ──→ Carts ──→ Orders
           │
           └──→ Forum Posts ──→ Comments
                      └──→ Likes
```

**Relasi:**
1. **Petani → Products**: One-to-Many (satu petani bisa punya banyak produk)
2. **Customer → Carts**: One-to-Many (satu customer bisa punya banyak item keranjang)
3. **Carts → Products**: Many-to-One (banyak item keranjang bisa referensi produk yang sama)
4. **Customer → Orders**: One-to-Many (satu customer bisa punya banyak pesanan)
5. **Petani → Orders**: One-to-Many (satu petani bisa punya banyak pesanan)
6. **Orders → Products**: Many-to-Many (satu pesanan bisa punya banyak produk)
7. **User → Forum Posts**: One-to-Many (satu user bisa buat banyak postingan)
8. **Forum Posts → Comments**: One-to-Many (satu postingan bisa punya banyak komentar)
9. **Forum Posts → Likes**: Many-to-Many (satu postingan bisa dilike banyak user)

---

## 🔒 Validasi & Constraints

### Email
- Harus unique (case-insensitive)
- Format email valid

### Status
- Customer/Petani: "pending" | "accepted" | "rejected" | "suspended"
- Order: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
- Payment: "pending" | "paid" | "failed"

### Stock
- Tidak boleh negatif
- Validasi saat add to cart dan checkout

### Price
- Harus positif (> 0)

---

## 📝 Catatan Penting

1. **Denormalization**: Beberapa data di-denormalize untuk performa (contoh: `farmerName` di products, `productName` di carts)
2. **Timestamps**: Semua menggunakan ISO 8601 format
3. **File Uploads**: Gambar disimpan di `backend/uploads/` dan diakses via URL
4. **Data Persistence**: Semua data tersimpan permanen di file JSON
5. **Concurrency**: File-based storage, untuk production disarankan menggunakan database proper (PostgreSQL, MongoDB, dll)

