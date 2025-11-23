import React, { useState } from 'react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { Home, Bell, History, Image, Package, ShoppingBag, Wallet, MessageSquare, HelpCircle, Settings } from 'lucide-react';
import { FarmerMonitoring } from './FarmerMonitoring';
import { FarmerProducts } from './FarmerProducts';
import { FarmerOrders } from './FarmerOrders';
import { FarmerBalance } from './FarmerBalance';
import { FarmerHistory } from './FarmerHistory';
import { Notifications } from '../shared/Notifications';
import { GrowthGallery } from '../shared/GrowthGallery';
import { ForumDiscussion } from '../shared/ForumDiscussion';
import { AIChatbot } from '../shared/AIChatbot';
import { AccountSettings } from '../shared/AccountSettings';

type FarmerPage = 'monitoring' | 'history' | 'gallery' | 'products' | 'add-product' | 'orders' | 'balance' | 'forum' | 'help' | 'settings' | 'notifications';

export const FarmerDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<FarmerPage>('monitoring');

  const menuItems = [
    { id: 'monitoring' as FarmerPage, icon: Home, label: 'Dashboard Monitoring' },
    { id: 'notifications' as FarmerPage, icon: Bell, label: 'Notifikasi' },
    { id: 'history' as FarmerPage, icon: History, label: 'Riwayat & Ekspor' },
    { id: 'gallery' as FarmerPage, icon: Image, label: 'Galeri Pertumbuhan' },
    { id: 'products' as FarmerPage, icon: Package, label: 'Daftar Produk' },
    { id: 'orders' as FarmerPage, icon: ShoppingBag, label: 'Manajemen Pesanan' },
    { id: 'balance' as FarmerPage, icon: Wallet, label: 'Saldo & Keuangan' },
    { id: 'forum' as FarmerPage, icon: MessageSquare, label: 'Forum Diskusi' },
    { id: 'help' as FarmerPage, icon: HelpCircle, label: 'Bantuan (AI Chatbot)' },
    { id: 'settings' as FarmerPage, icon: Settings, label: 'Pengaturan Akun' },
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
      case 'monitoring':
        return <FarmerMonitoring />;
      case 'history':
        return <FarmerHistory />;
      case 'products':
        return <FarmerProducts />;
      case 'orders':
        return <FarmerOrders />;
      case 'balance':
        return <FarmerBalance />;
      case 'notifications':
        return <Notifications />;
      case 'gallery':
        return <GrowthGallery />;
      case 'forum':
        return <ForumDiscussion />;
      case 'help':
        return <AIChatbot />;
      case 'settings':
        return <AccountSettings />;
      default:
        return <FarmerMonitoring />;
    }
  };

  return (
    <DashboardLayout sidebar={sidebar} notifications={3}>
      {renderPage()}
    </DashboardLayout>
  );
};
