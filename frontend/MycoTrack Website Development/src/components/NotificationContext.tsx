import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

interface NotificationContextType {
  toastNotifications: ToastNotification[];
  addToastNotification: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toastNotifications, setToastNotifications] = useState<ToastNotification[]>([]);

  const addToastNotification = useCallback((type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const newNotification: ToastNotification = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
      read: false,
      createdAt: new Date(),
    };
    
    setToastNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setToastNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setToastNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setToastNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const unreadCount = toastNotifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        toastNotifications,
        addToastNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

