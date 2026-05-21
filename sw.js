// MY ASSISTANT - Service Worker v1.1
const CACHE_NAME = 'my-assistant-v1';
let _scheduled = null;

function _showNotif(title, body) {
  const scope = self.registration.scope;
  return self.registration.showNotification(title || '⏱ 타이머 완료!', {
    body: body || '단계가 끝났어요!',
    icon: scope + 'icon.svg',
    badge: scope + 'badge.svg',
    vibrate: [200, 100, 200, 100, 400],
    tag: 'timer-notification',
    requireInteraction: false,
    silent: false,
    data: { url: self.location.origin }
  });
}

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('message', event => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_NOTIFICATION') {
    event.waitUntil(_showNotif(event.data.title, event.data.body));
  }

  // Android 백그라운드 대응: SW에 종료 시각을 등록해두고 직접 알림 발송
  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    if (_scheduled) { clearTimeout(_scheduled); _scheduled = null; }
    const { title, body, at } = event.data;
    const delay = Math.max(0, at - Date.now());
    _scheduled = setTimeout(() => {
      _showNotif(title, body);
      _scheduled = null;
    }, delay);
  }

  if (event.data.type === 'CANCEL_NOTIFICATION') {
    if (_scheduled) { clearTimeout(_scheduled); _scheduled = null; }
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});
