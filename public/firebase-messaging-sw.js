// firebase-messaging-sw.js
// Background FCM Service Worker for MedManage PWA
// This file MUST be in /public so it serves at the root URL.

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ─── Firebase config (MUST match your app's config) ───────────────────────
// Note: These are NEXT_PUBLIC_ values — safe to expose in SW.
firebase.initializeApp({
  apiKey:            'AIzaSyCDCv2Ol-s9hkcgAfHix3wC_JOfUNIOAsE',
  authDomain:        'medmanage-58e98.firebaseapp.com',
  projectId:         'medmanage-58e98',
  storageBucket:     'medmanage-58e98.firebasestorage.app',
  messagingSenderId: '829152485346',
  appId:             '1:829152485346:web:725df93cc81a77021163bb',
});

const messaging = firebase.messaging();

// ─── Background message handler ────────────────────────────────────────────
// Fires when app is in background or closed
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const title = payload.notification?.title || '💊 MedManage';
  const body  = payload.notification?.body  || 'You have a medication reminder.';
  const data  = payload.data || {};

  // Different actions based on notification type
  const isReminder = data.type === 'medication_reminder';

  const options = {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    tag: isReminder ? `reminder-${data.reminderId}` : (data.medicineId || 'medmanage-reminder'),
    data,
    requireInteraction: true,
    actions: isReminder
      ? [
          { action: 'taken',  title: '✅ Taken'  },
          { action: 'snooze', title: '⏰ Snooze' },
          { action: 'skip',   title: '⏭️ Skip'   },
        ]
      : [
          { action: 'taken',  title: '✅ Mark Taken' },
          { action: 'snooze', title: '⏰ Snooze 15 min' },
        ],
    vibrate: [200, 100, 200],
  };

  return self.registration.showNotification(title, options);
});


// ─── Notification click handler ────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data       = event.notification.data || {};
  const action     = event.action;
  const isReminder = data.type === 'medication_reminder';

  if (isReminder && data.reminderId) {
    // ── Reminder actions (Taken / Snooze / Skip) ──
    if (action === 'taken' || action === 'snooze' || action === 'skip') {
      event.waitUntil(
        fetch('/api/reminders/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reminderId: data.reminderId, action }),
        }).catch(console.error)
      );
    }
    // Always open the reminders page so user sees status
    event.waitUntil(clients.openWindow('/dashboard/reminders'));
    return;
  }

  // ── Legacy dose-mark action (existing behavior) ──
  if (action === 'taken') {
    if (data.userId && data.medicineId && data.date && data.timeSlot) {
      event.waitUntil(
        fetch('/api/doses/mark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId:     data.userId,
            medicineId: data.medicineId,
            date:       data.date,
            timeSlot:   data.timeSlot,
            status:     'taken',
          }),
        }).catch(console.error)
      );
    }
    event.waitUntil(clients.openWindow('/dashboard'));
  } else if (action === 'snooze') {
    // Re-show notification after 15 minutes (legacy)
    event.waitUntil(
      new Promise((resolve) => {
        setTimeout(() => {
          self.registration.showNotification(event.notification.title, {
            body:    event.notification.body,
            icon:    '/icons/icon-192.png',
            data:    event.notification.data,
            actions: [
              { action: 'taken',  title: '✅ Mark Taken' },
              { action: 'snooze', title: '⏰ Snooze 15 min' },
            ],
          });
          resolve();
        }, 15 * 60 * 1000);
      })
    );
  } else {
    // Default: focus or open dashboard
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes('/dashboard') && 'focus' in client) return client.focus();
        }
        return clients.openWindow('/dashboard');
      })
    );
  }
});

// ─── Push event fallback ───────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const payload = event.data.json();
      // Firebase SDK handles this, but fallback just in case
      if (!payload.notification) {
        const title = payload.data?.title || '💊 MedManage Reminder';
        const body  = payload.data?.body  || 'Time to take your medicine!';
        event.waitUntil(
          self.registration.showNotification(title, {
            body,
            icon: '/icons/icon-192.png',
            data: payload.data || {},
          })
        );
      }
    } catch (e) {
      // Not JSON — ignore
    }
  }
});
