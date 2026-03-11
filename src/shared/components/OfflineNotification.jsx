import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Wifi, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function OfflineNotification() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      // Hide notification after 3 seconds
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show initial state if offline
    if (!navigator.onLine) {
      setShowNotification(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <Alert className={`${
        isOnline 
          ? 'border-green-200 bg-green-50 text-green-800' 
          : 'border-orange-200 bg-orange-50 text-orange-800'
      }`}>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <AlertDescription>
            {isOnline 
              ? t('pwa.backOnline', 'You\'re back online!')
              : t('pwa.offlineMode', 'You\'re offline. Some features may be limited.')
            }
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}