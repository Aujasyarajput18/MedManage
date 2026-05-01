/**
 * lib/reminderStore.js  [NEW]
 *
 * Lightweight localStorage-backed store for medication reminders.
 * Each reminder shape:
 * {
 *   id            : string,
 *   userId        : string | 'demo',
 *   medicineName  : string,
 *   scheduledTime : ISO string (e.g. "2026-05-02T08:00:00"),
 *   status        : 'pending' | 'taken' | 'snoozed' | 'skipped' | 'missed',
 *   retryCount    : number (0-3),
 *   createdAt     : ISO string,
 * }
 */

const STORE_KEY = 'medmanage_reminders';

/** Read all reminders from localStorage */
function readAll() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Persist all reminders to localStorage */
function writeAll(reminders) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORE_KEY, JSON.stringify(reminders));
}

/** Get all reminders (optionally filtered by userId) */
export function getReminders(userId = null) {
  const all = readAll();
  if (!userId) return all;
  return all.filter((r) => r.userId === userId);
}

/** Create a new reminder. Returns the created reminder. */
export function createReminder({ userId, medicineName, scheduledTime }) {
  const reminder = {
    id:            crypto.randomUUID(),
    userId:        userId || 'demo',
    medicineName:  medicineName.trim(),
    scheduledTime: new Date(scheduledTime).toISOString(),
    status:        'pending',
    retryCount:    0,
    createdAt:     new Date().toISOString(),
  };
  const all = readAll();
  writeAll([...all, reminder]);
  return reminder;
}

/** Update a single reminder by id. Returns updated reminder or null. */
export function updateReminder(id, patch) {
  const all = readAll();
  let updated = null;
  const next = all.map((r) => {
    if (r.id !== id) return r;
    updated = { ...r, ...patch };
    return updated;
  });
  if (updated) writeAll(next);
  return updated;
}

/** Delete a reminder by id */
export function deleteReminder(id) {
  writeAll(readAll().filter((r) => r.id !== id));
}

/**
 * Find reminders that were due > 1 minute ago and are still 'pending'.
 * These are "missed" — user had the app closed or didn't respond.
 */
export function getMissedReminders(userId = null) {
  const now = Date.now();
  return getReminders(userId).filter((r) => {
    if (r.status !== 'pending') return false;
    const due = new Date(r.scheduledTime).getTime();
    return due < now - 60_000; // more than 1 min past due
  });
}

/** Mark missed reminders as 'missed' and return them */
export function collectMissedReminders(userId = null) {
  const missed = getMissedReminders(userId);
  missed.forEach((r) => updateReminder(r.id, { status: 'missed' }));
  return missed;
}

/** Get all pending reminders due within the next N seconds */
export function getUpcomingReminders(userId = null, withinSeconds = 60) {
  const now = Date.now();
  return getReminders(userId).filter((r) => {
    if (r.status !== 'pending') return false;
    const due = new Date(r.scheduledTime).getTime();
    return due >= now && due <= now + withinSeconds * 1000;
  });
}
