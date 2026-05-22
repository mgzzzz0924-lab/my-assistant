// MY ASSISTANT - Service Worker v1.3
const SW_VERSION = 'v1.3';
let _scheduled = null;

console.log('[SW ' + SW_VERSION + '] loaded');

function _showNotif(title, body) {
  const scope = self.registration.scope;
  return self.registration.showNotification(title || '⏱ 타이머 완료!', {
    body: body || '단계가 끝났어요!',
    icon: scope + 'icon.svg',
    badge: scope + 'badge.svg',
    // 진동 패턴: 강하게 (heads-up trigger 조건 강화)
    vibrate: [300, 100, 300, 100, 300, 100, 500],
    // 매번 다른 tag → Android가 "새 알림"으로 인식 → 팝업 표시
    tag: 'timer-' + Date.now(),
    renotify: true,
    requireInteraction: true,
    // actions가 있으면 Android에서 더 prominent하게 표시되는 경향
    actions: [
      { action: 'open', title: '확인' }
    ],
    data: { url: scope, ts: Date.now() }
  });
}

self.addEventListener('install', event => {
  console.log('[SW ' + SW_VERSION + '] install');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[SW ' + SW_VERSION + '] activate');
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

  // 디버그용: 버전 확인
  if (event.data.type === 'GET_SW_VERSION' && event.source) {
    event.source.postMessage({ type: 'SW_VERSION', version: SW_VERSION });
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
