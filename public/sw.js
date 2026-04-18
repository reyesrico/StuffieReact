/**
 * Stuffie Service Worker
 *
 * Handles Web Push notification display (push event) and navigation
 * when the user clicks a notification (notificationclick event).
 *
 * Deployed to public/sw.js — served at <base>/sw.js on GitHub Pages.
 * Registered in src/main.tsx via navigator.serviceWorker.register().
 */

// ---------------------------------------------------------------------------
// push — display the notification
// ---------------------------------------------------------------------------
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'Stuffie', body: event.data.text(), url: '/notifications' };
  }

  const {
    title = 'Stuffie',
    body  = 'You have a new notification',
    url   = '/notifications',
  } = data;

  // Build icon URL relative to the service worker scope so it works on
  // both localhost and GitHub Pages (/StuffieReact/).
  const iconUrl = `${self.registration.scope}images/stuffie-logo-light.svg`;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:  iconUrl,
      badge: iconUrl,
      tag:   'stuffie-push', // replaces any previous unread notification
      data:  { url },
    })
  );
});

// ---------------------------------------------------------------------------
// notificationclick — focus or open the app
// ---------------------------------------------------------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Convert the relative path (e.g. '/notifications') to a full URL that
  // respects the GitHub Pages sub-path scope.
  const scope = self.registration.scope; // e.g. 'https://reyesrico.github.io/StuffieReact/'
  const urlPath = (event.notification.data?.url || '/').replace(/^\//, '');
  const targetUrl = urlPath ? scope + urlPath : scope;

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus an existing tab if the app is already open
        for (const client of clientList) {
          if (client.url.startsWith(scope) && 'focus' in client) {
            if ('navigate' in client) client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Otherwise open a new tab
        if (clients.openWindow) return clients.openWindow(targetUrl);
      })
  );
});
