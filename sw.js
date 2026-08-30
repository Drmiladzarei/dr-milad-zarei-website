const CACHE_NAME = 'dr-milad-zarei-cache-v2';

const PRECACHE = [
  './',
  './index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

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

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // درخواست‌های Supabase را Cache نمی‌کنیم
  if (
    url.pathname.includes('/rest/') ||
    url.pathname.includes('/auth/') ||
    url.pathname.includes('/functions/')
  ) {
    return;
  }

  // ویدئوها و درخواست‌های Range را به خود مرورگر می‌سپاریم
  if (
    request.destination === 'video' ||
    request.headers.get('range')
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {

      // اگر قبلاً ذخیره شده، مستقیماً از Cache بخوان
      // و دوباره از اینترنت دانلود نکن
      if (cached) {
        return cached;
      }

      // اگر اولین بار است، از اینترنت دریافت کن
      return fetch(request).then(response => {

        if (!response || !response.ok) {
          return response;
        }

        // ذخیره نسخه دریافت‌شده برای دفعات بعد
        if (
          response.type === 'basic' ||
          response.type === 'cors'
        ) {
          const responseClone = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseClone).catch(() => {});
            });
        }

        return response;
      });

    }).catch(() => {

      // در حالت آفلاین، صفحه اصلی را نمایش بده
      return caches.match('./index.html');

    })
  );
});
