const CACHE_NAME = 'v7-ammari-nexus-cache';
const ASSETS = [
  '/',
  '/css/style.css',
  '/js/main.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
    );
});

// V7 Push Notification Handling
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'المجرّة العَمّارية', body: 'تطور جديد في الملحمة!' };
    const options = {
        body: data.body,
        icon: '/covers/season1.jpg',
        badge: '/covers/season2.jpg',
        vibrate: [200, 100, 200],
        data: { url: data.url || '/' }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url));
});
