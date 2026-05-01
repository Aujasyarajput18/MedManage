/**
 * lib/gemini.js  [NEW]
 *
 * Shared server-side Gemini API helper.
 * Uses the REST API directly — no npm package needed.
 *
 * Model used: gemini-1.5-flash  (free tier: 15 RPM, 1M tokens/day)
 * Vision:     gemini-1.5-flash  (supports inline base64 images)
 *
 * Get your free API key at: https://aistudio.google.com/app/apikey
 * Add to .env.local:  GEMINI_API_KEY=your_key_here
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL          = 'gemini-1.5-flash';
const BASE_URL       = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/**
 * Call Gemini with a plain text prompt.
 * @param {string} prompt
 * @param {object} options  — { maxTokens, temperature }
 * @returns {string} text response
 */
export async function geminiText(prompt, { maxTokens = 1024, temperature = 0.4 } = {}) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set in .env.local');

  const res = await fetch(`${BASE_URL}?key=${GEMINI_API_KEY}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

/**
 * Call Gemini with an image + text prompt (vision).
 * @param {string} base64Image  — base64-encoded image (no data: prefix)
 * @param {string} mimeType     — e.g. 'image/jpeg', 'image/png'
 * @param {string} prompt
 * @returns {string} text response
 */
export async function geminiVision(base64Image, mimeType, prompt) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set in .env.local');

  const res = await fetch(`${BASE_URL}?key=${GEMINI_API_KEY}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inline_data: { mime_type: mimeType, data: base64Image } },
          { text: prompt },
        ],
      }],
      generationConfig: { maxOutputTokens: 512, temperature: 0.2 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini Vision error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

/** Returns true if the API key is configured */
export function isGeminiConfigured() {
  return !!GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_key_here';
}
