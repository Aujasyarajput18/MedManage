/**
 * app/api/reminders/action/route.js  [NEW]
 *
 * Called by the service worker when user taps a notification action
 * while the app is in the background (Taken / Snooze / Skip).
 *
 * Updates reminder status in localStorage via a response that
 * the next page load will pick up.
 *
 * Note: Service workers cannot access localStorage directly.
 * This API endpoint returns an instruction; the next app load
 * reads the updated localStorage state via reminderStore.
 *
 * Architecture: SW → POST here → we store action in a server-side queue
 * → next app open reads localStorage (which was updated by the engine).
 *
 * For MVP: we use a simple in-memory pending actions map.
 * The reminder page reads this on mount.
 */

import { NextResponse } from 'next/server';

// In-process store for pending actions (cleared on server restart — MVP acceptable)
// In production: use Redis or Firestore for this.
const pendingActions = new Map(); // reminderId → action

export async function POST(request) {
  try {
    const { reminderId, action } = await request.json();

    if (!reminderId || !['taken', 'snooze', 'skip'].includes(action)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Store the action so next page load can apply it
    pendingActions.set(reminderId, { action, timestamp: Date.now() });

    console.log(`[ReminderAction] ${action} for reminder ${reminderId}`);

    return NextResponse.json({ success: true, reminderId, action });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  // Reminder page polls this to pick up background actions
  const actions = Object.fromEntries(pendingActions.entries());
  // Clear after reading (once applied)
  pendingActions.clear();
  return NextResponse.json({ actions });
}
