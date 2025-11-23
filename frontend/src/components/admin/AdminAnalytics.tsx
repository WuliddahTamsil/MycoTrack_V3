import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, ShoppingBag, DollarSign, MapPin, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:3000/api';

interface Farmer {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected' | 'suspended';
}

interface Order {
  id: string;
  farmerId: string;
  farmerName: string;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: string;
  createdAt: string;
}

interface TopFarmer {
  id: string;
  name: string;
  revenue: number;
  orders: number;
  rating: number;
}

interface Product {
  id: string;
  category: string;
  name: string;
}

interface FarmerWithAddress extends Farmer {
  address: string;
}

export const AdminAnalytics: React.FC = () => {
  const [topFarmers, setTopFarmers] = useState<TopFarmer[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<Array<{ month: string; revenue: number; orders: number }>>([]);
  const [farmerDistribution, setFarmerDistribution] = useState<Array<{ region: string; farmers: number; percentage: number }>>([]);
  const [productCategories, setProductCategories] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalFarmers: 0,
    revenueChange: 0,
    ordersChange: 0,
    avgOrderChange: 0,
    farmersChange: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data
      const [farmersRes, ordersRes, productsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users/petanis`),
        fetch(`${API_BASE_URL}/orders`).catch(() => null),
        fetch(`${API_BASE_URL}/products`).catch(() => null)
      ]);

      if (!farmersRes.ok) throw new Error('Failed to fetch farmers');

      const farmersData = await farmersRes.json();
      const farmers: FarmerWithAddress[] = farmersData.petanis || [];

      // Get all orders
      let allOrders: Order[] = [];
      if (ordersRes && ordersRes.ok) {
        const ordersData = await ordersRes.json();
        allOrders = ordersData.orders || [];
      }

      // Get all products
      let allProducts: Product[] = [];
      if (productsRes && productsRes.ok) {
        const productsData = await productsRes.json();
        allProducts = productsData.products || [];
      }

      // Calculate monthly revenue from orders
      const monthlyData = calculateMonthlyRevenue(allOrders);
      setMonthlyRevenue(monthlyData);

      // Calculate farmer distribution by region
      const distribution = calculateFarmerDistribution(farmers);
      setFarmerDistribution(distribution);

      // Calculate product categories
      const categories = calculateProductCategories(allProducts);
      setProductCategories(categories);

      // Calculate top farmers
      const topFarmersData = calculateTopFarmers(farmers, allOrders);
      setTopFarmers(topFarmersData);

      // Calculate statistics
      const paidOrders = allOrders.filter(o => o.paymentStatus === 'paid');
      const currentMonthRevenue = monthlyData[monthlyData.length - 1]?.revenue || 0;
      const previousMonthRevenue = monthlyData[monthlyData.length - 2]?.revenue || 0;
      const currentMonthOrders = monthlyData[monthlyData.length - 1]?.orders || 0;
      const previousMonthOrders = monthlyData[monthlyData.length - 2]?.orders || 0;
      
      const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const totalOrders = paidOrders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const totalFarmers = farmers.filter(f => f.status === 'accepted').length;
      
      const revenueChange = previousMonthRevenue > 0 
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
        : 0;
      const ordersChange = previousMonthOrders > 0 
        ? ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100 
        : 0;
      
      // Calculate farmers change (this month vs last month)
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const farmersThisMonth = farmers.filter(f => 
        new Date(f.createdAt) >= currentMonth && f.status === 'accepted'
      ).length;
      const farmersLastMonth = farmers.filter(f => {
        const createdAt = new Date(f.createdAt);
        return createdAt >= lastMonth && createdAt < currentMonth && f.status === 'accepted';
      }).length;
      const farmersChange = farmersLastMonth > 0 
        ? ((farmersThisMonth - farmersLastMonth) / farmersLastMonth) * 100 
        : (farmersThisMonth > 0 ? 100 : 0);

      const avgOrderChange = revenueChange - ordersChange; // Simplified

      setStats({
        totalRevenue,
        totalOrders,
        avgOrderValue,
        totalFarmers,
        revenueChange,
        ordersChange,
        avgOrderChange,
        farmersChange
      });
    } catch (error: unknown) {
      console.error('Error fetching analytics data:', error);
      toast.error('Gagal memuat data analitik');
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyRevenue = (orders: Order[]): Array<{ month: string; revenue: number; orders: number }> => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = new Map<string, { revenue: number; orders: number }>();

    // Initialize last 12 months
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      monthlyMap.set(key, { revenue: 0, orders: 0 });
    }

    // Calculate from paid orders only
    orders.filter(o => o.paymentStatus === 'paid').forEach(order => {
      const orderDate = new Date(order.createdAt);
      const key = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
      const data = monthlyMap.get(key);
      if (data) {
        data.revenue += order.total || 0;
        data.orders += 1;
      }
    });

    // Convert to array format
    return Array.from(monthlyMap.entries())
      .map(([key, data]) => {
        const [year, month] = key.split('-').map(Number);
        return {
          month: monthNames[month],
          revenue: data.revenue,
          orders: data.orders
        };
      })
      .slice(-12); // Last 12 months
  };

  const calculateFarmerDistribution = (farmers: FarmerWithAddress[]): Array<{ region: string; farmers: number; percentage: number }> => {
    const regionMap = new Map<string, number>();
    const acceptedFarmers = farmers.filter(f => f.status === 'accepted');

    acceptedFarmers.forEach(farmer => {
      const address = (farmer.address || '').toLowerCase();
      let region = 'Lainnya';

      // Extract region from address
      if (address.includes('bandung')) region = 'Bandung';
      else if (address.includes('jakarta') || address.includes('dki')) region = 'Jakarta';
      else if (address.includes('surabaya')) region = 'Surabaya';
      else if (address.includes('yogyakarta') || address.includes('jogja')) region = 'Yogyakarta';
      else if (address.includes('semarang')) region = 'Semarang';
      else if (address.includes('medan')) region = 'Medan';
      else if (address.includes('makassar')) region = 'Makassar';
      else if (address.includes('palembang')) region = 'Palembang';
      else if (address.includes('bogor')) region = 'Bogor';
      else if (address.includes('kuningan') || address.includes('ciniru')) region = 'Kuningan';

      regionMap.set(region, (regionMap.get(region) || 0) + 1);
    });

    const total = acceptedFarmers.length;
    return Array.from(regionMap.entries())
      .map(([region, count]) => ({
        region,
        farmers: count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.farmers - a.farmers);
  };

  const calculateProductCategories = (products: Product[]): Array<{ name: string; value: number; color: string }> => {
    const categoryMap = new Map<string, number>();
    const colors = ['#FF6B35', '#FFA726', '#8B4513', '#556B2F', '#4A90E2', '#9C27B0'];

    products.forEach(product => {
      const category = product.category || 'Lainnya';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    const total = products.length;
    let colorIndex = 0;
    
    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({
        name,
        value: total > 0 ? Math.round((count / total) * 100) : 0,
        color: colors[colorIndex++ % colors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 categories
  };

  const calculateTopFarmers = (farmers: Farmer[], orders: Order[]): TopFarmer[] => {
    const farmerStats = new Map<string, { revenue: number; orders: number }>();

    // Initialize all accepted farmers
    farmers.filter(f => f.status === 'accepted').forEach(farmer => {
      farmerStats.set(farmer.id, { revenue: 0, orders: 0 });
    });

    // Calculate revenue from paid orders only
    orders.filter(o => o.paymentStatus === 'paid').forEach(order => {
      if (order.farmerId) {
        const stats = farmerStats.get(order.farmerId) || { revenue: 0, orders: 0 };
        stats.revenue += order.total || 0;
        stats.orders += 1;
        farmerStats.set(order.farmerId, stats);
      }
    });

    // Convert to array and calculate rating
    return Array.from(farmerStats.entries())
      .map(([farmerId, stats]) => {
        const farmer = farmers.find(f => f.id === farmerId);
        if (!farmer) return null;

        // Calculate rating: base 4.0 + (orders * 0.02) capped at 5.0
        const rating = Math.min(4.0 + (stats.orders * 0.02), 5.0);
        const roundedRating = Math.round(rating * 10) / 10;

        return {
          id: farmerId,
          name: farmer.name,
          revenue: stats.revenue,
          orders: stats.orders,
          rating: roundedRating
        };
      })
      .filter((farmer): farmer is TopFarmer => farmer !== null)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };


  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-60">Total Revenue</p>
                <p className="text-2xl mt-2">
                  Rp {stats.totalRevenue >= 1000000 
                    ? `${(stats.totalRevenue / 1000000).toFixed(1)}jt`
                    : `${(stats.totalRevenue / 1000).toFixed(0)}k`}
                </p>
                <p className={`text-sm mt-1 ${stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange.toFixed(1)}% vs bulan lalu
                </p>
              </div>
              <DollarSign className="h-12 w-12 opacity-20" style={{ color: 'var(--primary-orange)' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-60">Total Pesanan</p>
                <p className="text-2xl mt-2">{stats.totalOrders}</p>
                <p className={`text-sm mt-1 ${stats.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.ordersChange >= 0 ? '+' : ''}{stats.ordersChange.toFixed(1)}% vs bulan lalu
                </p>
              </div>
              <ShoppingBag className="h-12 w-12 opacity-20" style={{ color: 'var(--primary-orange)' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-60">Rata-rata Nilai Pesanan</p>
                <p className="text-2xl mt-2">
                  Rp {stats.avgOrderValue >= 1000 
                    ? `${Math.round(stats.avgOrderValue / 1000)}k`
                    : Math.round(stats.avgOrderValue)}
                </p>
                <p className={`text-sm mt-1 ${stats.avgOrderChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.avgOrderChange >= 0 ? '+' : ''}{stats.avgOrderChange.toFixed(1)}% vs bulan lalu
                </p>
              </div>
              <TrendingUp className="h-12 w-12 opacity-20" style={{ color: 'var(--primary-orange)' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-60">Total Petani</p>
                <p className="text-2xl mt-2">{stats.totalFarmers}</p>
                <p className={`text-sm mt-1 ${stats.farmersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.farmersChange >= 0 ? '+' : ''}{stats.farmersChange.toFixed(1)}% vs bulan lalu
                </p>
              </div>
              <Users className="h-12 w-12 opacity-20" style={{ color: 'var(--primary-orange)' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" style={{ color: 'var(--primary-orange)' }} />
            Tren Revenue & Pesanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#FF7A00]/30 border-t-[#FF7A00] rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-[#5A4A32]">Memuat data tren...</p>
              </div>
            </div>
          ) : monthlyRevenue.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Belum ada data tren</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'Revenue (Rp)') {
                      return [`Rp ${value.toLocaleString('id-ID')}`, 'Revenue'];
                    }
                    return [value, 'Jumlah Pesanan'];
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--primary-orange)" 
                  strokeWidth={2}
                  name="Revenue (Rp)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="orders" 
                  stroke="var(--primary-gold)" 
                  strokeWidth={2}
                  name="Jumlah Pesanan"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Farmer Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" style={{ color: 'var(--primary-orange)' }} />
              Persebaran Petani per Wilayah
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-[#FF7A00]/30 border-t-[#FF7A00] rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-[#5A4A32]">Memuat data persebaran...</p>
                </div>
              </div>
            ) : farmerDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Belum ada data persebaran petani</p>
                </div>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={farmerDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="farmers" fill="var(--primary-orange)" name="Jumlah Petani" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {farmerDistribution.map((region) => (
                    <div key={region.region} className="flex items-center justify-between text-sm">
                      <span>{region.region}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${region.percentage}%`,
                              backgroundColor: 'var(--primary-orange)'
                            }}
                          />
                        </div>
                        <span className="w-16 text-right">{region.farmers} petani</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Product Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" style={{ color: 'var(--primary-orange)' }} />
              Kategori Produk Terlaris
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-[#FF7A00]/30 border-t-[#FF7A00] rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-[#5A4A32]">Memuat data kategori...</p>
                </div>
              </div>
            ) : productCategories.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Belum ada data kategori produk</p>
                </div>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {productCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {productCategories.map((category) => (
                    <div key={category.name} className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Farmers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" style={{ color: 'var(--primary-orange)' }} />
            Top 5 Petani Berdasarkan Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-[#FF7A00]/30 border-t-[#FF7A00] rounded-full animate-spin mx-auto"></div>
              <p className="text-[#5A4A32] mt-4">Memuat data top petani...</p>
            </div>
          ) : topFarmers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada data petani dengan revenue</p>
              <p className="text-sm mt-2">Data akan muncul setelah ada pesanan yang dibayar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topFarmers.map((farmer, index) => (
                <div 
                  key={farmer.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-orange)] to-[var(--primary-gold)] text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{farmer.name}</h4>
                    <div className="flex items-center gap-4 text-sm opacity-60 mt-1">
                      <span>{farmer.orders} pesanan</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {farmer.rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#B82601]">
                      Rp {farmer.revenue >= 1000000 
                        ? `${(farmer.revenue / 1000000).toFixed(1)}jt`
                        : `${(farmer.revenue / 1000).toFixed(0)}k`}
                    </p>
                    <p className="text-sm opacity-60">Total Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
