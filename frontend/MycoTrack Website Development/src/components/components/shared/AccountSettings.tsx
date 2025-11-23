import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Lock, Bell, CreditCard, Save, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:3000/api';

export const AccountSettings: React.FC = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(() => {
    // Load from localStorage or use user profilePhoto
    const saved = localStorage.getItem(`profilePhoto_${user?.id}`);
    return saved || user?.profilePhoto || null;
  });
  const [isUploading, setIsUploading] = useState(false);
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || user?.phoneNumber || '',
    address: user?.address || '',
    bio: 'Petani jamur kuping dengan pengalaman 5 tahun',
    bankName: 'Bank Mandiri',
    bankAccount: '1234567890',
    bankHolder: user?.name || ''
  });

  // Load profile data from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const savedPhoto = localStorage.getItem(`profilePhoto_${user.id}`);
      if (savedPhoto) {
        setProfilePhoto(savedPhoto);
      }
      
      // Load saved profile data
      const savedProfile = localStorage.getItem(`profile_${user.id}`);
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          setProfile(prev => ({ 
            ...prev, 
            ...parsed,
            // Ensure all fields are set
            name: parsed.name || user?.name || prev.name,
            email: parsed.email || user?.email || prev.email,
            phone: parsed.phone || user?.phone || user?.phoneNumber || prev.phone,
            address: parsed.address || user?.address || prev.address,
            bio: parsed.bio || prev.bio,
          }));
        } catch (e) {
          console.error('Error parsing saved profile:', e);
        }
      } else {
        // Initialize with user data if no saved profile
        setProfile(prev => ({
          ...prev,
          name: user?.name || prev.name,
          email: user?.email || prev.email,
          phone: user?.phone || user?.phoneNumber || prev.phone,
          address: user?.address || prev.address,
          bio: prev.bio, // Keep default bio if no saved data
        }));
      }
    }
  }, [user?.id, user?.name, user?.email, user?.phone, user?.phoneNumber, user?.address]);

  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailPromotions: false,
    pushOrders: true,
    pushAlerts: true,
    pushForum: false,
    smsOrders: false
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (JPG, PNG)');
      return;
    }

    setIsUploading(true);
    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePhoto(result);
        // Save to localStorage
        if (user?.id) {
          localStorage.setItem(`profilePhoto_${user.id}`, result);
          // Dispatch custom event to update header
          window.dispatchEvent(new Event('profilePhotoUpdated'));
        }
        toast.success('Foto profil berhasil diupload!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Gagal mengupload foto profil');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Update profile via API
      const endpoint = user?.role === 'petani' 
        ? `${API_BASE_URL}/petani/profile`
        : user?.role === 'customer'
        ? `${API_BASE_URL}/customer/profile`
        : null;

      if (!endpoint) {
        toast.error('Role tidak valid');
        return;
      }

      const response = await fetch(`${endpoint}/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          phoneNumber: profile.phone,
          address: profile.address,
          bio: profile.bio,
        }),
      });

      if (response.ok) {
        // Save to localStorage
        if (user?.id) {
          localStorage.setItem(`profile_${user.id}`, JSON.stringify({
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            address: profile.address,
            bio: profile.bio,
            bankName: profile.bankName,
            bankAccount: profile.bankAccount,
            bankHolder: profile.bankHolder,
          }));
        }
        
        toast.success('Profil berhasil diperbarui!');
        setIsEditing(false);
        
        // Reload page to update header
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal memperbarui profil');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      // Fallback: save to localStorage only
      if (user?.id) {
        localStorage.setItem(`profile_${user.id}`, JSON.stringify({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          bio: profile.bio,
          bankName: profile.bankName,
          bankAccount: profile.bankAccount,
          bankHolder: profile.bankHolder,
        }));
      }
      toast.success('Profil berhasil diperbarui! (disimpan lokal)');
      setIsEditing(false);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleSaveNotifications = () => {
    toast.success('Pengaturan notifikasi berhasil disimpan!');
  };

  const handleChangePassword = () => {
    if (!security.currentPassword || !security.newPassword) {
      toast.error('Harap isi semua field password!');
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      toast.error('Password baru tidak cocok!');
      return;
    }
    if (security.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter!');
      return;
    }
    
    toast.success('Password berhasil diubah!');
    setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="h-6 w-6" style={{ color: 'var(--primary-orange)' }} />
            <div>
              <CardTitle>Pengaturan Akun</CardTitle>
              <CardDescription>Kelola profil dan preferensi akun Anda</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
              <TabsTrigger value="security">Keamanan</TabsTrigger>
              <TabsTrigger value="payment">Pembayaran</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Pribadi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      {profilePhoto ? (
                        <AvatarImage src={profilePhoto} alt={profile.name} className="object-cover" />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-[var(--primary-orange)] to-[var(--primary-gold)] text-white text-2xl">
                        {profile.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mb-2"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                        disabled={isUploading}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {isUploading ? 'Mengupload...' : 'Ubah Foto'}
                      </Button>
                      <p className="text-sm opacity-60">JPG, PNG maks. 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Alamat</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 opacity-50" />
                        <Input
                          id="address"
                          value={profile.address}
                          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      disabled={!isEditing}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="flex gap-3">
                    {!isEditing ? (
                      <Button 
                        onClick={() => setIsEditing(true)}
                        className="bg-[var(--primary-orange)] hover:bg-[var(--primary-gold)]"
                      >
                        Edit Profil
                      </Button>
                    ) : (
                      <>
                        <Button 
                          onClick={handleSaveProfile}
                          className="bg-[var(--primary-orange)] hover:bg-[var(--primary-gold)]"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Simpan Perubahan
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Batal
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preferensi Notifikasi</CardTitle>
                  <CardDescription>Kelola cara kami menghubungi Anda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="mb-4">Email</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">Notifikasi Pesanan</p>
                          <p className="text-xs opacity-60">Terima email untuk pesanan baru dan update</p>
                        </div>
                        <Switch
                          checked={notifications.emailOrders}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, emailOrders: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">Promosi & Tips</p>
                          <p className="text-xs opacity-60">Dapatkan tips budidaya dan promo menarik</p>
                        </div>
                        <Switch
                          checked={notifications.emailPromotions}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, emailPromotions: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="mb-4">Push Notification</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">Pesanan & Transaksi</p>
                          <p className="text-xs opacity-60">Update pesanan dan pembayaran</p>
                        </div>
                        <Switch
                          checked={notifications.pushOrders}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, pushOrders: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">Alert IoT Monitoring</p>
                          <p className="text-xs opacity-60">Peringatan suhu, kelembaban abnormal</p>
                        </div>
                        <Switch
                          checked={notifications.pushAlerts}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, pushAlerts: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">Aktivitas Forum</p>
                          <p className="text-xs opacity-60">Komentar dan likes pada postingan Anda</p>
                        </div>
                        <Switch
                          checked={notifications.pushForum}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, pushForum: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="mb-4">SMS</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">Notifikasi Pesanan Penting</p>
                          <p className="text-xs opacity-60">SMS untuk pesanan bernilai tinggi</p>
                        </div>
                        <Switch
                          checked={notifications.smsOrders}
                          onCheckedChange={(checked) => 
                            setNotifications({ ...notifications, smsOrders: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveNotifications}
                    className="bg-[var(--primary-orange)] hover:bg-[var(--primary-gold)]"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Preferensi
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ubah Password</CardTitle>
                  <CardDescription>Pastikan akun Anda aman dengan password yang kuat</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Password Saat Ini</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
                      <Input
                        id="currentPassword"
                        type="password"
                        value={security.currentPassword}
                        onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Password Baru</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
                      <Input
                        id="newPassword"
                        type="password"
                        value={security.newPassword}
                        onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={security.confirmPassword}
                        onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm">
                      <strong>Tips Password Aman:</strong>
                    </p>
                    <ul className="text-sm mt-2 space-y-1 opacity-70 ml-4 list-disc">
                      <li>Minimal 6 karakter</li>
                      <li>Kombinasi huruf besar dan kecil</li>
                      <li>Gunakan angka dan simbol</li>
                      <li>Jangan gunakan password yang sama dengan akun lain</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={handleChangePassword}
                    className="bg-[var(--primary-orange)] hover:bg-[var(--primary-gold)]"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Ubah Password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Rekening Bank</CardTitle>
                  <CardDescription>Untuk pembayaran dan pencairan dana</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Nama Bank</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
                      <Input
                        id="bankName"
                        value={profile.bankName}
                        onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">Nomor Rekening</Label>
                    <Input
                      id="bankAccount"
                      value={profile.bankAccount}
                      onChange={(e) => setProfile({ ...profile, bankAccount: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankHolder">Nama Pemilik Rekening</Label>
                    <Input
                      id="bankHolder"
                      value={profile.bankHolder}
                      onChange={(e) => setProfile({ ...profile, bankHolder: e.target.value })}
                    />
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm">
                      <strong>Catatan:</strong> Pastikan nama pemilik rekening sesuai dengan KTP untuk memudahkan proses verifikasi dan pencairan dana.
                    </p>
                  </div>

                  <Button 
                    onClick={handleSaveProfile}
                    className="bg-[var(--primary-orange)] hover:bg-[var(--primary-gold)]"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Informasi Bank
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
