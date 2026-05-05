'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { seedDemoData } from '@/lib/demo';

const FEATURES = [
  { title: 'SOS Emergency', desc: 'Hold 3 seconds → live GPS sent to contacts via SMS instantly.', color: '#DC2626', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  )},
  { title: 'AI Drug Checker', desc: 'Plain-language interaction warnings. No medical jargon.', color: '#8B5CF6', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>
  )},
  { title: 'Smart Reminders', desc: 'Never miss a dose. Snooze, skip, or mark taken with one tap.', color: '#0D9488', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
  )},
  { title: 'Gamified Streaks', desc: 'Points, badges, 7-day streaks. Staying consistent is rewarding.', color: '#F59E0B', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
  )},
  { title: 'Caregiver Access', desc: 'Add family members. Share medication data with caregivers.', color: '#FB923C', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )},
  { title: 'Free Forever', desc: 'Medisafe went paid. MedManage is — and always will be — free.', color: '#10B981', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  )},
];

const COMPARE = [
  ['Always Free',        '✓', '✗ Paid 2026', '✓', '✗'],
  ['SOS Emergency',     '✓', '✗',           '✗', '✗'],
  ['AI Drug Check',     '✓', '✗',           '✗', 'Partial'],
  ['India-First',       '✓', '✗',           '✗', '✗'],
  ['Offline Mode',      '✓', '✗',           '✗', '✗'],
  ['Gamification',      '✓', '✗',           '✗', '✗'],
  ['Caregiver Alerts',  '✓ Instant', 'Delayed', '✗', '✗'],
];

export default function LandingPage() {
  const router = useRouter();
  const handleDemo = () => {
    seedDemoData();
    router.push('/dashboard?demo=true');
  };

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: '#FFFBF7', color: '#1C1917', minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,251,247,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E7E5E4',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(20px, 5vw, 80px)',
        height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: '#0D9488', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/></svg>
          </div>
          <span style={{ fontWeight: 900, fontSize: '1.15rem', color: '#1C1917' }}>MedManage</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/auth/login" style={{ padding: '8px 18px', borderRadius: 10, color: '#57534E', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem', border: '1.5px solid #E7E5E4' }}>Sign In</Link>
          <Link href="/auth/signup" style={{ padding: '8px 20px', borderRadius: 10, background: '#0D9488', color: 'white', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem', boxShadow: '0 4px 16px rgba(13,148,136,0.3)' }}>Get Started Free</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(160deg, #0D9488 0%, #0A7A70 55%, #064E3B 100%)',
        padding: 'clamp(60px, 8vw, 120px) clamp(20px, 5vw, 80px)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 50%)' }} />

        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(251,146,60,0.2)', border: '1px solid rgba(251,146,60,0.4)', borderRadius: 9999, padding: '6px 16px', marginBottom: 24 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FB923C', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <span style={{ color: '#FB923C', fontWeight: 700, fontSize: '0.85rem' }}>Medisafe went paid · We're the free replacement</span>
          </div>

          <h1 style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 900, fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', color: 'white', lineHeight: 1.15, margin: '0 0 20px' }}>
            The Free, AI-Powered<br />
            <span style={{ color: '#6EE7B7' }}>Medication App for India.</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.65 }}>
            Drug interaction warnings. Emergency SOS. Gamified streaks. Caregiver alerts. No paywalls. No ads. Always free.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <Link href="/auth/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#0D9488', fontWeight: 800, fontSize: '1rem', padding: '14px 28px', borderRadius: 12, textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', transition: 'transform 0.2s' }}>
              Get Started Free →
            </Link>
            <button onClick={handleDemo} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, fontSize: '1rem', padding: '14px 28px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.3)', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
              Try Demo (no login)
            </button>
          </div>

          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['No credit card', 'Free forever', 'Works on any phone', 'Installs as an app'].map(t => (
              <span key={t} style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ color: '#6EE7B7', fontWeight: 900 }}>✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHONE PREVIEW STRIP ── */}
      <section style={{ background: '#F5F5F0', padding: 'clamp(40px, 5vw, 80px) clamp(20px, 5vw, 80px)', textAlign: 'center' }}>
        <p style={{ color: '#57534E', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Looks great on any device</p>
        <h2 style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: '#1C1917', marginBottom: 48 }}>
          Designed for phones first. Works everywhere.
        </h2>

        {/* Mini phone mockups */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Dashboard', bg: '#0D9488', content: [
              { h: 60, color: '#0D9488', text: 'Today\'s Medicines' },
              { h: 40, color: '#FFF', text: 'Metformin 500mg · 8 AM' },
              { h: 40, color: '#FFF', text: 'Amlodipine 5mg · 8 PM' },
            ]},
            { label: 'SOS Alert', bg: '#DC2626', content: [
              { h: 80, color: '#DC2626', text: '🆘 Emergency SOS' },
              { h: 40, color: '#FFF', text: 'Hold 3 seconds' },
            ]},
            { label: 'Reminders', bg: '#8B5CF6', content: [
              { h: 50, color: '#8B5CF6', text: 'Reminders' },
              { h: 40, color: '#FFF', text: 'Metformin · 8:00 AM' },
              { h: 40, color: '#FFF', text: 'Vitamin D · 12:00 PM' },
            ]},
          ].map((screen) => (
            <div key={screen.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 140, height: 280, background: 'white', borderRadius: 28, overflow: 'hidden', boxShadow: '0 0 0 6px #1C1917, 0 20px 40px rgba(0,0,0,0.3)', position: 'relative' }}>
                {/* Notch */}
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 60, height: 16, background: '#1C1917', borderRadius: '0 0 12px 12px', zIndex: 2 }} />
                <div style={{ background: screen.bg, padding: '22px 12px 10px', textAlign: 'center' }}>
                  <p style={{ color: 'white', fontWeight: 800, fontSize: '0.7rem', margin: 0 }}>{screen.content[0].text}</p>
                </div>
                <div style={{ padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {screen.content.slice(1).map((c, i) => (
                    <div key={i} style={{ background: '#F5F5F0', borderRadius: 8, padding: '8px 10px', border: '1px solid #E7E5E4' }}>
                      <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#1C1917', margin: 0 }}>{c.text}</p>
                    </div>
                  ))}
                </div>
                {/* Home bar */}
                <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', width: 50, height: 4, background: '#1C1917', borderRadius: 2, opacity: 0.2 }} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#57534E' }}>{screen.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section style={{ padding: 'clamp(60px, 6vw, 100px) clamp(20px, 5vw, 80px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ color: '#0D9488', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Everything you need</p>
          <h2 style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2.4rem)', color: '#1C1917' }}>
            Everything your medication app<br /><span style={{ color: '#0D9488' }}>should have had.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: 'white', border: '1px solid #E7E5E4', borderRadius: 16, padding: 28, boxShadow: '0 2px 8px rgba(28,25,23,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${f.color}12`, border: `1.5px solid ${f.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 16 }}>
                {f.icon}
              </div>
              <h3 style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: '1.05rem', color: '#1C1917', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: '#57534E', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section style={{ background: '#F5F5F0', padding: 'clamp(60px, 6vw, 100px) clamp(20px, 5vw, 80px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: '#1C1917' }}>How we compare</h2>
          <p style={{ color: '#57534E', marginTop: 8 }}>vs. Medisafe, MyTherapy, EveryDose</p>
        </div>

        <div style={{ overflowX: 'auto', maxWidth: 860, margin: '0 auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(28,25,23,0.08)' }}>
            <thead>
              <tr style={{ background: '#0D9488' }}>
                {['Feature', 'MedManage', 'Medisafe', 'MyTherapy', 'EveryDose'].map((h, i) => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: i === 0 ? 'left' : 'center', color: 'white', fontFamily: 'Nunito,sans-serif', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.02em', background: i === 1 ? '#0A7A70' : undefined }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([feat, ...vals], ri) => (
                <tr key={feat} style={{ borderBottom: '1px solid #E7E5E4', background: ri % 2 === 0 ? 'white' : '#FAFAFA' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.875rem', color: '#1C1917' }}>{feat}</td>
                  {vals.map((v, vi) => (
                    <td key={vi} style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: vi === 0 ? 700 : 500, color: v === '✓' || v === '✓ Instant' ? '#0D9488' : v === '✗' ? '#DC2626' : '#F59E0B', background: vi === 0 ? 'rgba(13,148,136,0.04)' : undefined }}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'linear-gradient(135deg, #0D9488, #064E3B)', padding: 'clamp(60px, 6vw, 100px) clamp(20px, 5vw, 80px)', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: 'white', marginBottom: 12 }}>
          Start for free.<br />Takes 30 seconds.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 36, fontSize: '1.05rem' }}>No credit card. No ads. No paywalls. Ever.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/signup" style={{ display: 'inline-flex', alignItems: 'center', background: 'white', color: '#0D9488', fontWeight: 800, padding: '14px 32px', borderRadius: 12, textDecoration: 'none', fontSize: '1.05rem', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
            Sign Up Free →
          </Link>
          <button onClick={handleDemo} style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, padding: '14px 32px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1rem' }}>
            Try Demo First
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#1C1917', padding: '32px clamp(20px, 5vw, 80px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: '#0D9488', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/></svg>
          </div>
          <span style={{ color: 'white', fontWeight: 800 }}>MedManage</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>© 2026</span>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>Privacy</Link>
          <Link href="/terms" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>Terms</Link>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>We never sell your health data. Ever.</span>
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.9); }
        }
        @media (min-width: 900px) {
          body { background: #FFFBF7 !important; }
        }
      `}</style>
    </div>
  );
}
