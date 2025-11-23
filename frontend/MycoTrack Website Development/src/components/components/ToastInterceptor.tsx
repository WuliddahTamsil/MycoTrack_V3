import { useEffect } from 'react';
import { useNotificationContext } from './NotificationContext';
import { toast as sonnerToast } from 'sonner';

export const ToastInterceptor: React.FC = () => {
  const { addToastNotification } = useNotificationContext();

  useEffect(() => {
    // Intercept toast calls by wrapping the original toast functions
    const originalSuccess = sonnerToast.success;
    const originalError = sonnerToast.error;
    const originalInfo = sonnerToast.info;
    const originalWarning = sonnerToast.warning;

    sonnerToast.success = (message: string, options?: any) => {
      addToastNotification('success', 'Berhasil', typeof message === 'string' ? message : 'Operasi berhasil');
      return originalSuccess(message, options);
    };

    sonnerToast.error = (message: string, options?: any) => {
      addToastNotification('error', 'Error', typeof message === 'string' ? message : 'Terjadi kesalahan');
      return originalError(message, options);
    };

    sonnerToast.info = (message: string, options?: any) => {
      addToastNotification('info', 'Informasi', typeof message === 'string' ? message : 'Informasi');
      return originalInfo(message, options);
    };

    sonnerToast.warning = (message: string, options?: any) => {
      addToastNotification('warning', 'Peringatan', typeof message === 'string' ? message : 'Peringatan');
      return originalWarning(message, options);
    };

    return () => {
      // Restore original functions on unmount
      sonnerToast.success = originalSuccess;
      sonnerToast.error = originalError;
      sonnerToast.info = originalInfo;
      sonnerToast.warning = originalWarning;
    };
  }, [addToastNotification]);

  return null;
};

