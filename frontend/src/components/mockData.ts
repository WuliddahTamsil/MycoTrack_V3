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
    content: `Budidaya jamur kuping merupakan salah satu peluang bisnis yang menjanjikan. Artikel ini akan membahas panduan lengkap untuk pemula yang ingin memulai budidaya jamur kuping.

Persiapan Awal
Langkah pertama dalam budidaya jamur kuping adalah menyiapkan media tanam. Media tanam yang baik terdiri dari serbuk kayu, bekatul, kapur, dan air dengan perbandingan yang tepat. Pastikan semua bahan tercampur merata dan memiliki kelembaban yang sesuai.

Proses Inokulasi
Setelah media tanam siap, langkah berikutnya adalah inokulasi. Proses ini melibatkan penanaman bibit jamur ke dalam media tanam. Pastikan bibit yang digunakan berkualitas baik dan bebas dari kontaminasi.

Perawatan dan Pemeliharaan
Selama masa pertumbuhan, jamur kuping memerlukan perawatan yang telaten. Jaga suhu ruangan antara 22-28°C dan kelembaban udara sekitar 80-90%. Lakukan penyiraman secara rutin namun jangan berlebihan.

Panen
Jamur kuping biasanya siap dipanen setelah 2-3 bulan. Panen dilakukan dengan memetik jamur yang sudah cukup besar. Setelah panen pertama, biasanya akan ada panen berikutnya setiap 1-2 minggu sekali.

Dengan mengikuti panduan ini, Anda dapat memulai budidaya jamur kuping dengan lebih percaya diri. Ingat, kesabaran dan ketelatenan adalah kunci kesuksesan dalam budidaya jamur.`,
    image: 'https://images.unsplash.com/photo-1735282260417-cb781d757604?w=400',
    author: 'Dr. Agus Budiman',
    date: '2025-11-01',
    category: 'Tutorial'
  },
  {
    id: 'a2',
    title: 'Teknologi IoT dalam Budidaya Jamur Modern',
    excerpt: 'Bagaimana sensor IoT membantu meningkatkan produktivitas dan kualitas jamur kuping.',
    content: `Teknologi Internet of Things (IoT) telah merevolusi cara kita melakukan budidaya jamur. Dengan menggunakan sensor canggih, petani sekarang dapat memantau kondisi budidaya secara real-time.

Sensor Suhu dan Kelembaban
Sensor IoT dapat mengukur suhu dan kelembaban secara kontinyu. Data ini dikirim ke cloud dan dapat diakses melalui smartphone atau komputer. Dengan demikian, petani dapat segera mengetahui jika ada perubahan kondisi yang tidak diinginkan.

Otomasi Sistem
Dengan IoT, sistem penyiraman dan pengaturan suhu dapat diotomasi. Ketika sensor mendeteksi kelembaban turun di bawah ambang batas, sistem akan secara otomatis mengaktifkan penyiraman. Hal ini memastikan kondisi optimal selalu terjaga.

Analisis Data
Data yang dikumpulkan oleh sensor dapat dianalisis menggunakan machine learning untuk memberikan prediksi dan rekomendasi. Sistem dapat memprediksi waktu panen optimal dan memberikan peringatan dini jika ada potensi masalah.

Keuntungan IoT dalam Budidaya
Penggunaan IoT dalam budidaya jamur memberikan banyak keuntungan, antara lain: peningkatan produktivitas hingga 30%, pengurangan biaya operasional, dan peningkatan kualitas hasil panen. Dengan teknologi ini, budidaya jamur menjadi lebih efisien dan menguntungkan.`,
    image: 'https://images.unsplash.com/photo-1755719523098-227f4c486eb1?w=400',
    author: 'Ir. Fitri Handayani',
    date: '2025-10-28',
    category: 'Teknologi'
  },
  {
    id: 'a3',
    title: 'Mengelola Suhu dan Kelembaban Optimal untuk Jamur Kuping',
    excerpt: 'Tips praktis menjaga kondisi lingkungan ideal untuk pertumbuhan jamur kuping.',
    content: `Suhu dan kelembaban adalah dua faktor kritis dalam budidaya jamur kuping. Kondisi lingkungan yang tidak optimal dapat menyebabkan pertumbuhan jamur terhambat atau bahkan gagal panen.

Suhu Optimal
Jamur kuping tumbuh optimal pada suhu 22-28°C. Suhu yang terlalu rendah akan memperlambat pertumbuhan, sementara suhu yang terlalu tinggi dapat menyebabkan jamur layu atau mati. Gunakan termometer digital untuk memantau suhu secara akurat.

Kelembaban Ideal
Kelembaban udara yang ideal untuk jamur kuping adalah 80-90%. Kelembaban yang terlalu rendah akan membuat jamur kering, sedangkan kelembaban yang terlalu tinggi dapat menyebabkan kontaminasi. Gunakan hygrometer untuk mengukur kelembaban.

Tips Praktis
1. Pasang exhaust fan untuk sirkulasi udara yang baik
2. Gunakan humidifier jika kelembaban terlalu rendah
3. Lakukan penyiraman rutin namun jangan berlebihan
4. Monitor kondisi secara berkala menggunakan sensor IoT
5. Buat jadwal perawatan yang konsisten

Dengan menjaga suhu dan kelembaban dalam rentang optimal, Anda dapat memastikan pertumbuhan jamur kuping yang sehat dan produktif. Investasi pada alat monitoring yang baik akan sangat membantu dalam menjaga kondisi optimal ini.`,
    image: 'https://images.unsplash.com/photo-1735282260412-59db284b82ad?w=400',
    author: 'Prof. Bambang Suryadi',
    date: '2025-10-25',
    category: 'Panduan'
  },
  {
    id: 'a4',
    title: 'Strategi Pemasaran Jamur Kuping di Era Digital',
    excerpt: 'Maksimalkan penjualan jamur kuping dengan strategi marketing online yang efektif.',
    content: `Di era digital seperti sekarang, pemasaran online menjadi kunci kesuksesan bisnis budidaya jamur. Artikel ini akan membahas strategi pemasaran digital yang efektif untuk meningkatkan penjualan jamur kuping.

Media Sosial
Gunakan platform media sosial seperti Instagram, Facebook, dan TikTok untuk mempromosikan produk. Tampilkan foto-foto jamur yang menarik, proses budidaya, dan testimoni pelanggan. Konten visual yang menarik akan meningkatkan engagement dan minat pembeli.

Marketplace Online
Bergabunglah dengan marketplace online seperti Tokopedia, Shopee, atau marketplace khusus produk pertanian. Marketplace ini memiliki traffic tinggi dan dapat membantu produk Anda ditemukan oleh lebih banyak calon pembeli.

Website dan SEO
Buat website profesional untuk bisnis Anda. Optimasi website dengan SEO agar muncul di hasil pencarian Google. Konten blog tentang manfaat jamur kuping, resep masakan, dan tips budidaya dapat menarik lebih banyak pengunjung.

Email Marketing
Kumpulkan email pelanggan dan kirimkan newsletter berkala dengan informasi produk baru, promo, dan tips. Email marketing adalah cara yang efektif untuk menjaga hubungan dengan pelanggan dan meningkatkan repeat order.

Dengan menerapkan strategi pemasaran digital yang tepat, Anda dapat menjangkau pasar yang lebih luas dan meningkatkan penjualan jamur kuping secara signifikan.`,
    image: 'https://images.unsplash.com/photo-1552825897-bb5efa86eab1?w=400',
    author: 'Drs. Hendra Wijaya',
    date: '2025-10-20',
    category: 'Bisnis'
  },
  {
    id: 'a5',
    title: 'Mengatasi Hama dan Penyakit pada Jamur Kuping',
    excerpt: 'Identifikasi dan solusi praktis menghadapi masalah hama dan penyakit jamur kuping.',
    content: `Hama dan penyakit merupakan ancaman serius dalam budidaya jamur kuping. Artikel ini akan membantu Anda mengidentifikasi dan mengatasi berbagai masalah yang mungkin terjadi.

Jenis Hama Umum
1. Lalat dan serangga kecil - dapat merusak jamur dan menyebarkan penyakit
2. Tungau - menyerang media tanam dan jamur
3. Nematoda - merusak akar jamur

Penyakit yang Sering Terjadi
1. Kontaminasi bakteri - menyebabkan jamur membusuk
2. Jamur kompetitor - tumbuh lebih cepat dan mengambil nutrisi
3. Virus - menyebabkan pertumbuhan abnormal

Pencegahan
Langkah terbaik adalah pencegahan. Pastikan:
- Media tanam steril sebelum digunakan
- Ruangan budidaya bersih dan terawat
- Sirkulasi udara baik
- Kelembaban tidak berlebihan
- Bibit yang digunakan berkualitas

Pengobatan
Jika sudah terlanjur terkena hama atau penyakit:
1. Isolasi media yang terinfeksi
2. Buang bagian yang terinfeksi
3. Bersihkan ruangan dengan disinfektan
4. Perbaiki kondisi lingkungan
5. Gunakan pestisida organik jika diperlukan

Dengan pengetahuan yang tepat tentang hama dan penyakit, Anda dapat mencegah dan mengatasi masalah sebelum menjadi lebih serius.`,
    image: 'https://images.unsplash.com/photo-1735282260417-cb781d757604?w=400',
    author: 'Dr. Wati Susanti',
    date: '2025-10-15',
    category: 'Perawatan'
  },
  {
    id: 'a6',
    title: 'Peluang Ekspor Jamur Kuping Indonesia',
    excerpt: 'Potensi pasar ekspor jamur kuping dan cara memenuhi standar internasional.',
    content: `Indonesia memiliki potensi besar untuk menjadi eksportir jamur kuping terkemuka. Dengan iklim tropis yang mendukung dan sumber daya alam yang melimpah, produk jamur kuping Indonesia memiliki kualitas yang kompetitif di pasar internasional.

Pasar Ekspor Potensial
Negara-negara seperti China, Jepang, Korea Selatan, dan negara-negara Eropa memiliki permintaan tinggi terhadap jamur kuping. Produk Indonesia memiliki keunggulan karena kualitasnya yang baik dan harga yang kompetitif.

Standar Internasional
Untuk dapat mengekspor, produk harus memenuhi standar internasional:
1. Sertifikasi organik (jika memproduksi jamur organik)
2. Standar keamanan pangan (HACCP, ISO 22000)
3. Standar kualitas produk
4. Dokumentasi yang lengkap

Persiapan Ekspor
1. Pelajari regulasi negara tujuan
2. Dapatkan sertifikasi yang diperlukan
3. Bangun kemitraan dengan eksportir terpercaya
4. Investasi pada teknologi untuk meningkatkan kualitas
5. Bangun brand yang kuat

Keuntungan Ekspor
Ekspor jamur kuping dapat memberikan keuntungan yang signifikan:
- Harga jual lebih tinggi
- Pasar yang lebih luas
- Stabilitas permintaan
- Meningkatkan reputasi produk Indonesia

Dengan persiapan yang matang dan kualitas produk yang baik, pelaku usaha budidaya jamur kuping Indonesia dapat memanfaatkan peluang ekspor ini untuk mengembangkan bisnis mereka.`,
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
