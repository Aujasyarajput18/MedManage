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
      advice: `For ${medicineName}: Take it as soon as you remember. If your next dose is in less than 2 hours, skip the missed dose and continue your normal schedule. Never take a double dose to make up for a missed one. When in doubt, call your pharmacist.`,
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
      advice: `If you missed a dose of ${medicineName}, take it as soon as you remember. If it's almost time for your next dose, skip the missed one. Never take a double dose. When in doubt, ask your pharmacist.`,
    });
  }
}
