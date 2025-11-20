import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { StatCard } from '../shared/StatCard';
import { 
  Users, ShoppingCart, DollarSign, Package, FileText, MessageCircle, 
  TrendingUp, Clock, UserPlus, Plus, FilePlus, CheckCircle2, Eye,
  BarChart3, Activity, Zap
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
const API_BASE_URL = 'http://localhost:3000/api';

interface AdminHomeProps {
  onNavigate?: (page: string) => void;
}

interface Farmer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  status: 'pending' | 'accepted' | 'rejected' | 'suspended';
  createdAt: string;
  shop?: {
    name: string;
    description: string;
    photo?: string;
  };
  balance?: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  status: 'pending' | 'accepted' | 'rejected' | 'suspended';
  createdAt: string;
  balance?: number;
}

interface Order {
  id: string;
  customerId: string;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: string;
  createdAt: string;
}

interface ActivityItem {
  id: string;
  type: 'customer' | 'farmer' | 'product' | 'order' | 'article' | 'chat';
  title: string;
  description: string;
  timestamp: string;
  icon: any;
  color: string;
}

export const AdminHome: React.FC<AdminHomeProps> = ({ onNavigate }) => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [farmersRes, customersRes, ordersRes, productsRes, articlesRes, chatsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users/petanis`),
        fetch(`${API_BASE_URL}/admin/users/customers`),
        fetch(`${API_BASE_URL}/orders`).catch(() => null),
        fetch(`${API_BASE_URL}/products`).catch(() => null),
        fetch(`${API_BASE_URL}/articles`).catch(() => null),
        fetch(`${API_BASE_URL}/admin/chats`).catch(() => null)
      ]);

      if (!farmersRes.ok || !customersRes.ok) throw new Error('Failed to fetch data');

      const farmersData = await farmersRes.json();
      const customersData = await customersRes.json();
      
      setFarmers(farmersData.petanis || []);
      setCustomers(customersData.customers || []);

      if (ordersRes && ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }

      if (productsRes && productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products || []);
      }

      if (articlesRes && articlesRes.ok) {
        const articlesData = await articlesRes.json();
        setArticles(articlesData.articles || []);
      }

      if (chatsRes && chatsRes.ok) {
        const chatsData = await chatsRes.json();
        setChats(chatsData.conversations || []);
      }

      // Generate activities
      generateActivities();
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const generateActivities = () => {
    const activityList: ActivityItem[] = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Recent customers
    customers
      .filter(c => new Date(c.createdAt) >= today)
      .slice(0, 3)
      .forEach(c => {
        activityList.push({
          id: `customer-${c.id}`,
          type: 'customer',
          title: 'Customer Baru',
          description: `${c.name} mendaftar`,
          timestamp: c.createdAt,
          icon: UserPlus,
          color: 'text-blue-600'
        });
      });

    // Recent farmers
    farmers
      .filter(f => new Date(f.createdAt) >= today)
      .slice(0, 3)
      .forEach(f => {
        activityList.push({
          id: `farmer-${f.id}`,
          type: 'farmer',
          title: 'Petani Baru',
          description: `${f.name} mendaftar`,
          timestamp: f.createdAt,
          icon: UserPlus,
          color: 'text-green-600'
        });
      });

    // Recent orders
    orders
      .filter(o => new Date(o.createdAt) >= today)
      .slice(0, 3)
      .forEach(o => {
        activityList.push({
          id: `order-${o.id}`,
          type: 'order',
          title: 'Transaksi Baru',
          description: `Order senilai Rp ${o.total.toLocaleString('id-ID')}`,
          timestamp: o.createdAt,
          icon: ShoppingCart,
          color: 'text-purple-600'
        });
      });

    // Recent articles
    articles
      .slice(0, 2)
      .forEach(a => {
        activityList.push({
          id: `article-${a.id}`,
          type: 'article',
          title: 'Artikel Baru',
          description: a.title,
          timestamp: a.createdAt || a.date,
          icon: FileText,
          color: 'text-orange-600'
        });
      });

    // Sort by timestamp
    activityList.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setActivities(activityList.slice(0, 10));
  };

  // Calculate statistics
  const totalFarmers = farmers.length;
  const totalCustomers = customers.length;
  const totalProducts = products.length;
  const totalArticles = articles.length;
  const totalChats = chats.length;
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const newFarmersThisMonth = farmers.filter(f => 
    new Date(f.createdAt) >= startOfMonth
  ).length;
  
  const newCustomersThisMonth = customers.filter(c => 
    new Date(c.createdAt) >= startOfMonth
  ).length;

  const todayOrders = orders.filter(o => 
    new Date(o.createdAt) >= startOfToday
  );
  const todayRevenue = todayOrders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);
  const todayOrdersCount = todayOrders.length;

  const acceptedFarmers = farmers.filter(f => f.status === 'accepted');
  const pendingFarmers = farmers.filter(f => f.status === 'pending').sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Chart data - Weekly sales
  const weeklySalesData = (() => {
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const data = days.map((day, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= dayStart && orderDate < dayEnd && o.paymentStatus === 'paid';
      });
      
      return {
        day,
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
        orders: dayOrders.length
      };
    });
    return data;
  })();

  // Chart data - User activity
  const userActivityData = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const last6Months = months.slice(-6);
    
    return last6Months.map((month, index) => {
      const monthIndex = months.indexOf(month);
      const monthStart = new Date(now.getFullYear(), monthIndex, 1);
      const monthEnd = new Date(now.getFullYear(), monthIndex + 1, 1);
      
      const monthCustomers = customers.filter(c => {
        const date = new Date(c.createdAt);
        return date >= monthStart && date < monthEnd;
      }).length;
      
      const monthFarmers = farmers.filter(f => {
        const date = new Date(f.createdAt);
        return date >= monthStart && date < monthEnd;
      }).length;
      
      return {
        month,
        customers: monthCustomers,
        farmers: monthFarmers
      };
    });
  })();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#FF7A00]/10 via-[#FF7A00]/5 to-transparent rounded-2xl p-6 border-2 border-[#FF7A00]/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#B82601] mb-2">
              Selamat Datang, Admin! 👋
            </h1>
            <p className="text-gray-600 font-medium mb-4">
              Ringkasan aktivitas hari ini
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Order Masuk</p>
                    <p className="text-xl font-bold text-[#2D2416]">{todayOrdersCount}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Pendapatan Hari Ini</p>
                    <p className="text-xl font-bold text-[#2D2416]">Rp {todayRevenue.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Pengguna Baru</p>
                    <p className="text-xl font-bold text-[#2D2416]">
                      {customers.filter(c => new Date(c.createdAt) >= startOfToday).length + 
                       farmers.filter(f => new Date(f.createdAt) >= startOfToday).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div>
        <h2 className="text-xl font-bold text-[#2D2416] mb-4 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-[#FF7A00]" />
          Ringkasan Sistem
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Customer"
            value={totalCustomers}
            icon={Users}
            iconColor="var(--primary-orange)"
            trend={{ 
              value: `${newCustomersThisMonth} customer baru bulan ini`, 
              isPositive: newCustomersThisMonth > 0 
            }}
          />
          <StatCard
            title="Total Petani"
            value={totalFarmers}
            icon={Users}
            iconColor="var(--primary-gold)"
            trend={{ 
              value: `${newFarmersThisMonth} petani baru bulan ini`, 
              isPositive: newFarmersThisMonth > 0 
            }}
          />
          <StatCard
            title="Total Produk"
            value={totalProducts}
            icon={Package}
            iconColor="var(--secondary-olive)"
            trend={{ 
              value: `${acceptedFarmers.length} petani aktif`, 
              isPositive: true 
            }}
          />
          <StatCard
            title="Total Transaksi"
            value={orders.length}
            icon={ShoppingCart}
            iconColor="var(--primary-orange)"
            trend={{ 
              value: `${todayOrdersCount} transaksi hari ini`, 
              isPositive: todayOrdersCount > 0 
            }}
          />
          <StatCard
            title="Jumlah Artikel"
            value={totalArticles}
            icon={FileText}
            iconColor="var(--primary-gold)"
            trend={{ 
              value: 'Konten edukasi', 
              isPositive: true 
            }}
          />
          <StatCard
            title="Chat Customer Service"
            value={totalChats}
            icon={MessageCircle}
            iconColor="var(--secondary-olive)"
            trend={{ 
              value: 'Percakapan aktif', 
              isPositive: true 
            }}
          />
        </div>
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2 shadow-lg border-2 border-[#FF7A00]/10">
          <CardHeader className="bg-gradient-to-r from-[#FF7A00]/10 to-transparent border-b border-[#FF7A00]/20">
            <CardTitle className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-[#FF7A00]" />
              <span className="text-xl font-bold text-[#2D2416]">Penjualan Mingguan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#FF7A00" name="Pendapatan (Rp)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="orders" fill="#E8A600" name="Jumlah Order" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-lg border-2 border-[#FF7A00]/10">
          <CardHeader className="bg-gradient-to-r from-[#FF7A00]/10 to-transparent border-b border-[#FF7A00]/20">
            <CardTitle className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-[#FF7A00]" />
              <span className="text-xl font-bold text-[#2D2416]">Aksi Cepat</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <Button
              onClick={() => onNavigate?.('content')}
              className="w-full justify-start bg-gradient-to-r from-[#FF7A00] to-[#E8A600] text-white hover:shadow-lg transition-all"
            >
              <FilePlus className="h-4 w-4 mr-2" />
              Tambah Artikel
            </Button>
            <Button
              onClick={() => onNavigate?.('user-management')}
              variant="outline"
              className="w-full justify-start border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve User
            </Button>
            <Button
              onClick={() => onNavigate?.('customer-service')}
              variant="outline"
              className="w-full justify-start border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Kelola Customer Service
            </Button>
            <Button
              onClick={() => onNavigate?.('analytics')}
              variant="outline"
              className="w-full justify-start border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              Lihat Analitik
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* User Activity Chart and Activity Timeline */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* User Activity Chart */}
        <Card className="lg:col-span-2 shadow-lg border-2 border-[#FF7A00]/10">
          <CardHeader className="bg-gradient-to-r from-[#FF7A00]/10 to-transparent border-b border-[#FF7A00]/20">
            <CardTitle className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-[#FF7A00]" />
              <span className="text-xl font-bold text-[#2D2416]">Aktivitas User</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="customers" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Customer Baru"
                  dot={{ fill: '#3B82F6', r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="farmers" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Petani Baru"
                  dot={{ fill: '#10B981', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="shadow-lg border-2 border-[#FF7A00]/10">
          <CardHeader className="bg-gradient-to-r from-[#FF7A00]/10 to-transparent border-b border-[#FF7A00]/20">
            <CardTitle className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-[#FF7A00]" />
              <span className="text-xl font-bold text-[#2D2416]">Aktivitas Terkini</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Belum ada aktivitas hari ini</p>
                </div>
              ) : (
                activities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="relative">
                      {index !== activities.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full bg-white border-2 border-[#FF7A00]/20 flex items-center justify-center flex-shrink-0 z-10 ${activity.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-semibold text-sm text-[#2D2416]">{activity.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(activity.timestamp).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Farmer Activity Table */}
      <Card className="shadow-lg border-2 border-[#FF7A00]/10">
        <CardHeader className="bg-gradient-to-r from-[#FF7A00]/10 to-transparent border-b border-[#FF7A00]/20">
          <CardTitle className="text-xl font-bold text-[#2D2416]">Aktivitas Petani</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-[#FF7A00]/30 border-t-[#FF7A00] rounded-full animate-spin mx-auto"></div>
              <p className="text-[#5A4A32] mt-4 font-medium">Memuat data...</p>
            </div>
          ) : farmers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Tidak ada data petani
            </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-bold">Nama Petani</TableHead>
                  <TableHead className="font-bold">Email</TableHead>
                  <TableHead className="font-bold">Alamat</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Toko</TableHead>
                  <TableHead className="font-bold">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {farmers.map((farmer) => (
                  <TableRow key={farmer.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium">{farmer.name}</TableCell>
                      <TableCell>{farmer.email}</TableCell>
                      <TableCell className="max-w-xs truncate">{farmer.address}</TableCell>
                    <TableCell>
                        <Badge className={
                          farmer.status === 'accepted' 
                            ? 'bg-green-100 text-green-800 font-semibold' 
                            : farmer.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 font-semibold'
                            : farmer.status === 'rejected'
                            ? 'bg-red-100 text-red-800 font-semibold'
                            : 'bg-gray-100 text-gray-800 font-semibold'
                        }>
                          {farmer.status === 'accepted' ? 'Aktif' : 
                           farmer.status === 'pending' ? 'Pending' :
                           farmer.status === 'rejected' ? 'Ditolak' : 'Ditangguhkan'}
                      </Badge>
                    </TableCell>
                      <TableCell>{farmer.shop?.name || '-'}</TableCell>
                      <TableCell className="font-semibold">Rp {(farmer.balance || 0).toLocaleString('id-ID')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-2 border-[#FF7A00]/10">
          <CardHeader className="bg-gradient-to-r from-[#FF7A00]/10 to-transparent border-b border-[#FF7A00]/20">
            <CardTitle className="text-xl font-bold text-[#2D2416]">Petani Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-[#FF7A00]/30 border-t-[#FF7A00] rounded-full animate-spin mx-auto"></div>
              </div>
            ) : acceptedFarmers.length === 0 ? (
              <p style={{ color: 'var(--neutral-gray)' }}>
                Tidak ada petani aktif saat ini
              </p>
            ) : (
            <div className="space-y-4">
                {acceptedFarmers.slice(0, 5).map((farmer) => (
                <div key={farmer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#E8A600] text-white flex items-center justify-center font-bold shadow-md">
                      {farmer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D2416]">{farmer.name}</p>
                      <p className="text-sm text-gray-600">
                          {farmer.shop?.name || farmer.address}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 font-semibold">
                      Aktif
                  </Badge>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2 border-[#FF7A00]/10">
          <CardHeader className="bg-gradient-to-r from-[#FF7A00]/10 to-transparent border-b border-[#FF7A00]/20">
            <CardTitle className="text-xl font-bold text-[#2D2416]">Pengajuan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-[#FF7A00]/30 border-t-[#FF7A00] rounded-full animate-spin mx-auto"></div>
              </div>
            ) : pendingFarmers.length === 0 ? (
            <p style={{ color: 'var(--neutral-gray)' }}>
              Tidak ada pengajuan petani baru saat ini
            </p>
            ) : (
              <div className="space-y-4">
                {pendingFarmers.slice(0, 5).map((farmer) => (
                  <div key={farmer.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border-2 border-yellow-200 hover:bg-yellow-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-yellow-200 text-yellow-800 flex items-center justify-center font-bold shadow-md">
                        {farmer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#2D2416]">{farmer.name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(farmer.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 font-semibold">
                      Pending
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
