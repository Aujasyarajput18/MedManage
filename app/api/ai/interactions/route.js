/**
 * app/api/ai/interactions/route.js  [UPDATED — Gemini]
 *
 * Drug-drug interaction checker using Gemini 1.5 Flash (free tier).
 * Returns an honest unavailable state if API is not configured.
 */

import { NextResponse }                    from 'next/server';
import { geminiText, isGeminiConfigured }  from '@/lib/gemini';

export async function POST(request) {
  const { medicines } = await request.json();

  if (!medicines || medicines.length < 2) {
    return NextResponse.json({ interactions: [], overall: 'safe', summary: 'Add at least 2 medicines to check interactions.' });
  }

  if (!isGeminiConfigured()) {
    return NextResponse.json({
      interactions: [],
      overall: 'caution',
      summary: 'Interaction checking is not configured yet. Ask a doctor or pharmacist before combining medicines.',
      unavailable: true,
    });
  }

  const prompt = `You are a friendly medical advisor helping patients understand their medications.
Analyze these medicines for drug-drug interactions: ${medicines.join(', ')}.

Respond ONLY with this exact JSON (no markdown, no explanation outside the JSON):
{
  "interactions": [
    {
      "medicines": ["Drug A", "Drug B"],
      "severity": "safe|caution|danger",
      "title": "Short one-line title",
      "explanation": "Plain language explanation a patient can understand (2-3 sentences max). No medical jargon.",
      "action": "What should the patient do?"
    }
  ],
  "overall": "safe|caution|danger",
  "summary": "One sentence overall summary"
}

If NO interactions exist, return: {"interactions": [], "overall": "safe", "summary": "No significant interactions found between your medicines."}
Be friendly, reassuring when safe, clear when caution needed. Never be alarmist.`;

  try {
    const text      = await geminiText(prompt, { maxTokens: 1024 });
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[AI/interactions] Gemini error:', err.message);
    return NextResponse.json({
      interactions: [],
      overall:      'caution',
      summary:      'Unable to check interactions right now. Please consult your pharmacist before combining medicines.',
      error:        true,
    });
  }
}
