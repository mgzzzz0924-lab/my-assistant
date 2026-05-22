// MY ASSISTANT - Service Worker v1.2
const CACHE_NAME = 'my-assistant-v1';
let _scheduled = null;

function _showNotif(title, body) {
  const scope = self.registration.scope;
  return self.registration.showNotification(title || '⏱ 타이머 완료!', {
    body: body || '단계가 끝났어요!',
    icon: scope + 'icon.svg',
    badge: scope + 'badge.svg',
    vibrate: [200, 80, 200, 80, 400],
    // tag를 고정값으로 쓰면 Android가 "기존 알림 업데이트"로 인식 → 팝업 안 뜸
    // 매번 다른 tag를 쓰면 항상 새 알림으로 인식 → 팝업(heads-up) 뜸
    tag: 'timer-' + Date.now(),
    renotify: true,
    requireInteraction: true,
    data: { url: scope }
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
