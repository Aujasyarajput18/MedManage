/**
 * app/api/ai/missed-dose/route.js  [UPDATED — Gemini]
 *
 * AI missed dose advisor using Gemini 1.5 Flash (free tier).
 */

import { NextResponse }                   from 'next/server';
import { geminiText, isGeminiConfigured } from '@/lib/gemini';

export async function POST(request) {
  const { medicineName } = await request.json();

  if (!medicineName) {
    return NextResponse.json({ advice: 'Please specify the medicine name.' });
  }

  // Static fallback when no API key
  if (!isGeminiConfigured()) {
    return NextResponse.json({
      advice: `For ${medicineName}: follow the instructions on your prescription label or patient leaflet for missed doses. Do not take a double dose unless your clinician specifically told you to. If you are unsure, or this medicine is for diabetes, blood pressure, heart rhythm, seizures, blood thinning, mental health, or pain control, call your pharmacist or doctor before taking action.`,
      demoMode: true,
    });
  }

  const prompt = `A patient missed a dose of "${medicineName}". What should they do?
Give clear, friendly, practical advice in 3-4 sentences.
No medical jargon. Like a knowledgeable friend explaining.
Format as plain text — no markdown, no bullet points, no headings.`;

  try {
    const advice = await geminiText(prompt, { maxTokens: 300 });
    return NextResponse.json({ advice: advice.trim() });
  } catch (err) {
    console.error('[AI/missed-dose] Gemini error:', err.message);
    return NextResponse.json({
      advice: `Missed-dose guidance for ${medicineName} is unavailable right now. Check the prescription label or ask your pharmacist before taking an extra dose. Do not double up unless a clinician specifically told you to.`,
    });
  }
}
