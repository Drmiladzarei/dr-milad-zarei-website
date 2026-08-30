const CACHE_NAME = 'dr-milad-zarei-v1';

const STATIC_ASSETS = [
  './',
  './index.html'
];

// Install: cache the main page and essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: remove old versions of the cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: serve cached files when available
self.addEventListener('fetch', event => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        // Return cached version immediately,
        // while updating it in the background.
        event.waitUntil(
          fetch(request)
            .then(response => {
              if (
                response &&
                response.ok &&
                response.type === 'basic'
              ) {
                return caches.open(CACHE_NAME).then(cache => {
                  return cache.put(request, response.clone());
                });
              }
            })
            .catch(() => {})
        );

        return cachedResponse;
      }

      // Not cached: download it normally,
      // then save a copy for the next visit.
      return fetch(request)
        .then(response => {
          if (
            response &&
            response.ok &&
            (
              response.type === 'basic' ||
              response.type === 'cors'
            )
          ) {
            const responseClone = response.clone();

            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone).catch(() => {});
            });
          }

          return response;
        })
        .catch(() => {
          // If offline and nothing is cached,
          // return the cached homepage.
          return caches.match('./index.html');
        });
    })
  );
});
