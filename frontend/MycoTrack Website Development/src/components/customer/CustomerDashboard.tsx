import React, { useState } from 'react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { Store, ShoppingCart, Package, Wallet, User, HelpCircle } from 'lucide-react';
import { CustomerMarketplace } from './CustomerMarketplace';
import { CustomerCart } from './CustomerCart';
import { CustomerOrders } from './CustomerOrders';
import { CustomerBalance } from './CustomerBalance';
import { AccountSettings } from '../shared/AccountSettings';
import { AIChatbot } from '../shared/AIChatbot';

type CustomerPage = 'marketplace' | 'cart' | 'orders' | 'balance' | 'account' | 'help';

export const CustomerDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<CustomerPage>('marketplace');

  const menuItems = [
    { id: 'marketplace' as CustomerPage, icon: Store, label: 'Toko (Marketplace)' },
    { id: 'cart' as CustomerPage, icon: ShoppingCart, label: 'Keranjang' },
    { id: 'orders' as CustomerPage, icon: Package, label: 'Pesanan Saya' },
    { id: 'balance' as CustomerPage, icon: Wallet, label: 'Saldo Saya' },
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

  const renderPage = () => {
    switch (currentPage) {
      case 'marketplace':
        return <CustomerMarketplace />;
      case 'cart':
        return <CustomerCart onNavigateToCheckout={() => {}} />;
      case 'orders':
        return <CustomerOrders />;
      case 'balance':
        return <CustomerBalance />;
      case 'account':
        return <AccountSettings />;
      case 'help':
        return <AIChatbot />;
      default:
        return <CustomerMarketplace />;
    }
  };

  return (
    <DashboardLayout sidebar={sidebar} notifications={2}>
      {renderPage()}
    </DashboardLayout>
  );
};
