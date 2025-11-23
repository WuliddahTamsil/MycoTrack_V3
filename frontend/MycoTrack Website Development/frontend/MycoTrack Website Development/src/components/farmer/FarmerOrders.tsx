import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { mockOrders } from '../mockData';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner@2.0.3';

export const FarmerOrders: React.FC = () => {
  const { user, updateBalance } = useAuth();
  const [orders, setOrders] = useState(
    mockOrders.filter(o => o.farmerId === user?.id || o.farmerId === 'f1')
  );

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus as any } : o
    ));
    toast.success(`Status pesanan diperbarui menjadi ${newStatus}`);
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
      <div>
        <h2 style={{ color: 'var(--secondary-dark-red)' }}>Manajemen Pesanan</h2>
        <p style={{ color: 'var(--neutral-gray)' }}>
          Kelola pesanan dari pelanggan Anda
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <TableCell>{order.id.toUpperCase()}</TableCell>
                    <TableCell>
                      <div>
                        <p>{order.customerName}</p>
                        <p className="text-xs" style={{ color: 'var(--neutral-gray)' }}>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
