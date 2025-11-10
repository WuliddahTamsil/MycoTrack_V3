import React, { useState } from 'react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { Home, Bell, Users, UserCheck, FileText, BarChart3, Settings } from 'lucide-react';
import { AdminHome } from './AdminHome';
import { AdminFarmers } from './AdminFarmers';
import { AdminContent } from './AdminContent';
import { AdminCustomers } from './AdminCustomers';
import { AdminAnalytics } from './AdminAnalytics';
import { Notifications } from '../shared/Notifications';
import { AccountSettings } from '../shared/AccountSettings';

type AdminPage = 'home' | 'notifications' | 'farmers' | 'customers' | 'content' | 'analytics' | 'settings';

export const AdminDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AdminPage>('home');

  const menuItems = [
    { id: 'home' as AdminPage, icon: Home, label: 'Dashboard' },
    { id: 'notifications' as AdminPage, icon: Bell, label: 'Notifikasi' },
    { id: 'farmers' as AdminPage, icon: Users, label: 'Manajemen Petani' },
    { id: 'customers' as AdminPage, icon: UserCheck, label: 'Manajemen Customer' },
    { id: 'content' as AdminPage, icon: FileText, label: 'Manajemen Konten' },
    { id: 'analytics' as AdminPage, icon: BarChart3, label: 'Analitik Data' },
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
        return <AdminHome />;
      case 'farmers':
        return <AdminFarmers />;
      case 'content':
        return <AdminContent />;
      case 'customers':
        return <AdminCustomers />;
      case 'analytics':
        return <AdminAnalytics />;
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
