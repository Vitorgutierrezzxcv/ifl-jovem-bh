// Service Worker — Central IFL Jovem BH
// Auto-update: network-first for navigation ensures latest version on every open
const CACHE = 'ifl-pwa-v1';
const CORE = ['/', '/index.html', '/manifest.json'];

// Install: cache core assets and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).catch(() => {})
  );
  self.skipWaiting();
});

// Activate: clean old caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for navigation (always latest HTML), cache-first for assets
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests from same origin
  if (req.method !== 'GET' || url.origin !== location.origin) return;

  // Navigation requests (HTML pages) — network-first with content comparison
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const cached = await cache.match(req);

        try {
          const networkRes = await fetch(req);
          const networkText = await networkRes.clone().text();

          // If we have a cached version and content changed, notify clients to reload
          if (cached) {
            const cachedText = await cached.text();
            if (cachedText !== networkText) {
              const clients = await self.clients.matchAll({ type: 'window' });
              clients.forEach((c) => c.postMessage({ type: 'CONTENT_UPDATED' }));
            }
          }

          cache.put(req, networkRes.clone());
          return networkRes;
        } catch {
          // Offline — serve cached version
          return cached || (await cache.match('/index.html')) || Response.error();
        }
      })()
    );
    return;
  }

  // Static assets (JS, CSS, images with content hashes) — cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
        fetch(req).then((res) => {
          if (res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, clone));
          }
          return res;
        }).catch(() => cached)
      );
    })
  );
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
