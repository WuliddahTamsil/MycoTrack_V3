import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ArrowUpDown, Eye, Package } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ color: 'var(--secondary-dark-red)' }}>Pesanan Saya</h2>
        <p style={{ color: 'var(--neutral-gray)' }}>
          Riwayat pembelian dan status pesanan Anda
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Pesanan</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Urutkan Tanggal ({sortOrder === 'asc' ? 'Terlama' : 'Terbaru'})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-[#FF7A00]/30 border-t-[#FF7A00] rounded-full animate-spin mx-auto"></div>
              <p className="text-[#5A4A32] mt-4">Memuat data pesanan...</p>
            </div>
          ) : sortedOrders.length === 0 ? (
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
                  <TableHead>Produk</TableHead>
                  <TableHead>Penjual</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pembayaran</TableHead>
                  <TableHead>Tanggal</TableHead>
                    <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.map((order) => (
                  <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id.toUpperCase()}</TableCell>
                    <TableCell>
                      {order.products.map((p, idx) => (
                        <div key={idx} className="text-sm">
                          {p.name} x{p.quantity}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>{order.farmerName}</TableCell>
                    <TableCell>
                      Rp {order.total.toLocaleString('id-ID')}
                    </TableCell>
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
                      <Badge className={order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {order.paymentStatus === 'paid' ? 'Lunas' : 'Menunggu'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString('id-ID')}
                    </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="text-[#FF7A00] hover:text-[#B82601] hover:bg-[#FF7A00]/10"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Track
                        </Button>
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
