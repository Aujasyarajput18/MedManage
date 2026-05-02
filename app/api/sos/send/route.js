/**
 * app/api/sos/send/route.js  [UPDATED]
 *
 * Sends emergency SMS to contacts via Fast2SMS on SOS trigger.
 * Cost: ₹5/SMS on Fast2SMS Quick Transactional route.
 *
 * Env required:
 *   FAST2SMS_API_KEY  — from fast2sms.com → Developer → API
 *
 * Fast2SMS Docs: https://docs.fast2sms.com
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
  return null; // invalid number
}

export async function POST(request) {
  try {
    const { userName, contacts, location } = await request.json();

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ success: false, error: 'No contacts provided' }, { status: 400 });
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
    const validPhones = [];
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
      total: contacts.length,
      valid: validPhones.length,
      invalid: invalidPhones,
      smsResults: [],
      apiKeyMissing: false,
    };

    const apiKey = process.env.FAST2SMS_API_KEY;

    // ── No API key: dev/demo mode ─────────────────────────────────────────
    if (!apiKey || apiKey === 'your_fast2sms_key_here') {
      results.apiKeyMissing = true;
      return NextResponse.json({ success: true, devMode: true, ...results });
    }

    if (validPhones.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid Indian mobile numbers found',
        invalid: invalidPhones,
      }, { status: 400 });
    }

    // ── Send via Fast2SMS Quick Transactional (route: 'q') ────────────────
    // Cost: ₹5/SMS. Sends to all valid numbers in one API call.
    const payload = new URLSearchParams({
      route:    'q',
      message,
      language: 'english',
      flash:    '0',
      numbers:  validPhones.join(','),
    });

    const fast2smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization:  apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: payload,
    });

    const fast2smsData = await fast2smsRes.json();

    // Fast2SMS success: { return: true, request_id: '...', message: ['...'] }
    const smsSent = fast2smsData.return === true;

    results.smsResults.push({
      provider:  'fast2sms',
      requestId: fast2smsData.request_id,
      sent:      smsSent,
      message:   fast2smsData.message?.[0] || fast2smsData.message,
    });

    const providerMessage = fast2smsData.message?.[0] || fast2smsData.message || 'Fast2SMS did not accept the message';

    return NextResponse.json({
      success:  smsSent,
      smsSent,
      error: smsSent ? null : providerMessage,
      ...results,
      fast2sms: fast2smsData,
    });

  } catch (err) {
    console.error('[SOS] API error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * GET /api/sos/send — test endpoint to verify API key & balance
 */
export async function GET() {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey || apiKey === 'your_fast2sms_key_here') {
    return NextResponse.json({ configured: false, message: 'FAST2SMS_API_KEY not set in .env.local' });
  }
  try {
    const res  = await fetch('https://www.fast2sms.com/dev/wallet', {
      method: 'POST',
      headers: {
        authorization: apiKey,
        'Cache-Control': 'no-cache',
      },
    });
    const data = await res.json();
    if (!res.ok || data.return === false) {
      return NextResponse.json({
        configured: true,
        error: data.message || 'Unable to verify Fast2SMS wallet balance',
        fast2sms: data,
      }, { status: res.ok ? 400 : res.status });
    }
    return NextResponse.json({
      configured: true,
      balance:    Number(data.wallet),
      currency:   '₹',
      message:    `Fast2SMS configured. Wallet balance: ₹${data.wallet}`,
    });
  } catch (err) {
    return NextResponse.json({ configured: true, error: err.message }, { status: 500 });
  }
}
