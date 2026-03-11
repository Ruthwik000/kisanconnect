import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { RefreshCw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function PWAUpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateSW, setUpdateSW] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleSWUpdate = (event) => {
      setUpdateSW(() => event.detail.updateSW);
      setShowUpdate(true);
    };

    window.addEventListener('sw-update-available', handleSWUpdate);

    return () => {
      window.removeEventListener('sw-update-available', handleSWUpdate);
    };
  }, []);

  const handleUpdate = async () => {
    if (updateSW) {
      await updateSW();
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <Card className="fixed bottom-20 left-4 right-4 z-50 shadow-lg border-2 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1 text-blue-900">
              {t('pwa.updateAvailable', 'Update Available')}
            </h3>
            <p className="text-xs text-blue-700 mb-3">
              {t('pwa.updateDescription', 'A new version is available. Update now for the latest features.')}
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleUpdate}
                className="text-xs px-3 py-1 h-7 bg-blue-600 hover:bg-blue-700"
              >
                {t('pwa.update', 'Update')}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDismiss}
                className="text-xs px-3 py-1 h-7 text-blue-700 hover:bg-blue-100"
              >
                {t('pwa.notNow', 'Not now')}
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="flex-shrink-0 w-6 h-6 p-0 text-blue-700 hover:bg-blue-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}