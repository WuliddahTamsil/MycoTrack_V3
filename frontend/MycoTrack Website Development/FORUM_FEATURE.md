# Fitur Forum Diskusi - Dokumentasi Lengkap

Dokumentasi lengkap fitur forum diskusi dengan semua fungsi: Create Post, Like, Comment, Views, Edit, dan Delete.

---

## 📋 Daftar Fitur

1. [Create Post (CR)](#1-create-post-cr)
2. [Like (Toggle)](#2-like-toggle)
3. [Comment (Add/Edit/Delete)](#3-comment-addeditdelete)
4. [Views (Auto-increment)](#4-views-auto-increment)
5. [Edit & Delete Post](#5-edit--delete-post)
6. [Data Persistence](#6-data-persistence)

---

## 1. Create Post (CR)

### 1.1 Deskripsi

User (customer, petani, atau admin) bisa membuat postingan baru di forum dengan:
- Judul (required)
- Isi/Konten (required)
- Gambar (optional) - bisa file upload atau URL

### 1.2 Alur

```
User Login → Halaman Forum → Klik "Create Post" → Form Input → Submit → Post Tersimpan
```

### 1.3 API Endpoint

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
    "authorRole": "customer",
    "title": "Tips Budidaya Jamur Tiram",
    "content": "Berikut adalah tips...",
    "image": "http://localhost:3000/uploads/post-image-123.jpg",
    "likes": [],
    "comments": [],
    "views": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 1.4 Validasi

**Frontend:**
- Judul tidak boleh kosong
- Konten tidak boleh kosong
- Gambar: file upload ATAU URL (optional)

**Backend:**
- `authorId`, `authorName`, `title`, `content` required
- `image` atau `imageUrl` optional
- File upload memiliki prioritas jika keduanya ada

### 1.5 Struktur Data

```json
{
  "id": "post-{timestamp}",
  "authorId": "user-id",
  "authorName": "User Name",
  "authorRole": "customer" | "petani" | "admin",
  "title": "Judul Postingan",
  "content": "Isi postingan...",
  "image": "URL gambar atau null",
  "likes": [],
  "comments": [],
  "views": 0,
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

---

## 2. Like (Toggle)

### 2.1 Deskripsi

User bisa like/unlike postingan. Like bersifat toggle:
- Jika belum like → Like (tambah ke array)
- Jika sudah like → Unlike (hapus dari array)

### 2.2 Alur

```
User Lihat Post → Klik "Like" → Backend Check → Toggle Like → Update DB → Return Updated Post
```

### 2.3 API Endpoint

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
    "likes": [
      {
        "userId": "customer-1234567890",
        "userName": "John Doe",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ],
    ...
  },
  "isLiked": true
}
```

### 2.4 Logic Flow

```javascript
1. Get post from forum.json
2. Check if userId already in likes array
3. If exists:
   - Remove from likes (unlike)
   - message = "Like dibatalkan"
   - isLiked = false
4. If not exists:
   - Add to likes (like)
   - { userId, userName, timestamp }
   - message = "Postingan dilike"
   - isLiked = true
5. Update post.updatedAt
6. Save to forum.json
7. Return updated post
```

### 2.5 Struktur Like Data

```json
{
  "likes": [
    {
      "userId": "customer-1234567890",
      "userName": "John Doe",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    {
      "userId": "petani-1234567890",
      "userName": "Budi Petani",
      "timestamp": "2024-01-01T01:00:00.000Z"
    }
  ]
}
```

**Total Likes:** `post.likes.length`

---

## 3. Comment (Add/Edit/Delete)

### 3.1 Add Comment

#### Deskripsi
User bisa menambahkan komentar pada postingan.

#### API Endpoint

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

#### Logic Flow

```javascript
1. Validasi: userId, userName, content required
2. Get post from forum.json
3. Initialize comments array if not exists
4. Create comment:
   - id: "comment-{timestamp}"
   - userId, userName, userRole
   - content
   - createdAt, updatedAt
5. Add to post.comments array
6. Update post.updatedAt
7. Save to forum.json
8. Return comment and updated post
```

---

### 3.2 Edit Comment

#### Deskripsi
User bisa mengedit komentar miliknya sendiri.

#### API Endpoint

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
  "comment": {
    "id": "comment-1234567890",
    "content": "Updated comment content",
    "updatedAt": "2024-01-01T01:00:00.000Z",
    ...
  }
}
```

#### Logic Flow

```javascript
1. Validasi: userId, content required
2. Get post from forum.json
3. Find comment in post.comments
4. Validasi: userId matches comment.userId
5. Update:
   - content
   - updatedAt
6. Update post.updatedAt
7. Save to forum.json
8. Return updated comment
```

#### Permission
- Hanya pemilik komentar yang bisa edit

---

### 3.3 Delete Comment

#### Deskripsi
User bisa menghapus komentar. Yang bisa hapus:
- Pemilik komentar
- Penulis postingan
- Admin

#### API Endpoint

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

#### Logic Flow

```javascript
1. Get post from forum.json
2. Find comment in post.comments
3. Validasi permission:
   - userId matches comment.userId (owner)
   - OR userId is admin
   - OR userId matches post.authorId (post author)
4. Remove from post.comments array
5. Update post.updatedAt
6. Save to forum.json
```

#### Permission Matrix

| User Role | Can Delete Own Comment | Can Delete Others' Comment |
|----------|----------------------|---------------------------|
| Comment Owner | ✅ | ❌ |
| Post Author | ✅ | ✅ |
| Admin | ✅ | ✅ |
| Others | ❌ | ❌ |

---

### 3.4 Struktur Comment Data

```json
{
  "comments": [
    {
      "id": "comment-1234567890",
      "userId": "customer-1234567890",
      "userName": "John Doe",
      "userRole": "customer",
      "content": "Komentar pertama",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "comment-1234567891",
      "userId": "petani-1234567890",
      "userName": "Budi Petani",
      "userRole": "petani",
      "content": "Komentar kedua",
      "createdAt": "2024-01-01T01:00:00.000Z",
      "updatedAt": "2024-01-01T01:00:00.000Z"
    }
  ]
}
```

---

## 4. Views (Auto-increment)

### 4.1 Deskripsi

Views otomatis bertambah setiap kali postingan dibuka. Tidak perlu request terpisah untuk increment views.

### 4.2 Alur

```
User Buka Post → GET /api/forum/posts/:id → Backend Increment Views → Return Post
```

### 4.3 API Endpoint

**GET** `/api/forum/posts/:id`

**Response Success (200):**
```json
{
  "post": {
    "id": "post-1234567890",
    "title": "Tips Budidaya Jamur Tiram",
    "content": "...",
    "views": 151, // Auto-increment
    "likes": [ ... ],
    "comments": [ ... ],
    ...
  }
}
```

### 4.4 Logic Flow

```javascript
1. Get post from forum.json
2. Increment views:
   - If views undefined: views = 1
   - Else: views += 1
3. Update post.updatedAt
4. Save to forum.json
5. Return post with updated views
```

### 4.5 Catatan Penting

- Views **otomatis** bertambah saat GET post detail
- Tidak perlu endpoint terpisah untuk increment views
- Views tersimpan permanen di database
- Setiap user yang buka post → views +1 (tidak ada deduplication)

---

## 5. Edit & Delete Post

### 5.1 Edit Post

#### Deskripsi
Penulis postingan atau admin bisa mengedit postingan.

#### API Endpoint

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
  "post": {
    "id": "post-1234567890",
    "title": "Updated Title",
    "content": "Updated content",
    "updatedAt": "2024-01-01T01:00:00.000Z",
    ...
  }
}
```

#### Logic Flow

```javascript
1. Get post from forum.json
2. Validasi permission:
   - authorId matches post.authorId (owner)
   - OR authorId is admin
3. Update fields (if provided):
   - title
   - content
   - image (file upload atau imageUrl)
4. Update post.updatedAt
5. Save to forum.json
6. Return updated post
```

#### Permission
- Hanya penulis atau admin yang bisa edit

---

### 5.2 Delete Post

#### Deskripsi
Penulis postingan atau admin bisa menghapus postingan.

#### API Endpoint

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

#### Logic Flow

```javascript
1. Get post from forum.json
2. Validasi permission:
   - authorId matches post.authorId (owner)
   - OR authorId is admin
3. Remove post from forum array
4. Save to forum.json
```

#### Permission
- Hanya penulis atau admin yang bisa hapus

#### Catatan
- Saat post dihapus, semua likes dan comments juga ikut terhapus
- Tidak ada soft delete (permanent delete)

---

## 6. Data Persistence

### 6.1 Semua Aktivitas Tersimpan Permanen

Semua aktivitas forum tersimpan permanen di `forum.json`:

- ✅ **Posts:** Tersimpan dengan semua data
- ✅ **Likes:** Array dalam post object
- ✅ **Comments:** Array dalam post object
- ✅ **Views:** Number dalam post object
- ✅ **Edit History:** `updatedAt` timestamp

### 6.2 Struktur Data Lengkap

```json
[
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
      },
      {
        "userId": "petani-1234567890",
        "userName": "Budi Petani",
        "timestamp": "2024-01-01T01:00:00.000Z"
      }
    ],
    "comments": [
      {
        "id": "comment-1234567890",
        "userId": "petani-1234567890",
        "userName": "Budi Petani",
        "userRole": "petani",
        "content": "Terima kasih atas tipsnya!",
        "createdAt": "2024-01-01T02:00:00.000Z",
        "updatedAt": "2024-01-01T02:00:00.000Z"
      }
    ],
    "views": 150,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T02:00:00.000Z"
  }
]
```

### 6.3 Data Tidak Hilang

- **Like tetap tersimpan** meski user logout
- **Comments tetap tersimpan** meski user logout
- **Views tetap tersimpan** (tidak reset)
- **Edit history:** `updatedAt` menunjukkan kapan terakhir diupdate

---

## 📊 Flow Diagram Lengkap

```
┌─────────────────────────────────────────────────────────────┐
│                    CREATE POST (CR)                          │
└─────────────────────────────────────────────────────────────┘

User → Form Input → Submit → Backend Save → Post Tersimpan

┌─────────────────────────────────────────────────────────────┐
│                    LIKE (TOGGLE)                             │
└─────────────────────────────────────────────────────────────┘

User → Klik Like → Backend Check → Toggle → Update DB

┌─────────────────────────────────────────────────────────────┐
│                    COMMENT                                   │
└─────────────────────────────────────────────────────────────┘

User → Input Comment → Submit → Backend Save → Comment Tersimpan
User → Edit Comment → Submit → Backend Update → Comment Updated
User → Delete Comment → Backend Remove → Comment Deleted

┌─────────────────────────────────────────────────────────────┐
│                    VIEWS (AUTO-INCREMENT)                    │
└─────────────────────────────────────────────────────────────┘

User → Buka Post → GET /api/forum/posts/:id → Views += 1

┌─────────────────────────────────────────────────────────────┐
│                    EDIT & DELETE POST                         │
└─────────────────────────────────────────────────────────────┘

Author/Admin → Edit Post → Backend Update → Post Updated
Author/Admin → Delete Post → Backend Remove → Post Deleted
```

---

## 🎯 Summary

### Fitur yang Tersedia:

1. ✅ **Create Post (CR)**
   - Judul + konten (required)
   - Gambar (optional - file atau URL)
   - Tersimpan permanen

2. ✅ **Like (Toggle)**
   - Bisa like/unlike
   - Total likes ditampilkan
   - Tersimpan permanen

3. ✅ **Comment**
   - Add comment
   - Edit comment (owner only)
   - Delete comment (owner/post author/admin)
   - Tersimpan permanen

4. ✅ **Views**
   - Auto-increment saat post dibuka
   - Tersimpan permanen

5. ✅ **Edit & Delete Post**
   - Edit (author/admin only)
   - Delete (author/admin only)
   - Tersimpan permanen

### Semua Aktivitas Forum Tersimpan Permanen! ✅

