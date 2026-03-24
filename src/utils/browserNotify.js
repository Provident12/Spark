/**
 * Request browser notification permission on first use,
 * then show a native push notification.
 */
export function sendBrowserNotification(title, body) {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' });
      }
    });
  }
}

/**
 * Call this early (e.g. on login) to prompt for permission
 * so notifications are ready when needed.
 */
export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}
