const CACHE_NAME = 'medimind-v1';
const urlsToCache = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Handle notification click events (e.g., when app is backgrounded)
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Future-proofing for Push Notifications
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : { title: 'MediMind Notification', body: 'Reminder' };
    const options = {
        body: data.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063067.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/3063/3063067.png'
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});