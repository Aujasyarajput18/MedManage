import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — MedManage',
};

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
      <Link href="/" style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>← Back to home</Link>
      <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: '24px 0 8px' }}>
        Terms of Service
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Last updated: April 26, 2026</p>

      <div style={{ background: 'rgba(255,179,71,0.08)', border: '1px solid rgba(255,179,71,0.3)', borderRadius: 12, padding: '16px 20px', marginBottom: 32, fontWeight: 600, color: 'var(--warning)' }}>
        ⚕️ Important: MedManage is a medication tracking tool, not a medical service. Always follow your doctor's advice. Our AI is a helpful guide, not a substitute for professional medical care.
      </div>

      {[
        { title: '1. What MedManage is', body: 'MedManage is a medication adherence and health tracking application. It helps you remember to take medicines, track your health metrics, and access AI-generated information about your medications.' },
        { title: '2. Not medical advice', body: 'Nothing in MedManage — including AI responses, drug interaction warnings, or health journal analysis — constitutes medical advice. Always consult your doctor, pharmacist, or healthcare provider before making any changes to your medication regimen.' },
        { title: '3. SOS feature disclaimer', body: 'The SOS feature sends SMS messages to your emergency contacts. We are not liable for SMS delivery failures, incorrect contact information, or outcomes resulting from SOS use. Always call emergency services (112 in India) for life-threatening situations.' },
        { title: '4. Free to use', body: 'MedManage is free to use. We may introduce optional premium features in the future, but core functionality will always remain free.' },
        { title: '5. Account responsibility', body: 'You are responsible for maintaining the security of your account. Do not share your login credentials. You are responsible for all activity under your account.' },
        { title: '6. Changes to these terms', body: 'We may update these terms as the app evolves. We will notify you of material changes via email or in-app notification.' },
        { title: '7. Contact', body: 'Questions? Email legal@medmanage.app' },
      ].map(section => (
        <div key={section.title} style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: 8 }}>{section.title}</h2>
          <p>{section.body}</p>
        </div>
      ))}
    </div>
  );
}
