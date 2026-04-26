let claude = null;
try {
  const Anthropic = require('@anthropic-ai/sdk').default;
  if (process.env.CLAUDE_API_KEY) {
    claude = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  }
} catch (e) {
  // SDK not installed — run: npm install @anthropic-ai/sdk
}

export async function POST(request) {
  const { medicineName } = await request.json();

  // Fallback when SDK not installed
  if (!claude) {
    return Response.json({
      advice: `For ${medicineName}: Take it as soon as you remember. If your next dose is in less than 2 hours, skip the missed dose and continue your normal schedule. Never take a double dose to make up for a missed one. When in doubt, call your pharmacist.`,
    });
  }

  const prompt = `A patient missed a dose of "${medicineName}". What should they do? Give clear, friendly, practical advice in 3-4 sentences. No medical jargon. Like a knowledgeable friend explaining. Format as plain text, no markdown.`;

  try {
    const msg = await claude.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });
    return Response.json({ advice: msg.content[0].text });
  } catch {
    return Response.json({
      advice: `If you missed a dose of ${medicineName}, take it as soon as you remember. If it's almost time for your next dose, skip the missed one. Never take a double dose. When in doubt, ask your pharmacist.`,
    });
  }
}
