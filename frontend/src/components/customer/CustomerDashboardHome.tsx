import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Package, ShoppingCart, Wallet, FileText, Headphones, 
  Store, ArrowRight, Clock, TrendingUp, Star, Eye,
  Loader2, CheckCircle2, Truck, XCircle
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:3000/api';

interface Order {
  id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  total: number;
  products: Array<{ name: string; quantity: number }>;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
  category: string;
  farmerName: string;
  stock: number;
  unit: string;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
}

interface CustomerDashboardHomeProps {
  onNavigate: (page: string) => void;
  onArticleClick: (articleId: string) => void;
}

export const CustomerDashboardHome: React.FC<CustomerDashboardHomeProps> = ({ 
  onNavigate, 
  onArticleClick 
}) => {
  const { user } = useAuth();
  const { getTotalItems } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [ordersRes, productsRes, articlesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/customer/orders?customerId=${user?.id}`).catch(() => null),
        fetch(`${API_BASE_URL}/products`).catch(() => null),
        fetch(`${API_BASE_URL}/articles`).catch(() => null)
      ]);

      if (ordersRes && ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }

      if (productsRes && productsRes.ok) {
        const productsData = await productsRes.json();
        // Get top products (by stock or random for recommendation)
        setProducts((productsData.products || []).slice(0, 6));
      }

      if (articlesRes && articlesRes.ok) {
        const articlesData = await articlesRes.json();
        setArticles((articlesData.articles || []).slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeOrders = orders.filter(o => 
    ['pending', 'processing', 'shipped'].includes(o.status)
  );
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return CheckCircle2;
      case 'shipped':
        return Truck;
      case 'processing':
        return Package;
      case 'cancelled':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'processing':
        return 'Diproses';
      case 'shipped':
        return 'Dikirim';
      case 'delivered':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#FF7A00]/10 via-[#FF7A00]/5 to-transparent rounded-2xl p-6 border-2 border-[#FF7A00]/20">
        <h1 className="text-3xl font-bold text-[#B82601] mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 font-medium">
          Selamat berbelanja jamur kuping berkualitas di MycoTrack
        </p>
      </div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md border-2 border-[#FF7A00]/10 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Total Pesanan</p>
                <p className="text-2xl font-bold text-[#B82601]">{totalOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-2 border-[#FF7A00]/10 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Pesanan Aktif</p>
                <p className="text-2xl font-bold text-[#B82601]">{activeOrders.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-2 border-[#FF7A00]/10 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Saldo Saya</p>
                <p className="text-2xl font-bold text-[#B82601]">Rp {(user?.balance || 0).toLocaleString('id-ID')}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-2 border-[#FF7A00]/10 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Keranjang</p>
                <p className="text-2xl font-bold text-[#B82601]">{getTotalItems()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Pesanan Terbaru & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Status Pesanan Terbaru */}
        <Card className="lg:col-span-2 shadow-lg border-2 border-[#FF7A00]/10">
          <CardHeader className="bg-gradient-to-r from-[#FF7A00]/10 to-transparent border-b border-[#FF7A00]/20">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-[#2D2416]">
                <Package className="h-6 w-6 text-[#FF7A00]" />
                Status Pesanan Terbaru
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('orders')}
                className="text-[#FF7A00] hover:text-[#B82601]"
              >
                Lihat Semua
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#FF7A00]" />
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 text-sm">Tidak ada pesanan aktif</p>
                <Button
                  onClick={() => onNavigate('marketplace')}
                  className="mt-4 gradient-autumn-cta text-white"
                >
                  Mulai Belanja
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeOrders.slice(0, 3).map((order) => {
                  const StatusIcon = getStatusIcon(order.status);
                  return (
                    <div
                      key={order.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => onNavigate('orders')}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        order.status === 'delivered' ? 'bg-green-100' :
                        order.status === 'shipped' ? 'bg-purple-100' :
                        order.status === 'processing' ? 'bg-blue-100' :
                        'bg-yellow-100'
                      }`}>
                        <StatusIcon className={`h-5 w-5 ${
                          order.status === 'delivered' ? 'text-green-600' :
                          order.status === 'shipped' ? 'text-purple-600' :
                          order.status === 'processing' ? 'text-blue-600' :
                          'text-yellow-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-[#2D2416]">
                          {order.products[0]?.name || 'Pesanan'} {order.products.length > 1 && `+${order.products.length - 1} lainnya`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                        <p className="text-sm font-semibold text-[#FF7A00] mt-1">
                          Rp {order.total.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-lg border-2 border-[#FF7A00]/10">
          <CardHeader className="bg-gradient-to-r from-[#FF7A00]/10 to-transparent border-b border-[#FF7A00]/20">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-[#2D2416]">
              <TrendingUp className="h-6 w-6 text-[#FF7A00]" />
              Aksi Cepat
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <Button
              onClick={() => onNavigate('marketplace')}
              variant="outline"
              className="w-full justify-start border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white"
            >
              <Store className="h-4 w-4 mr-2" />
              Lihat Semua Produk
            </Button>
            <Button
              onClick={() => onNavigate('cart')}
              variant="outline"
              className="w-full justify-start border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Lihat Keranjang
            </Button>
            <Button
              onClick={() => onNavigate('customer-service')}
              variant="outline"
              className="w-full justify-start border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white"
            >
              <Headphones className="h-4 w-4 mr-2" />
              Hubungi Customer Service
            </Button>
            <Button
              onClick={() => onNavigate('orders')}
              variant="outline"
              className="w-full justify-start border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white"
            >
              <Package className="h-4 w-4 mr-2" />
              Lihat Riwayat Pesanan
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Rekomendasi Produk */}
      <Card className="shadow-lg border-2 border-[#FF7A00]/10">
        <CardHeader className="bg-gradient-to-r from-[#FF7A00]/10 to-transparent border-b border-[#FF7A00]/20">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-[#2D2416]">
              <Star className="h-6 w-6 text-[#FF7A00]" />
              Rekomendasi Produk
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('marketplace')}
              className="text-[#FF7A00] hover:text-[#B82601]"
            >
              Lihat Semua
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#FF7A00]" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Belum ada produk tersedia
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="autumn-card autumn-card-hover border-[#FF7A00]/10 overflow-hidden cursor-pointer"
                  onClick={() => onNavigate('marketplace')}
                >
                  <div className="relative overflow-hidden group">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <CardContent className="p-4">
                    <Badge className="mb-2 gradient-autumn-cta text-white text-xs">
                      {product.category}
                    </Badge>
                    <h3 className="font-bold text-sm text-[#B82601] mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">{product.farmerName}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-[#FF7A00]">
                        Rp {product.price.toLocaleString('id-ID')}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        Stok: {product.stock}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Artikel Terbaru */}
      <Card className="shadow-lg border-2 border-[#FF7A00]/10">
        <CardHeader className="bg-gradient-to-r from-[#FF7A00]/10 to-transparent border-b border-[#FF7A00]/20">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-[#2D2416]">
              <FileText className="h-6 w-6 text-[#FF7A00]" />
              Artikel Terbaru
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('articles')}
              className="text-[#FF7A00] hover:text-[#B82601]"
            >
              Lihat Semua
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#FF7A00]" />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Belum ada artikel tersedia
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {articles.map((article) => (
                <Card
                  key={article.id}
                  className="autumn-card autumn-card-hover border-[#FF7A00]/10 overflow-hidden cursor-pointer"
                  onClick={() => onArticleClick(article.id)}
                >
                  <div className="relative overflow-hidden group">
                    <ImageWithFallback
                      src={article.image}
                      alt={article.title}
                      className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <Badge className="absolute top-2 left-2 gradient-autumn-cta text-white text-xs">
                      {article.category}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-sm text-[#B82601] mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {article.excerpt}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(article.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

