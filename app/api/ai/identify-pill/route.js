/**
 * app/api/ai/identify-pill/route.js  [UPDATED — Gemini Vision]
 *
 * Pill photo identifier using Gemini 1.5 Flash vision.
 * Accepts a base64-encoded image and returns medicine details.
 */

import { NextResponse }                         from 'next/server';
import { geminiVision, isGeminiConfigured }     from '@/lib/gemini';

const DEMO_RESULT = {
  name:       'Metformin',
  dosage:     '500mg',
  category:   'Chronic',
  notes:      'Demo identification — add GEMINI_API_KEY to .env.local for real AI vision.',
  confidence: 'demo',
};

export async function POST(request) {
  const { image, mimeType = 'image/jpeg' } = await request.json();

  if (!image) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }

  // Demo fallback
  if (!isGeminiConfigured()) {
    return NextResponse.json(DEMO_RESULT);
  }

  const prompt = `You are a medicine identifier. Look at this image carefully.
If it shows a medicine, pill, tablet, capsule, or medicine box/strip, identify it.
Return ONLY a JSON object — no markdown, no explanation:
{
  "name": "medicine name",
  "dosage": "dosage like 500mg or 10ml (empty string if not visible)",
  "category": "Chronic or Acute or Vitamin or Supplement or Ayurvedic",
  "notes": "one short plain-language sentence about this medicine"
}
If you cannot identify it, return: {"name": "Unknown", "dosage": "", "category": "", "notes": "Could not identify. Please try a clearer photo of the medicine name."}`;

  try {
    const raw  = await geminiVision(image, mimeType, prompt);
    const clean = raw.replace(/```json|```/g, '').trim();
    const json  = JSON.parse(clean.match(/\{[\s\S]*\}/)[0]);
    return NextResponse.json(json);
  } catch (err) {
    console.error('[AI/identify-pill] Gemini error:', err.message);
    return NextResponse.json({
      name:     'Unknown',
      dosage:   '',
      category: '',
      notes:    'Could not identify. Please try a clearer photo of the medicine name.',
    });
  }
}
