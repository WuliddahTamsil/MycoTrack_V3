import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { CartProvider } from './components/CartContext';
import { NotificationProvider } from './components/NotificationContext';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserDetail } from './components/admin/UserDetail';
import { CheckoutPage } from './pages/CheckoutPage';
import { Toaster } from './components/ui/sonner';
import { ToastInterceptor } from './components/ToastInterceptor';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user } = useAuth();

    if (!user) {
    return <Navigate to="/" replace />;
    }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/" 
        element={!user ? <LandingPage /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/login" 
        element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/register" 
        element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/admin-login" 
        element={!user ? <AdminLoginPage /> : <Navigate to="/dashboard" replace />} 
      />
      
      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {user?.role === 'admin' && <AdminDashboard />}
            {user?.role === 'petani' && <FarmerDashboard />}
            {user?.role === 'customer' && <CustomerDashboard />}
            {!user && <Navigate to="/" replace />}
          </ProtectedRoute>
        }
      />
      
      {/* Admin User Detail Route */}
      <Route
        path="/admin/user-detail/:type/:id"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserDetail />
          </ProtectedRoute>
        }
      />
      
      {/* Checkout Route */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      
      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <ToastInterceptor />
          <AppContent />
          <Toaster position="top-right" />
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
    </BrowserRouter>
  );
}
