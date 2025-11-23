import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Filter, Ban, CheckCircle, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3000/api';

interface Customer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  status: 'pending' | 'accepted' | 'rejected' | 'suspended';
  createdAt: string;
  profilePhoto?: string;
  balance?: number;
}

export const AdminCustomers: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/users/customers`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast.error('Gagal memuat data customer');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (customerId: string, newStatus: 'accepted' | 'suspended') => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/customers/${customerId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          adminEmail: 'admin'
        })
      });
      if (!response.ok) throw new Error('Failed to update status');
      toast.success(`Customer berhasil ${newStatus === 'suspended' ? 'dinonaktifkan' : 'diaktifkan'}!`);
      fetchCustomers();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Gagal mengupdate status customer');
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phoneNumber.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'accepted').length;
  const totalBalance = customers.reduce((sum, c) => sum + (c.balance || 0), 0);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      accepted: { label: 'Aktif', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-800' },
      suspended: { label: 'Ditangguhkan', className: 'bg-gray-100 text-gray-800' }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
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
                  Rp {(totalBalance / 1000000).toFixed(1)}jt
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Aktif</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
                <SelectItem value="suspended">Ditangguhkan</SelectItem>
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
                  <TableHead>Alamat</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Bergabung</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-[#FF7A00]/30 border-t-[#FF7A00] rounded-full animate-spin mx-auto"></div>
                      <p className="text-gray-500 mt-4">Memuat data...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
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
                            {customer.profilePhoto ? (
                              <AvatarImage src={customer.profilePhoto} alt={customer.name} />
                            ) : null}
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
                            {customer.phoneNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{customer.address}</TableCell>
                      <TableCell>Rp {(customer.balance || 0).toLocaleString('id-ID')}</TableCell>
                      <TableCell>
                        {new Date(customer.createdAt).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.status || 'pending')}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/user-detail/customers/${customer.id}`)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          {customer.status === 'accepted' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(customer.id, 'suspended')}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          ) : customer.status === 'suspended' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(customer.id, 'accepted')}
                              className="hover:bg-green-50 hover:text-green-600"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          ) : null}
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

    </div>
  );
};
