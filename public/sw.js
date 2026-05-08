self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title ?? 'Vlinder League';
  const options = {
    body: data.body ?? '',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: data.tag ?? 'vlinder-reminder',
    data: { url: data.url ?? '/predictions' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/predictions';
  event.waitUntil(clients.openWindow(url));
});
