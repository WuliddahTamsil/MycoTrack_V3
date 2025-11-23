import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  ArrowUpDown, Eye, Package, Search, Filter, TrendingUp, DollarSign, 
  Clock, CheckCircle2, XCircle, Truck, ShoppingBag, MapPin,
  Calendar, User, Store, ArrowRight
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { OrderTracking } from '../shared/OrderTracking';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:3000/api';

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  farmerId: string;
  farmerName: string;
  products: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  shippingAddress: string;
  tracking?: Array<{
    status: string;
    message: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const CustomerOrders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user?.id]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/customer/orders?customerId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Gagal memuat data pesanan');
    } finally {
      setLoading(false);
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'processing':
        return Package;
      case 'shipped':
        return Truck;
      case 'delivered':
        return CheckCircle2;
      case 'cancelled':
        return XCircle;
      default:
        return Package;
    }
  };

  // Filter orders
  const filteredOrders = sortedOrders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.products.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalSpent: orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0),
    pendingPayment: orders.filter(o => o.paymentStatus === 'pending').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#B82601] mb-2">Pesanan Saya</h2>
          <p className="text-gray-600">
            Riwayat pembelian dan status pesanan Anda
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">Total Pesanan</p>
                <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-green-700">Rp {stats.totalSpent.toLocaleString('id-ID')}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">Dalam Pengiriman</p>
                <p className="text-2xl font-bold text-purple-700">{stats.shipped}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">Pembayaran Tertunda</p>
                <p className="text-2xl font-bold text-orange-700">{stats.pendingPayment}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-2 border-[#FF7A00]/20 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari pesanan, penjual, atau produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2 border-gray-200 focus:border-[#FF7A00]"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] border-2">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status Pesanan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="processing">Diproses</SelectItem>
                  <SelectItem value="shipped">Dikirim</SelectItem>
                  <SelectItem value="delivered">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-[150px] border-2">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status Pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Pembayaran</SelectItem>
                  <SelectItem value="paid">Lunas</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="failed">Gagal</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="border-2"
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {sortOrder === 'asc' ? 'Terlama' : 'Terbaru'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Grid */}
      {loading ? (
        <Card className="border-2 border-[#FF7A00]/20">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#FF7A00]/30 border-t-[#FF7A00] rounded-full animate-spin mx-auto"></div>
              <p className="text-[#5A4A32] mt-4 font-medium">Memuat data pesanan...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card className="border-2 border-gray-200">
          <CardContent className="p-12">
            <div className="text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold text-gray-600 mb-2">
                {orders.length === 0 ? 'Belum ada pesanan' : 'Tidak ada pesanan yang sesuai filter'}
              </p>
              <p className="text-sm text-gray-500">
                {orders.length === 0 
                  ? 'Mulai berbelanja untuk melihat pesanan Anda di sini' 
                  : 'Coba ubah filter atau kata kunci pencarian'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            return (
              <Card 
                key={order.id} 
                className="border-2 border-gray-200 hover:border-[#FF7A00] transition-all duration-300 shadow-md hover:shadow-xl group cursor-pointer overflow-hidden"
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="p-0">
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-[#FF7A00]/10 via-[#FF7A00]/5 to-transparent p-4 border-b-2 border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-4 w-4 text-[#FF7A00]" />
                          <p className="text-xs font-mono text-gray-600">{order.id.toUpperCase().substring(0, 20)}...</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-gray-400" />
                          <p className="text-sm font-semibold text-gray-700">{order.farmerName}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} font-semibold px-3 py-1`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {order.status === 'pending' ? 'Menunggu' :
                         order.status === 'processing' ? 'Diproses' :
                         order.status === 'shipped' ? 'Dikirim' :
                         order.status === 'delivered' ? 'Selesai' :
                         'Dibatalkan'}
                      </Badge>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-4 space-y-3">
                    {/* Products */}
                    <div className="flex items-start gap-2">
                      <ShoppingBag className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        {order.products.map((p, idx) => (
                          <div key={idx} className="text-sm text-gray-700">
                            <span className="font-medium">{p.name}</span>
                            <span className="text-gray-500"> × {p.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600 line-clamp-2">{order.shippingAddress}</p>
                    </div>

                    {/* Payment Status */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Badge className={order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                          {order.paymentStatus === 'paid' ? 'Lunas' : order.paymentStatus === 'pending' ? 'Menunggu' : 'Gagal'}
                        </Badge>
                        <span className="text-xs text-gray-500">{order.paymentMethod}</span>
                      </div>
                      <p className="text-lg font-bold text-[#FF7A00]">
                        Rp {order.total.toLocaleString('id-ID')}
                      </p>
                    </div>

                    {/* Date and Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="text-[#FF7A00] border-[#FF7A00] hover:bg-[#FF7A00] hover:text-white"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Track
                      </Button>
                    </div>
                  </div>

                  {/* Hover Indicator */}
                  <div className="h-1 bg-gradient-to-r from-[#FF7A00] to-[#E8A600] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Tracking Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <DialogTitle className="text-2xl">Tracking Pesanan</DialogTitle>
            </DialogHeader>
            <div 
              className="space-y-6 px-6 py-4 overflow-y-auto flex-1 custom-scrollbar" 
              style={{ 
                maxHeight: 'calc(90vh - 120px)'
              }}
            >
              {/* Order Info */}
              <div className="bg-[#FAF5EF] rounded-xl p-4 border border-[#FF7A00]/20">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#5A4A32] mb-1">ID Pesanan</p>
                    <p className="font-semibold text-[#2D2416]">{selectedOrder.id.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#5A4A32] mb-1">Penjual</p>
                    <p className="font-semibold text-[#2D2416]">{selectedOrder.farmerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#5A4A32] mb-1">Total</p>
                    <p className="font-semibold text-[#FF7A00]">Rp {selectedOrder.total.toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#5A4A32] mb-1">Alamat Pengiriman</p>
                    <p className="font-semibold text-[#2D2416] text-sm">{selectedOrder.shippingAddress}</p>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="font-semibold text-[#2D2416] mb-3">Produk yang Dipesan</h3>
                <div className="space-y-2">
                  {selectedOrder.products.map((product, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">Jumlah: {product.quantity}</p>
                      </div>
                      <p className="font-semibold text-[#FF7A00]">
                        Rp {(product.price * product.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Timeline */}
              <div>
                <h3 className="font-semibold text-[#2D2416] mb-4">Status Pengiriman</h3>
                <div className="bg-white rounded-xl p-6 border border-[#FF7A00]/10">
                  <OrderTracking 
                    currentStatus={selectedOrder.status} 
                    tracking={selectedOrder.tracking || []}
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
