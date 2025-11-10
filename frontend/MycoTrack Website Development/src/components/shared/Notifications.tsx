import React, { useState } from 'react';
import { Bell, Check, Trash2, Package, DollarSign, AlertCircle, TrendingUp, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface Notification {
  id: string;
  type: 'order' | 'payment' | 'alert' | 'info' | 'forum';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: React.ElementType;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Pesanan Baru',
    message: 'Anda menerima pesanan baru sebanyak 5kg Jamur Kuping dari Toko Segar Jaya',
    time: '5 menit yang lalu',
    read: false,
    icon: Package
  },
  {
    id: '2',
    type: 'alert',
    title: 'Peringatan Suhu',
    message: 'Suhu ruangan baglog #3 mencapai 32°C, segera lakukan penyesuaian',
    time: '15 menit yang lalu',
    read: false,
    icon: AlertCircle
  },
  {
    id: '3',
    type: 'payment',
    title: 'Pembayaran Diterima',
    message: 'Pembayaran sebesar Rp 450.000 telah masuk ke saldo Anda',
    time: '1 jam yang lalu',
    read: true,
    icon: DollarSign
  },
  {
    id: '4',
    type: 'info',
    title: 'Kondisi Optimal',
    message: 'Kelembaban pada ruang baglog #1 mencapai tingkat optimal (85%)',
    time: '2 jam yang lalu',
    read: true,
    icon: TrendingUp
  },
  {
    id: '5',
    type: 'forum',
    title: 'Komentar Baru di Forum',
    message: 'Ada 3 balasan baru pada diskusi "Tips Budidaya Jamur Kuping"',
    time: '3 jam yang lalu',
    read: true,
    icon: MessageCircle
  },
];

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState('all');

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(notif => !notif.read);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-blue-100 text-blue-800';
      case 'payment': return 'bg-green-100 text-green-800';
      case 'alert': return 'bg-red-100 text-red-800';
      case 'forum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6" style={{ color: 'var(--primary-orange)' }} />
              <div>
                <CardTitle>Notifikasi</CardTitle>
                <p className="text-sm opacity-60 mt-1">
                  {unreadCount} notifikasi belum dibaca
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={markAllAsRead}
                className="hover:bg-gray-50"
              >
                <Check className="h-4 w-4 mr-2" />
                Tandai Semua Dibaca
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="all">
                Semua ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Belum Dibaca ({unreadCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada notifikasi</p>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      notif.read ? 'bg-white' : 'bg-orange-50 border-orange-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className={`p-2 rounded-lg ${getTypeColor(notif.type)}`}
                      >
                        <notif.icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm">{notif.title}</h4>
                              {!notif.read && (
                                <Badge className="bg-[var(--primary-orange)] text-white px-2 py-0">
                                  Baru
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm opacity-70 mb-2">{notif.message}</p>
                            <p className="text-xs opacity-50">{notif.time}</p>
                          </div>
                          
                          <div className="flex gap-2">
                            {!notif.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notif.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notif.id)}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
