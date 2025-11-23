import React, { ReactNode, useState, useEffect } from 'react';
import { Bell, LogOut, Shell, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useAuth } from '../AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  notifications?: number;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  sidebar,
  notifications = 0 
}) => {
  const { user, logout } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    // Load profile photo from localStorage or user object
    const loadPhoto = () => {
      if (user?.id) {
        const saved = localStorage.getItem(`profilePhoto_${user.id}`);
        setProfilePhoto(saved || user.profilePhoto || null);
      }
    };
    
    loadPhoto();
    
    // Listen for storage changes (when photo is updated in AccountSettings)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `profilePhoto_${user?.id}`) {
        setProfilePhoto(e.newValue || null);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event for same-window updates
    const handlePhotoUpdate = () => {
      loadPhoto();
    };
    
    window.addEventListener('profilePhotoUpdated', handlePhotoUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profilePhotoUpdated', handlePhotoUpdate);
    };
  }, [user]);

  const getRoleBadgeClass = () => {
    switch (user?.role) {
      case 'admin':
        return 'gradient-yellow-gold';
      case 'petani':
        return 'gradient-red-fire';
      case 'customer':
        return 'gradient-orange-warm';
      default:
        return 'gradient-autumn-cta';
    }
  };

  return (
    <div className="flex h-screen relative overflow-hidden bg-[#FFF8F0]">
      {/* Vibrant Autumn Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-[#FF7A00]/8 to-[#E8A600]/8 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-[#B82601]/6 to-[#FF7A00]/6 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Sidebar */}
      <aside className="w-72 bg-white/90 backdrop-blur-md border-r border-[#FF7A00]/10 flex flex-col relative z-10 autumn-shadow">
        <div className="p-6 border-b border-[#FF7A00]/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-autumn-hero flex items-center justify-center autumn-glow">
              <Shell className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient-autumn">MycoTrack</span>
          </div>
          
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${getRoleBadgeClass()} text-white text-sm autumn-shadow font-medium`}>
            <Sparkles className="h-3 w-3" />
            {user?.role === 'admin' ? 'Admin' : user?.role === 'petani' ? 'Petani' : 'Customer'}
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4">
          {sidebar}
        </nav>
        
        <div className="p-4 border-t border-[#FF7A00]/10">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-[#B82601] hover:text-[#8B1C01] hover:bg-[#B82601]/5 font-medium"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Bar */}
        <header className="bg-white/90 backdrop-blur-md border-b border-[#FF7A00]/10 px-8 py-5 autumn-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl mb-1 text-[#B82601] font-bold">
                Selamat Datang, {user?.name} 👋
              </h1>
              <p className="text-sm text-[#5A4A32] font-medium">
                {user?.email}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative autumn-card p-3 rounded-xl hover-lift transition-all">
                <Bell className="h-5 w-5 text-[#FF7A00]" />
                {notifications > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs gradient-autumn-cta text-white border-0 animate-pulse font-bold"
                  >
                    {notifications}
                  </Badge>
                )}
              </button>
              
              <Avatar className="w-12 h-12 rounded-2xl autumn-shadow">
                {profilePhoto ? (
                  <AvatarImage src={profilePhoto} alt={user?.name} className="object-cover rounded-2xl" />
                ) : null}
                <AvatarFallback className={`${getRoleBadgeClass()} text-white text-lg font-bold rounded-2xl`}>
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
