import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Eye, Package } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';
import { OrderTracking } from '../shared/OrderTracking';

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

export const FarmerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([] as Order[]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null as Order | null);
  const [notifications, setNotifications] = useState([] as any[]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
      fetchNotifications();
      // Poll for new notifications every 5 seconds
      const interval = setInterval(() => {
        fetchNotifications();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/farmer/orders?farmerId=${user?.id}`);
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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          farmerId: user?.id
        })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
    toast.success(`Status pesanan diperbarui menjadi ${newStatus}`);
      await fetchOrders();
      
      // Update selected order if it's the one being changed
      if (selectedOrder?.id === orderId) {
        const updatedOrder = await fetch(`${API_BASE_URL}/orders/${orderId}`).then(r => r.json());
        setSelectedOrder(updatedOrder.order);
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error('Gagal mengupdate status pesanan');
    }
  };

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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: 'var(--secondary-dark-red)' }}>Manajemen Pesanan</h2>
          <p style={{ color: 'var(--neutral-gray)' }}>
            Kelola pesanan dari pelanggan Anda
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 border border-orange-300 rounded-lg animate-pulse">
            <Package className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-semibold text-orange-800">
              {unreadCount} Pesanan Baru
            </span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-[#FF7A00]/30 border-t-[#FF7A00] rounded-full animate-spin mx-auto"></div>
              <p className="text-[#5A4A32] mt-4">Memuat data pesanan...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Belum ada pesanan</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Pesanan</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status Pembayaran</TableHead>
                  <TableHead>Metode Pembayaran</TableHead>
                  <TableHead>Status Pesanan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id.toUpperCase()}</TableCell>
                    <TableCell>
                      <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-xs text-gray-600">
                          {order.shippingAddress}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.products.map((p, idx) => (
                        <div key={idx} className="text-sm">
                          {p.name} x{p.quantity}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      Rp {order.total.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus === 'paid' ? 'Lunas' : order.paymentStatus === 'pending' ? 'Menunggu' : 'Gagal'}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status === 'pending' ? 'Menunggu' :
                         order.status === 'processing' ? 'Diproses' :
                         order.status === 'shipped' ? 'Dikirim' :
                         order.status === 'delivered' ? 'Selesai' :
                         'Dibatalkan'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                        <div className="flex gap-2">
                          {(Button as any)({
                            variant: "ghost",
                            size: "sm",
                            onClick: () => setSelectedOrder(order),
                            className: "text-[#FF7A00] hover:text-[#B82601] hover:bg-[#FF7A00]/10",
                            children: <Eye className="h-4 w-4" />
                          })}
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Menunggu</SelectItem>
                          <SelectItem value="processing">Diproses</SelectItem>
                          <SelectItem value="shipped">Dikirim</SelectItem>
                          <SelectItem value="delivered">Selesai</SelectItem>
                          <SelectItem value="cancelled">Dibatalkan</SelectItem>
                        </SelectContent>
                      </Select>
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>

      {/* Order Tracking Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Tracking Pesanan</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Order Info */}
              <div className="bg-[#FAF5EF] rounded-xl p-4 border border-[#FF7A00]/20">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#5A4A32] mb-1">ID Pesanan</p>
                    <p className="font-semibold text-[#2D2416]">{selectedOrder.id.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#5A4A32] mb-1">Pelanggan</p>
                    <p className="font-semibold text-[#2D2416]">{selectedOrder.customerName}</p>
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

              {/* Update Status */}
              <div>
                <h3 className="font-semibold text-[#2D2416] mb-3">Update Status</h3>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="processing">Diproses</SelectItem>
                    <SelectItem value="shipped">Dikirim</SelectItem>
                    <SelectItem value="delivered">Selesai</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
