import { today, daysBetween } from './utils.js';

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function checkAndNotify(entries) {
  if (Notification.permission !== 'granted') return;

  const t = today();
  const toNotify = [];

  entries.forEach((e) => {
    if (!e.deadline || e.status === 'rejected' || e.status === 'offer') return;

    const dl = new Date(e.deadline);
    dl.setHours(0, 0, 0, 0);
    const diff = daysBetween(dl, t);

    // Notify for overdue, today, and tomorrow
    if (diff === -1) {
      toNotify.push({
        title: `${e.company} — ${e.role}`,
        body: `Deadline was yesterday. Apply now or mark rejected.`,
        tag: `overdue-${e.id}`,
      });
    } else if (diff === 0) {
      toNotify.push({
        title: `${e.company} — ${e.role}`,
        body: `Application deadline is TODAY!`,
        tag: `today-${e.id}`,
      });
    } else if (diff === 1) {
      toNotify.push({
        title: `${e.company} — ${e.role}`,
        body: `Application deadline is TOMORROW.`,
        tag: `tomorrow-${e.id}`,
      });
    }
  });

  toNotify.forEach(({ title, body, tag }) => {
    // Use tag to prevent duplicate notifications
    new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
      tag,
      badge: '/icons/favicon.ico',
      requireInteraction: diff <= 0,
    });
  });
}

export function scheduleNotificationCheck() {
  // Try to schedule via service worker for periodic checks
  if ('serviceWorker' in navigator && 'periodicSync' in ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready
      .then((registration) => {
        return registration.periodicSync.register('check-notifications', {
          minInterval: 24 * 60 * 60 * 1000, // 24 hours
        });
      })
      .catch(() => {
        // Fallback: browser doesn't support periodic sync
        console.log('Periodic sync not supported, using fallback');
      });
  }
}
