import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — MedManage',
  description: 'How MedManage handles your health data — written in plain English.',
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
      <Link href="/" style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>← Back to home</Link>
      <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: '24px 0 8px' }}>
        Privacy Policy
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Last updated: April 26, 2026</p>

      <div style={{ background: 'rgba(67,217,162,0.08)', border: '1px solid rgba(67,217,162,0.3)', borderRadius: 12, padding: '16px 20px', marginBottom: 32, fontWeight: 600, color: 'var(--success)' }}>
        🛡️ Plain English Summary: We never sell your health data. Ever. Your medical information stays on your device and in your private Firebase account, which only you can access.
      </div>

      {[
        { title: '1. What data we collect', body: 'We collect: your email address (for login), your medicine names and schedules, your health journal entries (BP, glucose, mood), and your SOS emergency contacts. We do NOT collect: your exact GPS location (only captured momentarily during SOS trigger), financial information, or any data we don\'t need to run the app.' },
        { title: '2. How we store your data', body: 'Your data is stored in Google Firebase (Firestore), a SOC 2 compliant, encrypted database. Access is controlled by your Firebase authentication — only you can read and write your own data. Our server-side code (API routes) cannot read your personal health data.' },
        { title: '3. AI queries', body: 'When you use AI features, the relevant medicine names or images are sent to the Gemini API for analysis. We do not intentionally include personally identifying information in those requests.' },
        { title: '4. SOS and SMS', body: 'When you trigger SOS, your GPS coordinates and name are sent via Fast2SMS to your emergency contacts only. We log the time and location of SOS triggers in your private Firestore document for your own history.' },
        { title: '5. We do NOT sell your data', body: 'MedManage does not sell, rent, or share your personal health information with advertisers, data brokers, insurance companies, pharma companies, or any third party. This is a founding principle of our company.' },
        { title: '6. Data deletion', body: 'You can delete your account and all associated data at any time from Settings → Delete Account. This permanently removes all your data from our servers within 30 days.' },
        { title: '7. Contact', body: 'Questions? Email privacy@medmanage.app' },
      ].map(section => (
        <div key={section.title} style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: 8 }}>{section.title}</h2>
          <p>{section.body}</p>
        </div>
      ))}
    </div>
  );
}
