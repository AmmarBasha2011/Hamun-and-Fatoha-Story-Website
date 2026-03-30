const CACHE_NAME = 'story-v3.5';
const ASSETS = [
  '/',
  '/css/style.css',
  '/covers/season1.jpg',
  '/covers/season2.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
