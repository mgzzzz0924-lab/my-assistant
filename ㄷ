// MY ASSISTANT - Service Worker v1.0
const CACHE_NAME = 'my-assistant-v1';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('message', event => {
  if (!event.data) return;
  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body } = event.data;
    event.waitUntil(
      self.registration.showNotification(title || '⏱ 타이머 완료!', {
        body: body || '단계가 끝났어요!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200, 100, 400],
        tag: 'timer-notification',
        requireInteraction: false,
        silent: false,
        data: { url: self.location.origin }
      })
    );
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
