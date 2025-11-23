# Alur Logika Fitur - MycoTrack

Dokumentasi lengkap alur logika untuk setiap fitur dalam sistem MycoTrack.

---

## 📋 Daftar Isi

1. [Fitur Tambah Produk - Petani](#1-fitur-tambah-produk---petani)
2. [Fitur Keranjang - Customer](#2-fitur-keranjang---customer)
3. [Manajemen Pesanan](#3-manajemen-pesanan)
4. [Fitur Forum Diskusi](#4-fitur-forum-diskusi)

---

## 1. Fitur Tambah Produk - Petani

### 1.1 Alur Lengkap

```
┌─────────────────┐
│  Petani Login   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Dashboard Petani│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Klik "Tambah  │
│     Produk"    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Form Input     │
│  - Nama Produk  │
│  - Deskripsi    │
│  - Harga        │
│  - Stok         │
│  - Unit         │
│  - Kategori     │
│  - Gambar       │
│    (file/URL)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Submit Form    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validasi       │
│  - Field wajib  │
│  - Petani       │
│    status       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Simpan ke DB   │
│  (products.json)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Produk muncul  │
│  - Marketplace  │
│  - Daftar Produk│
│    Petani       │
└─────────────────┘
```

### 1.2 Validasi

**Frontend Validasi:**
- Semua field wajib diisi (kecuali gambar)
- Harga harus > 0
- Stok harus >= 0
- Unit tidak boleh kosong
- Kategori tidak boleh kosong
- Gambar: file upload ATAU URL (minimal salah satu)

**Backend Validasi:**
1. Check `farmerId` exists
2. Check petani status = "accepted"
3. Validate required fields
4. Validate price > 0
5. Validate stock >= 0
6. Process image (file upload atau URL)

### 1.3 Proses Penyimpanan

```javascript
// Backend: POST /api/petani/products
1. Baca products.json
2. Buat product object baru dengan:
   - id: "product-{timestamp}"
   - farmerId: dari request
   - farmerName: dari petanis.json (denormalize)
   - name, description, price, stock, unit, category
   - image: URL dari file upload atau imageUrl
   - createdAt, updatedAt
3. Push ke array products
4. Write ke products.json
5. Return product object
```

### 1.4 Tampilan Produk

**Marketplace (Customer):**
- GET /api/products → Tampilkan semua produk dengan status "accepted"
- Filter by category, search, farmerId

**Daftar Produk Petani:**
- GET /api/petani/products?farmerId={id} → Tampilkan produk milik petani
- Petani bisa edit/delete produknya sendiri

---

## 2. Fitur Keranjang - Customer

### 2.1 Alur Lengkap

```
┌─────────────────┐
│ Customer Login  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Marketplace    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Klik "Tambah  │
│  ke Keranjang"  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validasi Stok │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Simpan ke DB   │
│  (carts.json)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Tampilkan di   │
│  Halaman        │
│  Keranjang      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Customer bisa: │
│  - Lihat items  │
│  - Update qty   │
│  - Hapus item   │
│  - Checkout     │
└─────────────────┘
```

### 2.2 Add to Cart Logic

```javascript
// Backend: POST /api/customer/cart
1. Validasi:
   - customerId, productId, quantity required
   - Product exists
   - Stock >= quantity

2. Check cart:
   - Apakah produk sudah ada di keranjang?
   - Jika YA: Update quantity (tambah)
   - Jika TIDAK: Buat item baru

3. Simpan ke carts.json:
   - id: "cart-{timestamp}"
   - customerId, productId
   - Denormalize: productName, productImage, farmerId, farmerName, price
   - quantity, subtotal (price × quantity)
   - createdAt, updatedAt

4. Return cart items
```

### 2.3 Update Cart Item

```javascript
// Backend: PUT /api/customer/cart/:id
1. Validasi:
   - customerId matches cart item
   - quantity >= 1
   - Product stock >= quantity

2. Update:
   - quantity
   - subtotal = price × quantity
   - updatedAt

3. Save to carts.json
```

### 2.4 Delete Cart Item

```javascript
// Backend: DELETE /api/customer/cart/:id
1. Validasi: customerId matches cart item
2. Remove item from carts array
3. Save to carts.json
```

### 2.5 Data Persistence

**Penting:** Data keranjang tersimpan **permanen** di database, bukan hanya state frontend. Ini berarti:
- Keranjang tetap ada setelah refresh page
- Keranjang bisa diakses dari device berbeda (jika login sama)
- Data tidak hilang saat browser ditutup

---

## 3. Manajemen Pesanan

### 3.1 Alur Checkout

```
┌─────────────────┐
│  Halaman        │
│  Keranjang      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Pilih items    │
│  untuk checkout │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Input Alamat   │
│  Pengiriman     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Pilih Metode   │
│  Pembayaran     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Klik "Checkout"│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validasi:      │
│  - Stok cukup   │
│  - Produk ada   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Group by       │
│  Farmer         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Create Orders  │
│  (per farmer)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Update Stock   │
│  Products       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Remove from    │
│  Cart           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Orders masuk   │
│  Manajemen      │
│  Pesanan        │
└─────────────────┘
```

### 3.2 Checkout Logic

```javascript
// Backend: POST /api/orders
1. Validasi:
   - customerId, cartItemIds, shippingAddress required
   - Customer exists

2. Get cart items:
   - Filter carts by customerId and cartItemIds
   - Validate all items exist

3. Group by farmer:
   - Loop cart items
   - Group by farmerId
   - Calculate total per farmer

4. For each farmer group:
   a. Validate products:
      - Product exists
      - Stock >= quantity
   
   b. Create order:
      - id: "order-{timestamp}-{random}"
      - customerId, customerName
      - farmerId, farmerName
      - products array (denormalized)
      - total
      - status: "pending"
      - paymentStatus: "pending"
      - paymentMethod
      - shippingAddress
      - tracking: [{ status: "pending", message: "Pesanan dibuat", timestamp }]
      - createdAt, updatedAt
   
   c. Update product stock:
      - stock -= quantity
      - updatedAt

5. Remove checked out items from cart

6. Save orders to orders.json

7. Return created orders
```

### 3.3 Order Status Flow

```
pending → processing → shipped → delivered
   │
   └──→ cancelled
```

**Status Transitions:**
- `pending`: Pesanan baru dibuat
- `processing`: Petani sedang memproses pesanan
- `shipped`: Pesanan sedang dikirim
- `delivered`: Pesanan telah diterima customer
- `cancelled`: Pesanan dibatalkan

**Update Status:**
```javascript
// Backend: PUT /api/orders/:id/status
1. Validasi: farmerId matches order
2. Update status
3. Add tracking entry:
   - status
   - message (auto-generated)
   - timestamp
4. Save to orders.json
```

### 3.4 Payment Status

```javascript
// Backend: PUT /api/orders/:id/payment
1. Validasi: paymentStatus valid
2. Update paymentStatus
3. Save to orders.json
```

### 3.5 Manajemen Pesanan

**Customer View:**
- GET /api/customer/orders?customerId={id}
- Lihat semua pesanan milik customer
- Filter by status (optional)

**Farmer View:**
- GET /api/farmer/orders?farmerId={id}
- Lihat semua pesanan untuk petani
- Update status pesanan

**Order Detail:**
- GET /api/orders/:id
- Lihat detail lengkap pesanan
- Lihat tracking history

---

## 4. Fitur Forum Diskusi

### 4.1 Create Post (CR)

```
┌─────────────────┐
│  User Login     │
│  (Customer/      │
│   Petani/Admin) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Halaman Forum  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Klik "Create   │
│     Post"       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Form Input:    │
│  - Judul        │
│  - Isi/Konten   │
│  - Gambar       │
│    (optional)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Submit         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validasi:      │
│  - Judul        │
│  - Konten       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Simpan ke DB   │
│  (forum.json)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Post muncul di │
│  Forum List     │
└─────────────────┘
```

**Backend Logic:**
```javascript
// POST /api/forum/posts
1. Validasi:
   - authorId, authorName, title, content required
   - Image: file upload atau imageUrl (optional)

2. Create post:
   - id: "post-{timestamp}"
   - authorId, authorName, authorRole
   - title, content
   - image: URL dari file atau imageUrl
   - likes: []
   - comments: []
   - views: 0
   - createdAt, updatedAt

3. Save to forum.json
```

### 4.2 Like (Toggle)

```
┌─────────────────┐
│  User melihat   │
│  Postingan      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Klik tombol    │
│  "Like"         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Check: User    │
│  sudah like?    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
   YA        TIDAK
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ Unlike │ │  Like  │
│ (hapus │ │ (tambah│
│  like) │ │  like) │
└───┬────┘ └───┬────┘
    │          │
    └────┬─────┘
         │
         ▼
┌─────────────────┐
│  Update DB      │
│  (forum.json)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Update UI:     │
│  - Total likes  │
│  - Like status  │
└─────────────────┘
```

**Backend Logic:**
```javascript
// POST /api/forum/posts/:id/like
1. Get post from forum.json
2. Check if userId already in likes array
3. If exists:
   - Remove from likes (unlike)
4. If not exists:
   - Add to likes (like)
   - { userId, userName, timestamp }
5. Update updatedAt
6. Save to forum.json
7. Return post with updated likes
```

### 4.3 Comment (Add/Edit/Delete)

#### 4.3.1 Add Comment

```
┌─────────────────┐
│  User melihat   │
│  Postingan      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Input komentar │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Submit         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validasi:      │
│  - userId       │
│  - userName     │
│  - content      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Create comment:│
│  - id           │
│  - userId       │
│  - userName     │
│  - userRole     │
│  - content      │
│  - createdAt    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Add to post    │
│  comments array │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Save to DB     │
└─────────────────┘
```

**Backend Logic:**
```javascript
// POST /api/forum/posts/:id/comments
1. Validasi:
   - userId, userName, content required

2. Create comment:
   - id: "comment-{timestamp}"
   - userId, userName, userRole
   - content
   - createdAt, updatedAt

3. Add to post.comments array
4. Update post.updatedAt
5. Save to forum.json
```

#### 4.3.2 Edit Comment

```
┌─────────────────┐
│  User melihat   │
│  Komentarnya    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Klik "Edit"    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Input baru     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validasi:      │
│  - userId match │
│  - content      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Update comment │
│  - content       │
│  - updatedAt    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Save to DB     │
└─────────────────┘
```

**Backend Logic:**
```javascript
// PUT /api/forum/posts/:postId/comments/:commentId
1. Get post from forum.json
2. Find comment in post.comments
3. Validasi: userId matches comment.userId
4. Update:
   - content
   - updatedAt
5. Update post.updatedAt
6. Save to forum.json
```

#### 4.3.3 Delete Comment

```
┌─────────────────┐
│  User melihat   │
│  Komentar       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Klik "Delete"  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validasi:      │
│  - userId match │
│    (owner/      │
│     admin/      │
│     post author)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Remove from    │
│  comments array │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Save to DB     │
└─────────────────┘
```

**Backend Logic:**
```javascript
// DELETE /api/forum/posts/:postId/comments/:commentId
1. Get post from forum.json
2. Find comment in post.comments
3. Validasi:
   - userId matches comment.userId (owner)
   - OR userId is admin
   - OR userId matches post.authorId (post author)
4. Remove from post.comments array
5. Update post.updatedAt
6. Save to forum.json
```

### 4.4 Views (Auto-increment)

```
┌─────────────────┐
│  User membuka   │
│  Postingan      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GET /api/forum │
│  /posts/:id     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend:       │
│  - Get post     │
│  - views += 1   │
│  - Save to DB   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Return post    │
│  dengan views   │
│  terbaru        │
└─────────────────┘
```

**Backend Logic:**
```javascript
// GET /api/forum/posts/:id
1. Get post from forum.json
2. Increment views:
   - If views undefined: views = 1
   - Else: views += 1
3. Update updatedAt
4. Save to forum.json
5. Return post
```

**Note:** Views otomatis bertambah setiap kali endpoint ini dipanggil. Tidak perlu request terpisah.

### 4.5 Edit & Delete Post

#### 4.5.1 Edit Post

```
┌─────────────────┐
│  Author/Admin   │
│  melihat        │
│  Postingannya   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Klik "Edit"    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Form Edit:     │
│  - Judul        │
│  - Konten       │
│  - Gambar       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validasi:      │
│  - authorId     │
│    (owner/      │
│     admin)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Update post    │
│  - title        │
│  - content      │
│  - image        │
│  - updatedAt    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Save to DB     │
└─────────────────┘
```

**Backend Logic:**
```javascript
// PUT /api/forum/posts/:id
1. Get post from forum.json
2. Validasi:
   - authorId matches post.authorId (owner)
   - OR authorId is admin
3. Update:
   - title (if provided)
   - content (if provided)
   - image (if provided)
   - updatedAt
4. Save to forum.json
```

#### 4.5.2 Delete Post

```
┌─────────────────┐
│  Author/Admin   │
│  melihat        │
│  Postingannya   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Klik "Delete"  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Konfirmasi     │
│  Hapus?         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validasi:      │
│  - authorId     │
│    (owner/      │
│     admin)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Remove from    │
│  forum.json     │
└─────────────────┘
```

**Backend Logic:**
```javascript
// DELETE /api/forum/posts/:id
1. Get post from forum.json
2. Validasi:
   - authorId matches post.authorId (owner)
   - OR authorId is admin
3. Remove post from forum array
4. Save to forum.json
```

### 4.6 Data Persistence

**Semua aktivitas forum tersimpan permanen:**
- Posts: Tersimpan di forum.json
- Likes: Array dalam post object
- Comments: Array dalam post object
- Views: Number dalam post object

**Tidak ada data yang hilang:**
- Like tetap tersimpan meski user logout
- Comments tetap tersimpan
- Views tetap tersimpan
- Edit history: updatedAt timestamp

---

## 🔄 Flow Diagram Lengkap

### Petani → Produk → Customer

```
┌─────────┐
│ Petani  │
│ Register│
└────┬────┘
     │
     ▼
┌─────────┐
│ Admin   │
│ Approve │
└────┬────┘
     │
     ▼
┌─────────┐      ┌─────────┐
│ Petani  │─────▶│ Tambah  │
│ Login   │      │ Produk  │
└────┬────┘      └────┬────┘
     │                │
     │                ▼
     │          ┌─────────┐
     │          │ Produk  │
     │          │ Tersimpan│
     │          └────┬────┘
     │               │
     │               ▼
     │          ┌─────────┐
     │          │ Muncul  │
     │          │ di      │
     │          │ Marketplace│
     │          └────┬────┘
     │               │
     │               ▼
     │          ┌─────────┐
     │          │Customer │
     │          │Lihat    │
     │          │Produk   │
     │          └────┬────┘
     │               │
     │               ▼
     │          ┌─────────┐
     │          │Add to   │
     │          │Cart     │
     │          └────┬────┘
     │               │
     │               ▼
     │          ┌─────────┐
     │          │Checkout │
     │          └────┬────┘
     │               │
     │               ▼
     │          ┌─────────┐
     │          │Order    │
     │          │Created  │
     │          └────┬────┘
     │               │
     │               ▼
     │          ┌─────────┐
     │          │Petani   │
     │          │Lihat    │
     │          │Order    │
     │          └────┬────┘
     │               │
     │               ▼
     │          ┌─────────┐
     │          │Update   │
     │          │Status   │
     │          └─────────┘
```

---

## 📝 Catatan Penting

1. **Data Persistence:** Semua data tersimpan permanen di file JSON
2. **Denormalization:** Beberapa data di-denormalize untuk performa (contoh: farmerName di products)
3. **Validation:** Validasi dilakukan di backend dan frontend
4. **Error Handling:** Semua endpoint memiliki error handling
5. **Timestamps:** Semua data memiliki createdAt dan updatedAt
6. **Stock Management:** Stok otomatis berkurang saat checkout
7. **Cart Management:** Cart tersimpan permanen, bukan hanya state frontend

