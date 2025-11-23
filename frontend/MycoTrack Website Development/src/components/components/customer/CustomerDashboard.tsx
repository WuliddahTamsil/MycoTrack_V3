import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../shared/DashboardLayout';
import { Store, ShoppingCart, Package, Wallet, User, HelpCircle, FileText, Headphones, Home } from 'lucide-react';
import { CustomerMarketplace } from './CustomerMarketplace';
import { CustomerCart } from './CustomerCart';
import { CustomerOrders } from './CustomerOrders';
import { CustomerBalance } from './CustomerBalance';
import { AccountSettings } from '../shared/AccountSettings';
import { AIChatbot } from '../shared/AIChatbot';
import { ArticleList } from '../shared/ArticleList';
import { ArticleDetail } from '../shared/ArticleDetail';
import { CustomerServiceChat } from './CustomerServiceChat';
import { CustomerDashboardHome } from './CustomerDashboardHome';

type CustomerPage = 'dashboard' | 'marketplace' | 'cart' | 'orders' | 'balance' | 'account' | 'help' | 'articles' | 'article-detail' | 'customer-service';

export const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState<CustomerPage>('dashboard');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  // Handle page query parameter
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam && ['dashboard', 'marketplace', 'cart', 'orders', 'balance', 'account', 'help', 'articles', 'customer-service'].includes(pageParam)) {
      setCurrentPage(pageParam as CustomerPage);
      setSelectedArticleId(null);
    }
  }, [searchParams]);

  const menuItems = [
    { id: 'dashboard' as CustomerPage, icon: Home, label: 'Dashboard' },
    { id: 'marketplace' as CustomerPage, icon: Store, label: 'Toko (Marketplace)' },
    { id: 'cart' as CustomerPage, icon: ShoppingCart, label: 'Keranjang' },
    { id: 'orders' as CustomerPage, icon: Package, label: 'Pesanan Saya' },
    { id: 'balance' as CustomerPage, icon: Wallet, label: 'Saldo Saya' },
    { id: 'articles' as CustomerPage, icon: FileText, label: 'Info / Artikel' },
    { id: 'customer-service' as CustomerPage, icon: Headphones, label: 'Customer Service' },
    { id: 'account' as CustomerPage, icon: User, label: 'Akun Saya' },
    { id: 'help' as CustomerPage, icon: HelpCircle, label: 'Bantuan' },
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
      case 'dashboard':
        return <CustomerDashboardHome 
          onNavigate={(page) => setCurrentPage(page as CustomerPage)} 
          onArticleClick={handleArticleClick}
        />;
      case 'marketplace':
        return <CustomerMarketplace onNavigateToCustomerService={() => setCurrentPage('customer-service')} />;
      case 'cart':
        return <CustomerCart 
          onNavigateToCheckout={() => navigate('/checkout')} 
          onNavigateToCustomerService={() => setCurrentPage('customer-service')}
        />;
      case 'orders':
        return <CustomerOrders />;
      case 'balance':
        return <CustomerBalance />;
      case 'articles':
        return <ArticleList onArticleClick={handleArticleClick} />;
      case 'customer-service':
        return <CustomerServiceChat />;
      case 'account':
        return <AccountSettings />;
      case 'help':
        return <AIChatbot />;
      default:
        return <CustomerDashboardHome 
          onNavigate={(page) => setCurrentPage(page as CustomerPage)} 
          onArticleClick={handleArticleClick}
        />;
    }
  };

  return (
    <DashboardLayout sidebar={sidebar} notifications={2}>
      {renderPage()}
    </DashboardLayout>
  );
};
