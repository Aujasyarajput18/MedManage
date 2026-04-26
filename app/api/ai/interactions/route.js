let claude = null;
try {
  const Anthropic = require('@anthropic-ai/sdk').default;
  if (process.env.CLAUDE_API_KEY) {
    claude = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  }
} catch (e) {
  // SDK not installed yet — run: npm install @anthropic-ai/sdk
}

const DEMO_FALLBACK = {
  interactions: [{
    medicines: ['Aspirin', 'Metformin'],
    severity: 'caution',
    title: 'Minor blood sugar interaction',
    explanation: 'Aspirin can occasionally affect blood sugar levels, slightly changing how Metformin works. Not dangerous at normal doses.',
    action: 'Monitor your blood sugar more closely. Inform your doctor at your next visit.',
  }],
  overall: 'caution',
  summary: 'Demo mode: one potential interaction found.',
};

export async function POST(request) {
  const { medicines } = await request.json();
  if (!medicines || medicines.length < 2) {
    return Response.json({ interactions: [], safe: true });
  }

  // Return demo data if SDK not installed or key not set
  if (!claude) {
    return Response.json(DEMO_FALLBACK);
  }

  const prompt = `You are a friendly medical advisor helping patients understand their medications. 
Analyze these medicines for drug-drug interactions: ${medicines.join(', ')}.

For EACH pair that has an interaction, respond in this exact JSON format:
{
  "interactions": [
    {
      "medicines": ["Drug A", "Drug B"],
      "severity": "safe|caution|danger",
      "title": "Short one-line title",
      "explanation": "Plain language explanation a patient can understand (2-3 sentences max). No medical jargon. Like a friend explaining it.",
      "action": "What should the patient do?"
    }
  ],
  "overall": "safe|caution|danger",
  "summary": "One sentence overall summary"
}

If there are NO interactions, return: {"interactions": [], "overall": "safe", "summary": "No significant interactions found between your medicines."}

Be friendly, reassuring when safe, clear when caution is needed. Never be alarmist.`;

  try {
    const message = await claude.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    
    const text = message.content[0].text;
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const result = JSON.parse(jsonMatch[0]);
    return Response.json(result);
  } catch (err) {
    console.error('Claude API error:', err);
    // Graceful fallback
    return Response.json({
      interactions: [],
      overall: 'safe',
      summary: 'Unable to check interactions right now. Please consult your pharmacist.',
      error: true,
    });
  }
}
