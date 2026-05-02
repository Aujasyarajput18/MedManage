/**
 * app/api/doses/mark/route.js
 * Legacy notification endpoint.
 *
 * It is intentionally disabled because accepting a client-supplied userId
 * would be unsafe for medication records. Dose writes must happen from an
 * authenticated client or a server endpoint that verifies Firebase ID tokens.
 */

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await request.json().catch(() => ({}));

    return NextResponse.json({
      error: 'Background dose marking is disabled until authenticated server-side writes are configured.',
    }, { status: 501 });
  } catch (err) {
    console.error('/api/doses/mark error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
