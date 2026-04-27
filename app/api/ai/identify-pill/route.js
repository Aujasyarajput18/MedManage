let claude = null;
try {
  const Anthropic = require('@anthropic-ai/sdk').default;
  if (process.env.CLAUDE_API_KEY) {
    claude = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  }
} catch (e) {
  // SDK not installed
}

export async function POST(request) {
  const { image, mimeType } = await request.json();

  // Demo fallback when no Claude API
  if (!claude || !image) {
    return Response.json({
      name:     'Metformin',
      dosage:   '500mg',
      category: 'Chronic',
      notes:    'Demo identification. Add your Claude API key for real AI vision.',
      confidence: 'demo',
    });
  }

  try {
    const msg = await claude.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType || 'image/jpeg',
              data: image,
            },
          },
          {
            type: 'text',
            text: `You are a medicine identifier. Look at this image and identify the medicine.
Return ONLY a JSON object with these fields (no markdown, no explanation):
{
  "name": "medicine name",
  "dosage": "dosage like 500mg or 10ml",
  "category": "Chronic or Acute or Vitamin or Supplement or Ayurvedic",
  "notes": "one short sentence about this medicine in plain language"
}
If you cannot identify it, return {"name": "Unknown", "dosage": "", "category": "", "notes": "Could not identify. Please try a clearer photo."}`,
          },
        ],
      }],
    });

    const raw  = msg.content[0].text.trim();
    const json = JSON.parse(raw.replace(/```json|```/g, '').trim());
    return Response.json(json);
  } catch (e) {
    return Response.json({
      name: 'Unknown',
      dosage: '',
      category: '',
      notes: 'Could not identify. Please try a clearer photo of the medicine name.',
    });
  }
}
