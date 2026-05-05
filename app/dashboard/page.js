'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { subscribeMedicines, subscribeDoseLogs, getUserProfile, logDose } from '@/lib/firestore';
import { isDemoMode, getDemoMedicines, getDemoProfile } from '@/lib/demo';
import Link from 'next/link';
import styles from './dashboard.module.css';

/* ── Adherence ring ── */
function AdherenceRing({ percent }) {
  const r = 48;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
      <circle
        cx="60" cy="60" r={r}
        fill="none"
        stroke={percent >= 80 ? '#FFFFFF' : percent >= 50 ? '#FDE68A' : '#FCA5A5'}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x="60" y="55" textAnchor="middle" fill="white" fontSize="20" fontWeight="900" fontFamily="Nunito,sans-serif">{percent}%</text>
      <text x="60" y="72" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10" fontFamily="Nunito,sans-serif">Today</text>
    </svg>
  );
}

/* ── Week chart inside teal hero ── */
function WeekChart({ data }) {
  const max = Math.max(...data.map(d => d.taken || d.total || 1), 1);
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().getDay();
  return (
    <div className={styles.weekChart}>
      {data.map((d, i) => (
        <div key={i} className={styles.barWrap}>
          <div className={styles.barTrack}>
            <div
              className={styles.barFill}
              style={{
                height: `${((d.taken || d.total || 0) / max) * 100}%`,
                background: i === today ? '#FFFFFF' : 'rgba(255,255,255,0.35)',
              }}
            />
          </div>
          <span className={styles.barLabel} style={{ color: i === today ? '#FFFFFF' : 'rgba(255,255,255,0.6)' }}>
            {days[(new Date().getDay() - (6 - i) + 7) % 7]}
          </span>
        </div>
      ))}
    </div>
  );
}

const DEMO_LOGS = [
  { medicineId: 'demo-1', timeSlot: '08:00', status: 'taken' },
  { medicineId: 'demo-3', timeSlot: '10:00', status: 'taken' },
];

const WEEK_DEMO = [
  { taken: 3 }, { taken: 4 }, { taken: 4 }, { taken: 2 }, { taken: 4 }, { taken: 3 }, { taken: 0 },
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [medicines, setMedicines] = useState([]);
  const [doseLogs, setDoseLogs]   = useState([]);
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [marking, setMarking]     = useState({});

  const today   = new Date().toISOString().split('T')[0];
  const hourNow = new Date().getHours();
  const greeting = hourNow < 12 ? 'Good morning' : hourNow < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const name = profile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'there';

  useEffect(() => {
    if (isDemoMode()) {
      setMedicines(getDemoMedicines());
      setDoseLogs(DEMO_LOGS);
      setProfile(getDemoProfile());
      setLoading(false);
      return;
    }
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const unsubMeds = subscribeMedicines(user.uid, (meds) => { setMedicines(meds); setLoading(false); });
    const unsubLogs = subscribeDoseLogs(user.uid, today, setDoseLogs);
    getUserProfile(user.uid).then(p => p && setProfile(p));
    return () => { unsubMeds(); unsubLogs(); };
  }, [user, authLoading, today]);

  const allSlots     = medicines.flatMap(m => (m.times || []).map(t => ({ medId: m.id, time: t, name: m.name, emoji: m.emoji || '💊', color: m.color || '#0D9488' })));
  const takenCount   = doseLogs.filter(l => l.status === 'taken').length;
  const adherence    = allSlots.length > 0 ? Math.round((takenCount / allSlots.length) * 100) : 100;
  const streak       = profile?.streak || 0;
  const loggedKeys   = new Set(doseLogs.map(l => `${l.medicineId}_${l.timeSlot}`));
  const pendingSlots = allSlots.filter(s => !loggedKeys.has(`${s.medId}_${s.time}`));

  const markTaken = async (medId, timeSlot) => {
    const key = `${medId}_${timeSlot}`;
    setMarking(m => ({ ...m, [key]: true }));
    try {
      if (user && !isDemoMode()) {
        await logDose(user.uid, { medicineId: medId, timeSlot, status: 'taken', date: today });
      } else {
        setDoseLogs(prev => [...prev, { medicineId: medId, timeSlot, status: 'taken' }]);
      }
    } finally {
      setMarking(m => { const n = { ...m }; delete n[key]; return n; });
    }
  };

  const QUICK_LINKS = [
    { label: 'Medicines', href: '/dashboard/medicines', color: '#0D9488', abbr: 'Rx' },
    { label: 'Calendar',  href: '/dashboard/calendar',  color: '#8B5CF6', abbr: 'Cal' },
    { label: 'Journal',   href: '/dashboard/journal',   color: '#F59E0B', abbr: 'Jnl' },
    { label: 'Badges',    href: '/dashboard/achievements', color: '#EC4899', abbr: '★' },
    { label: 'Doctor',    href: '/dashboard/appointments', color: '#3B82F6', abbr: 'Dr.' },
    { label: 'Analytics', href: '/dashboard/analytics', color: '#10B981', abbr: '%' },
    { label: 'SOS',       href: '/dashboard/sos',       color: '#DC2626', abbr: 'SOS' },
    { label: 'Settings',  href: '/dashboard/settings',  color: '#6B7280', abbr: '⚙' },
  ];

  if (loading) return (
    <div style={{ paddingTop: 40, textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: 8 }}>💊</div>
      <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading...</p>
    </div>
  );

  return (
    <div className="flex-col gap-5 animate-fade-in">

      {/* ── GREETING + DATE ── */}
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>{dateStr}</p>
        <h1 style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 900, fontSize: '1.6rem', color: 'var(--text-primary)', margin: 0 }}>
          {greeting}, {name}
        </h1>
      </div>

      {/* ── TEAL HERO CARD ── */}
      <div className={styles.heroCard}>
        <div className={styles.ringSection}>
          <AdherenceRing percent={adherence} />
          <div className={styles.ringStats}>
            <div className={styles.statItem}>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'white' }}>{takenCount}</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Taken</span>
            </div>
            <div className={styles.statItem}>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#FDE68A' }}>{pendingSlots.length}</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Pending</span>
            </div>
            <div className={styles.statItem}>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#FDE68A' }}>🔥{streak}</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Day streak</span>
            </div>
          </div>
        </div>
        <div className={styles.chartSection}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>THIS WEEK</p>
          <WeekChart data={WEEK_DEMO} />
        </div>
      </div>

      {/* ── TODAY'S MEDICINES ── */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>Today's Medicines</h2>
          <Link href="/dashboard/medicines" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>See all →</Link>
        </div>

        {medicines.length === 0 ? (
          <div className="glass-card text-center flex-col gap-3" style={{ padding: 'var(--space-8)' }}>
            <span style={{ fontSize: '3rem' }}>💊</span>
            <p className="font-bold">No medicines added yet</p>
            <Link href="/dashboard/medicines/add" className="btn btn-primary btn-sm" style={{ alignSelf: 'center' }}>
              + Add First Medicine
            </Link>
          </div>
        ) : (
          <div className="flex-col gap-3">
            {allSlots.slice(0, 5).map(slot => {
              const key    = `${slot.medId}_${slot.time}`;
              const log    = doseLogs.find(l => l.medicineId === slot.medId && l.timeSlot === slot.time);
              const status = log?.status || 'pending';
              return (
                <div key={key} className="glass-card flex items-center gap-3" style={{ padding: 'var(--space-4)' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 'var(--radius-sm)',
                    background: `${slot.color}18`,
                    border: `1.5px solid ${slot.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem', flexShrink: 0,
                  }}>{slot.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="font-bold" style={{ margin: 0, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {slot.name}
                    </p>
                    <p className="text-xs text-muted" style={{ margin: 0 }}>⏰ {slot.time}</p>
                  </div>
                  {status === 'taken' ? (
                    <span style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)', borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: '0.78rem', fontWeight: 700, border: '1px solid rgba(16,185,129,0.25)' }}>
                      ✓ Taken
                    </span>
                  ) : status === 'skipped' ? (
                    <span style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--warning)', borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: '0.78rem', fontWeight: 700, border: '1px solid rgba(245,158,11,0.25)' }}>
                      ⏭ Skipped
                    </span>
                  ) : (
                    <button
                      onClick={() => markTaken(slot.medId, slot.time)}
                      disabled={marking[key]}
                      style={{
                        background: 'var(--primary)', color: 'white',
                        border: 'none', borderRadius: 'var(--radius-full)',
                        padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'Nunito,sans-serif',
                        minHeight: 36, flexShrink: 0,
                      }}
                    >
                      {marking[key] ? '...' : 'Take'}
                    </button>
                  )}
                </div>
              );
            })}
            {allSlots.length > 5 && (
              <Link href="/dashboard/medicines" style={{ textAlign: 'center', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', padding: '8px', display: 'block' }}>
                +{allSlots.length - 5} more doses →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── QUICK ACCESS GRID ── */}
      <div>
        <h2 style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: '1.1rem', marginBottom: 12 }}>Quick Access</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {QUICK_LINKS.map(q => (
            <Link key={q.href} href={q.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 8px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                textAlign: 'center',
                transition: 'all 0.18s ease',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${q.color}18`,
                  border: `1.5px solid ${q.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: q.color,
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  fontFamily: 'Nunito,sans-serif',
                }}>{q.abbr}</div>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-secondary)', lineHeight: 1.2 }}>{q.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── BOTTOM QUICK ACTIONS ── */}
      <div className="flex gap-3">
        <Link href="/dashboard/medicines/identify" className="glass-card flex-col gap-1 items-center text-center" style={{ flex: 1, textDecoration: 'none', padding: 'var(--space-4)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <span className="text-xs font-bold">Identify Pill</span>
          <span className="text-xs text-muted">AI scan</span>
        </Link>
        <Link href="/dashboard/medicines/interactions" className="glass-card flex-col gap-1 items-center text-center" style={{ flex: 1, textDecoration: 'none', padding: 'var(--space-4)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>
          </div>
          <span className="text-xs font-bold">Interactions</span>
          <span className="text-xs text-muted">AI check</span>
        </Link>
        <Link href="/dashboard/profiles" className="glass-card flex-col gap-1 items-center text-center" style={{ flex: 1, textDecoration: 'none', padding: 'var(--space-4)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(251,146,60,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <span className="text-xs font-bold">Family</span>
          <span className="text-xs text-muted">Caregiver</span>
        </Link>
      </div>

    </div>
  );
}
