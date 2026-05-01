/**
 * app/api/doses/mark/route.js
 * Called by the FCM service worker "Mark Taken" notification action.
 * Uses the Firebase REST API so no firebase-admin package is needed.
 */

import { NextResponse } from 'next/server';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/** Simple Firestore REST write using fetch (no firebase-admin needed) */
async function firestoreSet(path, fields) {
  const url = `${FIRESTORE_BASE}/${path}?updateMask.fieldPaths=${Object.keys(fields).join('&updateMask.fieldPaths=')}`;
  const body = {
    fields: Object.fromEntries(
      Object.entries(fields).map(([k, v]) => {
        if (typeof v === 'string')  return [k, { stringValue: v }];
        if (typeof v === 'number')  return [k, { integerValue: v }];
        if (typeof v === 'boolean') return [k, { booleanValue: v }];
        return [k, { stringValue: String(v) }];
      })
    ),
  };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Firestore REST error: ${res.status}`);
  return res.json();
}

export async function POST(request) {
  try {
    const { userId, medicineId, date, timeSlot, status = 'taken' } = await request.json();

    if (!userId || !medicineId || !date || !timeSlot) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const doseKey = `${date}_${medicineId}_${timeSlot.replace(':', '')}`;

    await firestoreSet(
      `users/${userId}/doseLogs/${doseKey}`,
      { medicineId, date, timeSlot, status, source: 'notification' }
    );

    return NextResponse.json({ success: true, doseKey, status });
  } catch (err) {
    console.error('/api/doses/mark error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
