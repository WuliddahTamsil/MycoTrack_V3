import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { StatCard } from '../shared/StatCard';
import { Users, ShoppingCart, DollarSign } from 'lucide-react';
import { mockFarmers, mockProducts, mockOrders } from '../mockData';

export const AdminHome: React.FC = () => {
  const totalFarmers = mockFarmers.length;
  const totalCustomers = 15; // Mock data
  const totalSales = mockOrders.reduce((sum, order) => sum + order.total, 0);
  const onlineFarmers = mockFarmers.filter(f => f.status === 'online');

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ color: 'var(--secondary-dark-red)' }}>Dashboard Admin</h2>
        <p style={{ color: 'var(--neutral-gray)' }}>
          Ringkasan sistem MycoTrack
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Petani"
          value={totalFarmers}
          icon={Users}
          iconColor="var(--primary-orange)"
          trend={{ value: '3 petani baru bulan ini', isPositive: true }}
        />
        <StatCard
          title="Total Customer"
          value={totalCustomers}
          icon={Users}
          iconColor="var(--primary-gold)"
          trend={{ value: '8 customer baru bulan ini', isPositive: true }}
        />
        <StatCard
          title="Total Penjualan"
          value={`Rp ${totalSales.toLocaleString('id-ID')}`}
          icon={DollarSign}
          iconColor="var(--secondary-olive)"
          trend={{ value: '12% dari bulan lalu', isPositive: true }}
        />
      </div>

      {/* Farmer Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Petani</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Petani</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Produk</TableHead>
                <TableHead>Total Penjualan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFarmers.map((farmer) => (
                <TableRow key={farmer.id}>
                  <TableCell>{farmer.name}</TableCell>
                  <TableCell>{farmer.location}</TableCell>
                  <TableCell>
                    <Badge className={farmer.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {farmer.status === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                  </TableCell>
                  <TableCell>{farmer.totalProducts}</TableCell>
                  <TableCell>Rp {farmer.totalSales.toLocaleString('id-ID')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Petani Online</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {onlineFarmers.map((farmer) => (
                <div key={farmer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary-orange)] text-white flex items-center justify-center">
                      {farmer.name.charAt(0)}
                    </div>
                    <div>
                      <p>{farmer.name}</p>
                      <p className="text-sm" style={{ color: 'var(--neutral-gray)' }}>
                        {farmer.location}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Online
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pengajuan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ color: 'var(--neutral-gray)' }}>
              Tidak ada pengajuan petani baru saat ini
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
