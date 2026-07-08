import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

// PWA auto-update: registers service worker and reloads when new content is available
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      let refreshing = false;

      // Reload when a new service worker takes control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      // Listen for content update messages from the service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'CONTENT_UPDATED' && !refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      // Check for SW updates on app focus and periodically
      const checkForUpdates = () => registration.update().catch(() => {});
      checkForUpdates();
      setInterval(checkForUpdates, 60000);

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdates();
      });
    }).catch(() => {});
  });
}