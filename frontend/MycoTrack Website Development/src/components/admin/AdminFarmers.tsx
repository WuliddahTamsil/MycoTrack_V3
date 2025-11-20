import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3000/api';

interface Farmer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  status: 'pending' | 'accepted' | 'rejected' | 'suspended';
  createdAt: string;
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
  balance?: number;
}

export const AdminFarmers: React.FC = () => {
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/users/petanis`);
      if (!response.ok) throw new Error('Failed to fetch farmers');
      const data = await response.json();
      setFarmers(data.petanis || []);
    } catch (error: any) {
      console.error('Error fetching farmers:', error);
      toast.error('Gagal memuat data petani');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFarmer = async (farmerId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus petani ini?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/users/petanis/${farmerId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminEmail: 'admin' })
        });
        if (!response.ok) throw new Error('Failed to delete farmer');
      toast.success('Petani berhasil dihapus');
        fetchFarmers();
      } catch (error: any) {
        console.error('Error deleting farmer:', error);
        toast.error('Gagal menghapus petani');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      accepted: { label: 'Diterima', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-800' },
      suspended: { label: 'Ditangguhkan', className: 'bg-gray-100 text-gray-800' }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };


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
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-[#FF7A00]/30 border-t-[#FF7A00] rounded-full animate-spin mx-auto"></div>
              <p className="text-[#5A4A32] mt-4">Memuat data...</p>
            </div>
          ) : farmers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Tidak ada data petani
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                  <TableHead>No. HP</TableHead>
                  <TableHead>Alamat</TableHead>
                <TableHead>Status</TableHead>
                  <TableHead>Toko</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farmers.map((farmer) => (
                <TableRow key={farmer.id}>
                  <TableCell>{farmer.name}</TableCell>
                  <TableCell>{farmer.email}</TableCell>
                    <TableCell>{farmer.phoneNumber}</TableCell>
                    <TableCell className="max-w-xs truncate">{farmer.address}</TableCell>
                    <TableCell>{getStatusBadge(farmer.status || 'pending')}</TableCell>
                    <TableCell>{farmer.shop?.name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/user-detail/petanis/${farmer.id}`)}
                      >
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};
