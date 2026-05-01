/**
 * app/api/ai/food-warnings/route.js  [NEW — Gemini]
 *
 * Food & drink interaction warnings for a specific medicine.
 */

import { NextResponse }                   from 'next/server';
import { geminiText, isGeminiConfigured } from '@/lib/gemini';

const DEMO_WARNINGS = {
  warnings: [
    { icon: '🍊', text: 'Avoid grapefruit — it can affect how your medicine is absorbed.' },
    { icon: '☕', text: 'Limit caffeine — may increase side effects.' },
    { icon: '🥛', text: 'Some medicines work better taken with food to reduce stomach upset.' },
  ],
  tip: 'Demo mode — add GEMINI_API_KEY for real food interaction data.',
  demoMode: true,
};

export async function POST(request) {
  const { medicineName } = await request.json();

  if (!medicineName) {
    return NextResponse.json({ warnings: [], tip: 'Specify a medicine name.' });
  }

  if (!isGeminiConfigured()) {
    return NextResponse.json(DEMO_WARNINGS);
  }

  const prompt = `What foods, drinks, or dietary items should a patient avoid or be careful about when taking "${medicineName}"?

Return ONLY a JSON object (no markdown):
{
  "warnings": [
    { "icon": "🍊", "text": "plain language warning in one sentence" }
  ],
  "tip": "one overall dietary tip for this medicine"
}

Use relevant food emojis (🥛🍷🌿🍊☕🧄🥦 etc.).
If no significant food interactions exist, return: {"warnings": [], "tip": "No major food interactions. Take with a glass of water."}
Maximum 4 warnings. Plain language only — no medical jargon.`;

  try {
    const text      = await geminiText(prompt, { maxTokens: 400 });
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error('[AI/food-warnings] Gemini error:', err.message);
    return NextResponse.json({
      warnings: [],
      tip:      'Take with a full glass of water. Ask your pharmacist about food interactions.',
    });
  }
}
