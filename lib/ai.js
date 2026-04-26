// Claude API integration via a server-side API route proxy
// To avoid exposing the Claude key on the client side

// Interaction check — call from client, handled by /api/ai/interactions
export async function checkDrugInteractions(medicines) {
  if (!medicines || medicines.length < 2) return null;
  
  try {
    const res = await fetch('/api/ai/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicines: medicines.map((m) => m.name) }),
    });
    if (!res.ok) throw new Error('AI API failed');
    return await res.json();
  } catch (err) {
    console.error('AI interaction check failed:', err);
    return null;
  }
}

export async function getMissedDoseAdvice(medicineName) {
  try {
    const res = await fetch('/api/ai/missed-dose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicineName }),
    });
    if (!res.ok) throw new Error('AI API failed');
    return await res.json();
  } catch (err) {
    console.error('Missed dose advice failed:', err);
    return null;
  }
}

export async function getFoodWarnings(medicineName) {
  try {
    const res = await fetch('/api/ai/food-warnings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicineName }),
    });
    if (!res.ok) throw new Error('AI API failed');
    return await res.json();
  } catch (err) {
    console.error('Food warnings failed:', err);
    return null;
  }
}

export async function identifyPillFromPhoto(base64Image) {
  try {
    const res = await fetch('/api/ai/identify-pill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    });
    if (!res.ok) throw new Error('AI API failed');
    return await res.json();
  } catch (err) {
    console.error('Pill identification failed:', err);
    return null;
  }
}
