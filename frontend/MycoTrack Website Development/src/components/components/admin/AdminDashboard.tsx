import React, { useState } from 'react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { Home, Bell, FileText, BarChart3, Settings, UserCog, MapPin, Headphones } from 'lucide-react';
import { AdminHome } from './AdminHome';
import { AdminContent } from './AdminContent';
import { AdminAnalytics } from './AdminAnalytics';
import { Notifications } from '../shared/Notifications';
import { AccountSettings } from '../shared/AccountSettings';
import { UserManagement } from './UserManagement';
import { FarmerDistributionMap } from './FarmerDistributionMap';
import { AdminCustomerService } from './AdminCustomerService';

type AdminPage = 'home' | 'notifications' | 'user-management' | 'content' | 'analytics' | 'farmer-distribution' | 'customer-service' | 'settings';

export const AdminDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AdminPage>('home');

  const menuItems = [
    { id: 'home' as AdminPage, icon: Home, label: 'Dashboard' },
    { id: 'notifications' as AdminPage, icon: Bell, label: 'Notifikasi' },
    { id: 'user-management' as AdminPage, icon: UserCog, label: 'Manajemen User' },
    { id: 'farmer-distribution' as AdminPage, icon: MapPin, label: 'Persebaran Petani' },
    { id: 'content' as AdminPage, icon: FileText, label: 'Manajemen Konten' },
    { id: 'analytics' as AdminPage, icon: BarChart3, label: 'Analitik Data' },
    { id: 'customer-service' as AdminPage, icon: Headphones, label: 'Customer Service' },
    { id: 'settings' as AdminPage, icon: Settings, label: 'Pengaturan Akun' },
  ];

  const sidebar = (
    <div className="space-y-1">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setCurrentPage(item.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
            currentPage === item.id
              ? 'gradient-autumn-cta text-white shadow-lg autumn-glow hover-lift'
              : 'text-[#5A4A32] hover:bg-[#FF7A00]/10 hover:text-[#B82601] hover:translate-x-1'
          }`}
        >
          <item.icon className="h-5 w-5" />
          <span className="text-sm">{item.label}</span>
        </button>
      ))}
    </div>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <AdminHome onNavigate={(page: AdminPage) => setCurrentPage(page)} />;
      case 'user-management':
        return <UserManagement />;
      case 'farmer-distribution':
        return <FarmerDistributionMap />;
      case 'content':
        return <AdminContent />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'customer-service':
        return <AdminCustomerService />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <AccountSettings />;
      default:
        return <AdminHome />;
    }
  };

  return (
    <DashboardLayout sidebar={sidebar} notifications={5}>
      {renderPage()}
    </DashboardLayout>
  );
};
