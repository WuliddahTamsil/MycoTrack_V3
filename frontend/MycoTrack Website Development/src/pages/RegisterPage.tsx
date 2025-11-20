import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Shell, ArrowLeft, Upload, Mail, Lock, User, Phone, MapPin, Store, FileText, Image, Package } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../components/AuthContext';
import { toast } from 'sonner';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'customer' | 'petani'>('customer');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  // Customer specific
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

  // Petani specific
  const [ktpPhoto, setKtpPhoto] = useState<File | null>(null);
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [shopPhoto, setShopPhoto] = useState<File | null>(null);
  const [landArea, setLandArea] = useState('');
  const [landPhoto, setLandPhoto] = useState<File | null>(null);
  const [mushroomType, setMushroomType] = useState('');
  const [rackCount, setRackCount] = useState('');
  const [baglogCount, setBaglogCount] = useState('');
  const [harvestCapacity, setHarvestCapacity] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await register({
        role,
        name,
        email,
        password,
        phoneNumber,
        address,
        profilePhoto: role === 'customer' ? profilePhoto : null,
        ktpPhoto: role === 'petani' ? ktpPhoto : null,
        shopName: role === 'petani' ? shopName : undefined,
        shopDescription: role === 'petani' ? shopDescription : undefined,
        shopPhoto: role === 'petani' ? shopPhoto : null,
        landArea: role === 'petani' ? landArea : undefined,
        landPhoto: role === 'petani' ? landPhoto : null,
        mushroomType: role === 'petani' ? mushroomType : undefined,
        rackCount: role === 'petani' ? rackCount : undefined,
        baglogCount: role === 'petani' ? baglogCount : undefined,
        harvestCapacity: role === 'petani' ? harvestCapacity : undefined,
      });
      toast.success('Registrasi berhasil! Selamat bergabung 🎉');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 relative overflow-hidden bg-gradient-to-br from-[#FFF8F0] via-[#FFE4CC] to-[#FFF4D4]">
      {/* Animated Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-gradient-to-br from-[#FF7A00]/15 to-[#E8A600]/15 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute -bottom-12 -left-12 w-96 h-96 bg-gradient-to-br from-[#B82601]/15 to-[#FF7A00]/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#FF7A00]/5 to-[#E8A600]/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#FF7A00]/20 rounded-full animate-float"
            style={{
              left: `${15 + i * 12}%`,
              top: `${8 + i * 10}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${3.5 + i * 0.3}s`
            }}
          />
        ))}
      </div>

      <div className={`relative z-10 w-full max-w-4xl mx-auto px-4 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="autumn-card border-[#FF7A00]/10 p-8 autumn-shadow-lg backdrop-blur-sm bg-white/95 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 text-[#5A4A32] hover:text-[#B82601] transition-all duration-300 hover:translate-x-[-4px] group">
              <ArrowLeft className="h-4 w-4 group-hover:translate-x-[-2px] transition-transform" />
              <span className="text-sm font-medium">Kembali ke Beranda</span>
            </Link>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-16 h-16 rounded-xl gradient-autumn-hero flex items-center justify-center autumn-glow animate-bounce-soft hover:scale-110 transition-transform duration-300 cursor-pointer">
                <Shell className="h-8 w-8 text-white animate-pulse" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gradient-autumn mb-2 animate-fade-in">Daftar Akun</h1>
            <p className="text-[#5A4A32] text-sm animate-fade-in-delay">
              Bergabung dengan MycoTrack untuk memulai perjalanan Anda
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-6 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
            <Label className="text-[#2D2416] mb-2 block flex items-center gap-2">
              <User className="h-4 w-4 text-[#FF7A00]" />
              Daftar Sebagai
            </Label>
            <Select value={role} onValueChange={(value) => setRole(value as 'customer' | 'petani')}>
              <SelectTrigger className="bg-[#FAF5EF] border-[#FF7A00]/20 hover:border-[#FF7A00]/40 transition-all duration-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#FF7A00]/20">
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="petani">Petani</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Common Fields */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                <Label htmlFor="name" className="text-[#2D2416] flex items-center gap-2">
                  <User className="h-4 w-4 text-[#FF7A00]" />
                  Nama Lengkap *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00] transition-all duration-300 hover:border-[#FF7A00]/40 focus:shadow-lg focus:shadow-[#FF7A00]/20"
                />
              </div>

              <div className="animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
                <Label htmlFor="email" className="text-[#2D2416] flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#FF7A00]" />
                  Email *
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00] transition-all duration-300 hover:border-[#FF7A00]/40 focus:shadow-lg focus:shadow-[#FF7A00]/20"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#FF7A00]/50 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
                <Label htmlFor="password" className="text-[#2D2416] flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#FF7A00]" />
                  Password *
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00] transition-all duration-300 hover:border-[#FF7A00]/40 focus:shadow-lg focus:shadow-[#FF7A00]/20"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#FF7A00]/50 pointer-events-none" />
                </div>
              </div>

              <div className="animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
                <Label htmlFor="phoneNumber" className="text-[#2D2416] flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#FF7A00]" />
                  Nomor HP *
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="081234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="pl-10 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00] transition-all duration-300 hover:border-[#FF7A00]/40 focus:shadow-lg focus:shadow-[#FF7A00]/20"
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#FF7A00]/50 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
              <Label htmlFor="address" className="text-[#2D2416] flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#FF7A00]" />
                Alamat Lengkap *
              </Label>
              <Textarea
                id="address"
                placeholder="Jl. Contoh No. 123, Kota, Provinsi"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00] transition-all duration-300 hover:border-[#FF7A00]/40 focus:shadow-lg focus:shadow-[#FF7A00]/20"
                rows={3}
              />
            </div>

            {/* Customer Specific Fields */}
            {role === 'customer' && (
              <div className="animate-slide-in-up" style={{ animationDelay: '0.7s' }}>
                <Label htmlFor="profilePhoto" className="text-[#2D2416] flex items-center gap-2">
                  <Image className="h-4 w-4 text-[#FF7A00]" />
                  Foto Profil
                </Label>
                <div className="mt-2">
                  <input
                    id="profilePhoto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setProfilePhoto)}
                    className="hidden"
                  />
                  <label
                    htmlFor="profilePhoto"
                    className="flex items-center gap-2 px-4 py-2 bg-[#FAF5EF] border border-[#FF7A00]/20 rounded-md cursor-pointer hover:bg-[#FF7A00]/5 transition-all duration-300 hover:border-[#FF7A00]/40 hover:shadow-md transform hover:scale-[1.02]"
                  >
                    <Upload className="h-4 w-4 text-[#FF7A00] animate-pulse" />
                    <span className="text-sm text-[#5A4A32]">
                      {profilePhoto ? profilePhoto.name : 'Pilih Foto Profil'}
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Petani Specific Fields */}
            {role === 'petani' && (
              <>
                <div className="border-t border-[#FF7A00]/20 pt-6 mt-6 animate-slide-in-up" style={{ animationDelay: '0.7s' }}>
                  <h3 className="text-lg font-bold text-[#B82601] mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Identitas Petani
                  </h3>
                  
                  <div className="mb-5">
                    <Label htmlFor="ktpPhoto" className="text-[#2D2416] flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#FF7A00]" />
                      Foto KTP *
                    </Label>
                    <div className="mt-2">
                      <input
                        id="ktpPhoto"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setKtpPhoto)}
                        required
                        className="hidden"
                      />
                      <label
                        htmlFor="ktpPhoto"
                        className="flex items-center gap-2 px-4 py-2 bg-[#FAF5EF] border border-[#FF7A00]/20 rounded-md cursor-pointer hover:bg-[#FF7A00]/5 transition-all duration-300 hover:border-[#FF7A00]/40 hover:shadow-md transform hover:scale-[1.02]"
                      >
                        <Upload className="h-4 w-4 text-[#FF7A00] animate-pulse" />
                        <span className="text-sm text-[#5A4A32]">
                          {ktpPhoto ? ktpPhoto.name : 'Pilih Foto KTP'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#FF7A00]/20 pt-6 mt-6 animate-slide-in-up" style={{ animationDelay: '0.8s' }}>
                  <h3 className="text-lg font-bold text-[#B82601] mb-4 flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Data Toko Petani
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <Label htmlFor="shopName" className="text-[#2D2416] flex items-center gap-2">
                        <Store className="h-4 w-4 text-[#FF7A00]" />
                        Nama Toko *
                      </Label>
                      <Input
                        id="shopName"
                        type="text"
                        placeholder="Nama Toko Anda"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        required
                        className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00] transition-all duration-300 hover:border-[#FF7A00]/40 focus:shadow-lg focus:shadow-[#FF7A00]/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="shopPhoto" className="text-[#2D2416] flex items-center gap-2">
                        <Image className="h-4 w-4 text-[#FF7A00]" />
                        Foto Toko
                      </Label>
                      <div className="mt-2">
                        <input
                          id="shopPhoto"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, setShopPhoto)}
                          className="hidden"
                        />
                        <label
                          htmlFor="shopPhoto"
                          className="flex items-center gap-2 px-4 py-2 bg-[#FAF5EF] border border-[#FF7A00]/20 rounded-md cursor-pointer hover:bg-[#FF7A00]/5 transition-all duration-300 hover:border-[#FF7A00]/40 hover:shadow-md transform hover:scale-[1.02]"
                        >
                          <Upload className="h-4 w-4 text-[#FF7A00] animate-pulse" />
                          <span className="text-sm text-[#5A4A32]">
                            {shopPhoto ? shopPhoto.name : 'Pilih Foto Toko'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="shopDescription" className="text-[#2D2416] flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#FF7A00]" />
                      Deskripsi Toko *
                    </Label>
                    <Textarea
                      id="shopDescription"
                      placeholder="Deskripsi tentang toko dan produk Anda"
                      value={shopDescription}
                      onChange={(e) => setShopDescription(e.target.value)}
                      required
                      className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00] transition-all duration-300 hover:border-[#FF7A00]/40 focus:shadow-lg focus:shadow-[#FF7A00]/20"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="border-t border-[#FF7A00]/20 pt-6 mt-6 animate-slide-in-up" style={{ animationDelay: '0.9s' }}>
                  <h3 className="text-lg font-bold text-[#B82601] mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Data Lahan Jamur Kuping
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <Label htmlFor="landArea" className="text-[#2D2416] flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#FF7A00]" />
                        Luas Lahan (m²) *
                      </Label>
                      <Input
                        id="landArea"
                        type="number"
                        placeholder="100"
                        value={landArea}
                        onChange={(e) => setLandArea(e.target.value)}
                        required
                        min="0"
                        step="0.01"
                        className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00] transition-all duration-300 hover:border-[#FF7A00]/40 focus:shadow-lg focus:shadow-[#FF7A00]/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="landPhoto" className="text-[#2D2416] flex items-center gap-2">
                        <Image className="h-4 w-4 text-[#FF7A00]" />
                        Foto Lahan
                      </Label>
                      <div className="mt-2">
                        <input
                          id="landPhoto"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, setLandPhoto)}
                          className="hidden"
                        />
                        <label
                          htmlFor="landPhoto"
                          className="flex items-center gap-2 px-4 py-2 bg-[#FAF5EF] border border-[#FF7A00]/20 rounded-md cursor-pointer hover:bg-[#FF7A00]/5 transition-all duration-300 hover:border-[#FF7A00]/40 hover:shadow-md transform hover:scale-[1.02]"
                        >
                          <Upload className="h-4 w-4 text-[#FF7A00] animate-pulse" />
                          <span className="text-sm text-[#5A4A32]">
                            {landPhoto ? landPhoto.name : 'Pilih Foto Lahan'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <Label htmlFor="mushroomType" className="text-[#2D2416] flex items-center gap-2">
                        <Package className="h-4 w-4 text-[#FF7A00]" />
                        Jenis Jamur *
                      </Label>
                      <Input
                        id="mushroomType"
                        type="text"
                        placeholder="Jamur Kuping"
                        value={mushroomType}
                        onChange={(e) => setMushroomType(e.target.value)}
                        required
                        className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00] transition-all duration-300 hover:border-[#FF7A00]/40 focus:shadow-lg focus:shadow-[#FF7A00]/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="rackCount" className="text-[#2D2416] flex items-center gap-2">
                        <Package className="h-4 w-4 text-[#FF7A00]" />
                        Jumlah Rak *
                      </Label>
                      <Input
                        id="rackCount"
                        type="number"
                        placeholder="10"
                        value={rackCount}
                        onChange={(e) => setRackCount(e.target.value)}
                        required
                        min="0"
                        className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00] transition-all duration-300 hover:border-[#FF7A00]/40 focus:shadow-lg focus:shadow-[#FF7A00]/20"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <Label htmlFor="baglogCount" className="text-[#2D2416] flex items-center gap-2">
                        <Package className="h-4 w-4 text-[#FF7A00]" />
                        Jumlah Baglog *
                      </Label>
                      <Input
                        id="baglogCount"
                        type="number"
                        placeholder="500"
                        value={baglogCount}
                        onChange={(e) => setBaglogCount(e.target.value)}
                        required
                        min="0"
                        className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00] transition-all duration-300 hover:border-[#FF7A00]/40 focus:shadow-lg focus:shadow-[#FF7A00]/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="harvestCapacity" className="text-[#2D2416] flex items-center gap-2">
                        <Package className="h-4 w-4 text-[#FF7A00]" />
                        Kapasitas Panen (kg) *
                      </Label>
                      <Input
                        id="harvestCapacity"
                        type="number"
                        placeholder="100"
                        value={harvestCapacity}
                        onChange={(e) => setHarvestCapacity(e.target.value)}
                        required
                        min="0"
                        step="0.01"
                        className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00] transition-all duration-300 hover:border-[#FF7A00]/40 focus:shadow-lg focus:shadow-[#FF7A00]/20"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="animate-slide-in-up pt-2" style={{ animationDelay: role === 'customer' ? '0.8s' : '1.2s' }}>
              <Button 
                type="submit" 
                className="w-full gradient-autumn-cta text-white hover-lift autumn-glow font-semibold mt-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#FF7A00]/50 active:scale-95"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Memproses...
                  </span>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                    Daftar Sekarang
                  </>
                )}
              </Button>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-[#5A4A32]">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-[#FF7A00] hover:text-[#B82601] font-semibold">
                  Masuk
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

