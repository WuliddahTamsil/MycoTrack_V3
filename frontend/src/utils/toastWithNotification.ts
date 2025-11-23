import { toast as sonnerToast } from 'sonner';

// This will be set by the NotificationProvider
let addNotification: ((type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void) | null = null;

export const setNotificationHandler = (handler: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void) => {
  addNotification = handler;
};

export const toast = {
  success: (message: string, options?: any) => {
    sonnerToast.success(message, options);
    if (addNotification) {
      addNotification('success', 'Berhasil', message);
    }
  },
  error: (message: string, options?: any) => {
    sonnerToast.error(message, options);
    if (addNotification) {
      addNotification('error', 'Error', message);
    }
  },
  info: (message: string, options?: any) => {
    sonnerToast.info(message, options);
    if (addNotification) {
      addNotification('info', 'Informasi', message);
    }
  },
  warning: (message: string, options?: any) => {
    sonnerToast.warning(message, options);
    if (addNotification) {
      addNotification('warning', 'Peringatan', message);
    }
  },
};

