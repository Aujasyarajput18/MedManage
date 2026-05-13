/**
 * app/api/ai/identify-pill/route.js
 *
 * Pill photo identifier using Gemini 2.0 Flash vision.
 * Accepts a base64-encoded image and returns full medicine details.
 */

import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL         = 'gemini-2.0-flash';
const BASE_URL      = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export async function POST(request) {
  const { image, mimeType = 'image/jpeg' } = await request.json();

  if (!image) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_key_here') {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured. Please add it to your environment variables.' },
      { status: 503 }
    );
  }

  const prompt = `You are a pharmaceutical expert AI. Carefully examine this image.

If it shows ANY of the following: a pill, tablet, capsule, syrup bottle, medicine box, blister pack, medicine strip, or medicine label — identify it and return ONLY this exact JSON (no markdown, no explanation, no code fences):

{
  "name": "full medicine name (generic + brand if visible)",
  "dosage": "dosage strength like 500mg or 10mg/5ml or 250mg (empty string if not visible)",
  "category": "one of: Chronic | Acute | Vitamin | Supplement | Ayurvedic | Antibiotic | Painkiller | Antacid | Other",
  "type": "one of: Tablet | Capsule | Syrup | Injection | Drops | Other",
  "uses": "one sentence describing what this medicine treats",
  "notes": "one important safety note about this medicine (e.g. take with food, avoid alcohol)"
}

If you CANNOT identify the medicine from the image, return:
{"name": "Unknown", "dosage": "", "category": "", "type": "", "uses": "", "notes": "Could not identify. Please try a clearer photo of the medicine name on the box or strip."}

IMPORTANT: Return ONLY the JSON object. Nothing else.`;

  try {
    const res = await fetch(`${BASE_URL}?key=${GEMINI_API_KEY}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mimeType, data: image } },
            { text: prompt },
          ],
        }],
        generationConfig: {
          maxOutputTokens: 512,
          temperature:     0.1,  // Low temp = more factual
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[identify-pill] Gemini API error:', res.status, errText);
      return NextResponse.json(
        { error: `Gemini API error ${res.status}. Check your API key.` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw  = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Extract JSON from response
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON in Gemini response');

    const json = JSON.parse(match[0]);
    return NextResponse.json(json);

  } catch (err) {
    console.error('[identify-pill] Error:', err.message);
    return NextResponse.json({
      name:     'Unknown',
      dosage:   '',
      category: '',
      type:     '',
      uses:     '',
      notes:    'Could not identify. Please try a clearer photo showing the medicine name.',
    });
  }
}
