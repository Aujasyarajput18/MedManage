import Link from 'next/link';

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. What We Collect',
      content: 'We collect only the information you provide directly: your name, email address, and the health data you choose to enter (medicines, dosage, reminders, journal entries). We do not collect your location unless you explicitly activate the SOS feature.'
    },
    {
      title: '2. How We Use Your Data',
      content: 'Your health data is used exclusively to power the app features you use — reminders, adherence tracking, journal, and the doctor\'s report PDF. We do NOT sell, share, or monetise your personal health information under any circumstances.'
    },
    {
      title: '3. Data Storage',
      content: 'Your data is securely stored using Google Firebase Firestore with industry-standard AES-256 encryption at rest and TLS in transit. We comply with GDPR, India\'s DPDPA 2023, and healthcare data best practices.'
    },
    {
      title: '4. AI Features',
      content: 'When you use AI features (Pill Identifier, Drug Interactions, Food Warnings), your query text is sent to Google Gemini API servers for processing. This data is not stored permanently and is governed by Google\'s AI data usage policies.'
    },
    {
      title: '5. Emergency SOS',
      content: 'When you activate SOS, your GPS coordinates are collected and sent via SMS to your pre-configured emergency contacts. This data is transmitted in real time and not stored in our systems beyond the session.'
    },
    {
      title: '6. Your Rights',
      content: 'You have the right to access, export, and permanently delete all your data at any time. Use the "Download Raw Data" feature in Doctor\'s Report to export, or email us at privacy@medmanage.app to request deletion.'
    },
    {
      title: '7. Cookies',
      content: 'We use only essential cookies for authentication (Firebase Auth session tokens). We do not use advertising or tracking cookies.'
    },
    {
      title: '8. Children\'s Privacy',
      content: 'MedManage is not intended for children under 13. We do not knowingly collect personal information from children.'
    },
    {
      title: '9. Changes to This Policy',
      content: 'We will notify you of material changes to this policy via in-app notification at least 14 days before changes take effect.'
    },
    {
      title: '10. Contact',
      content: 'For privacy concerns: privacy@medmanage.app | MedManage, India'
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{
        background: 'var(--primary)',
        padding: '40px var(--space-5) 32px',
      }}>
        <Link href="/dashboard/settings" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
          ← Back to Settings
        </Link>
        <h1 style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 900, fontSize: '1.8rem', color: 'white', margin: '12px 0 4px' }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.9rem' }}>
          Last updated: May 2026 · MedManage App
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: 'var(--space-5)', maxWidth: 720, margin: '0 auto' }}>
        <div style={{
          background: 'rgba(13,148,136,0.06)',
          border: '1px solid rgba(13,148,136,0.2)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-5)',
        }}>
          <p style={{ margin: 0, color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem' }}>
            <strong>Our commitment:</strong> We never sell your health data. Period.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sections.map((s, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <h2 style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 8px' }}>
                {s.title}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65, margin: 0 }}>
                {s.content}
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link href="/terms" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
            View Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}
