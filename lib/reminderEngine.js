/**
 * lib/reminderEngine.js  [NEW]
 *
 * Core reminder scheduling engine.
 *
 * Behavior:
 *  - Polls every 30s for due reminders
 *  - When due: shows in-app alert + sends FCM push notification
 *  - Starts a 15-min response window
 *  - If no response: retries every 5 min, max 3 retries
 *  - After 3 retries: calls triggerVoiceCall() placeholder
 *
 * NOTE: Reliability requires the app/tab to be open.
 * For background delivery, FCM service worker handles push notifications.
 */

import { getReminders, updateReminder } from './reminderStore';

// ─── Constants ─────────────────────────────────────────────────────────────
const RESPONSE_WINDOW_MS  = 15 * 60 * 1000; // 15 minutes
const RETRY_INTERVAL_MS   =  5 * 60 * 1000; // 5 minutes between retries
const MAX_RETRIES         = 3;
const POLL_INTERVAL_MS    = 30 * 1000;       // check every 30 seconds

// ─── State ─────────────────────────────────────────────────────────────────
// Map of reminderId → { timeoutId, retryCount }
const activeTimers = new Map();

// Callback set by the UI to display in-app alert
let inAppAlertCallback = null;

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Register a callback that the UI uses to display in-app alerts.
 * The callback receives: (reminder) => void
 */
export function setInAppAlertHandler(callback) {
  inAppAlertCallback = callback;
}

/**
 * Start the reminder engine polling loop.
 * Call once on app mount (in DashboardLayout or a provider).
 * Returns a cleanup function.
 */
export function startReminderEngine(userId) {
  if (typeof window === 'undefined') return () => {};

  const tick = () => {
    const now = Date.now();
    const reminders = getReminders(userId);

    reminders.forEach((reminder) => {
      if (reminder.status !== 'pending') return;
      if (activeTimers.has(reminder.id)) return; // already scheduled

      const due = new Date(reminder.scheduledTime).getTime();
      const delay = due - now;

      if (delay <= 0) {
        // Already past due but no timer set — fire immediately
        scheduleFireNow(reminder);
      } else if (delay < POLL_INTERVAL_MS * 2) {
        // Due soon — set a precise timer
        const timeoutId = setTimeout(() => scheduleFireNow(reminder), delay);
        activeTimers.set(reminder.id, { timeoutId, retryCount: 0 });
      }
    });
  };

  // Run immediately on start, then every 30s
  tick();
  const intervalId = setInterval(tick, POLL_INTERVAL_MS);

  return () => {
    clearInterval(intervalId);
    activeTimers.forEach(({ timeoutId }) => clearTimeout(timeoutId));
    activeTimers.clear();
  };
}

/**
 * Cancel all timers for a specific reminder (after Taken/Skip).
 */
export function cancelReminderTimers(reminderId) {
  const entry = activeTimers.get(reminderId);
  if (entry) {
    clearTimeout(entry.timeoutId);
    activeTimers.delete(reminderId);
  }
}

// ─── Internal ──────────────────────────────────────────────────────────────

function scheduleFireNow(reminder) {
  const entry = activeTimers.get(reminder.id) || { retryCount: 0 };
  activeTimers.set(reminder.id, { ...entry, timeoutId: null });
  fireReminder(reminder, entry.retryCount);
}

function fireReminder(reminder, retryCount) {
  console.log(`[ReminderEngine] Firing reminder "${reminder.medicineName}" (retry ${retryCount})`);

  // 1. Show in-app alert (if UI registered a handler)
  if (inAppAlertCallback) {
    inAppAlertCallback(reminder);
  }

  // 2. Send FCM push notification (best-effort)
  sendPushNotification(reminder, retryCount);

  // 3. Start 15-min response window timer
  const responseTimer = setTimeout(() => {
    handleNoResponse(reminder, retryCount);
  }, RESPONSE_WINDOW_MS);

  activeTimers.set(reminder.id, { timeoutId: responseTimer, retryCount });
}

function handleNoResponse(reminder, retryCount) {
  // Re-read from store — user might have acted via another tab
  const reminders = getReminders();
  const current = reminders.find((r) => r.id === reminder.id);

  if (!current || current.status !== 'pending') {
    // User already responded — do nothing
    activeTimers.delete(reminder.id);
    return;
  }

  if (retryCount >= MAX_RETRIES) {
    // Max retries reached — trigger voice call placeholder
    console.warn(
      `[ReminderEngine] Max retries (${MAX_RETRIES}) reached for "${reminder.medicineName}".`
    );
    triggerVoiceCall(current, retryCount);
    updateReminder(reminder.id, { status: 'missed', retryCount });
    activeTimers.delete(reminder.id);
    return;
  }

  // Retry after 5 minutes
  console.log(`[ReminderEngine] No response — retrying in 5 min (retry ${retryCount + 1}/${MAX_RETRIES})`);
  const retryTimer = setTimeout(() => {
    fireReminder(reminder, retryCount + 1);
  }, RETRY_INTERVAL_MS);

  activeTimers.set(reminder.id, { timeoutId: retryTimer, retryCount: retryCount + 1 });
}

// ─── FCM Push ───────────────────────────────────────────────────────────────

async function sendPushNotification(reminder, retryCount) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  try {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(
      retryCount === 0 ? '💊 Medication Reminder' : `💊 Reminder (Retry ${retryCount}/${MAX_RETRIES})`,
      {
        body:             `Time to take ${reminder.medicineName}`,
        icon:             '/icons/icon-192.png',
        badge:            '/icons/icon-72.png',
        tag:              `reminder-${reminder.id}`,
        requireInteraction: true,
        data: {
          reminderId:   reminder.id,
          medicineName: reminder.medicineName,
          type:         'medication_reminder',
        },
        actions: [
          { action: 'taken',  title: '✅ Taken'  },
          { action: 'snooze', title: '⏰ Snooze' },
          { action: 'skip',   title: '⏭️ Skip'   },
        ],
        vibrate: [200, 100, 200],
      }
    );
  } catch (err) {
    console.warn('[ReminderEngine] Push notification failed:', err.message);
    // Graceful degradation — in-app alert still works
  }
}

// ─── Voice Call Placeholder ─────────────────────────────────────────────────

/**
 * Placeholder: In a future version, this will trigger an automated voice call.
 * DO NOT implement voice calling here.
 */
function triggerVoiceCall(reminder, retryCount) {
  // Voice call will be triggered here in future
  console.log(
    `[VoiceCall] Voice call will be triggered here in future for user "${reminder.userId}", medicine "${reminder.medicineName}" after ${retryCount} retries.`
  );
}
