# API Documentation - MycoTrack Backend

Dokumentasi lengkap semua endpoint API untuk sistem MycoTrack.

**Base URL:** `http://localhost:3000`

---

## 📋 Daftar Isi

1. [Authentication Endpoints](#1-authentication-endpoints)
2. [Product Endpoints (Petani)](#2-product-endpoints-petani)
3. [Cart Endpoints (Customer)](#3-cart-endpoints-customer)
4. [Order Endpoints](#4-order-endpoints)
5. [Forum Endpoints](#5-forum-endpoints)
6. [Admin Endpoints](#6-admin-endpoints)

---

## 1. Authentication Endpoints

### 1.1 Register Customer

**POST** `/api/customer/register`

**Description:** Registrasi customer baru

**Content-Type:** `multipart/form-data` (untuk upload foto profil)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "address": "Jl. Contoh No. 123",
  "phoneNumber": "081234567890",
  "profilePhoto": "<file>" // Optional
}
```

**Response Success (201):**
```json
{
  "message": "Registrasi berhasil",
  "user": {
    "id": "customer-1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "address": "Jl. Contoh No. 123",
    "phoneNumber": "081234567890",
    "profilePhoto": "http://localhost:3000/uploads/profilePhoto-123.jpg",
    "role": "customer",
    "balance": 0,
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response Error (400):**
```json
{
  "error": "Semua field wajib diisi"
}
```

**Response Error (400):**
```json
{
  "error": "Email sudah terdaftar"
}
```

---

### 1.2 Login Customer

**POST** `/api/customer/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "message": "Login berhasil",
  "user": {
    "id": "customer-1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "status": "accepted"
  }
}
```

**Response Error (401):**
```json
{
  "error": "Email atau password salah"
}
```

**Response Error (403):**
```json
{
  "error": "Akun Anda masih menunggu persetujuan admin. Silakan tunggu konfirmasi."
}
```

---

### 1.3 Register Petani

**POST** `/api/petani/register`

**Content-Type:** `multipart/form-data`

**Request Body:**
```json
{
  "name": "Budi Petani",
  "email": "budi@example.com",
  "password": "password123",
  "phoneNumber": "081234567890",
  "address": "Jl. Pertanian No. 456",
  "shopName": "Toko Jamur Budi",
  "shopDescription": "Toko jamur terpercaya",
  "landArea": "1000",
  "mushroomType": "Jamur Tiram",
  "rackCount": "50",
  "baglogCount": "500",
  "harvestCapacity": "100",
  "ktpPhoto": "<file>", // Optional
  "shopPhoto": "<file>", // Optional
  "landPhoto": "<file>" // Optional
}
```

**Response Success (201):**
```json
{
  "message": "Registrasi berhasil",
  "user": {
    "id": "petani-1234567890",
    "name": "Budi Petani",
    "email": "budi@example.com",
    "role": "petani",
    "status": "pending",
    "shop": { ... },
    "farm": { ... }
  }
}
```

---

### 1.4 Login Petani

**POST** `/api/petani/login`

**Request Body:**
```json
{
  "email": "budi@example.com",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "message": "Login berhasil",
  "user": {
    "id": "petani-1234567890",
    "name": "Budi Petani",
    "email": "budi@example.com",
    "role": "petani",
    "status": "accepted"
  }
}
```

---

### 1.5 Login Admin

**POST** `/api/admin/login`

**Request Body:**
```json
{
  "email": "admin@mycotrack.com",
  "password": "admin123"
}
```

**Response Success (200):**
```json
{
  "message": "Login berhasil",
  "user": {
    "id": "admin-1234567890",
    "name": "Admin MycoTrack",
    "email": "admin@mycotrack.com",
    "role": "admin"
  }
}
```

---

## 2. Product Endpoints (Petani)

### 2.1 Get All Products (Marketplace)

**GET** `/api/products`

**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search by name or description
- `farmerId` (optional): Filter by farmer ID

**Example:**
```
GET /api/products?category=Jamur Segar&search=tiram
```

**Response Success (200):**
```json
{
  "products": [
    {
      "id": "product-1234567890",
      "farmerId": "petani-1234567890",
      "farmerName": "Budi Petani",
      "name": "Jamur Tiram Segar",
      "description": "Jamur tiram organik segar",
      "price": 25000,
      "stock": 100,
      "unit": "kg",
      "category": "Jamur Segar",
      "image": "http://localhost:3000/uploads/image-123.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

### 2.2 Get Product by ID

**GET** `/api/products/:id`

**Response Success (200):**
```json
{
  "product": {
    "id": "product-1234567890",
    "farmerId": "petani-1234567890",
    "farmerName": "Budi Petani",
    "name": "Jamur Tiram Segar",
    "description": "Jamur tiram organik segar",
    "price": 25000,
    "stock": 100,
    "unit": "kg",
    "category": "Jamur Segar",
    "image": "http://localhost:3000/uploads/image-123.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response Error (404):**
```json
{
  "error": "Produk tidak ditemukan"
}
```

---

### 2.3 Get Products by Farmer

**GET** `/api/petani/products?farmerId=petani-1234567890`

**Query Parameters:**
- `farmerId` (required): ID petani

**Response Success (200):**
```json
{
  "products": [
    {
      "id": "product-1234567890",
      "name": "Jamur Tiram Segar",
      "price": 25000,
      "stock": 100,
      ...
    }
  ],
  "total": 1
}
```

---

### 2.4 Create Product (Petani)

**POST** `/api/petani/products`

**Content-Type:** `multipart/form-data`

**Request Body:**
```json
{
  "farmerId": "petani-1234567890",
  "name": "Jamur Tiram Segar",
  "description": "Jamur tiram organik segar dari kebun sendiri",
  "price": "25000",
  "stock": "100",
  "unit": "kg",
  "category": "Jamur Segar",
  "image": "<file>", // Optional - file upload
  "imageUrl": "https://example.com/image.jpg" // Optional - URL image (alternatif)
}
```

**Note:** Gunakan `image` untuk file upload ATAU `imageUrl` untuk URL gambar. File upload memiliki prioritas.

**Response Success (201):**
```json
{
  "message": "Produk berhasil ditambahkan",
  "product": {
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
}
```

**Response Error (400):**
```json
{
  "error": "Semua field wajib diisi (kecuali gambar)"
}
```

**Response Error (403):**
```json
{
  "error": "Akun petani belum disetujui"
}
```

---

### 2.5 Update Product (Petani)

**PUT** `/api/petani/products/:id`

**Content-Type:** `multipart/form-data`

**Request Body:**
```json
{
  "farmerId": "petani-1234567890",
  "name": "Jamur Tiram Segar (Updated)",
  "description": "Updated description",
  "price": "30000",
  "stock": "150",
  "unit": "kg",
  "category": "Jamur Segar",
  "image": "<file>", // Optional
  "imageUrl": "https://example.com/new-image.jpg" // Optional
}
```

**Response Success (200):**
```json
{
  "message": "Produk berhasil diperbarui",
  "product": { ... }
}
```

**Response Error (403):**
```json
{
  "error": "Anda tidak memiliki akses ke produk ini"
}
```

---

### 2.6 Delete Product (Petani)

**DELETE** `/api/petani/products/:id`

**Request Body:**
```json
{
  "farmerId": "petani-1234567890"
}
```

**Response Success (200):**
```json
{
  "message": "Produk berhasil dihapus"
}
```

---

## 3. Cart Endpoints (Customer)

### 3.1 Get Cart Items

**GET** `/api/customer/cart?customerId=customer-1234567890`

**Query Parameters:**
- `customerId` (required): ID customer

**Response Success (200):**
```json
{
  "items": [
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
  ],
  "total": 1
}
```

---

### 3.2 Add to Cart

**POST** `/api/customer/cart`

**Request Body:**
```json
{
  "customerId": "customer-1234567890",
  "productId": "product-1234567890",
  "quantity": 2
}
```

**Response Success (201):**
```json
{
  "message": "Item berhasil ditambahkan ke keranjang",
  "cart": [ ... ]
}
```

**Response Error (400):**
```json
{
  "error": "Stok tidak mencukupi"
}
```

**Note:** Jika produk yang sama sudah ada di keranjang, quantity akan ditambah (bukan item baru).

---

### 3.3 Update Cart Item Quantity

**PUT** `/api/customer/cart/:id`

**Request Body:**
```json
{
  "customerId": "customer-1234567890",
  "quantity": 3
}
```

**Response Success (200):**
```json
{
  "message": "Keranjang berhasil diperbarui",
  "item": { ... }
}
```

---

### 3.4 Delete Cart Item

**DELETE** `/api/customer/cart/:id`

**Request Body:**
```json
{
  "customerId": "customer-1234567890"
}
```

**Response Success (200):**
```json
{
  "message": "Item berhasil dihapus dari keranjang"
}
```

---

### 3.5 Clear Cart

**DELETE** `/api/customer/cart`

**Request Body:**
```json
{
  "customerId": "customer-1234567890"
}
```

**Response Success (200):**
```json
{
  "message": "Keranjang berhasil dikosongkan"
}
```

---

## 4. Order Endpoints

### 4.1 Get Customer Orders

**GET** `/api/customer/orders?customerId=customer-1234567890`

**Query Parameters:**
- `customerId` (required): ID customer

**Response Success (200):**
```json
{
  "orders": [
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
  ],
  "total": 1
}
```

---

### 4.2 Get Farmer Orders

**GET** `/api/farmer/orders?farmerId=petani-1234567890`

**Query Parameters:**
- `farmerId` (required): ID petani

**Response Success (200):**
```json
{
  "orders": [ ... ],
  "total": 1
}
```

---

### 4.3 Get Order by ID

**GET** `/api/orders/:id`

**Response Success (200):**
```json
{
  "order": { ... }
}
```

---

### 4.4 Create Order (Checkout)

**POST** `/api/orders`

**Request Body:**
```json
{
  "customerId": "customer-1234567890",
  "cartItemIds": ["cart-1234567890", "cart-1234567891"],
  "paymentMethod": "Saldo MycoTrack",
  "shippingAddress": "Jl. Contoh No. 123, Jakarta"
}
```

**Response Success (201):**
```json
{
  "message": "Pesanan berhasil dibuat",
  "orders": [
    {
      "id": "order-1234567890-abc123",
      "customerId": "customer-1234567890",
      "farmerId": "petani-1234567890",
      "products": [ ... ],
      "total": 50000,
      "status": "pending",
      "paymentStatus": "pending",
      ...
    }
  ],
  "totalOrders": 1
}
```

**Note:** 
- Satu checkout bisa menghasilkan multiple orders jika produk dari petani berbeda
- Stok produk otomatis berkurang
- Item keranjang otomatis dihapus setelah checkout

---

### 4.5 Update Order Status (Farmer)

**PUT** `/api/orders/:id/status`

**Request Body:**
```json
{
  "farmerId": "petani-1234567890",
  "status": "processing"
}
```

**Valid Status:** `"pending"` | `"processing"` | `"shipped"` | `"delivered"` | `"cancelled"`

**Response Success (200):**
```json
{
  "message": "Status pesanan berhasil diupdate",
  "order": { ... }
}
```

---

### 4.6 Update Payment Status

**PUT** `/api/orders/:id/payment`

**Request Body:**
```json
{
  "paymentStatus": "paid"
}
```

**Valid Status:** `"pending"` | `"paid"` | `"failed"`

**Response Success (200):**
```json
{
  "message": "Status pembayaran berhasil diupdate",
  "order": { ... }
}
```

---

## 5. Forum Endpoints

### 5.1 Get All Forum Posts

**GET** `/api/forum/posts`

**Query Parameters:**
- `search` (optional): Search by title or content
- `authorId` (optional): Filter by author ID

**Response Success (200):**
```json
{
  "posts": [
    {
      "id": "post-1234567890",
      "authorId": "customer-1234567890",
      "authorName": "John Doe",
      "authorRole": "customer",
      "title": "Tips Budidaya Jamur Tiram",
      "content": "Berikut adalah tips...",
      "image": "http://localhost:3000/uploads/post-image-123.jpg",
      "likes": [
        {
          "userId": "customer-1111111111",
          "userName": "Jane Doe",
          "timestamp": "2024-01-01T00:00:00.000Z"
        }
      ],
      "comments": [ ... ],
      "views": 150,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

### 5.2 Get Forum Post by ID (Increment Views)

**GET** `/api/forum/posts/:id`

**Response Success (200):**
```json
{
  "post": {
    "id": "post-1234567890",
    "title": "Tips Budidaya Jamur Tiram",
    "content": "...",
    "views": 151, // Auto-increment
    ...
  }
}
```

**Note:** Views otomatis bertambah +1 setiap kali endpoint ini dipanggil.

---

### 5.3 Create Forum Post

**POST** `/api/forum/posts`

**Content-Type:** `multipart/form-data`

**Request Body:**
```json
{
  "authorId": "customer-1234567890",
  "authorName": "John Doe",
  "authorRole": "customer",
  "title": "Tips Budidaya Jamur Tiram",
  "content": "Berikut adalah tips untuk budidaya jamur tiram...",
  "image": "<file>", // Optional - file upload
  "imageUrl": "https://example.com/image.jpg" // Optional - URL image
}
```

**Response Success (201):**
```json
{
  "message": "Postingan berhasil dibuat",
  "post": {
    "id": "post-1234567890",
    "authorId": "customer-1234567890",
    "authorName": "John Doe",
    "title": "Tips Budidaya Jamur Tiram",
    "content": "...",
    "likes": [],
    "comments": [],
    "views": 0,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 5.4 Update Forum Post

**PUT** `/api/forum/posts/:id`

**Content-Type:** `multipart/form-data`

**Request Body:**
```json
{
  "authorId": "customer-1234567890",
  "title": "Updated Title",
  "content": "Updated content",
  "image": "<file>", // Optional
  "imageUrl": "https://example.com/new-image.jpg" // Optional
}
```

**Response Success (200):**
```json
{
  "message": "Postingan berhasil diperbarui",
  "post": { ... }
}
```

**Note:** Hanya penulis atau admin yang bisa edit.

---

### 5.5 Delete Forum Post

**DELETE** `/api/forum/posts/:id`

**Request Body:**
```json
{
  "authorId": "customer-1234567890"
}
```

**Response Success (200):**
```json
{
  "message": "Postingan berhasil dihapus"
}
```

**Note:** Hanya penulis atau admin yang bisa hapus.

---

### 5.6 Toggle Like on Forum Post

**POST** `/api/forum/posts/:id/like`

**Request Body:**
```json
{
  "userId": "customer-1234567890",
  "userName": "John Doe"
}
```

**Response Success (200):**
```json
{
  "message": "Postingan dilike", // atau "Like dibatalkan"
  "post": {
    "id": "post-1234567890",
    "likes": [ ... ],
    ...
  },
  "isLiked": true
}
```

**Note:** Like bersifat toggle. Jika sudah like, akan unlike. Jika belum like, akan like.

---

### 5.7 Add Comment to Forum Post

**POST** `/api/forum/posts/:id/comments`

**Request Body:**
```json
{
  "userId": "customer-1234567890",
  "userName": "John Doe",
  "userRole": "customer",
  "content": "Terima kasih atas tipsnya!"
}
```

**Response Success (201):**
```json
{
  "message": "Komentar berhasil ditambahkan",
  "comment": {
    "id": "comment-1234567890",
    "userId": "customer-1234567890",
    "userName": "John Doe",
    "userRole": "customer",
    "content": "Terima kasih atas tipsnya!",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "post": { ... }
}
```

---

### 5.8 Update Comment

**PUT** `/api/forum/posts/:postId/comments/:commentId`

**Request Body:**
```json
{
  "userId": "customer-1234567890",
  "content": "Updated comment content"
}
```

**Response Success (200):**
```json
{
  "message": "Komentar berhasil diperbarui",
  "comment": { ... }
}
```

**Note:** Hanya pemilik komentar yang bisa edit.

---

### 5.9 Delete Comment

**DELETE** `/api/forum/posts/:postId/comments/:commentId`

**Request Body:**
```json
{
  "userId": "customer-1234567890"
}
```

**Response Success (200):**
```json
{
  "message": "Komentar berhasil dihapus"
}
```

**Note:** Pemilik komentar, penulis postingan, atau admin bisa hapus.

---

## 6. Admin Endpoints

### 6.1 Get All Customers

**GET** `/api/admin/users/customers`

**Query Parameters:**
- `status` (optional): Filter by status - "pending" | "accepted" | "rejected" | "suspended"
- `search` (optional): Search by name or email

**Response Success (200):**
```json
{
  "customers": [
    {
      "id": "customer-1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "status": "accepted",
      ...
    }
  ],
  "total": 1
}
```

---

### 6.2 Get All Petanis

**GET** `/api/admin/users/petanis`

**Query Parameters:**
- `status` (optional): Filter by status
- `search` (optional): Search by name or email

**Response Success (200):**
```json
{
  "petanis": [ ... ],
  "total": 1
}
```

---

### 6.3 Get Customer by ID

**GET** `/api/admin/users/customers/:id`

**Response Success (200):**
```json
{
  "customer": { ... }
}
```

---

### 6.4 Get Petani by ID

**GET** `/api/admin/users/petanis/:id`

**Response Success (200):**
```json
{
  "petani": { ... }
}
```

---

### 6.5 Update Customer Status

**PUT** `/api/admin/users/customers/:id/status`

**Request Body:**
```json
{
  "status": "accepted",
  "adminMessage": "Akun diterima",
  "adminEmail": "admin@mycotrack.com"
}
```

**Valid Status:** `"pending"` | `"accepted"` | `"rejected"` | `"suspended"`

**Response Success (200):**
```json
{
  "message": "Status berhasil diupdate",
  "customer": { ... }
}
```

---

### 6.6 Update Petani Status

**PUT** `/api/admin/users/petanis/:id/status`

**Request Body:**
```json
{
  "status": "accepted",
  "adminMessage": "Akun diterima",
  "adminEmail": "admin@mycotrack.com"
}
```

**Response Success (200):**
```json
{
  "message": "Status berhasil diupdate",
  "petani": { ... }
}
```

---

### 6.7 Delete Customer

**DELETE** `/api/admin/users/customers/:id`

**Request Body:**
```json
{
  "adminEmail": "admin@mycotrack.com"
}
```

**Response Success (200):**
```json
{
  "message": "Customer berhasil dihapus"
}
```

---

### 6.8 Delete Petani

**DELETE** `/api/admin/users/petanis/:id`

**Request Body:**
```json
{
  "adminEmail": "admin@mycotrack.com"
}
```

**Response Success (200):**
```json
{
  "message": "Petani berhasil dihapus"
}
```

---

### 6.9 Get Audit Logs

**GET** `/api/admin/logs?limit=100`

**Query Parameters:**
- `limit` (optional, default: 100): Limit jumlah log

**Response Success (200):**
```json
{
  "logs": [
    {
      "action": "accepted",
      "role": "customer",
      "userEmail": "john@example.com",
      "adminEmail": "admin@mycotrack.com",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "oldStatus": "pending",
      "newStatus": "accepted"
    }
  ],
  "total": 1
}
```

---

## 🔒 Error Responses

Semua endpoint mengembalikan error dengan format berikut:

**400 Bad Request:**
```json
{
  "error": "Pesan error"
}
```

**401 Unauthorized:**
```json
{
  "error": "Email atau password salah"
}
```

**403 Forbidden:**
```json
{
  "error": "Anda tidak memiliki akses"
}
```

**404 Not Found:**
```json
{
  "error": "Resource tidak ditemukan"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Server error"
}
```

---

## 📝 Notes

1. **File Uploads:** Gunakan `multipart/form-data` untuk upload file
2. **Image URL Alternative:** Untuk produk dan forum post, bisa gunakan file upload ATAU URL gambar
3. **Authentication:** Saat ini belum ada JWT token, gunakan user ID dari response login
4. **CORS:** Backend sudah dikonfigurasi untuk menerima request dari frontend (localhost:5173, localhost:5174)
5. **Data Persistence:** Semua data tersimpan permanen di file JSON

---

## 🧪 Testing

Gunakan tools seperti:
- Postman
- Insomnia
- curl
- Browser (untuk GET requests)

**Example curl:**
```bash
# Get all products
curl http://localhost:3000/api/products

# Login customer
curl -X POST http://localhost:3000/api/customer/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

