const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Helper function to read JSON file
async function readJSONFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Helper function to write JSON file
async function writeJSONFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Helper function to log admin actions
async function logAdminAction(action, role, userEmail, adminEmail, details = {}) {
  try {
    const logs = await readJSONFile(logsPath);
    logs.push({
      action,
      role,
      userEmail,
      adminEmail,
      timestamp: new Date().toISOString(),
      ...details
    });
    await writeJSONFile(logsPath, logs);
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
}

// Paths to data files
const adminPath = path.join(__dirname, 'data', 'admin.json');
const customersPath = path.join(__dirname, 'data', 'customers.json');
const petanisPath = path.join(__dirname, 'data', 'petanis.json');
const logsPath = path.join(__dirname, 'data', 'logs.json');
const ordersPath = path.join(__dirname, 'data', 'orders.json');
const productsPath = path.join(__dirname, 'data', 'products.json');
const cartsPath = path.join(__dirname, 'data', 'carts.json');
const forumPath = path.join(__dirname, 'data', 'forum.json');
const notificationsPath = path.join(__dirname, 'data', 'notifications.json');
const articlesPath = path.join(__dirname, 'data', 'articles.json');
const chatsPath = path.join(__dirname, 'data', 'chats.json');

// Serve uploaded files - make sure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);
app.use('/uploads', express.static(uploadsDir));

// ========== CUSTOMER ENDPOINTS ==========

// Register Customer
app.post('/api/customer/register', upload.single('profilePhoto'), async (req, res) => {
  try {
    console.log('=== CUSTOMER REGISTER REQUEST ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('File:', req.file ? req.file.filename : 'No file');
    
    let { name, email, password, address, phoneNumber } = req.body;
    
    // Normalize email and password
    email = email ? email.trim().toLowerCase() : '';
    password = password ? password.trim() : '';
    name = name ? name.trim() : '';
    address = address ? address.trim() : '';
    phoneNumber = phoneNumber ? phoneNumber.trim() : '';
    
    if (!name || !email || !password || !address || !phoneNumber) {
      console.log('❌ Validation failed:', { name: !!name, email: !!email, password: !!password, address: !!address, phoneNumber: !!phoneNumber });
      return res.status(400).json({ error: 'Semua field wajib diisi' });
    }

    const customers = await readJSONFile(customersPath);
    
    // Check if email already exists (case-insensitive)
    if (customers.find(c => (c.email || '').trim().toLowerCase() === email)) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    const newCustomer = {
      id: `customer-${Date.now()}`,
      name,
      email, // Store normalized email
      password, // Store trimmed password
      address,
      phoneNumber,
      profilePhoto: req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null,
      role: 'customer',
      balance: 0,
      status: 'pending', // New users start as pending
      adminMessage: null, // Admin can add rejection reason
      createdAt: new Date().toISOString()
    };

    customers.push(newCustomer);
    await writeJSONFile(customersPath, customers);

    // Don't send password in response
    const { password: _, ...customerResponse } = newCustomer;
    console.log('✅ Customer registered successfully:', customerResponse.email);
    console.log('User data:', JSON.stringify(customerResponse, null, 2));
    console.log('==================================\n');
    
    res.status(201).json({ message: 'Registrasi berhasil', user: customerResponse });
  } catch (error) {
    console.error('❌ ERROR in customer register:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Login Customer
app.post('/api/customer/login', async (req, res) => {
  try {
    console.log('=== CUSTOMER LOGIN REQUEST ===');
    console.log('Raw email:', JSON.stringify(req.body.email));
    console.log('Raw password:', JSON.stringify(req.body.password));
    
    // Trim and normalize email/password
    const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
    const password = req.body.password ? req.body.password.trim() : '';

    console.log('Normalized email:', JSON.stringify(email));
    console.log('Normalized password:', JSON.stringify(password));

    if (!email || !password) {
      console.log('❌ Validation failed: missing email or password');
      return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }

    // Check if email is admin first (auto-detect admin)
    const admins = await readJSONFile(adminPath);
    const admin = admins.find(a => {
      const storedEmail = (a.email || '').trim().toLowerCase();
      const storedPassword = (a.password || '').trim();
      return storedEmail === email && storedPassword === password;
    });

    if (admin) {
      console.log('✅ Admin detected! Auto-login as admin');
      const { password: _, ...adminResponse } = admin;
      console.log('User data:', JSON.stringify(adminResponse, null, 2));
      console.log('==============================\n');
      return res.json({ message: 'Login berhasil', user: adminResponse });
    }

    const customers = await readJSONFile(customersPath);
    console.log(`📋 Checking ${customers.length} customers`);
    
    // Debug: log all customer emails
    console.log('Available customer emails:', customers.map(c => c.email));
    
    // Find customer with case-insensitive email and exact password match
    const customer = customers.find(c => {
      const storedEmail = (c.email || '').trim().toLowerCase();
      const storedPassword = (c.password || '').trim();
      const emailMatch = storedEmail === email;
      const passwordMatch = storedPassword === password;
      
      console.log(`Comparing: "${storedEmail}" === "${email}" ? ${emailMatch}`);
      console.log(`Comparing: "${storedPassword}" === "${password}" ? ${passwordMatch}`);
      
      return emailMatch && passwordMatch;
    });

    if (!customer) {
      console.log('❌ Login failed: customer not found or password incorrect');
      console.log('Searched email:', email);
      console.log('Searched password length:', password.length);
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    // Check user status - only accepted users can login
    const status = customer.status || 'pending';
    if (status !== 'accepted') {
      console.log(`❌ Login failed: User status is "${status}", only "accepted" users can login`);
      const message = status === 'pending' 
        ? 'Akun Anda masih menunggu persetujuan admin. Silakan tunggu konfirmasi.'
        : status === 'rejected'
        ? `Akun Anda ditolak. ${customer.adminMessage || 'Silakan hubungi admin untuk informasi lebih lanjut.'}`
        : status === 'suspended'
        ? 'Akun Anda dinonaktifkan sementara. Silakan hubungi admin.'
        : 'Akun Anda belum aktif. Silakan hubungi admin.';
      return res.status(403).json({ error: message });
    }

    const { password: _, ...customerResponse } = customer;
    console.log('✅ Login successful for:', customer.email);
    console.log('User data:', JSON.stringify(customerResponse, null, 2));
    console.log('==============================\n');
    
    res.json({ message: 'Login berhasil', user: customerResponse });
  } catch (error) {
    console.error('❌ ERROR in customer login:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// ========== PETANI ENDPOINTS ==========

// Register Petani
app.post('/api/petani/register', upload.fields([
  { name: 'ktpPhoto', maxCount: 1 },
  { name: 'shopPhoto', maxCount: 1 },
  { name: 'landPhoto', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('=== PETANI REGISTER REQUEST ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
    
    let {
      name,
      email,
      password,
      phoneNumber,
      address,
      shopName,
      shopDescription,
      landArea,
      mushroomType,
      rackCount,
      baglogCount,
      harvestCapacity
    } = req.body;

    // Normalize email and password
    email = email ? email.trim().toLowerCase() : '';
    password = password ? password.trim() : '';
    name = name ? name.trim() : '';
    phoneNumber = phoneNumber ? phoneNumber.trim() : '';
    address = address ? address.trim() : '';
    shopName = shopName ? shopName.trim() : '';
    shopDescription = shopDescription ? shopDescription.trim() : '';

    if (!name || !email || !password || !phoneNumber || !address || 
        !shopName || !shopDescription || !landArea || !mushroomType || 
        !rackCount || !baglogCount || !harvestCapacity) {
      console.log('❌ Validation failed');
      return res.status(400).json({ error: 'Semua field wajib diisi' });
    }

    const petanis = await readJSONFile(petanisPath);
    
    // Check if email already exists (case-insensitive)
    if (petanis.find(p => (p.email || '').trim().toLowerCase() === email)) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    const newPetani = {
      id: `petani-${Date.now()}`,
      name,
      email, // Store normalized email
      password, // Store trimmed password
      phoneNumber,
      address,
      ktpPhoto: req.files?.ktpPhoto?.[0] ? `http://localhost:3000/uploads/${req.files.ktpPhoto[0].filename}` : null,
      role: 'petani',
      balance: 0,
      status: 'pending', // New users start as pending
      adminMessage: null, // Admin can add rejection reason
      shop: {
        name: shopName,
        description: shopDescription,
        photo: req.files?.shopPhoto?.[0] ? `http://localhost:3000/uploads/${req.files.shopPhoto[0].filename}` : null
      },
      farm: {
        landArea: parseFloat(landArea),
        landPhoto: req.files?.landPhoto?.[0] ? `http://localhost:3000/uploads/${req.files.landPhoto[0].filename}` : null,
        mushroomType,
        rackCount: parseInt(rackCount),
        baglogCount: parseInt(baglogCount),
        harvestCapacity: parseFloat(harvestCapacity)
      },
      createdAt: new Date().toISOString()
    };

    petanis.push(newPetani);
    await writeJSONFile(petanisPath, petanis);

    // Don't send password in response
    const { password: _, ...petaniResponse } = newPetani;
    console.log('Petani registered successfully:', petaniResponse.email);
    res.status(201).json({ message: 'Registrasi berhasil', user: petaniResponse });
  } catch (error) {
    console.error('Error registering petani:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Login Petani
app.post('/api/petani/login', async (req, res) => {
  try {
    console.log('=== PETANI LOGIN REQUEST ===');
    console.log('Raw email:', JSON.stringify(req.body.email));
    console.log('Raw password:', JSON.stringify(req.body.password));
    
    // Trim and normalize email/password
    const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
    const password = req.body.password ? req.body.password.trim() : '';

    console.log('Normalized email:', JSON.stringify(email));
    console.log('Normalized password:', JSON.stringify(password));

    if (!email || !password) {
      console.log('❌ Validation failed: missing email or password');
      return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }

    // Check if email is admin first (auto-detect admin)
    const admins = await readJSONFile(adminPath);
    const admin = admins.find(a => {
      const storedEmail = (a.email || '').trim().toLowerCase();
      const storedPassword = (a.password || '').trim();
      return storedEmail === email && storedPassword === password;
    });

    if (admin) {
      console.log('✅ Admin detected! Auto-login as admin');
      const { password: _, ...adminResponse } = admin;
      console.log('User data:', JSON.stringify(adminResponse, null, 2));
      console.log('==============================\n');
      return res.json({ message: 'Login berhasil', user: adminResponse });
    }

    const petanis = await readJSONFile(petanisPath);
    console.log(`📋 Checking ${petanis.length} petanis`);
    console.log('Available petani emails:', petanis.map(p => p.email));
    
    // Find petani with case-insensitive email and exact password match
    const petani = petanis.find(p => {
      const storedEmail = (p.email || '').trim().toLowerCase();
      const storedPassword = (p.password || '').trim();
      const emailMatch = storedEmail === email;
      const passwordMatch = storedPassword === password;
      
      console.log(`Comparing: "${storedEmail}" === "${email}" ? ${emailMatch}`);
      console.log(`Comparing: "${storedPassword}" === "${password}" ? ${passwordMatch}`);
      
      return emailMatch && passwordMatch;
    });

    if (!petani) {
      console.log('❌ Login failed: petani not found or password incorrect');
      console.log('Searched email:', email);
      console.log('Searched password length:', password.length);
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    // Check user status - only accepted users can login
    const status = petani.status || 'pending';
    if (status !== 'accepted') {
      console.log(`❌ Login failed: User status is "${status}", only "accepted" users can login`);
      const message = status === 'pending' 
        ? 'Akun Anda masih menunggu persetujuan admin. Silakan tunggu konfirmasi.'
        : status === 'rejected'
        ? `Akun Anda ditolak. ${petani.adminMessage || 'Silakan hubungi admin untuk informasi lebih lanjut.'}`
        : status === 'suspended'
        ? 'Akun Anda dinonaktifkan sementara. Silakan hubungi admin.'
        : 'Akun Anda belum aktif. Silakan hubungi admin.';
      return res.status(403).json({ error: message });
    }

    const { password: _, ...petaniResponse } = petani;
    console.log('✅ Login successful for:', petani.email);
    console.log('User data:', JSON.stringify(petaniResponse, null, 2));
    console.log('==============================\n');
    
    res.json({ message: 'Login berhasil', user: petaniResponse });
  } catch (error) {
    console.error('❌ ERROR in petani login:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// ========== PRODUCT ENDPOINTS (PETANI) ==========

// Get all products (for marketplace)
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, farmerId } = req.query;
    let products = await readJSONFile(productsPath);
    const petanis = await readJSONFile(petanisPath);
    
    // Filter products: only show products from accepted farmers
    const acceptedFarmerIds = new Set(
      petanis.filter(p => p.status === 'accepted').map(p => p.id)
    );
    products = products.filter(p => acceptedFarmerIds.has(p.farmerId));
    
    // Filter by farmer if specified
    if (farmerId) {
      products = products.filter(p => p.farmerId === farmerId);
    }
    
    // Filter by category
    if (category) {
      products = products.filter(p => p.category === category);
    }
    
    // Search by name or description
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p => 
        (p.name || '').toLowerCase().includes(searchLower) ||
        (p.description || '').toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by createdAt descending (newest first)
    products.sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    
    console.log(`✅ Returning ${products.length} products for marketplace`);
    res.json({ products, total: products.length });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const products = await readJSONFile(productsPath);
    const product = products.find(p => p.id === req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }
    
    res.json({ product });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get products by farmer (for farmer's product list)
app.get('/api/petani/products', async (req, res) => {
  try {
    const { farmerId } = req.query;
    if (!farmerId) {
      return res.status(400).json({ error: 'farmerId is required' });
    }
    
    const products = await readJSONFile(productsPath);
    const farmerProducts = products.filter(p => p.farmerId === farmerId);
    
    // Sort by createdAt descending (newest first)
    farmerProducts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    res.json({ products: farmerProducts, total: farmerProducts.length });
  } catch (error) {
    console.error('Error getting farmer products:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Create new product (Petani)
app.post('/api/petani/products', upload.single('image'), async (req, res) => {
  try {
    console.log('=== CREATE PRODUCT REQUEST ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('File:', req.file ? req.file.filename : 'No file');
    
    const {
      farmerId,
      name,
      description,
      price,
      stock,
      unit,
      category,
      imageUrl
    } = req.body;
    
    if (!farmerId || !name || !description || !price || !stock || !unit || !category) {
      console.log('❌ Validation failed');
      return res.status(400).json({ error: 'Semua field wajib diisi (kecuali gambar)' });
    }
    
    // Verify farmer exists
    const petanis = await readJSONFile(petanisPath);
    const farmer = petanis.find(p => p.id === farmerId);
    
    if (!farmer) {
      return res.status(404).json({ error: 'Petani tidak ditemukan' });
    }
    
    // Check if farmer is accepted
    if (farmer.status !== 'accepted') {
      return res.status(403).json({ error: 'Akun petani belum disetujui' });
    }
    
    // Determine image URL (file upload takes priority over URL)
    let image = null;
    if (req.file) {
      image = `http://localhost:3000/uploads/${req.file.filename}`;
    } else if (imageUrl && imageUrl.trim()) {
      image = imageUrl.trim();
    }
    
    const products = await readJSONFile(productsPath);
    
    const newProduct = {
      id: `product-${Date.now()}`,
      farmerId,
      farmerName: farmer.name,
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      stock: parseFloat(stock),
      unit: unit.trim(),
      category: category.trim(),
      image: image,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    await writeJSONFile(productsPath, products);
    
    console.log('✅ Product created successfully:', newProduct.id);
    console.log('==================================\n');
    
    res.status(201).json({ message: 'Produk berhasil ditambahkan', product: newProduct });
  } catch (error) {
    console.error('❌ ERROR creating product:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update product (Petani)
app.put('/api/petani/products/:id', upload.single('image'), async (req, res) => {
  try {
    const {
      farmerId,
      name,
      description,
      price,
      stock,
      unit,
      category,
      imageUrl
    } = req.body;
    
    const products = await readJSONFile(productsPath);
    const productIndex = products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }
    
    const product = products[productIndex];
    
    // Verify farmer owns this product
    if (product.farmerId !== farmerId) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses ke produk ini' });
    }
    
    // Update fields
    if (name) products[productIndex].name = name.trim();
    if (description) products[productIndex].description = description.trim();
    if (price) products[productIndex].price = parseFloat(price);
    if (stock !== undefined) products[productIndex].stock = parseFloat(stock);
    if (unit) products[productIndex].unit = unit.trim();
    if (category) products[productIndex].category = category.trim();
    
    // Update image (file upload takes priority)
    if (req.file) {
      products[productIndex].image = `http://localhost:3000/uploads/${req.file.filename}`;
    } else if (imageUrl !== undefined) {
      products[productIndex].image = imageUrl && imageUrl.trim() ? imageUrl.trim() : null;
    }
    
    products[productIndex].updatedAt = new Date().toISOString();
    
    await writeJSONFile(productsPath, products);
    
    res.json({ message: 'Produk berhasil diperbarui', product: products[productIndex] });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Delete product (Petani)
app.delete('/api/petani/products/:id', async (req, res) => {
  try {
    const { farmerId } = req.body;
    
    const products = await readJSONFile(productsPath);
    const productIndex = products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }
    
    const product = products[productIndex];
    
    // Verify farmer owns this product
    if (product.farmerId !== farmerId) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses ke produk ini' });
    }
    
    products.splice(productIndex, 1);
    await writeJSONFile(productsPath, products);
    
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// ========== CART ENDPOINTS (CUSTOMER) ==========

// Get cart items for customer
app.get('/api/customer/cart', async (req, res) => {
  try {
    const { customerId } = req.query;
    if (!customerId) {
      return res.status(400).json({ error: 'customerId is required' });
    }
    
    const carts = await readJSONFile(cartsPath);
    const customerCart = carts.filter(c => c.customerId === customerId);
    
    res.json({ items: customerCart, total: customerCart.length });
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Add item to cart
app.post('/api/customer/cart', async (req, res) => {
  try {
    const {
      customerId,
      productId,
      quantity
    } = req.body;
    
    if (!customerId || !productId || !quantity) {
      return res.status(400).json({ error: 'customerId, productId, dan quantity wajib diisi' });
    }
    
    // Verify product exists
    const products = await readJSONFile(productsPath);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }
    
    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Stok tidak mencukupi' });
    }
    
    const carts = await readJSONFile(cartsPath);
    
    // Check if item already exists in cart
    const existingItemIndex = carts.findIndex(
      c => c.customerId === customerId && c.productId === productId
    );
    
    if (existingItemIndex !== -1) {
      // Update quantity
      const newQuantity = carts[existingItemIndex].quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ error: 'Stok tidak mencukupi' });
      }
      carts[existingItemIndex].quantity = newQuantity;
      carts[existingItemIndex].updatedAt = new Date().toISOString();
    } else {
      // Add new item
      const newCartItem = {
        id: `cart-${Date.now()}`,
        customerId,
        productId,
        productName: product.name,
        productImage: product.image,
        farmerId: product.farmerId,
        farmerName: product.farmerName,
        price: product.price,
        unit: product.unit,
        quantity: quantity,
        subtotal: product.price * quantity,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      carts.push(newCartItem);
    }
    
    await writeJSONFile(cartsPath, carts);
    
    res.status(201).json({ message: 'Item berhasil ditambahkan ke keranjang', cart: carts });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update cart item quantity
app.put('/api/customer/cart/:id', async (req, res) => {
  try {
    const { customerId, quantity } = req.body;
    
    if (!customerId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'customerId dan quantity (min 1) wajib diisi' });
    }
    
    const carts = await readJSONFile(cartsPath);
    const cartIndex = carts.findIndex(c => c.id === req.params.id);
    
    if (cartIndex === -1) {
      return res.status(404).json({ error: 'Item keranjang tidak ditemukan' });
    }
    
    const cartItem = carts[cartIndex];
    
    // Verify customer owns this cart item
    if (cartItem.customerId !== customerId) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses ke item ini' });
    }
    
    // Check product stock
    const products = await readJSONFile(productsPath);
    const product = products.find(p => p.id === cartItem.productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Stok tidak mencukupi' });
    }
    
    carts[cartIndex].quantity = quantity;
    carts[cartIndex].subtotal = cartItem.price * quantity;
    carts[cartIndex].updatedAt = new Date().toISOString();
    
    await writeJSONFile(cartsPath, carts);
    
    res.json({ message: 'Keranjang berhasil diperbarui', item: carts[cartIndex] });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Delete cart item
app.delete('/api/customer/cart/:id', async (req, res) => {
  try {
    const { customerId } = req.body;
    
    const carts = await readJSONFile(cartsPath);
    const cartIndex = carts.findIndex(c => c.id === req.params.id);
    
    if (cartIndex === -1) {
      return res.status(404).json({ error: 'Item keranjang tidak ditemukan' });
    }
    
    const cartItem = carts[cartIndex];
    
    // Verify customer owns this cart item
    if (cartItem.customerId !== customerId) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses ke item ini' });
    }
    
    carts.splice(cartIndex, 1);
    await writeJSONFile(cartsPath, carts);
    
    res.json({ message: 'Item berhasil dihapus dari keranjang' });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Clear cart (delete all items for customer)
app.delete('/api/customer/cart', async (req, res) => {
  try {
    const { customerId } = req.body;
    
    if (!customerId) {
      return res.status(400).json({ error: 'customerId is required' });
    }
    
    const carts = await readJSONFile(cartsPath);
    const filteredCarts = carts.filter(c => c.customerId !== customerId);
    
    await writeJSONFile(cartsPath, filteredCarts);
    
    res.json({ message: 'Keranjang berhasil dikosongkan' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// ========== ADMIN ENDPOINTS ==========

// Login Admin (only login, no register)
app.post('/api/admin/login', async (req, res) => {
  try {
    console.log('=== ADMIN LOGIN REQUEST ===');
    console.log('Raw email:', JSON.stringify(req.body.email));
    console.log('Raw password:', JSON.stringify(req.body.password));
    
    // Trim and normalize email/password
    const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
    const password = req.body.password ? req.body.password.trim() : '';

    console.log('Normalized email:', JSON.stringify(email));
    console.log('Normalized password:', JSON.stringify(password));

    if (!email || !password) {
      console.log('❌ Validation failed: missing email or password');
      return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }

    const admins = await readJSONFile(adminPath);
    console.log(`📋 Checking ${admins.length} admins`);
    console.log('Available admin emails:', admins.map(a => a.email));
    
    // Find admin with case-insensitive email and exact password match
    const admin = admins.find(a => {
      const storedEmail = (a.email || '').trim().toLowerCase();
      const storedPassword = (a.password || '').trim();
      const emailMatch = storedEmail === email;
      const passwordMatch = storedPassword === password;
      
      console.log(`Comparing: "${storedEmail}" === "${email}" ? ${emailMatch}`);
      console.log(`Comparing: "${storedPassword}" === "${password}" ? ${passwordMatch}`);
      
      return emailMatch && passwordMatch;
    });

    if (!admin) {
      console.log('❌ Login failed: admin not found or password incorrect');
      console.log('Searched email:', email);
      console.log('Searched password length:', password.length);
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const { password: _, ...adminResponse } = admin;
    console.log('✅ Login successful for:', admin.email);
    console.log('User data:', JSON.stringify(adminResponse, null, 2));
    console.log('==============================\n');
    
    res.json({ message: 'Login berhasil', user: adminResponse });
  } catch (error) {
    console.error('❌ ERROR in admin login:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// ========== ADMIN USER MANAGEMENT ENDPOINTS ==========

// Get all customers
app.get('/api/admin/users/customers', async (req, res) => {
  try {
    console.log('=== GET ALL CUSTOMERS ===');
    const { status, search } = req.query;
    console.log('Query params:', { status, search });
    
    let customers = await readJSONFile(customersPath);
    console.log(`📋 Found ${customers.length} customers in database`);
    
    // Filter by status
    if (status) {
      const beforeFilter = customers.length;
      customers = customers.filter(c => (c.status || 'pending') === status);
      console.log(`🔍 Filtered by status "${status}": ${beforeFilter} -> ${customers.length}`);
    }
    
    // Search by name or email
    if (search) {
      const beforeSearch = customers.length;
      const searchLower = search.toLowerCase();
      customers = customers.filter(c => 
        (c.name || '').toLowerCase().includes(searchLower) ||
        (c.email || '').toLowerCase().includes(searchLower)
      );
      console.log(`🔍 Filtered by search "${search}": ${beforeSearch} -> ${customers.length}`);
    }
    
    // Remove password from response
    const customersResponse = customers.map(({ password, ...customer }) => customer);
    console.log(`✅ Returning ${customersResponse.length} customers`);
    console.log('Customer emails:', customersResponse.map(c => c.email));
    console.log('==========================\n');
    
    res.json({ customers: customersResponse, total: customersResponse.length });
  } catch (error) {
    console.error('❌ Error getting customers:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get all petanis
app.get('/api/admin/users/petanis', async (req, res) => {
  try {
    console.log('=== GET ALL PETANIS ===');
    const { status, search } = req.query;
    console.log('Query params:', { status, search });
    
    let petanis = await readJSONFile(petanisPath);
    console.log(`📋 Found ${petanis.length} petanis in database`);
    
    // Filter by status
    if (status) {
      const beforeFilter = petanis.length;
      petanis = petanis.filter(p => (p.status || 'pending') === status);
      console.log(`🔍 Filtered by status "${status}": ${beforeFilter} -> ${petanis.length}`);
    }
    
    // Search by name or email
    if (search) {
      const beforeSearch = petanis.length;
      const searchLower = search.toLowerCase();
      petanis = petanis.filter(p => 
        (p.name || '').toLowerCase().includes(searchLower) ||
        (p.email || '').toLowerCase().includes(searchLower)
      );
      console.log(`🔍 Filtered by search "${search}": ${beforeSearch} -> ${petanis.length}`);
    }
    
    // Remove password from response
    const petanisResponse = petanis.map(({ password, ...petani }) => petani);
    console.log(`✅ Returning ${petanisResponse.length} petanis`);
    console.log('Petani emails:', petanisResponse.map(p => p.email));
    console.log('==========================\n');
    
    res.json({ petanis: petanisResponse, total: petanisResponse.length });
  } catch (error) {
    console.error('❌ Error getting petanis:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get customer by ID
app.get('/api/admin/users/customers/:id', async (req, res) => {
  try {
    const customers = await readJSONFile(customersPath);
    const customer = customers.find(c => c.id === req.params.id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer tidak ditemukan' });
    }
    
    const { password, ...customerResponse } = customer;
    res.json({ customer: customerResponse });
  } catch (error) {
    console.error('Error getting customer:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get petani by ID
app.get('/api/admin/users/petanis/:id', async (req, res) => {
  try {
    const petanis = await readJSONFile(petanisPath);
    const petani = petanis.find(p => p.id === req.params.id);
    
    if (!petani) {
      return res.status(404).json({ error: 'Petani tidak ditemukan' });
    }
    
    const { password, ...petaniResponse } = petani;
    res.json({ petani: petaniResponse });
  } catch (error) {
    console.error('Error getting petani:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update customer status
app.put('/api/admin/users/customers/:id/status', async (req, res) => {
  try {
    const { status, adminMessage, adminEmail } = req.body;
    
    if (!['pending', 'accepted', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid' });
    }
    
    const customers = await readJSONFile(customersPath);
    const customerIndex = customers.findIndex(c => c.id === req.params.id);
    
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer tidak ditemukan' });
    }
    
    const oldStatus = customers[customerIndex].status || 'pending';
    customers[customerIndex].status = status;
    if (adminMessage) {
      customers[customerIndex].adminMessage = adminMessage;
    }
    if (status === 'accepted' || status === 'rejected') {
      customers[customerIndex].reviewedAt = new Date().toISOString();
    }
    
    await writeJSONFile(customersPath, customers);
    
    // Log admin action
    await logAdminAction(status, 'customer', customers[customerIndex].email, adminEmail || 'admin', {
      oldStatus,
      newStatus: status,
      adminMessage
    });
    
    const { password, ...customerResponse } = customers[customerIndex];
    res.json({ message: 'Status berhasil diupdate', customer: customerResponse });
  } catch (error) {
    console.error('Error updating customer status:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update petani status
app.put('/api/admin/users/petanis/:id/status', async (req, res) => {
  try {
    const { status, adminMessage, adminEmail } = req.body;
    
    if (!['pending', 'accepted', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid' });
    }
    
    const petanis = await readJSONFile(petanisPath);
    const petaniIndex = petanis.findIndex(p => p.id === req.params.id);
    
    if (petaniIndex === -1) {
      return res.status(404).json({ error: 'Petani tidak ditemukan' });
    }
    
    const oldStatus = petanis[petaniIndex].status || 'pending';
    petanis[petaniIndex].status = status;
    if (adminMessage) {
      petanis[petaniIndex].adminMessage = adminMessage;
    }
    if (status === 'accepted' || status === 'rejected') {
      petanis[petaniIndex].reviewedAt = new Date().toISOString();
    }
    
    await writeJSONFile(petanisPath, petanis);
    
    // Log admin action
    await logAdminAction(status, 'petani', petanis[petaniIndex].email, adminEmail || 'admin', {
      oldStatus,
      newStatus: status,
      adminMessage
    });
    
    const { password, ...petaniResponse } = petanis[petaniIndex];
    res.json({ message: 'Status berhasil diupdate', petani: petaniResponse });
  } catch (error) {
    console.error('Error updating petani status:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update customer data
app.put('/api/admin/users/customers/:id', async (req, res) => {
  try {
    console.log(`📝 PUT /api/admin/users/customers/${req.params.id} - Updating customer data`);
    const { name, email, phoneNumber, address, adminEmail } = req.body;
    
    if (!name || !email || !phoneNumber || !address) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }
    
    const customers = await readJSONFile(customersPath);
    const customerIndex = customers.findIndex(c => c.id === req.params.id);
    
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer tidak ditemukan' });
    }
    
    // Check if email is already used by another customer
    const emailExists = customers.some((c, idx) => c.email === email && idx !== customerIndex);
    if (emailExists) {
      return res.status(400).json({ error: 'Email sudah digunakan' });
    }
    
    // Update customer data
    const oldData = { ...customers[customerIndex] };
    customers[customerIndex].name = name;
    customers[customerIndex].email = email;
    customers[customerIndex].phoneNumber = phoneNumber;
    customers[customerIndex].address = address;
    customers[customerIndex].updatedAt = new Date().toISOString();
    
    await writeJSONFile(customersPath, customers);
    
    // Log admin action
    await logAdminAction('update', 'customer', email, adminEmail || 'admin', {
      oldData,
      newData: customers[customerIndex]
    });
    
    const { password, ...customerResponse } = customers[customerIndex];
    res.json({ message: 'Data customer berhasil diupdate', customer: customerResponse });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Delete customer
app.delete('/api/admin/users/customers/:id', async (req, res) => {
  try {
    const { adminEmail } = req.body;
    const customers = await readJSONFile(customersPath);
    const customerIndex = customers.findIndex(c => c.id === req.params.id);
    
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer tidak ditemukan' });
    }
    
    const deletedCustomer = customers[customerIndex];
    customers.splice(customerIndex, 1);
    await writeJSONFile(customersPath, customers);
    
    // Log admin action
    await logAdminAction('delete', 'customer', deletedCustomer.email, adminEmail || 'admin');
    
    res.json({ message: 'Customer berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update petani data
app.put('/api/admin/users/petanis/:id', async (req, res) => {
  try {
    console.log(`📝 PUT /api/admin/users/petanis/${req.params.id} - Updating petani data`);
    const { 
      name, 
      email, 
      phoneNumber, 
      address, 
      shop, 
      farm, 
      adminEmail 
    } = req.body;
    
    if (!name || !email || !phoneNumber || !address) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }
    
    const petanis = await readJSONFile(petanisPath);
    const petaniIndex = petanis.findIndex(p => p.id === req.params.id);
    
    if (petaniIndex === -1) {
      return res.status(404).json({ error: 'Petani tidak ditemukan' });
    }
    
    // Check if email is already used by another petani
    const emailExists = petanis.some((p, idx) => p.email === email && idx !== petaniIndex);
    if (emailExists) {
      return res.status(400).json({ error: 'Email sudah digunakan' });
    }
    
    // Update petani data
    const oldData = { ...petanis[petaniIndex] };
    petanis[petaniIndex].name = name;
    petanis[petaniIndex].email = email;
    petanis[petaniIndex].phoneNumber = phoneNumber;
    petanis[petaniIndex].address = address;
    petanis[petaniIndex].updatedAt = new Date().toISOString();
    
    // Update shop data if provided
    if (shop) {
      petanis[petaniIndex].shop = {
        ...petanis[petaniIndex].shop,
        ...shop
      };
    }
    
    // Update farm data if provided
    if (farm) {
      petanis[petaniIndex].farm = {
        ...petanis[petaniIndex].farm,
        ...farm
      };
    }
    
    await writeJSONFile(petanisPath, petanis);
    
    // Log admin action
    await logAdminAction('update', 'petani', email, adminEmail || 'admin', {
      oldData,
      newData: petanis[petaniIndex]
    });
    
    const { password, ...petaniResponse } = petanis[petaniIndex];
    res.json({ message: 'Data petani berhasil diupdate', petani: petaniResponse });
  } catch (error) {
    console.error('Error updating petani:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Delete petani
app.delete('/api/admin/users/petanis/:id', async (req, res) => {
  try {
    const { adminEmail } = req.body;
    const petanis = await readJSONFile(petanisPath);
    const petaniIndex = petanis.findIndex(p => p.id === req.params.id);
    
    if (petaniIndex === -1) {
      return res.status(404).json({ error: 'Petani tidak ditemukan' });
    }
    
    const deletedPetani = petanis[petaniIndex];
    petanis.splice(petaniIndex, 1);
    await writeJSONFile(petanisPath, petanis);
    
    // Log admin action
    await logAdminAction('delete', 'petani', deletedPetani.email, adminEmail || 'admin');
    
    res.json({ message: 'Petani berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting petani:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get audit logs
app.get('/api/admin/logs', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const logs = await readJSONFile(logsPath);
    
    // Sort by timestamp descending (newest first)
    const sortedLogs = logs.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // Limit results
    const limitedLogs = sortedLogs.slice(0, parseInt(limit));
    
    res.json({ logs: limitedLogs, total: logs.length });
  } catch (error) {
    console.error('Error getting logs:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// ========== ORDERS ENDPOINTS ==========

// Get orders for customer
app.get('/api/customer/orders', async (req, res) => {
  try {
    const { customerId } = req.query;
    if (!customerId) {
      return res.status(400).json({ error: 'customerId is required' });
    }
    
    const orders = await readJSONFile(ordersPath);
    const customerOrders = orders.filter(o => o.customerId === customerId);
    
    // Sort by createdAt descending (newest first)
    customerOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    res.json({ orders: customerOrders, total: customerOrders.length });
  } catch (error) {
    console.error('Error getting customer orders:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get orders for farmer
app.get('/api/farmer/orders', async (req, res) => {
  try {
    const { farmerId } = req.query;
    if (!farmerId) {
      return res.status(400).json({ error: 'farmerId is required' });
    }
    
    const orders = await readJSONFile(ordersPath);
    const farmerOrders = orders.filter(o => o.farmerId === farmerId);
    
    // Sort by createdAt descending (newest first)
    farmerOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    res.json({ orders: farmerOrders, total: farmerOrders.length });
  } catch (error) {
    console.error('Error getting farmer orders:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get all orders (for admin analytics)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await readJSONFile(ordersPath);
    
    // Sort by createdAt descending (newest first)
    orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    res.json({ orders, total: orders.length });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get order by ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const orders = await readJSONFile(ordersPath);
    const order = orders.find(o => o.id === req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
    }
    
    res.json({ order });
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Create new order (from cart checkout)
app.post('/api/orders', async (req, res) => {
  try {
    console.log('=== CREATE ORDER REQUEST ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const {
      customerId,
      cartItemIds, // Array of cart item IDs to checkout (optional)
      products, // Direct products array (optional, alternative to cartItemIds)
      farmerId, // Single farmer ID (when using products directly)
      total, // Total amount (when using products directly)
      paymentMethod,
      shippingAddress
    } = req.body;
    
    // Validate required fields
    console.log('🔍 Validating required fields...');
    console.log('  customerId:', customerId, 'Type:', typeof customerId, 'Exists:', !!customerId);
    console.log('  shippingAddress:', shippingAddress, 'Type:', typeof shippingAddress, 'Exists:', !!shippingAddress, 'Length:', shippingAddress?.length);
    
    if (!customerId || !shippingAddress) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({ 
        error: 'customerId dan shippingAddress wajib diisi',
        received: {
          hasCustomerId: !!customerId,
          hasShippingAddress: !!shippingAddress,
          customerId: customerId,
          shippingAddress: shippingAddress
        }
      });
    }
    
    console.log('✅ Required fields validated');
    
    // Get customer data
    console.log('📂 Reading customers file...');
    const customers = await readJSONFile(customersPath);
    console.log('  Total customers:', customers.length);
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) {
      console.log('❌ Customer not found:', customerId);
      console.log('  Available customer IDs:', customers.map(c => c.id));
      return res.status(404).json({ 
        error: 'Customer tidak ditemukan',
        customerId: customerId,
        availableIds: customers.map(c => c.id)
      });
    }
    
    console.log('✅ Customer found:', customer.name);
    
    let cartItems = [];
    
    console.log('📦 Received data:');
    console.log('  cartItemIds:', cartItemIds, 'Type:', typeof cartItemIds, 'IsArray:', Array.isArray(cartItemIds));
    console.log('  products:', JSON.stringify(products, null, 2), 'Type:', typeof products, 'IsArray:', Array.isArray(products), 'Length:', products?.length);
    console.log('  farmerId:', farmerId, 'Type:', typeof farmerId, 'Value:', JSON.stringify(farmerId));
    console.log('  customerId:', customerId);
    console.log('  shippingAddress:', shippingAddress);
    
    // Support both methods: cartItemIds OR products directly
    if (cartItemIds && Array.isArray(cartItemIds) && cartItemIds.length > 0) {
      console.log('✅ Using Method 1: cartItemIds');
      // Method 1: Using cartItemIds from database
      const carts = await readJSONFile(cartsPath);
      cartItems = carts.filter(c => 
        c.customerId === customerId && cartItemIds.includes(c.id)
      );
      
      if (cartItems.length === 0) {
        return res.status(400).json({ error: 'Tidak ada item yang dipilih' });
      }
    } else if (products && Array.isArray(products) && products.length > 0) {
      // Validate farmerId
      if (!farmerId || (typeof farmerId !== 'string' && typeof farmerId !== 'number')) {
        console.log('❌ farmerId invalid:', farmerId, 'Type:', typeof farmerId);
        return res.status(400).json({ 
          error: 'farmerId wajib diisi dan harus berupa string atau number',
          received: { farmerId, farmerIdType: typeof farmerId }
        });
      }
      
      const farmerIdStr = String(farmerId).trim();
      if (farmerIdStr === '') {
        console.log('❌ farmerId is empty string');
        return res.status(400).json({ error: 'farmerId tidak boleh kosong' });
      }
      
      console.log('✅ Using Method 2: products directly');
      console.log('  Products count:', products.length);
      console.log('  FarmerId:', farmerIdStr);
      
      // Method 2: Using products directly (from frontend cart state)
      // Convert products to cartItems format
      const productsData = await readJSONFile(productsPath);
      const petanis = await readJSONFile(petanisPath);
      const farmer = petanis.find(p => p.id === farmerIdStr || String(p.id) === farmerIdStr);
      
      if (!farmer) {
        console.log('❌ Farmer not found:', farmerIdStr);
        console.log('  Available farmers:', petanis.map(p => ({ id: p.id, name: p.name })));
        return res.status(404).json({ 
          error: `Petani dengan ID ${farmerIdStr} tidak ditemukan`,
          availableFarmers: petanis.map(p => p.id)
        });
      }
      
      console.log('✅ Farmer found:', farmer.name);
      
      cartItems = products.map((product, index) => {
        console.log(`  Processing product ${index + 1}:`, JSON.stringify(product));
        
        if (!product.productId) {
          throw new Error(`Product ${index + 1} tidak memiliki productId`);
        }
        if (!product.quantity || product.quantity <= 0) {
          throw new Error(`Product ${index + 1} quantity tidak valid: ${product.quantity}`);
        }
        if (!product.price || product.price <= 0) {
          throw new Error(`Product ${index + 1} price tidak valid: ${product.price}`);
        }
        
        const productData = productsData.find(p => p.id === product.productId);
        const cartItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          customerId,
          productId: product.productId,
          productName: product.name || productData?.name || 'Unknown',
          productImage: productData?.image || null,
          farmerId: farmerIdStr,
          farmerName: farmer.name,
          price: Number(product.price),
          unit: productData?.unit || 'kg',
          quantity: Number(product.quantity),
          subtotal: Number(product.price) * Number(product.quantity),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        console.log(`  ✅ Created cartItem:`, cartItem);
        return cartItem;
      });
      
      console.log('✅ Total cartItems created:', cartItems.length);
    } else {
      console.log('❌ Validation failed - No valid method found:');
      console.log('  cartItemIds:', cartItemIds, 'Type:', typeof cartItemIds, 'IsArray:', Array.isArray(cartItemIds), 'Length:', cartItemIds?.length);
      console.log('  products:', JSON.stringify(products), 'Type:', typeof products, 'IsArray:', Array.isArray(products), 'Length:', products?.length);
      console.log('  farmerId:', farmerId, 'Type:', typeof farmerId, 'Value:', JSON.stringify(farmerId));
      console.log('  customerId:', customerId);
      console.log('  shippingAddress:', shippingAddress);
      
      // More detailed error message
      let errorMsg = 'Data pesanan tidak lengkap. ';
      const issues = [];
      
      if (!products) {
        issues.push('products tidak ada');
      } else if (!Array.isArray(products)) {
        issues.push(`products bukan array (type: ${typeof products})`);
      } else if (products.length === 0) {
        issues.push('products array kosong');
      }
      
      if (!farmerId) {
        issues.push('farmerId tidak ada');
      } else if (typeof farmerId !== 'string' && typeof farmerId !== 'number') {
        issues.push(`farmerId type tidak valid (type: ${typeof farmerId})`);
      } else if (String(farmerId).trim() === '') {
        issues.push('farmerId kosong');
      }
      
      errorMsg += issues.length > 0 ? 'Masalah: ' + issues.join(', ') : 'Format data tidak sesuai';
      
      return res.status(400).json({ 
        error: errorMsg,
        received: {
          hasCartItemIds: !!cartItemIds,
          cartItemIdsType: typeof cartItemIds,
          cartItemIdsIsArray: Array.isArray(cartItemIds),
          cartItemIdsLength: cartItemIds?.length || 0,
          hasProducts: !!products,
          productsType: typeof products,
          productsIsArray: Array.isArray(products),
          productsLength: products?.length || 0,
          productsValue: products,
          hasFarmerId: !!farmerId,
          farmerId: farmerId,
          farmerIdType: typeof farmerId,
          farmerIdValue: String(farmerId)
        }
      });
    }
    
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Tidak ada item yang dipilih' });
    }
    
    // Group items by farmer
    const ordersByFarmer = {};
    
    for (const cartItem of cartItems) {
      const itemFarmerId = cartItem.farmerId;
      
      if (!ordersByFarmer[itemFarmerId]) {
        ordersByFarmer[itemFarmerId] = {
          farmerId: itemFarmerId,
          farmerName: cartItem.farmerName,
          products: [],
          total: 0
        };
      }
      
      // Verify product still exists and has stock
      const productsData = await readJSONFile(productsPath);
      const product = productsData.find(p => p.id === cartItem.productId);
      
      if (!product) {
        console.log('❌ Product not found:', cartItem.productId);
        return res.status(404).json({ error: `Produk ${cartItem.productName} tidak ditemukan` });
      }
      
      if (product.stock < cartItem.quantity) {
        console.log('❌ Insufficient stock:', cartItem.productName, 'Required:', cartItem.quantity, 'Available:', product.stock);
        return res.status(400).json({ error: `Stok ${cartItem.productName} tidak mencukupi. Stok tersedia: ${product.stock}` });
      }
      
      ordersByFarmer[itemFarmerId].products.push({
        productId: cartItem.productId,
        name: cartItem.productName,
        quantity: cartItem.quantity,
        price: cartItem.price
      });
      
      ordersByFarmer[itemFarmerId].total += cartItem.subtotal;
    }
    
    console.log('✅ Cart items processed. Orders by farmer:', Object.keys(ordersByFarmer).length);
    
    // Create orders for each farmer
    const orders = await readJSONFile(ordersPath);
    const createdOrders = [];
    
    for (const farmerId in ordersByFarmer) {
      const orderData = ordersByFarmer[farmerId];
      
      const newOrder = {
        id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customerId,
        customerName: customer.name,
        farmerId: orderData.farmerId,
        farmerName: orderData.farmerName,
        products: orderData.products,
        total: total && Object.keys(ordersByFarmer).length === 1 ? total : orderData.total + 15000,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: paymentMethod || 'Saldo MycoTrack',
        shippingAddress,
        tracking: [
          {
            status: 'pending',
            message: 'Pesanan dibuat',
            timestamp: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      orders.push(newOrder);
      createdOrders.push(newOrder);
      
      // Update product stock
      const productsData = await readJSONFile(productsPath);
      for (const product of orderData.products) {
        const productIndex = productsData.findIndex(p => p.id === product.productId);
        if (productIndex !== -1) {
          const oldStock = productsData[productIndex].stock;
          productsData[productIndex].stock -= product.quantity;
          productsData[productIndex].updatedAt = new Date().toISOString();
          console.log(`  ✅ Updated stock for ${product.name}: ${oldStock} -> ${productsData[productIndex].stock}`);
        }
      }
      await writeJSONFile(productsPath, productsData);
    }
    
    // Remove checked out items from cart (only if using cartItemIds)
    if (cartItemIds && Array.isArray(cartItemIds) && cartItemIds.length > 0) {
      const carts = await readJSONFile(cartsPath);
      const remainingCarts = carts.filter(c => 
        !(c.customerId === customerId && cartItemIds.includes(c.id))
      );
      await writeJSONFile(cartsPath, remainingCarts);
    }
    
    await writeJSONFile(ordersPath, orders);
    
    console.log('✅ Orders created successfully:', createdOrders.length);
    console.log('==================================\n');
    
    res.status(201).json({ 
      message: 'Pesanan berhasil dibuat', 
      orders: createdOrders,
      totalOrders: createdOrders.length
    });
  } catch (error) {
    console.error('❌ ERROR creating order:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update order status (for farmer)
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status, farmerId } = req.body;
    
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid' });
    }
    
    const orders = await readJSONFile(ordersPath);
    const orderIndex = orders.findIndex(o => o.id === req.params.id);
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
    }
    
    const order = orders[orderIndex];
    
    // Verify farmer owns this order
    if (order.farmerId !== farmerId) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses ke pesanan ini' });
    }
    
    const oldStatus = order.status;
    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();
    
    // Add tracking entry
    if (!orders[orderIndex].tracking) {
      orders[orderIndex].tracking = [];
    }
    
    const statusMessages = {
      pending: 'Pesanan dibuat',
      processing: 'Pesanan sedang diproses',
      shipped: 'Pesanan sedang dikirim',
      delivered: 'Pesanan telah diterima',
      cancelled: 'Pesanan dibatalkan'
    };
    
    orders[orderIndex].tracking.push({
      status,
      message: statusMessages[status] || `Status diubah menjadi ${status}`,
      timestamp: new Date().toISOString()
    });
    
    await writeJSONFile(ordersPath, orders);
    
    res.json({ message: 'Status pesanan berhasil diupdate', order: orders[orderIndex] });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update payment status
app.put('/api/orders/:id/payment', async (req, res) => {
  try {
    console.log('=== UPDATE PAYMENT STATUS REQUEST ===');
    console.log('Order ID:', req.params.id);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const { paymentStatus } = req.body;
    
    if (!paymentStatus) {
      console.log('❌ Payment status is required');
      return res.status(400).json({ error: 'Status pembayaran wajib diisi' });
    }
    
    if (!['pending', 'paid', 'failed'].includes(paymentStatus)) {
      console.log('❌ Invalid payment status:', paymentStatus);
      return res.status(400).json({ error: 'Status pembayaran tidak valid' });
    }
    
    const orders = await readJSONFile(ordersPath);
    console.log('Total orders in file:', orders.length);
    
    const orderIndex = orders.findIndex(o => o.id === req.params.id);
    console.log('Order index:', orderIndex);
    
    if (orderIndex === -1) {
      console.log('❌ Order not found:', req.params.id);
      return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
    }
    
    const oldPaymentStatus = orders[orderIndex].paymentStatus;
    orders[orderIndex].paymentStatus = paymentStatus;
    orders[orderIndex].updatedAt = new Date().toISOString();
    
    await writeJSONFile(ordersPath, orders);
    
    console.log('✅ Payment status updated:', oldPaymentStatus, '->', paymentStatus);
    console.log('==================================\n');
    
    res.json({ message: 'Status pembayaran berhasil diupdate', order: orders[orderIndex] });
  } catch (error) {
    console.error('❌ ERROR updating payment status:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// ========== FORUM ENDPOINTS ==========

// Get all forum posts
app.get('/api/forum/posts', async (req, res) => {
  try {
    const { search, authorId } = req.query;
    let forum = await readJSONFile(forumPath);
    
    // Filter by author if specified
    if (authorId) {
      forum = forum.filter(p => p.authorId === authorId);
    }
    
    // Search by title or content
    if (search) {
      const searchLower = search.toLowerCase();
      forum = forum.filter(p => 
        (p.title || '').toLowerCase().includes(searchLower) ||
        (p.content || '').toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by createdAt descending (newest first)
    forum.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    res.json({ posts: forum, total: forum.length });
  } catch (error) {
    console.error('Error getting forum posts:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get forum post by ID (increment views)
app.get('/api/forum/posts/:id', async (req, res) => {
  try {
    const forum = await readJSONFile(forumPath);
    const postIndex = forum.findIndex(p => p.id === req.params.id);
    
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Postingan tidak ditemukan' });
    }
    
    // Increment views
    if (!forum[postIndex].views) {
      forum[postIndex].views = 0;
    }
    forum[postIndex].views += 1;
    forum[postIndex].updatedAt = new Date().toISOString();
    
    await writeJSONFile(forumPath, forum);
    
    res.json({ post: forum[postIndex] });
  } catch (error) {
    console.error('Error getting forum post:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Create new forum post
app.post('/api/forum/posts', upload.single('image'), async (req, res) => {
  try {
    console.log('=== CREATE FORUM POST REQUEST ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('File:', req.file ? req.file.filename : 'No file');
    
    const {
      authorId,
      authorName,
      authorRole,
      title,
      content,
      imageUrl
    } = req.body;
    
    if (!authorId || !authorName || !title || !content) {
      console.log('❌ Validation failed');
      return res.status(400).json({ error: 'authorId, authorName, title, dan content wajib diisi' });
    }
    
    // Determine image URL (file upload takes priority over URL)
    let image = null;
    if (req.file) {
      image = `http://localhost:3000/uploads/${req.file.filename}`;
    } else if (imageUrl && imageUrl.trim()) {
      image = imageUrl.trim();
    }
    
    const forum = await readJSONFile(forumPath);
    
    const newPost = {
      id: `post-${Date.now()}`,
      authorId,
      authorName,
      authorRole: authorRole || 'customer',
      title: title.trim(),
      content: content.trim(),
      image: image,
      likes: [],
      comments: [],
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    forum.push(newPost);
    await writeJSONFile(forumPath, forum);
    
    console.log('✅ Forum post created successfully:', newPost.id);
    console.log('==================================\n');
    
    res.status(201).json({ message: 'Postingan berhasil dibuat', post: newPost });
  } catch (error) {
    console.error('❌ ERROR creating forum post:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update forum post
app.put('/api/forum/posts/:id', upload.single('image'), async (req, res) => {
  try {
    const {
      authorId,
      title,
      content,
      imageUrl
    } = req.body;
    
    const forum = await readJSONFile(forumPath);
    const postIndex = forum.findIndex(p => p.id === req.params.id);
    
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Postingan tidak ditemukan' });
    }
    
    const post = forum[postIndex];
    
    // Verify author or admin
    const isAuthor = post.authorId === authorId;
    const isAdmin = authorId && (await readJSONFile(adminPath)).some(a => a.id === authorId);
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses untuk mengedit postingan ini' });
    }
    
    // Update fields
    if (title) forum[postIndex].title = title.trim();
    if (content) forum[postIndex].content = content.trim();
    
    // Update image (file upload takes priority)
    if (req.file) {
      forum[postIndex].image = `http://localhost:3000/uploads/${req.file.filename}`;
    } else if (imageUrl !== undefined) {
      forum[postIndex].image = imageUrl && imageUrl.trim() ? imageUrl.trim() : null;
    }
    
    forum[postIndex].updatedAt = new Date().toISOString();
    
    await writeJSONFile(forumPath, forum);
    
    res.json({ message: 'Postingan berhasil diperbarui', post: forum[postIndex] });
  } catch (error) {
    console.error('Error updating forum post:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Delete forum post
app.delete('/api/forum/posts/:id', async (req, res) => {
  try {
    const { authorId } = req.body;
    
    const forum = await readJSONFile(forumPath);
    const postIndex = forum.findIndex(p => p.id === req.params.id);
    
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Postingan tidak ditemukan' });
    }
    
    const post = forum[postIndex];
    
    // Verify author or admin
    const isAuthor = post.authorId === authorId;
    const isAdmin = authorId && (await readJSONFile(adminPath)).some(a => a.id === authorId);
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses untuk menghapus postingan ini' });
    }
    
    forum.splice(postIndex, 1);
    await writeJSONFile(forumPath, forum);
    
    res.json({ message: 'Postingan berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting forum post:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Toggle like on forum post
app.post('/api/forum/posts/:id/like', async (req, res) => {
  try {
    const { userId, userName } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const forum = await readJSONFile(forumPath);
    const postIndex = forum.findIndex(p => p.id === req.params.id);
    
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Postingan tidak ditemukan' });
    }
    
    const post = forum[postIndex];
    
    // Initialize likes array if not exists
    if (!post.likes) {
      post.likes = [];
    }
    
    // Check if user already liked
    const likeIndex = post.likes.findIndex(l => l.userId === userId);
    
    if (likeIndex !== -1) {
      // Unlike (remove like)
      post.likes.splice(likeIndex, 1);
    } else {
      // Like (add like)
      post.likes.push({
        userId,
        userName: userName || 'User',
        timestamp: new Date().toISOString()
      });
    }
    
    forum[postIndex].updatedAt = new Date().toISOString();
    await writeJSONFile(forumPath, forum);
    
    res.json({ 
      message: likeIndex !== -1 ? 'Like dibatalkan' : 'Postingan dilike',
      post: forum[postIndex],
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Add comment to forum post
app.post('/api/forum/posts/:id/comments', async (req, res) => {
  try {
    const {
      userId,
      userName,
      userRole,
      content
    } = req.body;
    
    if (!userId || !userName || !content) {
      return res.status(400).json({ error: 'userId, userName, dan content wajib diisi' });
    }
    
    const forum = await readJSONFile(forumPath);
    const postIndex = forum.findIndex(p => p.id === req.params.id);
    
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Postingan tidak ditemukan' });
    }
    
    const post = forum[postIndex];
    
    // Initialize comments array if not exists
    if (!post.comments) {
      post.comments = [];
    }
    
    const newComment = {
      id: `comment-${Date.now()}`,
      userId,
      userName,
      userRole: userRole || 'customer',
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    post.comments.push(newComment);
    forum[postIndex].updatedAt = new Date().toISOString();
    
    await writeJSONFile(forumPath, forum);
    
    res.status(201).json({ message: 'Komentar berhasil ditambahkan', comment: newComment, post: forum[postIndex] });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update comment
app.put('/api/forum/posts/:postId/comments/:commentId', async (req, res) => {
  try {
    const { userId, content } = req.body;
    
    if (!userId || !content) {
      return res.status(400).json({ error: 'userId dan content wajib diisi' });
    }
    
    const forum = await readJSONFile(forumPath);
    const postIndex = forum.findIndex(p => p.id === req.params.postId);
    
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Postingan tidak ditemukan' });
    }
    
    const post = forum[postIndex];
    
    if (!post.comments) {
      return res.status(404).json({ error: 'Komentar tidak ditemukan' });
    }
    
    const commentIndex = post.comments.findIndex(c => c.id === req.params.commentId);
    
    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Komentar tidak ditemukan' });
    }
    
    const comment = post.comments[commentIndex];
    
    // Verify user owns this comment
    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses untuk mengedit komentar ini' });
    }
    
    post.comments[commentIndex].content = content.trim();
    post.comments[commentIndex].updatedAt = new Date().toISOString();
    forum[postIndex].updatedAt = new Date().toISOString();
    
    await writeJSONFile(forumPath, forum);
    
    res.json({ message: 'Komentar berhasil diperbarui', comment: post.comments[commentIndex] });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Delete comment
app.delete('/api/forum/posts/:postId/comments/:commentId', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const forum = await readJSONFile(forumPath);
    const postIndex = forum.findIndex(p => p.id === req.params.postId);
    
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Postingan tidak ditemukan' });
    }
    
    const post = forum[postIndex];
    
    if (!post.comments) {
      return res.status(404).json({ error: 'Komentar tidak ditemukan' });
    }
    
    const commentIndex = post.comments.findIndex(c => c.id === req.params.commentId);
    
    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Komentar tidak ditemukan' });
    }
    
    const comment = post.comments[commentIndex];
    
    // Verify user owns this comment or is admin
    const isAuthor = comment.userId === userId;
    const isAdmin = userId && (await readJSONFile(adminPath)).some(a => a.id === userId);
    const isPostAuthor = post.authorId === userId;
    
    if (!isAuthor && !isAdmin && !isPostAuthor) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses untuk menghapus komentar ini' });
    }
    
    post.comments.splice(commentIndex, 1);
    forum[postIndex].updatedAt = new Date().toISOString();
    
    await writeJSONFile(forumPath, forum);
    
    res.json({ message: 'Komentar berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// ========== ARTICLES ENDPOINTS ==========

// Get all articles (public - for Customer and Petani)
app.get('/api/articles', async (req, res) => {
  try {
    const { search, category } = req.query;
    let articles = await readJSONFile(articlesPath);
    
    // Filter by category if specified
    if (category) {
      articles = articles.filter(a => 
        (a.category || '').toLowerCase().includes(category.toLowerCase())
      );
    }
    
    // Search by title, excerpt, or content
    if (search) {
      const searchLower = search.toLowerCase();
      articles = articles.filter(a => 
        (a.title || '').toLowerCase().includes(searchLower) ||
        (a.excerpt || '').toLowerCase().includes(searchLower) ||
        (a.content || '').toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by date descending (newest first)
    articles.sort((a, b) => 
      new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime()
    );
    
    res.json({ articles, total: articles.length });
  } catch (error) {
    console.error('Error getting articles:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get article by ID (public - for Customer and Petani)
app.get('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const articles = await readJSONFile(articlesPath);
    const article = articles.find(a => a.id === id);
    
    if (!article) {
      return res.status(404).json({ error: 'Artikel tidak ditemukan' });
    }
    
    res.json({ article });
  } catch (error) {
    console.error('Error getting article:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Create article (Admin only)
app.post('/api/admin/articles', async (req, res) => {
  try {
    const { title, excerpt, content, author, category, image, date } = req.body;
    
    if (!title || !content || !author) {
      return res.status(400).json({ error: 'Judul, konten, dan penulis wajib diisi' });
    }
    
    const articles = await readJSONFile(articlesPath);
    
    const newArticle = {
      id: `a${Date.now()}`,
      title,
      excerpt: excerpt || '',
      content,
      author,
      category: category || 'Umum',
      image: image || 'https://images.unsplash.com/photo-1735282260417-cb781d757604?w=400',
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    articles.unshift(newArticle);
    await writeJSONFile(articlesPath, articles);
    
    res.status(201).json({ article: newArticle, message: 'Artikel berhasil ditambahkan' });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update article (Admin only)
app.put('/api/admin/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, author, category, image, date } = req.body;
    
    const articles = await readJSONFile(articlesPath);
    const articleIndex = articles.findIndex(a => a.id === id);
    
    if (articleIndex === -1) {
      return res.status(404).json({ error: 'Artikel tidak ditemukan' });
    }
    
    const updatedArticle = {
      ...articles[articleIndex],
      ...(title && { title }),
      ...(excerpt !== undefined && { excerpt }),
      ...(content && { content }),
      ...(author && { author }),
      ...(category !== undefined && { category }),
      ...(image !== undefined && { image }),
      ...(date && { date }),
      updatedAt: new Date().toISOString()
    };
    
    articles[articleIndex] = updatedArticle;
    await writeJSONFile(articlesPath, articles);
    
    res.json({ article: updatedArticle, message: 'Artikel berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Delete article (Admin only)
app.delete('/api/admin/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const articles = await readJSONFile(articlesPath);
    const articleIndex = articles.findIndex(a => a.id === id);
    
    if (articleIndex === -1) {
      return res.status(404).json({ error: 'Artikel tidak ditemukan' });
    }
    
    articles.splice(articleIndex, 1);
    await writeJSONFile(articlesPath, articles);
    
    res.json({ message: 'Artikel berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// ========== CUSTOMER SERVICE CHAT ENDPOINTS ==========

// Get conversations for customer
app.get('/api/customer/chats', async (req, res) => {
  try {
    const { customerId } = req.query;
    if (!customerId) {
      return res.status(400).json({ error: 'customerId is required' });
    }
    
    const chats = await readJSONFile(chatsPath);
    const customerChats = chats.filter(c => c.customerId === customerId);
    
    // Get latest message for each conversation
    const conversations = customerChats.reduce((acc, chat) => {
      if (!acc[chat.conversationId]) {
        acc[chat.conversationId] = {
          conversationId: chat.conversationId,
          customerId: chat.customerId,
          customerName: chat.customerName,
          adminId: chat.adminId || null,
          adminName: chat.adminName || null,
          lastMessage: chat.message,
          lastMessageTime: chat.timestamp,
          unreadCount: chat.sender === 'customer' ? 0 : (chat.read ? 0 : 1),
          createdAt: chat.createdAt
        };
      } else {
        if (new Date(chat.timestamp) > new Date(acc[chat.conversationId].lastMessageTime)) {
          acc[chat.conversationId].lastMessage = chat.message;
          acc[chat.conversationId].lastMessageTime = chat.timestamp;
        }
        if (chat.sender === 'admin' && !chat.read) {
          acc[chat.conversationId].unreadCount++;
        }
      }
      return acc;
    }, {});
    
    const conversationsList = Object.values(conversations).sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
    
    res.json({ conversations: conversationsList });
  } catch (error) {
    console.error('Error getting customer chats:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get messages for a conversation
app.get('/api/chats/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const chats = await readJSONFile(chatsPath);
    const messages = chats
      .filter(c => c.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    res.json({ messages });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Send message (Customer or Admin)
app.post('/api/chats/message', async (req, res) => {
  try {
    const { conversationId, customerId, customerName, adminId, adminName, sender, message } = req.body;
    
    if (!message || !sender) {
      return res.status(400).json({ error: 'Message and sender are required' });
    }
    
    if (sender === 'customer' && !customerId) {
      return res.status(400).json({ error: 'customerId is required for customer messages' });
    }
    
    if (sender === 'admin' && !adminId) {
      return res.status(400).json({ error: 'adminId is required for admin messages' });
    }
    
    const chats = await readJSONFile(chatsPath);
    
    // Generate conversationId if not provided (new conversation)
    let convId = conversationId;
    if (!convId) {
      convId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversationId: convId,
      customerId: customerId || null,
      customerName: customerName || null,
      adminId: adminId || null,
      adminName: adminName || null,
      sender, // 'customer' or 'admin'
      message,
      read: false,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    chats.push(newMessage);
    await writeJSONFile(chatsPath, chats);
    
    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Mark messages as read
app.put('/api/chats/:conversationId/read', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, userRole } = req.body; // userId can be customerId or adminId
    
    const chats = await readJSONFile(chatsPath);
    let updated = false;
    
    chats.forEach(chat => {
      if (chat.conversationId === conversationId) {
        if (userRole === 'customer' && chat.sender === 'admin' && !chat.read) {
          chat.read = true;
          updated = true;
        } else if (userRole === 'admin' && chat.sender === 'customer' && !chat.read) {
          chat.read = true;
          updated = true;
        }
      }
    });
    
    if (updated) {
      await writeJSONFile(chatsPath, chats);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get all conversations for Admin
app.get('/api/admin/chats', async (req, res) => {
  try {
    const chats = await readJSONFile(chatsPath);
    
    // Group by conversationId
    const conversations = chats.reduce((acc, chat) => {
      if (!acc[chat.conversationId]) {
        acc[chat.conversationId] = {
          conversationId: chat.conversationId,
          customerId: chat.customerId,
          customerName: chat.customerName,
          adminId: chat.adminId || null,
          adminName: chat.adminName || null,
          lastMessage: chat.message,
          lastMessageTime: chat.timestamp,
          unreadCount: chat.sender === 'admin' ? 0 : (chat.read ? 0 : 1),
          createdAt: chat.createdAt
        };
      } else {
        if (new Date(chat.timestamp) > new Date(acc[chat.conversationId].lastMessageTime)) {
          acc[chat.conversationId].lastMessage = chat.message;
          acc[chat.conversationId].lastMessageTime = chat.timestamp;
        }
        if (chat.sender === 'customer' && !chat.read) {
          acc[chat.conversationId].unreadCount++;
        }
      }
      return acc;
    }, {});
    
    const conversationsList = Object.values(conversations).sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
    
    res.json({ conversations: conversationsList });
  } catch (error) {
    console.error('Error getting admin chats:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Health check (should be before 404 handler)
app.get('/api/health', (req, res) => {
  console.log('✅ Health check accessed');
  res.json({ status: 'ok', message: 'Backend is running', timestamp: new Date().toISOString() });
});

// Root endpoint for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'MycoTrack Backend API',
    version: '2.0.0',
    endpoints: {
      auth: [
        'POST /api/customer/register',
        'POST /api/customer/login',
        'POST /api/petani/register',
        'POST /api/petani/login',
        'POST /api/admin/login'
      ],
      products: [
        'GET /api/products',
        'GET /api/products/:id',
        'GET /api/petani/products',
        'POST /api/petani/products',
        'PUT /api/petani/products/:id',
        'DELETE /api/petani/products/:id'
      ],
      cart: [
        'GET /api/customer/cart',
        'POST /api/customer/cart',
        'PUT /api/customer/cart/:id',
        'DELETE /api/customer/cart/:id',
        'DELETE /api/customer/cart'
      ],
      orders: [
        'GET /api/customer/orders',
        'GET /api/farmer/orders',
        'GET /api/orders/:id',
        'POST /api/orders',
        'PUT /api/orders/:id/status',
        'PUT /api/orders/:id/payment'
      ],
      forum: [
        'GET /api/forum/posts',
        'GET /api/forum/posts/:id',
        'POST /api/forum/posts',
        'PUT /api/forum/posts/:id',
        'DELETE /api/forum/posts/:id',
        'POST /api/forum/posts/:id/like',
        'POST /api/forum/posts/:id/comments',
        'PUT /api/forum/posts/:postId/comments/:commentId',
        'DELETE /api/forum/posts/:postId/comments/:commentId'
      ],
      admin: [
        'GET /api/admin/users/customers',
        'GET /api/admin/users/petanis',
        'GET /api/admin/users/customers/:id',
        'GET /api/admin/users/petanis/:id',
        'PUT /api/admin/users/customers/:id',
        'PUT /api/admin/users/customers/:id/status',
        'PUT /api/admin/users/petanis/:id',
        'PUT /api/admin/users/petanis/:id/status',
        'DELETE /api/admin/users/customers/:id',
        'DELETE /api/admin/users/petanis/:id',
        'GET /api/admin/logs',
        'POST /api/admin/articles',
        'PUT /api/admin/articles/:id',
        'DELETE /api/admin/articles/:id'
      ],
      articles: [
        'GET /api/articles',
        'GET /api/articles/:id'
      ],
      chats: [
        'GET /api/customer/chats',
        'GET /api/admin/chats',
        'GET /api/chats/:conversationId/messages',
        'POST /api/chats/message',
        'PUT /api/chats/:conversationId/read'
      ],
      system: [
        'GET /api/health'
      ]
    }
  });
});

// Error handler for multer (must be after routes)
app.use((error, req, res, next) => {
  console.error('='.repeat(50));
  console.error('ERROR HANDLER TRIGGERED');
  console.error('='.repeat(50));
  console.error('Error type:', error.constructor.name);
  console.error('Error message:', error.message);
  console.error('Request path:', req.path);
  console.error('Request method:', req.method);
  console.error('Error stack:', error.stack);
  console.error('='.repeat(50));
  
  if (error instanceof multer.MulterError) {
    console.error('Multer error:', error);
    return res.status(400).json({ error: `File upload error: ${error.message}` });
  }
  if (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
  next();
});

// ========== NOTIFICATIONS ENDPOINTS ==========

// Get notifications for user
app.get('/api/notifications', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const notifications = await readJSONFile(notificationsPath);
    const userNotifications = notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json({ notifications: userNotifications, unreadCount: userNotifications.filter(n => !n.read).length });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Create notification
app.post('/api/notifications', async (req, res) => {
  try {
    const { userId, type, title, message, orderId, read = false } = req.body;
    
    if (!userId || !type || !title || !message) {
      return res.status(400).json({ error: 'userId, type, title, dan message wajib diisi' });
    }
    
    const notifications = await readJSONFile(notificationsPath);
    
    const newNotification = {
      id: `notif-${Date.now()}`,
      userId,
      type, // 'new_order', 'order_status', 'payment', etc.
      title,
      message,
      orderId: orderId || null,
      read,
      createdAt: new Date().toISOString()
    };
    
    notifications.push(newNotification);
    await writeJSONFile(notificationsPath, notifications);
    
    console.log(`✅ Notification created for user ${userId}: ${title}`);
    res.status(201).json({ message: 'Notifikasi berhasil dibuat', notification: newNotification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const notifications = await readJSONFile(notificationsPath);
    const notification = notifications.find(n => n.id === req.params.id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notifikasi tidak ditemukan' });
    }
    
    notification.read = true;
    notification.updatedAt = new Date().toISOString();
    
    await writeJSONFile(notificationsPath, notifications);
    
    res.json({ message: 'Notifikasi ditandai sebagai sudah dibaca', notification });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// 404 handler (must be last)
app.use((req, res) => {
  console.log(`❌ 404 - Endpoint not found: ${req.method} ${req.path}`);
  console.log(`   Original URL: ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Endpoint not found', 
    path: req.path,
    method: req.method,
    originalUrl: req.originalUrl,
    message: 'See GET / for all available endpoints'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(50));
  console.log('Endpoints available:');
  console.log('  POST /api/customer/register');
  console.log('  POST /api/customer/login');
  console.log('  POST /api/petani/register');
  console.log('  POST /api/petani/login');
  console.log('  POST /api/admin/login');
  console.log('  GET  /api/admin/users/customers');
  console.log('  GET  /api/admin/users/petanis');
  console.log('  GET  /api/admin/users/customers/:id');
  console.log('  GET  /api/admin/users/petanis/:id');
  console.log('  PUT  /api/admin/users/customers/:id');
  console.log('  PUT  /api/admin/users/customers/:id/status');
  console.log('  PUT  /api/admin/users/petanis/:id');
  console.log('  PUT  /api/admin/users/petanis/:id/status');
  console.log('  DELETE /api/admin/users/customers/:id');
  console.log('  DELETE /api/admin/users/petanis/:id');
  console.log('  GET  /api/admin/logs');
  console.log('  GET  /api/products');
  console.log('  GET  /api/products/:id');
  console.log('  GET  /api/petani/products');
  console.log('  POST /api/petani/products');
  console.log('  PUT  /api/petani/products/:id');
  console.log('  DELETE /api/petani/products/:id');
  console.log('  GET  /api/customer/cart');
  console.log('  POST /api/customer/cart');
  console.log('  PUT  /api/customer/cart/:id');
  console.log('  DELETE /api/customer/cart/:id');
  console.log('  GET  /api/customer/orders');
  console.log('  GET  /api/farmer/orders');
  console.log('  GET  /api/orders/:id');
  console.log('  POST /api/orders');
  console.log('  PUT  /api/orders/:id/status');
  console.log('  PUT  /api/orders/:id/payment');
  console.log('  GET  /api/forum/posts');
  console.log('  GET  /api/forum/posts/:id');
  console.log('  POST /api/forum/posts');
  console.log('  PUT  /api/forum/posts/:id');
  console.log('  DELETE /api/forum/posts/:id');
  console.log('  POST /api/forum/posts/:id/like');
  console.log('  POST /api/forum/posts/:id/comments');
  console.log('  PUT  /api/forum/posts/:postId/comments/:commentId');
  console.log('  DELETE /api/forum/posts/:postId/comments/:commentId');
  console.log('  GET  /api/health');
  console.log('='.repeat(50));
}).on('error', (err) => {
  console.error('='.repeat(50));
  console.error('❌ ERROR STARTING SERVER');
  console.error('='.repeat(50));
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    console.error('Please stop the other server or change the port.');
    console.error('To find what is using port 3000:');
    console.error('  Windows: netstat -ano | findstr :3000');
    console.error('  Mac/Linux: lsof -i :3000');
  } else {
    console.error('Error:', err.message);
  }
  console.error('='.repeat(50));
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

