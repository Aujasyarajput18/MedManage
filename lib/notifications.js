/**
 * lib/notifications.js
 * FCM push notification setup + token management.
 * VAPID key needed in env: NEXT_PUBLIC_FIREBASE_VAPID_KEY
 */

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import app, { db } from './firebase';

let messaging = null;

/** Initialize Firebase Messaging (browser-only) */
function getMessagingInstance() {
  if (typeof window === 'undefined') return null;
  if (!messaging) {
    try {
      messaging = getMessaging(app);
    } catch (e) {
      console.warn('FCM not supported:', e.message);
      return null;
    }
  }
  return messaging;
}

/**
 * Request notification permission and get FCM token.
 * Saves token to Firestore under users/{uid}/fcmTokens.
 * @param {string} userId
 * @returns {string|null} token
 */
export async function requestNotificationPermission(userId) {
  if (typeof window === 'undefined') return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('Notification permission denied');
    return null;
  }

  const msg = getMessagingInstance();
  if (!msg) return null;

  try {
    const token = await getToken(msg, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.ready,
    });

    if (token && userId) {
      // Save token to Firestore
      await setDoc(
        doc(db, 'users', userId, 'fcmTokens', token.slice(0, 20)),
        { token, updatedAt: serverTimestamp(), platform: 'web' },
        { merge: true }
      );
    }

    return token;
  } catch (err) {
    console.error('FCM getToken error:', err);
    return null;
  }
}

/**
 * Listen for foreground FCM messages.
 * @param {function} callback - called with {title, body, data}
 * @returns {function} unsubscribe
 */
export function onForegroundMessage(callback) {
  const msg = getMessagingInstance();
  if (!msg) return () => {};
  return onMessage(msg, (payload) => {
    callback({
      title: payload.notification?.title || 'MedManage',
      body: payload.notification?.body || '',
      data: payload.data || {},
    });
  });
}

/**
 * Show a local browser notification (for foreground notifications).
 */
export function showLocalNotification(title, body, options = {}) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  new Notification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    ...options,
  });
}

/**
 * Schedule a local reminder using setTimeout (for short delays ≤ a few hours).
 * For production: use Cloud Scheduler + FCM.
 * @param {string} title
 * @param {string} body
 * @param {number} delayMs - milliseconds from now
 * @returns {number} timeoutId (use clearTimeout to cancel)
 */
export function scheduleLocalReminder(title, body, delayMs) {
  return setTimeout(() => {
    showLocalNotification(title, body);
  }, delayMs);
}

/**
 * Check if notifications are currently enabled.
 */
export function notificationsEnabled() {
  return typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'granted';
}
