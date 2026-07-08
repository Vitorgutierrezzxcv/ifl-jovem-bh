import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

// PWA auto-update: register SW, reload when a new version takes control
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    let refreshing = false;

    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // When a new SW is installed, tell it to activate immediately
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          // New SW finished installing and is waiting to activate
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            newWorker.postMessage('SKIP_WAITING');
          }
        });
      });
    }).catch(() => {});

    // Reload once when the new SW takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    // Check for updates periodically and when the app becomes visible
    const checkForUpdates = () => {
      navigator.serviceWorker.getRegistration().then((reg) => reg && reg.update()).catch(() => {});
    };
    setInterval(checkForUpdates, 60000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkForUpdates();
    });
  });
}