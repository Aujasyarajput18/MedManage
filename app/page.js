'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { seedDemoData } from '@/lib/demo';

const features = [
  ['AI safety', 'Interactions, pill scan, food warnings, and missed-dose help.'],
  ['Care team', 'Family profiles, SOS contacts, doctor exports, and adherence sharing.'],
  ['Dose cockpit', 'Take, skip, refill, review, and plan from one premium phone screen.'],
  ['Demo ready', 'A realistic no-login prototype seeded from the first click.'],
];

const workflow = [
  ['Scan', 'Identify a pill or add a prescription.'],
  ['Schedule', 'Dose times, inventory, and notes.'],
  ['Act', 'Take, skip, SOS, or export.'],
  ['Review', 'Streaks, symptoms, refills, and risk.'],
];

const mark = (color = '#fff') => ({
  width: 34,
  height: 34,
  borderRadius: '50%',
  border: `4px dashed ${color}`,
  boxShadow: `inset 0 0 0 8px transparent`,
  flex: '0 0 auto',
});

function Bottle({ color, name, dark = false }) {
  return (
    <div style={{
      position: 'absolute',
      left: '50%',
      top: 188,
      width: 146,
      height: 250,
      transform: 'translateX(-50%)',
      borderRadius: '22px 22px 34px 34px',
      background: `linear-gradient(180deg, ${color} 0 62%, rgba(67,24,9,.66) 62% 100%)`,
      boxShadow: '0 28px 42px rgba(0,0,0,.28)',
      overflow: 'visible',
      zIndex: 2,
    }}>
      <div style={{
        position: 'absolute',
        top: -48,
        left: -9,
        width: 164,
        height: 52,
        borderRadius: '5px 5px 10px 10px',
        background: 'linear-gradient(90deg,#f5f2ea,#fff,#ebe8df)',
        boxShadow: '0 16px 22px rgba(0,0,0,.2)',
      }} />
      <div style={{
        height: '62%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        color: dark ? '#111' : '#fff',
        textAlign: 'center',
        padding: '0 12px',
      }}>
        <span style={mark(dark ? '#111' : '#fff')} />
        <strong style={{ fontSize: 22, lineHeight: 1, fontWeight: 950 }}>{name}</strong>
        <small style={{ fontSize: 10, fontWeight: 900, opacity: .78 }}>by MedManage</small>
      </div>
      <div style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 14,
        height: 74,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        overflow: 'hidden',
      }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{
            width: 42,
            height: 68,
            borderRadius: 999,
            background: 'linear-gradient(145deg,rgba(255,231,110,.98),rgba(184,67,14,.88))',
            boxShadow: 'inset 0 12px 20px rgba(255,255,255,.34)',
            transform: `rotate(${[-22, 18, -8][i]}deg) translateY(${[0, 14, 5][i]}px)`,
          }} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ tone }) {
  const sleep = tone === 'sleep';
  const bg = sleep
    ? 'linear-gradient(160deg,#a90936 0%,#de2359 58%,#9f1838 100%)'
    : 'linear-gradient(160deg,#ffb90d 0%,#ffd51d 56%,#e3a512 100%)';
  const dark = !sleep;
  const text = dark ? '#111' : '#fff';

  return (
    <article style={{
      position: 'relative',
      width: 'min(360px, 88vw)',
      minHeight: 600,
      borderRadius: 48,
      padding: '26px 28px 24px',
      background: bg,
      color: text,
      boxShadow: '0 42px 90px rgba(34,75,91,.28)',
      overflow: 'hidden',
      transform: sleep ? 'rotate(-3deg)' : 'rotate(2deg)',
      flex: '0 0 auto',
    }}>
      <div style={{
        position: 'absolute',
        inset: '92px 28px 190px',
        opacity: .12,
        background: `radial-gradient(ellipse at 50% 40%, ${text} 0 25%, transparent 26%),
          radial-gradient(ellipse at 25% 70%, ${text} 0 15%, transparent 16%),
          radial-gradient(ellipse at 78% 70%, ${text} 0 16%, transparent 17%)`,
      }} />
      <div style={{ position: 'relative', zIndex: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" aria-label="Previous medicine" style={{
          width: 46,
          height: 46,
          borderRadius: '50%',
          border: 0,
          background: dark ? '#fff' : 'rgba(0,0,0,.18)',
          color: dark ? '#111' : '#fff',
          fontSize: 28,
          lineHeight: 1,
          cursor: 'pointer',
        }}>‹</button>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 30, fontWeight: 950 }}>
          <span style={mark(text)} /> MedManage
        </span>
      </div>
      <div style={{ position: 'relative', zIndex: 3, display: 'flex', gap: 30, marginTop: 38, fontSize: 17, fontWeight: 950 }}>
        <span style={{ opacity: sleep ? .48 : 1 }}>Relax</span>
        <span style={{ opacity: sleep ? 1 : .45 }}>Sleep</span>
      </div>
      <Bottle color={sleep ? '#bf1746' : '#f8bf16'} name={sleep ? 'Night Guard' : 'Daily Care'} dark={dark} />
      <div style={{ position: 'absolute', zIndex: 4, top: 158, right: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {['30', sleep ? '60' : '14', sleep ? '90' : '20'].map((dose, i) => (
          <span key={dose} style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: i === 0 ? '#111' : 'rgba(17,17,17,.22)',
            color: i === 0 ? '#fff' : (dark ? 'rgba(17,17,17,.5)' : 'rgba(255,255,255,.55)'),
            fontSize: 19,
            fontWeight: 950,
          }}>{dose}</span>
        ))}
      </div>
      <div style={{
        position: 'absolute',
        zIndex: 5,
        left: 0,
        right: 0,
        bottom: 0,
        minHeight: 235,
        padding: '34px 28px 28px',
        borderRadius: '42px 42px 0 0',
        background: '#fff',
        color: '#111',
      }}>
        <h2 style={{ margin: 0, fontSize: 38, lineHeight: .98, fontWeight: 950 }}>
          {sleep ? 'Night Guard 30' : 'Daily Care'}
        </h2>
        <p style={{ margin: '16px 0 20px', color: '#777', fontSize: 16, fontWeight: 900 }}>
          {sleep ? 'Dissolvable reminder plan' : '250 mg · refill in 12 days'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <strong style={{ fontSize: 34, lineHeight: 1 }}>{sleep ? '98%' : '12'}</strong>
          <span style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 20, fontWeight: 950 }}>
            <b style={{ width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#111', color: '#ffd21f' }}>-</b>
            {sleep ? '1' : '2'}
            <b style={{ width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#111', color: '#ffd21f' }}>+</b>
          </span>
        </div>
        <button type="button" style={{
          width: '100%',
          minHeight: 54,
          border: 0,
          borderRadius: 999,
          background: '#ffd21f',
          color: '#111',
          fontSize: 16,
          fontWeight: 950,
          cursor: 'pointer',
        }}>{sleep ? 'Open care plan' : 'Buy time back'}</button>
      </div>
    </article>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const handleDemo = () => {
    localStorage.setItem('medmanage_onboarding_done', 'true');
    seedDemoData();
    router.push('/dashboard?demo=true');
  };

  return (
    <main style={{
      minHeight: '100vh',
      overflow: 'hidden',
      background: 'linear-gradient(118deg,rgba(255,255,255,.36) 1px,transparent 1px) 0 0/180px 180px,#b8dbea',
      color: '#0b1117',
      fontFamily: 'Nunito, Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <nav style={{
        width: 'min(1180px, calc(100% - 32px))',
        margin: '0 auto',
        padding: '22px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/" aria-label="MedManage home" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: '#071018',
          textDecoration: 'none',
          fontSize: 'clamp(1.35rem, 2vw, 1.8rem)',
          fontWeight: 950,
        }}>
          <span style={mark('#fff')} /> MedManage
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/onboarding" style={{
            minHeight: 44,
            borderRadius: 999,
            padding: '0 18px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,.72)',
            boxShadow: '0 14px 28px rgba(25,57,71,.12)',
            color: '#111',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 950,
          }}>Tutorial</Link>
          <Link href="/auth/login" aria-label="Sign in" style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(255,255,255,.9)',
            boxShadow: '0 14px 28px rgba(25,57,71,.16)',
            color: '#111',
            textDecoration: 'none',
            fontSize: 24,
            fontWeight: 900,
          }}>⌾</Link>
          <button type="button" onClick={handleDemo} aria-label="Try demo" style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            border: 0,
            position: 'relative',
            background: 'rgba(255,255,255,.9)',
            boxShadow: '0 14px 28px rgba(25,57,71,.16)',
            color: '#111',
            cursor: 'pointer',
            fontSize: 24,
          }}>⌑<span style={{
            position: 'absolute',
            top: -2,
            right: -2,
            minWidth: 19,
            height: 19,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: '#111',
            color: '#fff',
            fontSize: 11,
            fontWeight: 950,
          }}>3</span></button>
        </div>
      </nav>

      <section style={{
        width: 'min(1180px, calc(100% - 32px))',
        margin: '0 auto',
        padding: 'clamp(28px,5vw,70px) 0 70px',
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(28px,5vw,70px)',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: '1 1 390px', maxWidth: 535 }}>
          <p style={{ margin: '0 0 18px', color: 'rgba(11,17,23,.7)', fontSize: 14, fontWeight: 950, textTransform: 'uppercase', letterSpacing: '.08em' }}>
            Free medication care prototype
          </p>
          <h1 style={{
            margin: 0,
            color: '#fff',
            fontSize: 'clamp(2.5rem, 12vw, 6.2rem)',
            lineHeight: .98,
            fontWeight: 950,
            textShadow: '0 20px 48px rgba(36,85,103,.22)',
            letterSpacing: 0,
          }}>
            Medication management that feels calm, premium, and ready to demo.
          </h1>
          <p style={{ maxWidth: 488, margin: '24px 0 0', color: 'rgba(11,17,23,.76)', fontSize: 17, lineHeight: 1.7, fontWeight: 800 }}>
            MedManage brings reminders, refills, AI safety checks, caregiver updates, SOS,
            journals, and doctor reports into one polished phone-first experience.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 30 }}>
            <button type="button" onClick={handleDemo} style={{
              minHeight: 56,
              border: 0,
              borderRadius: 999,
              padding: '0 30px',
              background: '#111',
              color: '#fff',
              fontSize: 16,
              fontWeight: 950,
              cursor: 'pointer',
              boxShadow: '0 18px 34px rgba(17,17,17,.2)',
            }}>Try interactive demo</button>
            <Link href="/auth/signup" style={{
              minHeight: 56,
              borderRadius: 999,
              padding: '0 30px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,.55)',
              border: '1px solid rgba(255,255,255,.7)',
              color: '#111',
              textDecoration: 'none',
              fontSize: 16,
              fontWeight: 950,
            }}>Create account</Link>
            <Link href="/onboarding" style={{
              minHeight: 56,
              borderRadius: 999,
              padding: '0 26px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(17,17,17,.08)',
              border: '1px solid rgba(17,17,17,.12)',
              color: '#111',
              textDecoration: 'none',
              fontSize: 16,
              fontWeight: 950,
            }}>Watch tutorial</Link>
          </div>
        </div>

        <div style={{
          flex: '1 1 560px',
          minHeight: 650,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          flexWrap: 'wrap',
        }} aria-label="MedManage product preview">
          <div style={{ marginRight: -40, marginTop: 40 }}><ProductCard tone="sleep" /></div>
          <div style={{ marginLeft: -10 }}><ProductCard tone="relax" /></div>
        </div>
      </section>

      <section style={{
        width: 'min(920px, calc(100% - 32px))',
        margin: '0 auto 34px',
        padding: 'clamp(42px,6vw,76px) clamp(24px,5vw,64px)',
        borderRadius: 44,
        background: 'rgba(72,132,166,.66)',
        color: '#fff',
        textAlign: 'center',
        boxShadow: '0 32px 80px rgba(34,75,91,.22)',
      }}>
        <p style={{ margin: '0 0 16px', color: 'rgba(255,255,255,.72)', fontWeight: 950 }}>Prototype-ready surface</p>
        <h2 style={{ maxWidth: 680, margin: '0 auto', color: '#fff', fontSize: 'clamp(2.5rem,6vw,5rem)', lineHeight: .98, fontWeight: 950 }}>
          Powerful care tools, presented like a real product.
        </h2>
        <div style={{ marginTop: 42, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, textAlign: 'left' }}>
          {workflow.map(([title, body]) => (
            <div key={title} style={{ padding: 18, borderRadius: 24, background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.16)' }}>
              <strong style={{ color: '#fff', fontWeight: 950 }}>{title}</strong>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,.75)', fontSize: 14, lineHeight: 1.55, fontWeight: 750 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{
        width: 'min(1180px, calc(100% - 32px))',
        margin: '0 auto',
        padding: '24px 0 72px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
        gap: 18,
      }}>
        {features.map(([title, body]) => (
          <article key={title} style={{
            minHeight: 232,
            padding: 26,
            borderRadius: 32,
            background: 'rgba(255,255,255,.76)',
            boxShadow: '0 22px 46px rgba(34,75,91,.14)',
            border: '1px solid rgba(255,255,255,.7)',
          }}>
            <span style={{ display: 'inline-flex', minHeight: 38, alignItems: 'center', padding: '0 14px', borderRadius: 999, background: '#111', color: '#fff', fontSize: 13, fontWeight: 950 }}>
              {title}
            </span>
            <p style={{ margin: '58px 0 0', color: 'rgba(11,17,23,.68)', fontSize: 16, lineHeight: 1.62, fontWeight: 800 }}>{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
