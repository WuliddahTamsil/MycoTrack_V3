import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Package, DollarSign, AlertCircle, TrendingUp, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';
import { useNotificationContext } from '../NotificationContext';

const API_BASE_URL = 'http://localhost:3000/api';

interface Notification {
  id: string;
  userId: string;
  type: 'new_order' | 'order_status' | 'payment' | 'alert' | 'info' | 'forum';
  title: string;
  message: string;
  orderId?: string | null;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const Notifications: React.FC = () => {
  const { user } = useAuth();
  const { toastNotifications, markAsRead: markToastAsRead, markAllAsRead: markAllToastAsRead, deleteNotification: deleteToastNotification, unreadCount: toastUnreadCount } = useNotificationContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      // Poll for new notifications every 5 seconds
      const interval = setInterval(() => {
        fetchNotifications();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Check if it's a toast notification
      if (id.startsWith('toast-')) {
        markToastAsRead(id);
        return;
      }

      // Otherwise, it's an API notification
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setNotifications(notifications.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Gagal menandai notifikasi');
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all API notifications as read
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(unreadNotifications.map(n => markAsRead(n.id)));
      
      // Mark all toast notifications as read
      markAllToastAsRead();
      
      toast.success('Semua notifikasi ditandai sebagai sudah dibaca');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = (id: string) => {
    if (id.startsWith('toast-')) {
      deleteToastNotification(id);
    } else {
      setNotifications(notifications.filter(notif => notif.id !== id));
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_order':
      case 'order_status':
        return Package;
      case 'payment':
        return DollarSign;
      case 'alert':
        return AlertCircle;
      case 'forum':
        return MessageCircle;
      case 'success':
        return Check;
      case 'error':
        return AlertCircle;
      case 'info':
        return TrendingUp;
      case 'warning':
        return AlertCircle;
      default:
        return TrendingUp;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'new_order':
      case 'order_status':
        return 'bg-blue-100 text-blue-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'alert':
        return 'bg-red-100 text-red-800';
      case 'forum':
        return 'bg-purple-100 text-purple-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: string | Date) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit yang lalu`;
    if (hours < 24) return `${hours} jam yang lalu`;
    if (days < 7) return `${days} hari yang lalu`;
    return date.toLocaleDateString('id-ID');
  };

  // Combine API notifications and toast notifications
  const allNotifications = [
    ...notifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt,
      source: 'api' as const,
    })),
    ...toastNotifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
      source: 'toast' as const,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredNotifications = activeTab === 'all' 
    ? allNotifications 
    : allNotifications.filter(notif => !notif.read);

  const unreadCount = notifications.filter(n => !n.read).length + toastUnreadCount;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-[#FF7A00]/30 border-t-[#FF7A00] rounded-full animate-spin mx-auto"></div>
          <p className="text-[#5A4A32] mt-4">Memuat notifikasi...</p>
        </div>
      </div>
    );
  }

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
                filteredNotifications.map((notif) => {
                  const IconComponent = getIcon(notif.type);
                  return (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (!notif.read) {
                          markAsRead(notif.id);
                        }
                      }}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer hover:shadow-md ${
                        notif.read ? 'bg-white' : 'bg-orange-50 border-orange-200'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className={`p-2 rounded-lg ${getTypeColor(notif.type)}`}
                        >
                          <IconComponent className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-semibold">{notif.title}</h4>
                                {!notif.read && (
                                  <Badge className="bg-[var(--primary-orange)] text-white px-2 py-0">
                                    Baru
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm opacity-70 mb-2">{notif.message}</p>
                              <p className="text-xs opacity-50">{formatTime(notif.createdAt)}</p>
                            </div>
                            
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
