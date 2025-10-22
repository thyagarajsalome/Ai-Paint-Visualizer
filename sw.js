// A simple, no-op service worker that takes immediate control.
// This is the simplest possible service worker that will satisfy the PWA install criteria.
// In a real-world app, you would add caching strategies here.

const CACHE_NAME = 'ai-paint-visualizer-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  // Note: Dynamically imported assets via importmap are harder to cache statically.
  // A more advanced service worker would cache these at runtime.
];

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

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