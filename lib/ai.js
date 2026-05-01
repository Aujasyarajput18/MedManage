/**
 * lib/ai.js  [UPDATED — switched from Claude to Gemini]
 *
 * Client-side helpers — these call Next.js API routes which
 * hold the GEMINI_API_KEY server-side (never exposed to browser).
 */

/** Check drug-drug interactions for a list of medicine objects */
export async function checkDrugInteractions(medicines) {
  if (!medicines || medicines.length < 2) return null;
  try {
    const res = await fetch('/api/ai/interactions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ medicines: medicines.map((m) => m.name) }),
    });
    if (!res.ok) throw new Error('AI API failed');
    return await res.json();
  } catch (err) {
    console.error('Drug interaction check failed:', err);
    return null;
  }
}

/** Get advice for a missed dose */
export async function getMissedDoseAdvice(medicineName) {
  try {
    const res = await fetch('/api/ai/missed-dose', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ medicineName }),
    });
    if (!res.ok) throw new Error('AI API failed');
    return await res.json();
  } catch (err) {
    console.error('Missed dose advice failed:', err);
    return null;
  }
}

/** Get food/drink warnings for a medicine */
export async function getFoodWarnings(medicineName) {
  try {
    const res = await fetch('/api/ai/food-warnings', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ medicineName }),
    });
    if (!res.ok) throw new Error('AI API failed');
    return await res.json();
  } catch (err) {
    console.error('Food warnings failed:', err);
    return null;
  }
}

/** Identify a pill from a base64 photo */
export async function identifyPillFromPhoto(base64Image, mimeType = 'image/jpeg') {
  try {
    const res = await fetch('/api/ai/identify-pill', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ image: base64Image, mimeType }),
    });
    if (!res.ok) throw new Error('AI API failed');
    return await res.json();
  } catch (err) {
    console.error('Pill identification failed:', err);
    return null;
  }
}
