// Simple service worker to handle fetch requests
const CACHE_NAME = 'green-call-crm-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests and avoid API calls
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  // Simple fetch without duplex option
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Fallback for offline scenarios
        return new Response('Offline', { status: 503 });
      })
  );
});