import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../shared/DashboardLayout';
import { ArrowLeft, CheckCircle, XCircle, Ban, Trash2, Image as ImageIcon, FileText, Store, Package, MapPin, Mail, Phone, User, Calendar, Home, Edit2, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '../AuthContext';

const API_BASE_URL = 'http://localhost:3000/api';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  status: 'pending' | 'accepted' | 'rejected' | 'suspended';
  createdAt: string;
  profilePhoto?: string;
  ktpPhoto?: string;
  adminMessage?: string;
  reviewedAt?: string;
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
}

export const UserDetail: React.FC = () => {
  const { type, id } = useParams<{ type: 'customers' | 'petanis'; id: string }>();
  const navigate = useNavigate();
  const { user: adminUser } = useAuth();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    shopName: '',
    shopDescription: '',
    landArea: '',
    mushroomType: '',
    rackCount: '',
    baglogCount: '',
    harvestCapacity: ''
  });

  useEffect(() => {
    fetchUserDetail();
  }, [type, id]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const endpoint = `${API_BASE_URL}/admin/users/${type}/${id}`;
      const response = await fetch(endpoint);
      
      if (!response.ok) throw new Error('Failed to fetch user detail');
      
      const data = await response.json();
      setUser(type === 'customers' ? data.customer : data.petani);
    } catch (error: any) {
      console.error('Error fetching user detail:', error);
      toast.error('Gagal memuat detail user');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string, message?: string) => {
    try {
      setActionLoading(true);
      const endpoint = `${API_BASE_URL}/admin/users/${type}/${id}/status`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminMessage: message,
          adminEmail: adminUser?.email || 'admin'
        })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      toast.success(`Status berhasil diubah menjadi ${status === 'accepted' ? 'Diterima' : status === 'rejected' ? 'Ditolak' : 'Ditangguhkan'}`);
      await fetchUserDetail();
      setShowRejectModal(false);
      setRejectReason('');
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Gagal mengupdate status');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteUser = async () => {
    try {
      setActionLoading(true);
      const endpoint = `${API_BASE_URL}/admin/users/${type}/${id}`;
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: adminUser?.email || 'admin'
        })
      });

      if (!response.ok) throw new Error('Failed to delete user');
      
      toast.success('User berhasil dihapus');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error('Gagal menghapus user');
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const openEditModal = () => {
    if (!user) return;
    
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      address: user.address || '',
      shopName: user.shop?.name || '',
      shopDescription: user.shop?.description || '',
      landArea: user.farm?.landArea?.toString() || '',
      mushroomType: user.farm?.mushroomType || '',
      rackCount: user.farm?.rackCount?.toString() || '',
      baglogCount: user.farm?.baglogCount?.toString() || '',
      harvestCapacity: user.farm?.harvestCapacity?.toString() || ''
    });
    setShowEditModal(true);
  };

  const updateUserData = async () => {
    try {
      setActionLoading(true);
      
      // Validate required fields
      if (!editFormData.name || !editFormData.email || !editFormData.phoneNumber || !editFormData.address) {
        toast.error('Mohon lengkapi semua field yang wajib diisi');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editFormData.email)) {
        toast.error('Format email tidak valid');
        return;
      }

      const endpoint = `${API_BASE_URL}/admin/users/${type}/${id}`;
      const payload: any = {
        name: editFormData.name,
        email: editFormData.email,
        phoneNumber: editFormData.phoneNumber,
        address: editFormData.address,
        adminEmail: adminUser?.email || 'admin'
      };

      // Add shop data for petani
      if (isPetani && (editFormData.shopName || editFormData.shopDescription)) {
        payload.shop = {
          name: editFormData.shopName,
          description: editFormData.shopDescription
        };
      }

      // Add farm data for petani
      if (isPetani && (editFormData.landArea || editFormData.mushroomType)) {
        payload.farm = {
          landArea: editFormData.landArea ? parseFloat(editFormData.landArea) : undefined,
          mushroomType: editFormData.mushroomType,
          rackCount: editFormData.rackCount ? parseInt(editFormData.rackCount) : undefined,
          baglogCount: editFormData.baglogCount ? parseInt(editFormData.baglogCount) : undefined,
          harvestCapacity: editFormData.harvestCapacity ? parseFloat(editFormData.harvestCapacity) : undefined
        };
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            'Endpoint tidak ditemukan. Pastikan backend berjalan dan sudah di-restart setelah perubahan terbaru.\n\n' +
            'Cara restart backend:\n' +
            '1. Stop backend (Ctrl+C di terminal backend)\n' +
            '2. Jalankan kembali: npm start di folder backend'
          );
        }
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to update user (Status: ${response.status})`);
      }
      
      toast.success('Data user berhasil diupdate');
      await fetchUserDetail();
      setShowEditModal(false);
    } catch (error: unknown) {
      console.error('Error updating user:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Gagal mengupdate data user');
      } else {
        toast.error('Gagal mengupdate data user');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const canAcceptPetani = () => {
    if (type !== 'petanis' || !user) return true;
    const petani = user as any;
    return petani.ktpPhoto && petani.shop?.photo && petani.farm?.landPhoto;
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
      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FF7A00]/30 border-t-[#FF7A00] rounded-full animate-spin mx-auto"></div>
          <p className="text-[#5A4A32] mt-4">Memuat detail user...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const sidebar = (
      <div className="space-y-1">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-[#5A4A32] hover:bg-[#FF7A00]/10 hover:text-[#B82601] hover:translate-x-1"
        >
          <Home className="h-5 w-5" />
          <span className="text-sm">Kembali ke Dashboard</span>
        </button>
      </div>
    );

    return (
      <DashboardLayout sidebar={sidebar}>
        <div className="text-center py-12">
          <p className="text-[#5A4A32]">User tidak ditemukan</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Kembali
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isPetani = type === 'petanis';

  const sidebar = (
    <div className="space-y-1">
      <button
        onClick={() => navigate('/dashboard')}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-[#5A4A32] hover:bg-[#FF7A00]/10 hover:text-[#B82601] hover:translate-x-1"
      >
        <Home className="h-5 w-5" />
        <span className="text-sm">Kembali ke Dashboard</span>
      </button>
    </div>
  );

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-[#5A4A32] hover:text-[#B82601]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gradient-autumn">Detail User</h1>
            <p className="text-[#5A4A32] mt-1">{isPetani ? 'Detail Petani' : 'Detail Customer'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(user.status || 'pending')}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <Button
          onClick={openEditModal}
          disabled={actionLoading}
          className="gradient-autumn-cta text-white hover-lift"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Data
        </Button>
        
        {user.status !== 'accepted' && (
          <Button
            onClick={() => updateStatus('accepted')}
            disabled={actionLoading || (isPetani && !canAcceptPetani())}
            className="gradient-autumn-cta text-white hover-lift"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Terima
          </Button>
        )}
        
        {user.status !== 'rejected' && (
          <Button
            onClick={() => setShowRejectModal(true)}
            disabled={actionLoading}
            variant="destructive"
            className="hover-lift"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Tolak
          </Button>
        )}
        
        {user.status === 'accepted' && (
          <Button
            onClick={() => updateStatus('suspended')}
            disabled={actionLoading}
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <Ban className="h-4 w-4 mr-2" />
            Nonaktifkan
          </Button>
        )}
        
        {user.status === 'suspended' && (
          <Button
            onClick={() => updateStatus('accepted')}
            disabled={actionLoading}
            className="gradient-autumn-cta text-white hover-lift"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Aktifkan Kembali
          </Button>
        )}
        
        <Button
          onClick={() => setShowDeleteModal(true)}
          disabled={actionLoading}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Hapus
        </Button>
      </div>

      {isPetani && !canAcceptPetani() && user.status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
          <p className="text-yellow-800 font-medium">
            ⚠️ Berkas belum lengkap. Silakan verifikasi sebelum melanjutkan.
          </p>
          <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
            {!user.ktpPhoto && <li>Foto KTP belum diunggah</li>}
            {!user.shop?.photo && <li>Foto Toko belum diunggah</li>}
            {!user.farm?.landPhoto && <li>Foto Lahan belum diunggah</li>}
          </ul>
        </div>
      )}

      {/* Customer Details */}
      {!isPetani && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-[#FF7A00]/10 p-6 autumn-shadow">
            <h2 className="text-xl font-bold text-[#B82601] mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Customer
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-[#5A4A32] text-sm">Nama Lengkap</Label>
                <p className="text-[#2D2416] font-medium mt-1">{user.name}</p>
              </div>
              <div>
                <Label className="text-[#5A4A32] text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <p className="text-[#2D2416] font-medium mt-1">{user.email}</p>
              </div>
              <div>
                <Label className="text-[#5A4A32] text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Nomor HP
                </Label>
                <p className="text-[#2D2416] font-medium mt-1">{user.phoneNumber}</p>
              </div>
              <div>
                <Label className="text-[#5A4A32] text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Alamat Lengkap
                </Label>
                <p className="text-[#2D2416] font-medium mt-1">{user.address}</p>
              </div>
              <div>
                <Label className="text-[#5A4A32] text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Tanggal Daftar
                </Label>
                <p className="text-[#2D2416] font-medium mt-1">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Profile Photo */}
          <div className="bg-white rounded-xl border border-[#FF7A00]/10 p-6 autumn-shadow">
            <h2 className="text-xl font-bold text-[#B82601] mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Foto Profil
            </h2>
            {user.profilePhoto ? (
              <div className="mt-4">
                <img
                  src={user.profilePhoto}
                  alt="Profile"
                  className="w-full h-64 object-cover rounded-lg border border-[#FF7A00]/20"
                />
              </div>
            ) : (
              <p className="text-[#5A4A32] mt-4">Tidak ada foto profil</p>
            )}
          </div>
        </div>
      )}

      {/* Petani Details */}
      {isPetani && (
        <div className="space-y-6">
          {/* Identitas Petani */}
          <div className="bg-white rounded-xl border border-[#FF7A00]/10 p-6 autumn-shadow">
            <h2 className="text-xl font-bold text-[#B82601] mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Identitas Petani
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-[#5A4A32] text-sm">Nama Lengkap</Label>
                <p className="text-[#2D2416] font-medium mt-1">{user.name}</p>
              </div>
              <div>
                <Label className="text-[#5A4A32] text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <p className="text-[#2D2416] font-medium mt-1">{user.email}</p>
              </div>
              <div>
                <Label className="text-[#5A4A32] text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Nomor HP
                </Label>
                <p className="text-[#2D2416] font-medium mt-1">{user.phoneNumber}</p>
              </div>
              <div>
                <Label className="text-[#5A4A32] text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Alamat
                </Label>
                <p className="text-[#2D2416] font-medium mt-1">{user.address}</p>
              </div>
              <div>
                <Label className="text-[#5A4A32] text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Tanggal Daftar
                </Label>
                <p className="text-[#2D2416] font-medium mt-1">{formatDate(user.createdAt)}</p>
              </div>
            </div>
            {user.ktpPhoto && (
              <div className="mt-6">
                <Label className="text-[#5A4A32] text-sm flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  Foto KTP
                </Label>
                <img
                  src={user.ktpPhoto}
                  alt="KTP"
                  className="w-full max-w-md h-auto rounded-lg border border-[#FF7A00]/20"
                />
              </div>
            )}
          </div>

          {/* Data Toko */}
          {user.shop && (
            <div className="bg-white rounded-xl border border-[#FF7A00]/10 p-6 autumn-shadow">
              <h2 className="text-xl font-bold text-[#B82601] mb-4 flex items-center gap-2">
                <Store className="h-5 w-5" />
                Data Toko Petani
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#5A4A32] text-sm">Nama Toko</Label>
                  <p className="text-[#2D2416] font-medium mt-1">{user.shop.name}</p>
                </div>
                <div>
                  <Label className="text-[#5A4A32] text-sm">Deskripsi Toko</Label>
                  <p className="text-[#2D2416] font-medium mt-1">{user.shop.description}</p>
                </div>
              </div>
              {user.shop.photo && (
                <div className="mt-6">
                  <Label className="text-[#5A4A32] text-sm flex items-center gap-2 mb-2">
                    <ImageIcon className="h-4 w-4" />
                    Foto Toko
                  </Label>
                  <img
                    src={user.shop.photo}
                    alt="Shop"
                    className="w-full max-w-md h-auto rounded-lg border border-[#FF7A00]/20"
                  />
                </div>
              )}
            </div>
          )}

          {/* Data Lahan */}
          {user.farm && (
            <div className="bg-white rounded-xl border border-[#FF7A00]/10 p-6 autumn-shadow">
              <h2 className="text-xl font-bold text-[#B82601] mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Data Lahan Jamur Kuping
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#5A4A32] text-sm">Luas Lahan (m²)</Label>
                  <p className="text-[#2D2416] font-medium mt-1">{user.farm.landArea}</p>
                </div>
                <div>
                  <Label className="text-[#5A4A32] text-sm">Jenis Jamur</Label>
                  <p className="text-[#2D2416] font-medium mt-1">{user.farm.mushroomType}</p>
                </div>
                <div>
                  <Label className="text-[#5A4A32] text-sm">Jumlah Rak</Label>
                  <p className="text-[#2D2416] font-medium mt-1">{user.farm.rackCount}</p>
                </div>
                <div>
                  <Label className="text-[#5A4A32] text-sm">Jumlah Baglog</Label>
                  <p className="text-[#2D2416] font-medium mt-1">{user.farm.baglogCount}</p>
                </div>
                <div>
                  <Label className="text-[#5A4A32] text-sm">Kapasitas Panen (kg)</Label>
                  <p className="text-[#2D2416] font-medium mt-1">{user.farm.harvestCapacity}</p>
                </div>
              </div>
              {user.farm.landPhoto && (
                <div className="mt-6">
                  <Label className="text-[#5A4A32] text-sm flex items-center gap-2 mb-2">
                    <ImageIcon className="h-4 w-4" />
                    Foto Lahan
                  </Label>
                  <img
                    src={user.farm.landPhoto}
                    alt="Land"
                    className="w-full max-w-md h-auto rounded-lg border border-[#FF7A00]/20"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Admin Message */}
      {user.adminMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <Label className="text-red-800 font-semibold">Alasan Penolakan:</Label>
          <p className="text-red-700 mt-2">{user.adminMessage}</p>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 autumn-shadow">
            <h3 className="text-xl font-bold text-[#B82601] mb-4">Tolak User</h3>
            <Label className="text-[#2D2416]">Alasan Penolakan *</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Masukkan alasan penolakan..."
              className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20"
              rows={4}
            />
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  if (rejectReason.trim()) {
                    updateStatus('rejected', rejectReason);
                  } else {
                    toast.error('Alasan penolakan wajib diisi');
                  }
                }}
                disabled={actionLoading || !rejectReason.trim()}
                variant="destructive"
                className="flex-1"
              >
                Tolak
              </Button>
              <Button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                variant="outline"
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 autumn-shadow">
            <h3 className="text-xl font-bold text-[#B82601] mb-4">Hapus User</h3>
            <p className="text-[#5A4A32] mb-6">
              Apakah Anda yakin ingin menghapus user <strong>{user.name}</strong>? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={deleteUser}
                disabled={actionLoading}
                variant="destructive"
                className="flex-1"
              >
                Hapus
              </Button>
              <Button
                onClick={() => setShowDeleteModal(false)}
                variant="outline"
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
          {/* Fixed Header */}
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b bg-white">
            <DialogTitle className="text-2xl font-bold text-gradient-autumn">
              Edit Data {isPetani ? 'Petani' : 'Customer'}
            </DialogTitle>
          </DialogHeader>
          
          {/* Scrollable Content */}
          <div 
            className="flex-1 overflow-y-auto px-6 py-4 min-h-0 custom-scrollbar"
            style={{ 
              maxHeight: 'calc(85vh - 180px)',
              scrollbarWidth: 'thin',
              scrollbarColor: '#fdba74 #f3f4f6'
            }}
          >
            <div className="space-y-6 pb-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#B82601] border-b pb-2">
                Informasi Dasar
              </h3>
              
              <div>
                <Label htmlFor="edit-name" className="text-[#5A4A32]">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="mt-1"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <Label htmlFor="edit-email" className="text-[#5A4A32]">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="mt-1"
                  placeholder="Masukkan email"
                />
              </div>

              <div>
                <Label htmlFor="edit-phone" className="text-[#5A4A32]">
                  Nomor HP <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editFormData.phoneNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                  className="mt-1"
                  placeholder="Masukkan nomor HP"
                />
              </div>

              <div>
                <Label htmlFor="edit-address" className="text-[#5A4A32]">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="edit-address"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="mt-1"
                  placeholder="Masukkan alamat lengkap"
                  rows={3}
                />
              </div>
            </div>

            {/* Shop Information (Petani only) */}
            {isPetani && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#B82601] border-b pb-2">
                  Data Toko
                </h3>
                
                <div>
                  <Label htmlFor="edit-shop-name" className="text-[#5A4A32]">
                    Nama Toko
                  </Label>
                  <Input
                    id="edit-shop-name"
                    value={editFormData.shopName}
                    onChange={(e) => setEditFormData({ ...editFormData, shopName: e.target.value })}
                    className="mt-1"
                    placeholder="Masukkan nama toko"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-shop-desc" className="text-[#5A4A32]">
                    Deskripsi Toko
                  </Label>
                  <Textarea
                    id="edit-shop-desc"
                    value={editFormData.shopDescription}
                    onChange={(e) => setEditFormData({ ...editFormData, shopDescription: e.target.value })}
                    className="mt-1"
                    placeholder="Masukkan deskripsi toko"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Farm Information (Petani only) */}
            {isPetani && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#B82601] border-b pb-2">
                  Data Lahan
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-land-area" className="text-[#5A4A32]">
                      Luas Lahan (m²)
                    </Label>
                    <Input
                      id="edit-land-area"
                      type="number"
                      value={editFormData.landArea}
                      onChange={(e) => setEditFormData({ ...editFormData, landArea: e.target.value })}
                      className="mt-1"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-mushroom-type" className="text-[#5A4A32]">
                      Jenis Jamur
                    </Label>
                    <Input
                      id="edit-mushroom-type"
                      value={editFormData.mushroomType}
                      onChange={(e) => setEditFormData({ ...editFormData, mushroomType: e.target.value })}
                      className="mt-1"
                      placeholder="Jenis jamur"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-rack-count" className="text-[#5A4A32]">
                      Jumlah Rak
                    </Label>
                    <Input
                      id="edit-rack-count"
                      type="number"
                      value={editFormData.rackCount}
                      onChange={(e) => setEditFormData({ ...editFormData, rackCount: e.target.value })}
                      className="mt-1"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-baglog-count" className="text-[#5A4A32]">
                      Jumlah Baglog
                    </Label>
                    <Input
                      id="edit-baglog-count"
                      type="number"
                      value={editFormData.baglogCount}
                      onChange={(e) => setEditFormData({ ...editFormData, baglogCount: e.target.value })}
                      className="mt-1"
                      placeholder="0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="edit-harvest-capacity" className="text-[#5A4A32]">
                      Kapasitas Panen (kg)
                    </Label>
                    <Input
                      id="edit-harvest-capacity"
                      type="number"
                      value={editFormData.harvestCapacity}
                      onChange={(e) => setEditFormData({ ...editFormData, harvestCapacity: e.target.value })}
                      className="mt-1"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="flex-shrink-0 px-6 pb-6 pt-4 border-t bg-gray-50 shadow-inner">
            <div className="flex gap-3">
              <Button
                onClick={updateUserData}
                disabled={actionLoading}
                className="flex-1 gradient-autumn-cta text-white hover-lift !bg-orange-500 hover:!bg-orange-400 transition-all duration-200"
              >
                <Save className="h-4 w-4 mr-2" />
                {actionLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
              <Button
                onClick={() => setShowEditModal(false)}
                disabled={actionLoading}
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-100"
              >
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
};

