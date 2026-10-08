// HACCP Pro — Service Worker v1.0
// Handles: Web Push notifications, offline cache

const CACHE = 'haccp-v1';
const PUSH_ICON = '/logo.png';
const PUSH_BADGE = '/logo.png';

// ── Install ──
self.addEventListener('install', e => {
  self.skipWaiting();
});

// ── Activate ──
self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// ── Push event — received from server ──
self.addEventListener('push', e => {
  let data = { title: 'HACCP Pro', body: 'Lembrete de registo diário.' };
  try {
    data = e.data ? e.data.json() : data;
  } catch(err) {}

  const options = {
    body: data.body || 'Verifique os registos de hoje.',
    icon: PUSH_ICON,
    badge: PUSH_BADGE,
    tag: 'haccp-daily-' + new Date().toISOString().slice(0,10),
    renotify: false,
    requireInteraction: false,
    silent: false,
    data: {
      url: data.url || '/',
      mod: data.mod || null
    },
    actions: [
      { action: 'open', title: '📋 Abrir App' },
      { action: 'dismiss', title: 'Dispensar' }
    ]
  };

  e.waitUntil(
    self.registration.showNotification(data.title || 'HACCP Pro — Lembrete', options)
  );
});

// ── Notification click ──
self.addEventListener('notificationclick', e => {
  e.notification.close();

  if (e.action === 'dismiss') return;

  const targetUrl = (e.notification.data && e.notification.data.url) || '/';

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Se já há uma janela aberta, focar
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          return client.focus();
        }
      }
      // Senão abrir nova janela
      return clients.openWindow(targetUrl);
    })
  );
});

// ── Notification close ──
self.addEventListener('notificationclose', () => {});
