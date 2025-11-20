import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Shell, ArrowLeft, Shield, Mail, Lock } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { useAuth } from '../components/AuthContext';
import { toast } from 'sonner';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password, 'admin');
      toast.success('Login admin berhasil! Selamat datang 🍄');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#FFF8F0] via-[#FFE4CC] to-[#FFF4D4]">
      {/* Animated Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-gradient-to-br from-[#FF7A00]/15 to-[#E8A600]/15 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute -bottom-12 -left-12 w-96 h-96 bg-gradient-to-br from-[#B82601]/15 to-[#FF7A00]/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-[#B82601]/8 to-[#FF7A00]/8 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#B82601]/20 rounded-full animate-float"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 12}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          />
        ))}
      </div>

      <div className={`relative z-10 w-full max-w-md mx-auto px-4 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="autumn-card border-[#FF7A00]/10 p-8 autumn-shadow-lg backdrop-blur-sm bg-white/95 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 text-[#5A4A32] hover:text-[#B82601] transition-all duration-300 hover:translate-x-[-4px] group">
              <ArrowLeft className="h-4 w-4 group-hover:translate-x-[-2px] transition-transform" />
              <span className="text-sm font-medium">Kembali ke Beranda</span>
            </Link>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-16 h-16 rounded-xl gradient-red-fire flex items-center justify-center autumn-glow animate-bounce-soft hover:scale-110 transition-transform duration-300 cursor-pointer">
                <Shield className="h-8 w-8 text-white animate-pulse" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gradient-fire mb-2 animate-fade-in">Admin Login</h1>
            <p className="text-[#5A4A32] text-sm animate-fade-in-delay">
              Akses khusus untuk administrator MycoTrack
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
              <Label htmlFor="email" className="text-[#2D2416] flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#B82601]" />
                Email
              </Label>
              <div className="relative mt-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@mycotrack.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00] transition-all duration-300 hover:border-[#FF7A00]/40 focus:shadow-lg focus:shadow-[#B82601]/20"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B82601]/50 pointer-events-none" />
              </div>
            </div>
            
            <div className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              <Label htmlFor="password" className="text-[#2D2416] flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#B82601]" />
                Password
              </Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-[#FAF5EF] border-[#FF7A00]/20 focus:border-[#FF7A00] focus:ring-[#FF7A00] transition-all duration-300 hover:border-[#FF7A00]/40 focus:shadow-lg focus:shadow-[#B82601]/20"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B82601]/50 pointer-events-none" />
              </div>
            </div>
            
            <div className="animate-slide-in-up pt-2" style={{ animationDelay: '0.3s' }}>
              <Button 
                type="submit" 
                className="w-full gradient-red-fire text-white hover-lift autumn-glow font-semibold mt-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#B82601]/50 active:scale-95"
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
                    Masuk sebagai Admin
                  </>
                )}
              </Button>
            </div>

            <div className="text-center mt-6">
              <p className="text-xs text-[#5A4A32]/70">
                Bukan admin?{' '}
                <Link to="/login" className="text-[#FF7A00] hover:text-[#B82601] font-semibold underline">
                  Login sebagai Customer/Petani
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

