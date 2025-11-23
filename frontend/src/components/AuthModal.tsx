import React, { useState } from 'react';
import { Sparkles, Shell } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth, UserRole } from './AuthContext';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<UserRole>('customer');
  
  // Register state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<UserRole>('customer');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(loginEmail, loginPassword, loginRole);
      toast.success('Login berhasil! Selamat datang di MycoTrack 🍄');
      onClose();
      // Reset form
      setLoginEmail('');
      setLoginPassword('');
      setLoginRole('customer');
    } catch (error) {
      toast.error('Login gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await register(registerName, registerEmail, registerPassword, registerRole);
      toast.success('Registrasi berhasil! Selamat bergabung 🎉');
      onClose();
      // Reset form
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterRole('customer');
    } catch (error) {
      toast.error('Registrasi gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md autumn-card border-[#FF7A00]/10 p-0 overflow-hidden autumn-shadow-lg">
        {/* Vibrant Autumn Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-[#FF7A00]/15 to-[#E8A600]/15 rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-br from-[#B82601]/15 to-[#FF7A00]/15 rounded-full blur-3xl animate-float"></div>
        </div>

        <div className="relative z-10 p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl gradient-autumn-hero flex items-center justify-center autumn-glow">
                <Shell className="h-6 w-6 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl text-gradient-autumn">Selamat Datang</DialogTitle>
            <DialogDescription className="text-center text-[#5A4A32] text-sm mt-2">
              Platform monitoring jamur berbasis AI & IoT
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#DDE0E3] mb-6">
              <TabsTrigger 
                value="login"
                className="data-[state=active]:gradient-autumn-cta data-[state=active]:text-white font-medium"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="data-[state=active]:gradient-autumn-cta data-[state=active]:text-white font-medium"
              >
                Daftar
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email" className="text-[#2D2416]">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="nama@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="login-password" className="text-[#2D2416]">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="login-role" className="text-[#2D2416]">Login Sebagai</Label>
                  <Select value={loginRole} onValueChange={(value) => setLoginRole(value as UserRole)}>
                    <SelectTrigger className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#FF7A00]/20">
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="petani">Petani</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full gradient-autumn-cta text-white hover-lift autumn-glow font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Memproses...
                    </span>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Masuk
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-[#5A4A32] mt-4">
                  Demo: Gunakan email apapun dengan role yang dipilih
                </p>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="register-name" className="text-[#2D2416]">Nama Lengkap</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Nama Anda"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                    className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="register-email" className="text-[#2D2416]">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="nama@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="register-password" className="text-[#2D2416]">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="register-role" className="text-[#2D2416]">Daftar Sebagai</Label>
                  <Select value={registerRole} onValueChange={(value) => setRegisterRole(value as UserRole)}>
                    <SelectTrigger className="mt-2 bg-[#FAF5EF] border-[#FF7A00]/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#FF7A00]/20">
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="petani">Petani</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full gradient-autumn-cta text-white hover-lift autumn-glow font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Memproses...
                    </span>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Daftar Sekarang
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-[#5A4A32] mt-4">
                  Dengan mendaftar, Anda menyetujui syarat & ketentuan kami
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
