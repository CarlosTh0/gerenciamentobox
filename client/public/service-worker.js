
const CACHE_NAME = 'cargo-management-v2';
const STATIC_CACHE_NAME = 'static-v2';
const DYNAMIC_CACHE_NAME = 'dynamic-v2';

const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon.ico',
  '/favicon.svg',
  '/manifest.json'
];

// Instalação e cache de arquivos estáticos
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installed successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated successfully');
      return self.clients.claim();
    })
  );
});

// Estratégia de cache: Network First para API, Cache First para assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não HTTP
  if (!request.url.startsWith('http')) {
    return;
  }

  // Estratégia para API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => {
                cache.put(request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Estratégia para assets estáticos e páginas
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Update cache in background
          fetch(request).then(response => {
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(STATIC_CACHE_NAME)
                .then(cache => {
                  cache.put(request, responseToCache);
                });
            }
          }).catch(() => {
            // Silently fail background updates
          });
          
          return cachedResponse;
        }

        // If not in cache, fetch from network
        return fetch(request)
          .then(response => {
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(DYNAMIC_CACHE_NAME)
                .then(cache => {
                  cache.put(request, responseToCache);
                });
            }
            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            throw error;
          });
      })
  );
});

// Background Sync para sincronização offline
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      syncData()
    );
  }
});

// Push notifications (preparado para uso futuro)
self.addEventListener('push', event => {
  console.log('Service Worker: Push message received', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'cargo-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'Visualizar'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Sistema de Cargas', options)
  );
});

// Função para sincronizar dados offline
async function syncData() {
  try {
    const offlineData = await getOfflineData();
    if (offlineData && offlineData.length > 0) {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offlineData)
      });

      if (response.ok) {
        await clearOfflineData();
        console.log('Service Worker: Offline data synced successfully');
      }
    }
  } catch (error) {
    console.error('Service Worker: Sync failed', error);
    throw error;
  }
}

// Helpers para gerenciar dados offline
async function getOfflineData() {
  return new Promise((resolve) => {
    const data = localStorage.getItem('cargo-offline-data');
    resolve(data ? JSON.parse(data) : []);
  });
}

async function clearOfflineData() {
  localStorage.removeItem('cargo-offline-data');
}
