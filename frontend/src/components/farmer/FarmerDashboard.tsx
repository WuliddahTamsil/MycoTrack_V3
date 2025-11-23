import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { Home, Bell, History, Image, Package, ShoppingBag, Wallet, MessageSquare, HelpCircle, Settings, FileText } from 'lucide-react';
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
import { ArticleList } from '../shared/ArticleList';
import { ArticleDetail } from '../shared/ArticleDetail';
import { useAuth } from '../AuthContext';

const API_BASE_URL = 'http://localhost:3000/api';

type FarmerPage = 'monitoring' | 'history' | 'gallery' | 'products' | 'add-product' | 'orders' | 'balance' | 'forum' | 'help' | 'settings' | 'notifications' | 'articles' | 'article-detail';

export const FarmerDashboard = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('monitoring' as FarmerPage);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchNotificationCount();
      // Poll for new notifications every 5 seconds
      const interval = setInterval(() => {
        fetchNotificationCount();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const fetchNotificationCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setUnreadNotifications(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const menuItems = [
    { id: 'monitoring' as FarmerPage, icon: Home, label: 'Dashboard Monitoring' },
    { id: 'notifications' as FarmerPage, icon: Bell, label: 'Notifikasi' },
    { id: 'history' as FarmerPage, icon: History, label: 'Riwayat & Ekspor' },
    { id: 'gallery' as FarmerPage, icon: Image, label: 'Galeri Pertumbuhan' },
    { id: 'products' as FarmerPage, icon: Package, label: 'Daftar Produk' },
    { id: 'orders' as FarmerPage, icon: ShoppingBag, label: 'Manajemen Pesanan' },
    { id: 'balance' as FarmerPage, icon: Wallet, label: 'Saldo & Keuangan' },
    { id: 'articles' as FarmerPage, icon: FileText, label: 'Info / Artikel' },
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

  const handleArticleClick = (articleId: string) => {
    setSelectedArticleId(articleId);
    setCurrentPage('article-detail');
  };

  const handleBackToArticles = () => {
    setSelectedArticleId(null);
    setCurrentPage('articles');
  };

  const renderPage = () => {
    if (currentPage === 'article-detail' && selectedArticleId) {
      return <ArticleDetail articleId={selectedArticleId} onBack={handleBackToArticles} />;
    }

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
      case 'articles':
        return <ArticleList onArticleClick={handleArticleClick} />;
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
    <DashboardLayout sidebar={sidebar} notifications={unreadNotifications}>
      {renderPage()}
    </DashboardLayout>
  );
};
