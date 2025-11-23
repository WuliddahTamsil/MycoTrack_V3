# Flow Petani → Produk → Customer

Penjelasan lengkap alur dari petani membuat produk hingga customer melakukan pembelian.

---

## 📊 Diagram Flow Lengkap

```
┌─────────────────────────────────────────────────────────────────┐
│                        REGISTRASI & APPROVAL                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────┐         ┌──────────┐         ┌──────────┐
│  Petani  │────────▶│  Admin   │────────▶│ Approved │
│ Register │         │  Review  │         │  Status  │
└──────────┘         └──────────┘         └─────┬─────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        PRODUK MANAGEMENT                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────┐         ┌──────────┐         ┌──────────┐
│  Petani  │────────▶│  Tambah  │────────▶│  Produk  │
│  Login   │         │  Produk  │         │ Tersimpan │
└──────────┘         └──────────┘         └─────┬─────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MARKETPLACE                                │
└─────────────────────────────────────────────────────────────────┘

┌──────────┐         ┌──────────┐         ┌──────────┐
│  Produk  │────────▶│ Muncul di│────────▶│ Customer │
│ Tersimpan│         │ Marketplace│        │  Lihat   │
└──────────┘         └──────────┘         └─────┬─────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SHOPPING CART                              │
└─────────────────────────────────────────────────────────────────┘

┌──────────┐         ┌──────────┐         ┌──────────┐
│ Customer │────────▶│ Add to   │────────▶│  Cart    │
│  Lihat   │         │  Cart    │         │ Tersimpan│
└──────────┘         └──────────┘         └─────┬─────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CHECKOUT & ORDER                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────┐         ┌──────────┐         ┌──────────┐
│  Cart    │────────▶│ Checkout │────────▶│  Order   │
│ Tersimpan│         │          │         │  Created │
└──────────┘         └──────────┘         └─────┬─────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        ORDER MANAGEMENT                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────┐         ┌──────────┐         ┌──────────┐
│  Order   │────────▶│  Petani  │────────▶│  Update  │
│  Created │         │  Process │         │  Status  │
└──────────┘         └──────────┘         └──────────┘
```

---

## 🔄 Step-by-Step Flow

### Step 1: Petani Registrasi

**Aktor:** Petani baru

**Proses:**
1. Petani mengisi form registrasi:
   - Nama, email, password
   - Nomor telepon, alamat
   - Data toko (nama, deskripsi, foto)
   - Data farm (luas lahan, jenis jamur, dll)
   - Upload KTP, foto toko, foto lahan

2. Backend menyimpan data ke `petanis.json`:
   ```json
   {
     "id": "petani-1234567890",
     "name": "Budi Petani",
     "email": "budi@example.com",
     "status": "pending",  // ← Status awal
     "shop": { ... },
     "farm": { ... }
   }
   ```

3. Status awal: `"pending"`

**API:** `POST /api/petani/register`

---

### Step 2: Admin Approval

**Aktor:** Admin

**Proses:**
1. Admin login ke dashboard
2. Admin melihat daftar petani dengan status "pending"
3. Admin review data petani:
   - Cek KTP
   - Cek data toko
   - Cek data farm
4. Admin memutuskan:
   - **Accept:** Status → `"accepted"`
   - **Reject:** Status → `"rejected"` + admin message

**API:** `PUT /api/admin/users/petanis/:id/status`

**Hasil:**
- Jika accepted: Petani bisa login dan membuat produk
- Jika rejected: Petani tidak bisa login

---

### Step 3: Petani Login

**Aktor:** Petani (status: "accepted")

**Proses:**
1. Petani input email & password
2. Backend validasi:
   - Email & password benar
   - Status = "accepted"
3. Return user data (tanpa password)

**API:** `POST /api/petani/login`

**Response:**
```json
{
  "message": "Login berhasil",
  "user": {
    "id": "petani-1234567890",
    "name": "Budi Petani",
    "email": "budi@example.com",
    "status": "accepted",
    "shop": { ... },
    "farm": { ... }
  }
}
```

---

### Step 4: Petani Tambah Produk

**Aktor:** Petani (logged in)

**Proses:**
1. Petani masuk ke dashboard
2. Klik tombol "Tambah Produk"
3. Form input muncul:
   - Nama Produk
   - Deskripsi
   - Harga
   - Stok
   - Unit (kg, pcs, pack, dll)
   - Kategori
   - Upload Gambar (file) ATAU Input URL gambar

4. Petani submit form

5. Backend validasi:
   - Semua field wajib diisi (kecuali gambar)
   - Petani exists
   - Petani status = "accepted"
   - Harga > 0
   - Stok >= 0

6. Backend simpan ke `products.json`:
   ```json
   {
     "id": "product-1234567890",
     "farmerId": "petani-1234567890",
     "farmerName": "Budi Petani",  // ← Denormalized
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
   ```

**API:** `POST /api/petani/products`

**Hasil:**
- Produk tersimpan di database
- Produk langsung muncul di marketplace
- Produk muncul di daftar produk petani

---

### Step 5: Produk Muncul di Marketplace

**Aktor:** Customer (atau siapa saja)

**Proses:**
1. Customer buka halaman marketplace
2. Frontend request: `GET /api/products`
3. Backend return semua produk dengan status petani = "accepted"
4. Frontend tampilkan produk:
   - Gambar produk
   - Nama produk
   - Nama petani
   - Harga
   - Stok
   - Kategori
   - Tombol "Tambah ke Keranjang"

**API:** `GET /api/products`

**Filter Options:**
- `?category=Jamur Segar` - Filter by category
- `?search=tiram` - Search by name/description
- `?farmerId=petani-123` - Filter by farmer

**Hasil:**
- Customer bisa melihat semua produk yang tersedia
- Produk yang baru ditambahkan langsung muncul (real-time)

---

### Step 6: Customer Login

**Aktor:** Customer

**Proses:**
1. Customer input email & password
2. Backend validasi:
   - Email & password benar
   - Status = "accepted"
3. Return user data

**API:** `POST /api/customer/login`

**Response:**
```json
{
  "message": "Login berhasil",
  "user": {
    "id": "customer-1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "accepted"
  }
}
```

---

### Step 7: Customer Add to Cart

**Aktor:** Customer (logged in)

**Proses:**
1. Customer melihat produk di marketplace
2. Customer klik "Tambah ke Keranjang"
3. Frontend request: `POST /api/customer/cart`
   ```json
   {
     "customerId": "customer-1234567890",
     "productId": "product-1234567890",
     "quantity": 2
   }
   ```

4. Backend validasi:
   - Product exists
   - Stock >= quantity
   - Customer exists

5. Backend check: Apakah produk sudah ada di keranjang?
   - **YA:** Update quantity (tambah)
   - **TIDAK:** Buat item baru

6. Backend simpan ke `carts.json`:
   ```json
   {
     "id": "cart-1234567890",
     "customerId": "customer-1234567890",
     "productId": "product-1234567890",
     "productName": "Jamur Tiram Segar",  // ← Denormalized
     "productImage": "http://localhost:3000/uploads/image-123.jpg",
     "farmerId": "petani-1234567890",
     "farmerName": "Budi Petani",  // ← Denormalized
     "price": 25000,
     "unit": "kg",
     "quantity": 2,
     "subtotal": 50000,  // ← price × quantity
     "createdAt": "2024-01-01T00:00:00.000Z",
     "updatedAt": "2024-01-01T00:00:00.000Z"
   }
   ```

**API:** `POST /api/customer/cart`

**Hasil:**
- Item tersimpan di database (permanen)
- Keranjang tetap ada setelah refresh
- Customer bisa lihat keranjang di halaman Cart

---

### Step 8: Customer Lihat Keranjang

**Aktor:** Customer

**Proses:**
1. Customer buka halaman Cart
2. Frontend request: `GET /api/customer/cart?customerId=customer-123`
3. Backend return semua item keranjang customer
4. Frontend tampilkan:
   - List items
   - Quantity per item
   - Subtotal per item
   - Total keseluruhan
   - Tombol "Update Quantity"
   - Tombol "Hapus"
   - Tombol "Checkout"

**API:** `GET /api/customer/cart?customerId={id}`

**Hasil:**
- Customer bisa:
  - Lihat semua items
  - Update quantity
  - Hapus item
  - Checkout

---

### Step 9: Customer Checkout

**Aktor:** Customer

**Proses:**
1. Customer pilih items untuk checkout (bisa pilih beberapa)
2. Customer input:
   - Alamat pengiriman
   - Metode pembayaran
3. Customer klik "Checkout"

4. Frontend request: `POST /api/orders`
   ```json
   {
     "customerId": "customer-1234567890",
     "cartItemIds": ["cart-123", "cart-124"],
     "paymentMethod": "Saldo MycoTrack",
     "shippingAddress": "Jl. Contoh No. 123, Jakarta"
   }
   ```

5. Backend proses:
   a. Get cart items
   b. Validasi semua items:
      - Product exists
      - Stock >= quantity
   c. **Group by farmer** (penting!)
      - Jika produk dari petani berbeda → buat order terpisah
   d. Untuk setiap farmer:
      - Create order
      - Update product stock (stock -= quantity)
      - Remove items from cart
   e. Simpan orders ke `orders.json`

6. Backend return created orders

**API:** `POST /api/orders`

**Hasil:**
- Orders dibuat (bisa multiple jika dari petani berbeda)
- Stock produk berkurang
- Items dihapus dari cart
- Orders muncul di:
  - Customer: Halaman Orders
  - Petani: Halaman Orders

---

### Step 10: Order Management

#### 10.1 Customer Lihat Orders

**Aktor:** Customer

**Proses:**
1. Customer buka halaman "Pesanan Saya"
2. Frontend request: `GET /api/customer/orders?customerId=customer-123`
3. Backend return semua orders customer
4. Frontend tampilkan:
   - List orders
   - Status pesanan
   - Status pembayaran
   - Total harga
   - Tracking history
   - Tombol "Lihat Detail"

**API:** `GET /api/customer/orders?customerId={id}`

---

#### 10.2 Petani Lihat Orders

**Aktor:** Petani

**Proses:**
1. Petani buka halaman "Pesanan Saya"
2. Frontend request: `GET /api/farmer/orders?farmerId=petani-123`
3. Backend return semua orders untuk petani
4. Frontend tampilkan:
   - List orders
   - Customer name
   - Products
   - Total
   - Status
   - Tombol "Update Status"

**API:** `GET /api/farmer/orders?farmerId={id}`

---

#### 10.3 Petani Update Order Status

**Aktor:** Petani

**Proses:**
1. Petani melihat order detail
2. Petani update status:
   - `pending` → `processing` (sedang diproses)
   - `processing` → `shipped` (sedang dikirim)
   - `shipped` → `delivered` (sudah diterima)

3. Frontend request: `PUT /api/orders/:id/status`
   ```json
   {
     "farmerId": "petani-1234567890",
     "status": "processing"
   }
   ```

4. Backend:
   - Validasi: farmerId matches order
   - Update status
   - Add tracking entry:
     ```json
     {
       "status": "processing",
       "message": "Pesanan sedang diproses",
       "timestamp": "2024-01-01T00:00:00.000Z"
     }
     ```
   - Save to `orders.json`

**API:** `PUT /api/orders/:id/status`

**Status Flow:**
```
pending → processing → shipped → delivered
   │
   └──→ cancelled
```

---

## 📊 Data Flow Diagram

```
┌──────────────┐
│  petanis.json│
│              │
│  - id        │
│  - name      │
│  - email     │
│  - status    │◄───┐
│  - shop      │    │
│  - farm      │    │
└──────┬───────┘    │
       │            │
       │            │
       ▼            │
┌──────────────┐    │
│ products.json│    │
│              │    │
│  - id        │    │
│  - farmerId ─┼────┘
│  - name      │
│  - price     │
│  - stock     │
│  - image     │
└──────┬───────┘
       │
       │
       ▼
┌──────────────┐
│  carts.json  │
│              │
│  - id        │
│  - customerId│
│  - productId─┼──┐
│  - quantity  │  │
│  - subtotal  │  │
└──────┬───────┘  │
       │          │
       │          │
       ▼          │
┌──────────────┐  │
│ orders.json  │  │
│              │  │
│  - id        │  │
│  - customerId│  │
│  - farmerId  │  │
│  - products ─┼──┘
│  - total     │
│  - status    │
│  - tracking  │
└──────────────┘
```

---

## 🔑 Key Points

### 1. Data Persistence
- **Semua data tersimpan permanen** di file JSON
- Cart tidak hilang setelah refresh
- Orders tersimpan untuk history

### 2. Real-time Updates
- Produk langsung muncul di marketplace setelah dibuat
- Stock otomatis berkurang saat checkout
- Status order bisa diupdate real-time

### 3. Denormalization
- `farmerName` di products (untuk performa)
- `productName`, `productImage` di carts (untuk performa)
- `customerName`, `farmerName` di orders (untuk performa)

### 4. Validation
- Petani harus "accepted" untuk membuat produk
- Stock validation saat add to cart dan checkout
- Customer harus "accepted" untuk login

### 5. Grouping by Farmer
- Satu checkout bisa menghasilkan multiple orders
- Setiap order untuk satu petani
- Memudahkan petani manage orders

### 6. Stock Management
- Stock berkurang saat checkout (bukan saat add to cart)
- Validasi stock dilakukan di:
  - Add to cart
  - Update cart quantity
  - Checkout

---

## 📝 Contoh Skenario Lengkap

### Skenario: Petani Jual Jamur ke Customer

1. **Petani "Budi" registrasi** → Status: pending
2. **Admin approve** → Status: accepted
3. **Budi login** → Berhasil
4. **Budi tambah produk "Jamur Tiram"** → Produk tersimpan
5. **Produk muncul di marketplace** → Semua customer bisa lihat
6. **Customer "John" login** → Berhasil
7. **John lihat produk "Jamur Tiram"** → Tampil di marketplace
8. **John add to cart (qty: 2)** → Cart tersimpan
9. **John lihat cart** → Item "Jamur Tiram" qty: 2
10. **John checkout** → Order created
11. **Stock "Jamur Tiram" berkurang** → 100 → 98
12. **Budi lihat order** → Order dari John muncul
13. **Budi update status** → processing → shipped → delivered
14. **John lihat order** → Status updated real-time

---

## 🎯 Summary

**Flow lengkap:**
1. Petani registrasi → Admin approve → Petani login
2. Petani tambah produk → Produk muncul di marketplace
3. Customer login → Customer lihat produk → Customer add to cart
4. Customer checkout → Order created → Stock berkurang
5. Petani lihat order → Petani update status
6. Customer lihat order → Tracking real-time

**Semua data tersimpan permanen di database!**

