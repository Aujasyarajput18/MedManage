export async function POST(request) {
  const { userName, contacts, location } = await request.json();

  const mapLink = location
    ? `https://maps.google.com/?q=${location.lat},${location.lng}`
    : 'Location unavailable';

  const message = `🚨 EMERGENCY ALERT: ${userName} needs help! Location: ${mapLink} - This is an automated SOS from MedManage app.`;

  // Fast2SMS Integration
  const apiKey = process.env.FAST2SMS_API_KEY;
  const phones = contacts.map((c) => c.phone.replace(/\D/g, '')).join(',');

  if (apiKey && phones) {
    try {
      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message,
          language: 'english',
          flash: 0,
          numbers: phones,
        }),
      });
      const data = await res.json();
      console.log('Fast2SMS response:', data);
    } catch (err) {
      console.error('Fast2SMS error:', err);
    }
  } else {
    // Dev mode: just log
    console.log('SOS would send to:', phones);
    console.log('Message:', message);
  }

  return Response.json({ success: true, message });
}
