import Link from 'next/link';

export default function TermsPage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By using MedManage ("the App"), you agree to these Terms of Service. If you do not agree, please do not use the App. These terms are governed by the laws of India.'
    },
    {
      title: '2. Not Medical Advice',
      content: 'MedManage is a personal health tracking tool. It does NOT provide medical advice, diagnosis, or treatment. Always consult a qualified doctor before changing your medication regimen. The AI features (drug interactions, pill identification) are informational only and may not be 100% accurate.'
    },
    {
      title: '3. User Responsibilities',
      content: 'You are responsible for the accuracy of the health information you enter. You agree not to use the App for any unlawful purpose. You must be at least 13 years old to use MedManage.'
    },
    {
      title: '4. SOS Feature Disclaimer',
      content: 'The SOS feature is an emergency aid tool. It depends on your device\'s GPS, SMS connectivity, and the accuracy of the contact information you provide. MedManage cannot guarantee delivery of emergency alerts due to network or device failures beyond our control. Always call emergency services (112 in India) in a life-threatening situation.'
    },
    {
      title: '5. Account Security',
      content: 'You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately at security@medmanage.app if you suspect unauthorized access.'
    },
    {
      title: '6. Intellectual Property',
      content: 'The MedManage name, logo, and all app content are the intellectual property of MedManage. You may not copy, modify, or redistribute without permission.'
    },
    {
      title: '7. Limitation of Liability',
      content: 'To the maximum extent permitted by law, MedManage shall not be liable for any indirect, incidental, or consequential damages arising from your use of the App, including medication errors based on App data.'
    },
    {
      title: '8. Changes to Terms',
      content: 'We may update these terms. Continued use of the App after changes constitutes acceptance of the new terms. Material changes will be communicated via in-app notification.'
    },
    {
      title: '9. Termination',
      content: 'We reserve the right to suspend or terminate your account if you violate these terms. You may delete your account at any time from Settings.'
    },
    {
      title: '10. Contact',
      content: 'For questions about these terms: legal@medmanage.app | MedManage, India'
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
          Terms of Service
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.9rem' }}>
          Last updated: May 2026 · MedManage App
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: 'var(--space-5)', maxWidth: 720, margin: '0 auto' }}>
        <div style={{
          background: 'rgba(220,38,38,0.06)',
          border: '1px solid rgba(220,38,38,0.2)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-5)',
        }}>
          <p style={{ margin: 0, color: 'var(--danger)', fontWeight: 700, fontSize: '0.95rem' }}>
            <strong>Important:</strong> MedManage is not a substitute for professional medical advice. Always consult your doctor.
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
          <Link href="/privacy" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
            View Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
