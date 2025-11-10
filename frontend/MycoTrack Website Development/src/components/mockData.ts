// Mock data for MycoTrack platform

export interface Product {
  id: string;
  farmerId: string;
  farmerName: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  image: string;
  category: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  category: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  farmerId: string;
  farmerName: string;
  products: { productId: string; name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
}

export interface SensorData {
  id: string;
  farmerId: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  phase: string;
  note?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'topup' | 'withdrawal' | 'purchase' | 'sale' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
  balance: number;
}

export interface Farmer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  status: 'online' | 'offline';
  totalSales: number;
  totalProducts: number;
  joinedAt: string;
}

// Mock Products
export const mockProducts: Product[] = [
  {
    id: 'p1',
    farmerId: 'f1',
    farmerName: 'Budi Santoso',
    name: 'Jamur Kuping Segar Premium',
    description: 'Jamur kuping segar kualitas premium, dipanen pagi hari',
    price: 45000,
    stock: 50,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1552825897-bb5efa86eab1?w=400',
    category: 'Segar'
  },
  {
    id: 'p2',
    farmerId: 'f2',
    farmerName: 'Siti Rahayu',
    name: 'Jamur Kuping Kering',
    description: 'Jamur kuping kering, tahan lama, cocok untuk masakan',
    price: 85000,
    stock: 30,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1552825897-bb5efa86eab1?w=400',
    category: 'Kering'
  },
  {
    id: 'p3',
    farmerId: 'f1',
    farmerName: 'Budi Santoso',
    name: 'Jamur Kuping Organik',
    description: 'Budidaya organik tanpa pestisida',
    price: 65000,
    stock: 25,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1552825897-bb5efa86eab1?w=400',
    category: 'Organik'
  },
  {
    id: 'p4',
    farmerId: 'f3',
    farmerName: 'Ahmad Yani',
    name: 'Paket Jamur Kuping 5kg',
    description: 'Paket hemat jamur kuping untuk kebutuhan usaha',
    price: 200000,
    stock: 15,
    unit: 'paket',
    image: 'https://images.unsplash.com/photo-1552825897-bb5efa86eab1?w=400',
    category: 'Paket'
  },
  {
    id: 'p5',
    farmerId: 'f2',
    farmerName: 'Siti Rahayu',
    name: 'Jamur Kuping Grade A',
    description: 'Jamur kuping grade A untuk ekspor',
    price: 95000,
    stock: 20,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1552825897-bb5efa86eab1?w=400',
    category: 'Premium'
  },
  {
    id: 'p6',
    farmerId: 'f3',
    farmerName: 'Ahmad Yani',
    name: 'Jamur Kuping Setengah Kering',
    description: 'Jamur kuping setengah kering, praktis untuk masakan',
    price: 60000,
    stock: 40,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1552825897-bb5efa86eab1?w=400',
    category: 'Setengah Kering'
  }
];

// Mock Articles
export const mockArticles: Article[] = [
  {
    id: 'a1',
    title: 'Panduan Lengkap Budidaya Jamur Kuping untuk Pemula',
    excerpt: 'Pelajari langkah-langkah mudah memulai budidaya jamur kuping dari nol hingga panen pertama.',
    content: 'Artikel lengkap tentang budidaya jamur kuping...',
    image: 'https://images.unsplash.com/photo-1735282260417-cb781d757604?w=400',
    author: 'Dr. Agus Budiman',
    date: '2025-11-01',
    category: 'Tutorial'
  },
  {
    id: 'a2',
    title: 'Teknologi IoT dalam Budidaya Jamur Modern',
    excerpt: 'Bagaimana sensor IoT membantu meningkatkan produktivitas dan kualitas jamur kuping.',
    content: 'IoT mengubah cara budidaya jamur...',
    image: 'https://images.unsplash.com/photo-1755719523098-227f4c486eb1?w=400',
    author: 'Ir. Fitri Handayani',
    date: '2025-10-28',
    category: 'Teknologi'
  },
  {
    id: 'a3',
    title: 'Mengelola Suhu dan Kelembaban Optimal untuk Jamur Kuping',
    excerpt: 'Tips praktis menjaga kondisi lingkungan ideal untuk pertumbuhan jamur kuping.',
    content: 'Suhu dan kelembaban adalah faktor kunci...',
    image: 'https://images.unsplash.com/photo-1735282260412-59db284b82ad?w=400',
    author: 'Prof. Bambang Suryadi',
    date: '2025-10-25',
    category: 'Panduan'
  },
  {
    id: 'a4',
    title: 'Strategi Pemasaran Jamur Kuping di Era Digital',
    excerpt: 'Maksimalkan penjualan jamur kuping dengan strategi marketing online yang efektif.',
    content: 'Di era digital, pemasaran online sangat penting...',
    image: 'https://images.unsplash.com/photo-1552825897-bb5efa86eab1?w=400',
    author: 'Drs. Hendra Wijaya',
    date: '2025-10-20',
    category: 'Bisnis'
  },
  {
    id: 'a5',
    title: 'Mengatasi Hama dan Penyakit pada Jamur Kuping',
    excerpt: 'Identifikasi dan solusi praktis menghadapi masalah hama dan penyakit jamur kuping.',
    content: 'Hama dan penyakit bisa menghancurkan panen...',
    image: 'https://images.unsplash.com/photo-1735282260417-cb781d757604?w=400',
    author: 'Dr. Wati Susanti',
    date: '2025-10-15',
    category: 'Perawatan'
  },
  {
    id: 'a6',
    title: 'Peluang Ekspor Jamur Kuping Indonesia',
    excerpt: 'Potensi pasar ekspor jamur kuping dan cara memenuhi standar internasional.',
    content: 'Indonesia memiliki peluang besar di pasar ekspor...',
    image: 'https://images.unsplash.com/photo-1735282260412-59db284b82ad?w=400',
    author: 'Ir. Yusuf Rahman',
    date: '2025-10-10',
    category: 'Bisnis'
  }
];

// Mock Farmers
export const mockFarmers: Farmer[] = [
  {
    id: 'f1',
    name: 'Budi Santoso',
    email: 'budi@mycotrack.com',
    phone: '081234567890',
    location: 'Bandung, Jawa Barat',
    status: 'online',
    totalSales: 15000000,
    totalProducts: 3,
    joinedAt: '2025-01-15'
  },
  {
    id: 'f2',
    name: 'Siti Rahayu',
    email: 'siti@mycotrack.com',
    phone: '081234567891',
    location: 'Bogor, Jawa Barat',
    status: 'online',
    totalSales: 12500000,
    totalProducts: 2,
    joinedAt: '2025-02-20'
  },
  {
    id: 'f3',
    name: 'Ahmad Yani',
    email: 'ahmad@mycotrack.com',
    phone: '081234567892',
    location: 'Malang, Jawa Timur',
    status: 'offline',
    totalSales: 8000000,
    totalProducts: 2,
    joinedAt: '2025-03-10'
  }
];

// Generate mock sensor data
export const generateMockSensorData = (farmerId: string, days: number = 7): SensorData[] => {
  const data: SensorData[] = [];
  const now = new Date();
  
  for (let i = days * 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      id: `sd${i}`,
      farmerId,
      timestamp: timestamp.toISOString(),
      temperature: 22 + Math.random() * 6, // 22-28°C
      humidity: 75 + Math.random() * 15, // 75-90%
      phase: i % 168 < 48 ? 'Inokulasi' : i % 168 < 96 ? 'Inkubasi' : i % 168 < 144 ? 'Pertumbuhan' : 'Panen'
    });
  }
  
  return data;
};

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 'o1',
    customerId: 'c1',
    customerName: 'John Doe',
    farmerId: 'f1',
    farmerName: 'Budi Santoso',
    products: [
      { productId: 'p1', name: 'Jamur Kuping Segar Premium', quantity: 10, price: 45000 }
    ],
    total: 450000,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'Saldo MycoTrack',
    shippingAddress: 'Jl. Sudirman No. 123, Jakarta',
    createdAt: '2025-10-30T10:00:00Z'
  },
  {
    id: 'o2',
    customerId: 'c2',
    customerName: 'Jane Smith',
    farmerId: 'f2',
    farmerName: 'Siti Rahayu',
    products: [
      { productId: 'p2', name: 'Jamur Kuping Kering', quantity: 5, price: 85000 }
    ],
    total: 425000,
    status: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'QRIS',
    shippingAddress: 'Jl. Thamrin No. 456, Jakarta',
    createdAt: '2025-11-01T14:30:00Z'
  },
  {
    id: 'o3',
    customerId: 'c1',
    customerName: 'John Doe',
    farmerId: 'f1',
    farmerName: 'Budi Santoso',
    products: [
      { productId: 'p3', name: 'Jamur Kuping Organik', quantity: 8, price: 65000 }
    ],
    total: 520000,
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'Saldo MycoTrack',
    shippingAddress: 'Jl. Sudirman No. 123, Jakarta',
    createdAt: '2025-11-03T09:15:00Z'
  }
];

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: 't1',
    userId: 'c1',
    type: 'topup',
    amount: 1000000,
    status: 'completed',
    description: 'Top up via QRIS',
    createdAt: '2025-10-25T08:00:00Z',
    balance: 1000000
  },
  {
    id: 't2',
    userId: 'c1',
    type: 'purchase',
    amount: -450000,
    status: 'completed',
    description: 'Pembelian Jamur Kuping Segar Premium',
    createdAt: '2025-10-30T10:00:00Z',
    balance: 550000
  },
  {
    id: 't3',
    userId: 'f1',
    type: 'sale',
    amount: 450000,
    status: 'completed',
    description: 'Penjualan ke John Doe',
    createdAt: '2025-10-30T10:00:00Z',
    balance: 450000
  }
];
