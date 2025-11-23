import React, { useState } from 'react';
import { UserCheck, Search, Filter, Eye, Ban, CheckCircle, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner@2.0.3';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
  status: 'active' | 'inactive' | 'banned';
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Toko Segar Jaya',
    email: 'segarjaya@gmail.com',
    phone: '081234567890',
    totalOrders: 24,
    totalSpent: 12500000,
    joinDate: '2024-08-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Warung Ibu Siti',
    email: 'ibusiti@gmail.com',
    phone: '082345678901',
    totalOrders: 18,
    totalSpent: 8900000,
    joinDate: '2024-09-01',
    status: 'active'
  },
  {
    id: '3',
    name: 'Restaurant Nusantara',
    email: 'nusantara@gmail.com',
    phone: '083456789012',
    totalOrders: 35,
    totalSpent: 18700000,
    joinDate: '2024-07-20',
    status: 'active'
  },
  {
    id: '4',
    name: 'Ahmad Fauzi',
    email: 'ahmadf@gmail.com',
    phone: '084567890123',
    totalOrders: 5,
    totalSpent: 1250000,
    joinDate: '2024-10-10',
    status: 'active'
  },
  {
    id: '5',
    name: 'Siti Nurhaliza',
    email: 'siti.nur@gmail.com',
    phone: '085678901234',
    totalOrders: 2,
    totalSpent: 450000,
    joinDate: '2024-10-28',
    status: 'inactive'
  }
];

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleToggleStatus = (customerId: string, newStatus: 'active' | 'banned') => {
    setCustomers(customers.map(c => 
      c.id === customerId ? { ...c, status: newStatus } : c
    ));
    toast.success(`Customer berhasil ${newStatus === 'banned' ? 'diblokir' : 'diaktifkan'}!`);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Tidak Aktif</Badge>;
      case 'banned':
        return <Badge className="bg-red-100 text-red-800">Diblokir</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-60">Total Customer</p>
                <p className="text-3xl mt-2">{totalCustomers}</p>
              </div>
              <UserCheck className="h-12 w-12 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-60">Customer Aktif</p>
                <p className="text-3xl mt-2">{activeCustomers}</p>
              </div>
              <CheckCircle className="h-12 w-12 opacity-20" style={{ color: 'var(--primary-orange)' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-60">Total Transaksi</p>
                <p className="text-3xl mt-2">
                  Rp {(totalRevenue / 1000000).toFixed(1)}jt
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCheck className="h-6 w-6" style={{ color: 'var(--primary-orange)' }} />
              <CardTitle>Manajemen Customer</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
              <Input
                placeholder="Cari customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
                <SelectItem value="banned">Diblokir</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Total Pesanan</TableHead>
                  <TableHead>Total Belanja</TableHead>
                  <TableHead>Bergabung</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Tidak ada data customer
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-blue-100 text-blue-800">
                              {customer.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{customer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-2 opacity-70">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                          <div className="flex items-center gap-2 opacity-70">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.totalOrders} pesanan</TableCell>
                      <TableCell>Rp {customer.totalSpent.toLocaleString('id-ID')}</TableCell>
                      <TableCell>
                        {new Date(customer.joinDate).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {customer.status !== 'banned' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(customer.id, 'banned')}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(customer.id, 'active')}
                              className="hover:bg-green-50 hover:text-green-600"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detail Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-blue-100 text-blue-800 text-2xl">
                    {selectedCustomer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg">{selectedCustomer.name}</h3>
                  {getStatusBadge(selectedCustomer.status)}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="opacity-60">Email</span>
                  <span>{selectedCustomer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Telepon</span>
                  <span>{selectedCustomer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Total Pesanan</span>
                  <span>{selectedCustomer.totalOrders} pesanan</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Total Belanja</span>
                  <span>Rp {selectedCustomer.totalSpent.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Bergabung Sejak</span>
                  <span>
                    {new Date(selectedCustomer.joinDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
