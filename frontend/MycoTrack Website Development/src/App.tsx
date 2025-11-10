import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import { CartProvider } from './components/CartContext';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Toaster } from './components/ui/sonner';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    if (!user) {
      return <LandingPage onOpenAuth={() => setIsAuthModalOpen(true)} />;
    }

    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'petani':
        return <FarmerDashboard />;
      case 'customer':
        return <CustomerDashboard />;
      default:
        return <LandingPage onOpenAuth={() => setIsAuthModalOpen(true)} />;
    }
  };

  return (
    <>
      {renderDashboard()}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <Toaster position="top-right" />
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
