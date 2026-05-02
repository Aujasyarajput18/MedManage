/**
 * app/api/sos/send/route.js
 *
 * Sends emergency SMS to contacts via Fast2SMS on SOS trigger.
 * Cost: ₹5/SMS on Fast2SMS Quick Transactional route.
 *
 * Env required:
 *   FAST2SMS_API_KEY  — from fast2sms.com → Developer → API
 */

import { NextResponse } from 'next/server';

/** Strip everything except digits, then ensure 10-digit Indian mobile */
function sanitizeIndianPhone(raw) {
  let digits = String(raw).replace(/\D/g, '');
  // Remove country code prefix if present (91XXXXXXXXXX → XXXXXXXXXX)
  if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  }
  // Must be 10 digits starting with 6-9
  if (/^[6-9]\d{9}$/.test(digits)) return digits;
  return null;
}

/** Safely parse JSON — returns null if response is HTML or malformed */
async function safeJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error('[SOS] Fast2SMS returned non-JSON:', text.slice(0, 200));
    return null;
  }
}

export async function POST(request) {
  try {
    const { userName, contacts, location } = await request.json();

    if (!contacts || contacts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No emergency contacts provided. Add contacts first.' },
        { status: 400 }
      );
    }

    // Build Google Maps link
    const mapLink = location
      ? `https://maps.google.com/?q=${location.lat},${location.lng}`
      : null;

    // Compose message (Fast2SMS has 160-char limit per SMS segment)
    const message = mapLink
      ? `URGENT: ${userName} needs emergency help! Location: ${mapLink} - Sent via MedManage SOS`
      : `URGENT: ${userName} needs emergency help! Please call immediately - Sent via MedManage SOS`;

    // Sanitize and validate all phone numbers
    const validPhones  = [];
    const invalidPhones = [];

    contacts.forEach((c) => {
      const num = sanitizeIndianPhone(c.phone);
      if (num) {
        validPhones.push(num);
      } else {
        invalidPhones.push({ name: c.name, phone: c.phone });
      }
    });

    const results = {
      message,
      total:      contacts.length,
      valid:      validPhones.length,
      invalid:    invalidPhones,
      smsResults: [],
    };

    const apiKey = process.env.FAST2SMS_API_KEY;

    // ── No API key: dev/demo mode ─────────────────────────────────────────
    if (!apiKey || apiKey === 'your_fast2sms_key_here') {
      console.log('[SOS Dev Mode] Would send SMS to:', validPhones, '\nMessage:', message);
      return NextResponse.json({ success: true, devMode: true, smsSent: false, ...results });
    }

    if (validPhones.length === 0) {
      return NextResponse.json({
        success: false,
        smsSent: false,
        error:   'None of the saved phone numbers are valid 10-digit Indian mobile numbers.',
        invalid: invalidPhones,
        ...results,
      }, { status: 400 });
    }

    // ── Send via Fast2SMS Quick Transactional (route: 'q') ────────────────
    const payload = new URLSearchParams({
      route:    'q',
      message,
      language: 'english',
      flash:    '0',
      numbers:  validPhones.join(','),
    });

    let fast2smsRes;
    try {
      fast2smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method:  'POST',
        headers: {
          authorization:  apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache',
        },
        body: payload,
        // 10s timeout via AbortController
        signal: AbortSignal.timeout(10000),
      });
    } catch (fetchErr) {
      return NextResponse.json({
        success: false,
        smsSent: false,
        error:   `Could not reach Fast2SMS: ${fetchErr.message}. Check internet connection.`,
        ...results,
      }, { status: 502 });
    }

    // Safely parse response — Fast2SMS occasionally returns HTML on errors
    const fast2smsData = await safeJson(fast2smsRes);

    if (!fast2smsData) {
      return NextResponse.json({
        success: false,
        smsSent: false,
        error:   `Fast2SMS returned an unexpected response (HTTP ${fast2smsRes.status}). Your API key may be invalid.`,
        ...results,
      }, { status: 502 });
    }

    // Fast2SMS success: { return: true, request_id: '...', message: ['...'] }
    const smsSent = fast2smsData.return === true;

    results.smsResults.push({
      provider:  'fast2sms',
      requestId: fast2smsData.request_id,
      sent:      smsSent,
      message:   Array.isArray(fast2smsData.message)
        ? fast2smsData.message.join('; ')
        : fast2smsData.message,
    });

    const providerError = Array.isArray(fast2smsData.message)
      ? fast2smsData.message.join('; ')
      : (fast2smsData.message || 'Fast2SMS rejected the request');

    return NextResponse.json({
      success: smsSent,
      smsSent,
      error:   smsSent ? null : providerError,
      ...results,
      fast2sms: fast2smsData,
    });

  } catch (err) {
    console.error('[SOS] Unhandled API error:', err.message);
    return NextResponse.json(
      { success: false, smsSent: false, error: `Server error: ${err.message}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sos/send — verify API key & check wallet balance
 */
export async function GET() {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey || apiKey === 'your_fast2sms_key_here') {
    return NextResponse.json({ configured: false, message: 'FAST2SMS_API_KEY not set' });
  }
  try {
    const res  = await fetch('https://www.fast2sms.com/dev/wallet', {
      method:  'POST',
      headers: { authorization: apiKey, 'Cache-Control': 'no-cache' },
      signal:  AbortSignal.timeout(5000),
    });
    const data = await safeJson(res);
    if (!data || data.return === false) {
      return NextResponse.json({
        configured: true,
        error: data?.message || 'Unable to verify Fast2SMS wallet balance',
      }, { status: 400 });
    }
    return NextResponse.json({
      configured: true,
      balance:    Number(data.wallet),
      currency:   '₹',
      message:    `Fast2SMS configured. Wallet: ₹${data.wallet}`,
    });
  } catch (err) {
    return NextResponse.json({ configured: true, error: err.message }, { status: 500 });
  }
}
