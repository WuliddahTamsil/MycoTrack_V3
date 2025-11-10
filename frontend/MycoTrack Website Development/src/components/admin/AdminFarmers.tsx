import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Edit, Trash2, Eye } from 'lucide-react';
import { SensorChart } from '../shared/SensorChart';
import { mockFarmers, mockProducts, mockOrders, generateMockSensorData } from '../mockData';
import { toast } from 'sonner@2.0.3';

export const AdminFarmers: React.FC = () => {
  const [farmers, setFarmers] = useState(mockFarmers);
  const [selectedFarmer, setSelectedFarmer] = useState<string | null>(null);

  const handleDeleteFarmer = (farmerId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus petani ini?')) {
      setFarmers(farmers.filter(f => f.id !== farmerId));
      toast.success('Petani berhasil dihapus');
    }
  };

  const selectedFarmerData = farmers.find(f => f.id === selectedFarmer);
  const farmerProducts = mockProducts.filter(p => p.farmerId === selectedFarmer);
  const farmerOrders = mockOrders.filter(o => o.farmerId === selectedFarmer);
  const farmerSensorData = selectedFarmer ? generateMockSensorData(selectedFarmer, 7) : [];

  if (selectedFarmer && selectedFarmerData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 style={{ color: 'var(--secondary-dark-red)' }}>Detail Petani: {selectedFarmerData.name}</h2>
            <p style={{ color: 'var(--neutral-gray)' }}>
              {selectedFarmerData.email} • {selectedFarmerData.phone}
            </p>
          </div>
          <Button variant="outline" onClick={() => setSelectedFarmer(null)}>
            Kembali
          </Button>
        </div>

        <Tabs defaultValue="monitoring">
          <TabsList>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="products">Produk & Penjualan</TabsTrigger>
            <TabsTrigger value="profile">Profil & Keuangan</TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="space-y-6">
            <SensorChart
              data={farmerSensorData.slice(-24)}
              title="Data Sensor 24 Jam Terakhir"
              showTemperature={true}
              showHumidity={true}
            />
            <Card>
              <CardHeader>
                <CardTitle>Galeri Foto Budidaya</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <img 
                    src="https://images.unsplash.com/photo-1735282260417-cb781d757604?w=300" 
                    alt="Growth"
                    className="rounded-lg w-full h-40 object-cover"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1735282260412-59db284b82ad?w=300" 
                    alt="Growth"
                    className="rounded-lg w-full h-40 object-cover"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1552825897-bb5efa86eab1?w=300" 
                    alt="Growth"
                    className="rounded-lg w-full h-40 object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Produk</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Produk</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Stok</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {farmerProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>Rp {product.price.toLocaleString('id-ID')}</TableCell>
                        <TableCell>{product.stock} {product.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Riwayat Penjualan</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Pesanan</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {farmerOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id.toUpperCase()}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>Rp {order.total.toLocaleString('id-ID')}</TableCell>
                        <TableCell>
                          <Badge className={order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString('id-ID')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Profil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--neutral-gray)' }}>Nama</p>
                    <p>{selectedFarmerData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--neutral-gray)' }}>Email</p>
                    <p>{selectedFarmerData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--neutral-gray)' }}>Telepon</p>
                    <p>{selectedFarmerData.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--neutral-gray)' }}>Lokasi</p>
                    <p>{selectedFarmerData.location}</p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--neutral-gray)' }}>Bergabung</p>
                    <p>{new Date(selectedFarmerData.joinedAt).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--neutral-gray)' }}>Status</p>
                    <Badge className={selectedFarmerData.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {selectedFarmerData.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Keuangan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--neutral-gray)' }}>Total Penjualan</span>
                    <span style={{ color: 'var(--primary-orange)' }}>
                      Rp {selectedFarmerData.totalSales.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--neutral-gray)' }}>Total Produk</span>
                    <span>{selectedFarmerData.totalProducts} produk</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ color: 'var(--secondary-dark-red)' }}>Manajemen Petani</h2>
        <p style={{ color: 'var(--neutral-gray)' }}>
          Kelola data petani MycoTrack
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Petani</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Produk</TableHead>
                <TableHead>Total Penjualan</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farmers.map((farmer) => (
                <TableRow key={farmer.id}>
                  <TableCell>{farmer.name}</TableCell>
                  <TableCell>{farmer.email}</TableCell>
                  <TableCell>{farmer.location}</TableCell>
                  <TableCell>
                    <Badge className={farmer.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {farmer.status === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                  </TableCell>
                  <TableCell>{farmer.totalProducts}</TableCell>
                  <TableCell>Rp {farmer.totalSales.toLocaleString('id-ID')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFarmer(farmer.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFarmer(farmer.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
