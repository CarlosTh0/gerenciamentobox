// Service worker para suporte offline

const CACHE_NAME = 'cargo-management-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/favicon.ico',
  '/manifest.json'
];

// Instalação e cache de arquivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Estratégia de cache: Stale-While-Revalidate
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // Return cached response if available
          if (cachedResponse) {
            // Revalidate for next time in background
            fetch(event.request)
              .then(response => {
                // Update the cache
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, response);
                  });
              })
              .catch(() => {
                // If fetch fails, we still have cached version
              });
            
            return cachedResponse;
          }

          // Otherwise, get from network
          return fetch(event.request)
            .then(response => {
              // Don't cache if not a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clone the response because it's used by the browser too
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              
              return response;
            })
            .catch(() => {
              // Network failed, show offline page for HTML requests
              if (event.request.headers.get('accept').includes('text/html')) {
                return caches.match('/offline.html');
              }
            });
        })
    );
  }
});

// Clean old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle sync events for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'sync-cargas') {
    event.waitUntil(syncData());
  }
});

// Function to sync data when online
async function syncData() {
  // This would synchronize with a backend server
  // For now, it's just a placeholder
  console.log('Syncing data with server...');
  return true;
}
