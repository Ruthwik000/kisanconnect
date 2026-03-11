// PWA utilities for service worker registration and updates

export const registerSW = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Import the registerSW function from vite-plugin-pwa
      const { registerSW } = await import('virtual:pwa-register');
      
      const updateSW = registerSW({
        onNeedRefresh() {
          // Dispatch custom event when update is available
          const event = new CustomEvent('sw-update-available', {
            detail: { updateSW }
          });
          window.dispatchEvent(event);
        },
        onOfflineReady() {
          console.log('App ready to work offline');
        },
        onRegistered(registration) {
          console.log('Service Worker registered successfully:', registration);
        },
        onRegisterError(error) {
          console.error('Service Worker registration failed:', error);
        }
      });
      
      return updateSW;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

export const showUpdateNotification = () => {
  // Create a custom event to notify the app about updates
  const event = new CustomEvent('sw-update-available');
  window.dispatchEvent(event);
};

export const skipWaiting = () => {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
};

// Check if app is running as PWA
export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
};

// Check if device supports PWA installation
export const canInstallPWA = () => {
  return 'serviceWorker' in navigator && 
         'PushManager' in window && 
         'Notification' in window;
};

// Get PWA display mode
export const getPWADisplayMode = () => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
  const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
  
  if (isFullscreen) return 'fullscreen';
  if (isStandalone) return 'standalone';
  if (isMinimalUI) return 'minimal-ui';
  return 'browser';
};

// Track PWA usage analytics
export const trackPWAUsage = () => {
  const displayMode = getPWADisplayMode();
  const isInstalled = isPWA();
  
  // You can send this data to your analytics service
  console.log('PWA Usage:', { displayMode, isInstalled });
  
  return { displayMode, isInstalled };
};