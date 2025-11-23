# Dokumentasi Lengkap MycoTrack Backend

Dokumentasi komprehensif untuk semua fitur sistem MycoTrack marketplace dan forum.

---

## 📚 Daftar Dokumentasi

1. **[DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md)** - Struktur database lengkap
2. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Dokumentasi semua API endpoints
3. **[FEATURE_FLOW.md](./FEATURE_FLOW.md)** - Alur logika setiap fitur
4. **[FARMER_PRODUCT_CUSTOMER_FLOW.md](./FARMER_PRODUCT_CUSTOMER_FLOW.md)** - Flow petani → produk → customer
5. **[FORUM_FEATURE.md](./FORUM_FEATURE.md)** - Dokumentasi fitur forum lengkap

---

## 🎯 Ringkasan Fitur

### 1. Fitur Tambah Produk - Petani ✅

**Status:** ✅ **Sudah Diimplementasi**

**Fitur:**
- Form input lengkap (nama, deskripsi, harga, stok, unit, kategori, gambar)
- Upload gambar (file) atau input URL gambar
- Produk langsung muncul di marketplace
- Produk tersimpan di daftar produk petani
- Data tersimpan permanen di database

**API:**
- `POST /api/petani/products` - Create product
- `GET /api/products` - Get all products (marketplace)
- `GET /api/petani/products` - Get products by farmer
- `PUT /api/petani/products/:id` - Update product
- `DELETE /api/petani/products/:id` - Delete product

**Dokumentasi:**
- [Database Structure - Products](./DATABASE_STRUCTURE.md#4-products-productsjson)
- [API Documentation - Products](./API_DOCUMENTATION.md#2-product-endpoints-petani)
- [Feature Flow - Add Product](./FEATURE_FLOW.md#1-fitur-tambah-produk---petani)
- [Farmer → Product → Customer Flow](./FARMER_PRODUCT_CUSTOMER_FLOW.md)

---

### 2. Fitur Keranjang - Customer ✅

**Status:** ✅ **Sudah Diimplementasi**

**Fitur:**
- Add to cart (data tersimpan di database, bukan hanya state)
- View cart items
- Update quantity
- Delete item
- Clear cart
- Data keranjang tersimpan permanen

**API:**
- `GET /api/customer/cart` - Get cart items
- `POST /api/customer/cart` - Add to cart
- `PUT /api/customer/cart/:id` - Update cart item
- `DELETE /api/customer/cart/:id` - Delete cart item
- `DELETE /api/customer/cart` - Clear cart

**Dokumentasi:**
- [Database Structure - Carts](./DATABASE_STRUCTURE.md#5-carts-cartsjson)
- [API Documentation - Cart](./API_DOCUMENTATION.md#3-cart-endpoints-customer)
- [Feature Flow - Cart](./FEATURE_FLOW.md#2-fitur-keranjang---customer)

---

### 3. Manajemen Pesanan ✅

**Status:** ✅ **Sudah Diimplementasi**

**Fitur:**
- Checkout dari cart
- Create order (bisa multiple jika dari petani berbeda)
- View orders (customer & farmer)
- Update order status
- Update payment status
- Tracking history
- Data pesanan tersimpan permanen

**API:**
- `GET /api/customer/orders` - Get customer orders
- `GET /api/farmer/orders` - Get farmer orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order (checkout)
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/payment` - Update payment status

**Dokumentasi:**
- [Database Structure - Orders](./DATABASE_STRUCTURE.md#6-orders-ordersjson)
- [API Documentation - Orders](./API_DOCUMENTATION.md#4-order-endpoints)
- [Feature Flow - Orders](./FEATURE_FLOW.md#3-manajemen-pesanan)
- [Farmer → Product → Customer Flow](./FARMER_PRODUCT_CUSTOMER_FLOW.md#step-9-customer-checkout)

---

### 4. Fitur Forum Diskusi ✅

**Status:** ✅ **Sudah Diimplementasi**

#### 4.1 Create Post (CR) ✅
- User bisa membuat postingan baru
- Judul + konten (required)
- Gambar (optional - file atau URL)
- Tersimpan permanen

#### 4.2 Like ✅
- User bisa like/unlike postingan (toggle)
- Total likes ditampilkan
- Tersimpan permanen

#### 4.3 Comment ✅
- User bisa menambah komentar
- User bisa edit komentar miliknya
- User bisa hapus komentar (owner/post author/admin)
- Tersimpan permanen

#### 4.4 Views ✅
- Views otomatis bertambah saat post dibuka
- Tersimpan permanen di database

#### 4.5 Edit & Delete Post ✅
- Penulis atau admin bisa edit postingan
- Penulis atau admin bisa hapus postingan
- Tersimpan permanen

**API:**
- `GET /api/forum/posts` - Get all posts
- `GET /api/forum/posts/:id` - Get post by ID (increment views)
- `POST /api/forum/posts` - Create post
- `PUT /api/forum/posts/:id` - Update post
- `DELETE /api/forum/posts/:id` - Delete post
- `POST /api/forum/posts/:id/like` - Toggle like
- `POST /api/forum/posts/:id/comments` - Add comment
- `PUT /api/forum/posts/:postId/comments/:commentId` - Update comment
- `DELETE /api/forum/posts/:postId/comments/:commentId` - Delete comment

**Dokumentasi:**
- [Database Structure - Forum](./DATABASE_STRUCTURE.md#7-forum-forumjson)
- [API Documentation - Forum](./API_DOCUMENTATION.md#5-forum-endpoints)
- [Feature Flow - Forum](./FEATURE_FLOW.md#4-fitur-forum-diskusi)
- [Forum Feature Documentation](./FORUM_FEATURE.md)

---

## 📊 Struktur Database

### File Database

Semua data tersimpan di `backend/data/`:

1. **admin.json** - Data admin
2. **customers.json** - Data customer
3. **petanis.json** - Data petani
4. **products.json** - Data produk
5. **carts.json** - Data keranjang
6. **orders.json** - Data pesanan
7. **forum.json** - Data forum
8. **logs.json** - Log aktivitas admin

### Relasi Database

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

**Detail:** [DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md)

---

## 🔄 Flow Lengkap

### Petani → Produk → Customer

```
1. Petani Registrasi → Admin Approve → Petani Login
2. Petani Tambah Produk → Produk Tersimpan
3. Produk Muncul di Marketplace
4. Customer Login → Customer Lihat Produk
5. Customer Add to Cart → Cart Tersimpan
6. Customer Checkout → Order Created
7. Stock Produk Berkurang
8. Petani Lihat Order → Petani Update Status
9. Customer Lihat Order → Tracking Real-time
```

**Detail:** [FARMER_PRODUCT_CUSTOMER_FLOW.md](./FARMER_PRODUCT_CUSTOMER_FLOW.md)

---

## 🛠️ API Endpoints Summary

### Authentication
- `POST /api/customer/register` - Register customer
- `POST /api/customer/login` - Login customer
- `POST /api/petani/register` - Register petani
- `POST /api/petani/login` - Login petani
- `POST /api/admin/login` - Login admin

### Products
- `GET /api/products` - Get all products (marketplace)
- `GET /api/products/:id` - Get product by ID
- `GET /api/petani/products` - Get products by farmer
- `POST /api/petani/products` - Create product
- `PUT /api/petani/products/:id` - Update product
- `DELETE /api/petani/products/:id` - Delete product

### Cart
- `GET /api/customer/cart` - Get cart items
- `POST /api/customer/cart` - Add to cart
- `PUT /api/customer/cart/:id` - Update cart item
- `DELETE /api/customer/cart/:id` - Delete cart item
- `DELETE /api/customer/cart` - Clear cart

### Orders
- `GET /api/customer/orders` - Get customer orders
- `GET /api/farmer/orders` - Get farmer orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order (checkout)
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/payment` - Update payment status

### Forum
- `GET /api/forum/posts` - Get all posts
- `GET /api/forum/posts/:id` - Get post by ID (increment views)
- `POST /api/forum/posts` - Create post
- `PUT /api/forum/posts/:id` - Update post
- `DELETE /api/forum/posts/:id` - Delete post
- `POST /api/forum/posts/:id/like` - Toggle like
- `POST /api/forum/posts/:id/comments` - Add comment
- `PUT /api/forum/posts/:postId/comments/:commentId` - Update comment
- `DELETE /api/forum/posts/:postId/comments/:commentId` - Delete comment

### Admin
- `GET /api/admin/users/customers` - Get all customers
- `GET /api/admin/users/petanis` - Get all petanis
- `GET /api/admin/users/customers/:id` - Get customer by ID
- `GET /api/admin/users/petanis/:id` - Get petani by ID
- `PUT /api/admin/users/customers/:id/status` - Update customer status
- `PUT /api/admin/users/petanis/:id/status` - Update petani status
- `DELETE /api/admin/users/customers/:id` - Delete customer
- `DELETE /api/admin/users/petanis/:id` - Delete petani
- `GET /api/admin/logs` - Get audit logs

**Detail:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## ✅ Checklist Fitur

### Fitur Tambah Produk - Petani
- [x] Form input lengkap (nama, deskripsi, harga, stok, unit, kategori)
- [x] Upload gambar (file)
- [x] Input URL gambar (alternatif)
- [x] Validasi semua field
- [x] Simpan ke database
- [x] Produk muncul di marketplace
- [x] Produk muncul di daftar produk petani

### Fitur Keranjang - Customer
- [x] Add to cart
- [x] Data tersimpan di database (bukan hanya state)
- [x] View cart items
- [x] Update quantity
- [x] Delete item
- [x] Clear cart
- [x] Validasi stok

### Manajemen Pesanan
- [x] Checkout dari cart
- [x] Create order
- [x] Group by farmer (multiple orders jika perlu)
- [x] Update stock produk
- [x] View orders (customer & farmer)
- [x] Update order status
- [x] Update payment status
- [x] Tracking history
- [x] Data tersimpan permanen

### Fitur Forum Diskusi
- [x] Create Post (CR)
- [x] Like (toggle)
- [x] Comment (add)
- [x] Comment (edit)
- [x] Comment (delete)
- [x] Views (auto-increment)
- [x] Edit Post
- [x] Delete Post
- [x] Semua aktivitas tersimpan permanen

---

## 🔑 Key Features

### 1. Data Persistence
✅ **Semua data tersimpan permanen** di file JSON:
- Products
- Carts
- Orders
- Forum posts, likes, comments, views

### 2. Real-time Updates
✅ **Update real-time:**
- Produk langsung muncul setelah dibuat
- Stock otomatis berkurang saat checkout
- Order status bisa diupdate real-time

### 3. Validation
✅ **Validasi lengkap:**
- Field validation
- Stock validation
- Permission validation
- Status validation

### 4. Denormalization
✅ **Data di-denormalize untuk performa:**
- `farmerName` di products
- `productName`, `productImage` di carts
- `customerName`, `farmerName` di orders

### 5. File Upload Support
✅ **Upload file atau URL:**
- Products: file upload atau URL
- Forum posts: file upload atau URL
- Profile photos: file upload

---

## 📝 Contoh Implementasi

### Frontend Example (React)

```typescript
// Add to Cart
const addToCart = async (productId: string, quantity: number) => {
  const response = await fetch('http://localhost:3000/api/customer/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: user.id,
      productId,
      quantity
    })
  });
  const data = await response.json();
  return data;
};

// Create Forum Post
const createPost = async (formData: FormData) => {
  const response = await fetch('http://localhost:3000/api/forum/posts', {
    method: 'POST',
    body: formData // multipart/form-data
  });
  const data = await response.json();
  return data;
};

// Toggle Like
const toggleLike = async (postId: string) => {
  const response = await fetch(`http://localhost:3000/api/forum/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      userName: user.name
    })
  });
  const data = await response.json();
  return data;
};
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start Server
```bash
npm start
```

### 3. Test API
```bash
# Health check
curl http://localhost:3000/api/health

# Get all products
curl http://localhost:3000/api/products

# Get all forum posts
curl http://localhost:3000/api/forum/posts
```

---

## 📚 Dokumentasi Lengkap

1. **[DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md)**
   - Struktur semua tabel/collection
   - Field definitions
   - Relasi database
   - Validasi & constraints

2. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**
   - Semua endpoints
   - Request/Response examples
   - Error handling
   - Query parameters

3. **[FEATURE_FLOW.md](./FEATURE_FLOW.md)**
   - Alur logika setiap fitur
   - Flow diagrams
   - Step-by-step processes

4. **[FARMER_PRODUCT_CUSTOMER_FLOW.md](./FARMER_PRODUCT_CUSTOMER_FLOW.md)**
   - Flow lengkap petani → produk → customer
   - Step-by-step dengan examples
   - Data flow diagrams

5. **[FORUM_FEATURE.md](./FORUM_FEATURE.md)**
   - Dokumentasi lengkap fitur forum
   - Create, Like, Comment, Views, Edit, Delete
   - Permission matrix
   - Data persistence

---

## ✅ Status Implementasi

**Semua fitur sudah diimplementasi dan siap digunakan!**

- ✅ Fitur Tambah Produk - Petani
- ✅ Fitur Keranjang - Customer
- ✅ Manajemen Pesanan
- ✅ Fitur Forum Diskusi (Create, Like, Comment, Views, Edit, Delete)

**Backend sudah lengkap dan siap untuk integrasi dengan frontend!**

---

## 📞 Support

Jika ada pertanyaan atau butuh bantuan:
1. Baca dokumentasi lengkap di file-file di atas
2. Cek API documentation untuk endpoint details
3. Cek feature flow untuk alur logika
4. Test dengan Postman atau curl

---

**Last Updated:** 2024-01-01
**Version:** 2.0.0

