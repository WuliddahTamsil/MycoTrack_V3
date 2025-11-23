import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Calendar } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3000/api';

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  status: 'pending' | 'accepted' | 'rejected' | 'suspended';
  createdAt: string;
  profilePhoto?: string;
  ktpPhoto?: string;
  shop?: {
    name: string;
    description: string;
    photo?: string;
  };
  farm?: {
    landArea: number;
    landPhoto?: string;
    mushroomType: string;
    rackCount: number;
    baglogCount: number;
    harvestCapacity: number;
  };
  adminMessage?: string;
}

export const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'customers' | 'petanis'>('customers');
  const [users, setUsers] = useState<User[]>([]);
  const [allCustomers, setAllCustomers] = useState<User[]>([]);
  const [allPetanis, setAllPetanis] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    // Update users based on active tab
    setUsers(activeTab === 'customers' ? allCustomers : allPetanis);
  }, [activeTab, allCustomers, allPetanis]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter, dateFilter]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching users from API...');
      
      // Fetch both customers and petanis
      const [customersRes, petanisRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users/customers`),
        fetch(`${API_BASE_URL}/admin/users/petanis`)
      ]);
      
      console.log('Customers response status:', customersRes.status);
      console.log('Petanis response status:', petanisRes.status);
      
      if (!customersRes.ok) {
        const errorText = await customersRes.text();
        console.error('Customers API error:', errorText);
        throw new Error(`Failed to fetch customers: ${customersRes.status} ${errorText}`);
      }
      
      if (!petanisRes.ok) {
        const errorText = await petanisRes.text();
        console.error('Petanis API error:', errorText);
        throw new Error(`Failed to fetch petanis: ${petanisRes.status} ${errorText}`);
      }
      
      const customersData = await customersRes.json();
      const petanisData = await petanisRes.json();
      
      console.log('📊 Customers data:', customersData);
      console.log('📊 Petanis data:', petanisData);
      console.log('📊 Customers count:', customersData.customers?.length || 0);
      console.log('📊 Petanis count:', petanisData.petanis?.length || 0);
      
      const customersList = customersData.customers || [];
      const petanisList = petanisData.petanis || [];
      
      setAllCustomers(customersList);
      setAllPetanis(petanisList);
      setUsers(activeTab === 'customers' ? customersList : petanisList);
      
      console.log('✅ Users loaded successfully');
      console.log('   - Customers:', customersList.length);
      console.log('   - Petanis:', petanisList.length);
    } catch (error: any) {
      console.error('❌ Error fetching users:', error);
      console.error('Error details:', error.message);
      toast.error(`Gagal memuat data user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = fetchAllUsers; // Alias for refresh button

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.phoneNumber.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => (u.status || 'pending') === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      if (dateFilter === 'today') {
        filterDate.setHours(0, 0, 0, 0);
        filtered = filtered.filter(u => new Date(u.createdAt) >= filterDate);
      } else if (dateFilter === 'week') {
        filterDate.setDate(now.getDate() - 7);
        filtered = filtered.filter(u => new Date(u.createdAt) >= filterDate);
      } else if (dateFilter === 'month') {
        filterDate.setMonth(now.getMonth() - 1);
        filtered = filtered.filter(u => new Date(u.createdAt) >= filterDate);
      }
    }

    setFilteredUsers(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      accepted: { label: 'Diterima', className: 'bg-green-100 text-green-800 border-green-300' },
      rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-800 border-red-300' },
      suspended: { label: 'Ditangguhkan', className: 'bg-gray-100 text-gray-800 border-gray-300' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-autumn">Manajemen User</h1>
          <p className="text-[#5A4A32] mt-1">Kelola pendaftaran customer dan petani</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#FF7A00]/20">
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'customers'
              ? 'text-[#FF7A00] border-b-2 border-[#FF7A00]'
              : 'text-[#5A4A32] hover:text-[#B82601]'
          }`}
        >
          Customer ({allCustomers.length})
        </button>
        <button
          onClick={() => setActiveTab('petanis')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'petanis'
              ? 'text-[#FF7A00] border-b-2 border-[#FF7A00]'
              : 'text-[#5A4A32] hover:text-[#B82601]'
          }`}
        >
          Petani ({allPetanis.length})
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A4A32]/50" />
          <Input
            placeholder="Cari nama, email, atau HP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#FAF5EF] border-[#FF7A00]/20"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-[#FAF5EF] border-[#FF7A00]/20">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Diterima</SelectItem>
            <SelectItem value="rejected">Ditolak</SelectItem>
            <SelectItem value="suspended">Ditangguhkan</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="bg-[#FAF5EF] border-[#FF7A00]/20">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter Tanggal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tanggal</SelectItem>
            <SelectItem value="today">Hari Ini</SelectItem>
            <SelectItem value="week">7 Hari Terakhir</SelectItem>
            <SelectItem value="month">Bulan Ini</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={fetchUsers}
          className="gradient-autumn-cta text-white hover-lift"
        >
          Refresh
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-[#FF7A00]/30 border-t-[#FF7A00] rounded-full animate-spin mx-auto"></div>
          <p className="text-[#5A4A32] mt-4">Memuat data...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-[#FAF5EF] rounded-xl border border-[#FF7A00]/20">
          <p className="text-[#5A4A32] font-semibold mb-2">Tidak ada data user ditemukan</p>
          <p className="text-sm text-[#5A4A32]/70">
            {users.length === 0 
              ? `Tidak ada ${activeTab === 'customers' ? 'customer' : 'petani'} yang terdaftar.`
              : `Filter tidak menemukan hasil. Total ${activeTab === 'customers' ? 'customer' : 'petani'}: ${users.length}`
            }
          </p>
          <p className="text-xs text-[#5A4A32]/50 mt-2">
            Cek console browser (F12) untuk detail error jika ada.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#FF7A00]/10 overflow-hidden autumn-shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#FF7A00]/10 to-[#E8A600]/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D2416]">Nama</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D2416]">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D2416]">No. HP</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D2416]">Alamat</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D2416]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D2416]">Tanggal Daftar</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-[#2D2416]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FF7A00]/10">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#FF7A00]/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-[#2D2416] font-medium">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-[#5A4A32]">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-[#5A4A32]">{user.phoneNumber}</td>
                    <td className="px-6 py-4 text-sm text-[#5A4A32] max-w-xs truncate">{user.address}</td>
                    <td className="px-6 py-4">{getStatusBadge(user.status || 'pending')}</td>
                    <td className="px-6 py-4 text-sm text-[#5A4A32]">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4">
                      <Button
                        onClick={() => navigate(`/admin/user-detail/${activeTab}/${user.id}`)}
                        variant="ghost"
                        size="sm"
                        className="text-[#FF7A00] hover:text-[#B82601] hover:bg-[#FF7A00]/10"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800 font-medium">Pending</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">
            {[...allCustomers, ...allPetanis].filter(u => (u.status || 'pending') === 'pending').length}
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-800 font-medium">Diterima</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {[...allCustomers, ...allPetanis].filter(u => u.status === 'accepted').length}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800 font-medium">Ditolak</p>
          <p className="text-2xl font-bold text-red-900 mt-1">
            {[...allCustomers, ...allPetanis].filter(u => u.status === 'rejected').length}
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-800 font-medium">Ditangguhkan</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {[...allCustomers, ...allPetanis].filter(u => u.status === 'suspended').length}
          </p>
        </div>
      </div>
    </div>
  );
};

