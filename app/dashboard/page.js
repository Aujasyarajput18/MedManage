'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { subscribeMedicines, subscribeDoseLogs, getUserProfile } from '@/lib/firestore';
import { isDemoMode, getDemoMedicines, getDemoProfile } from '@/lib/demo';
import Link from 'next/link';
import styles from './dashboard.module.css';

// SVG Adherence Ring
function AdherenceRing({ percent, todayText }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  const color = percent >= 80 ? '#43D9A2' : percent >= 50 ? '#FFB347' : '#FF4757';

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
      <circle
        cx="70" cy="70" r={r}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}
      />
      <text x="70" y="66" textAnchor="middle" fill="white" fontSize="22" fontWeight="800" fontFamily="Outfit,sans-serif">{percent}%</text>
      <text x="70" y="84" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="Inter,sans-serif">{todayText}</text>
    </svg>
  );
}

// Week bar chart
function WeekChart({ data }) {
  const max = Math.max(...data.map(d => d.total), 1);
  const days = ['S','M','T','W','T','F','S'];
  const today = new Date().getDay();

  return (
    <div className={styles.weekChart}>
      {data.map((d, i) => (
        <div key={i} className={styles.barWrap}>
          <div className={styles.barTrack}>
            <div
              className={styles.barFill}
              style={{
                height: `${(d.taken / max) * 100}%`,
                background: i === today ? 'var(--primary)' : 'rgba(108,99,255,0.4)',
              }}
            />
          </div>
          <span className={styles.barLabel} style={{ color: i === today ? 'var(--primary)' : 'var(--text-muted)' }}>
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

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [medicines, setMedicines]   = useState([]);
  const [doseLogs,  setDoseLogs]    = useState([]);
  const [profile,   setProfile]     = useState(null);
  const [loading,   setLoading]     = useState(true);
  const countRef                    = useRef(null);

  const today    = new Date().toISOString().split('T')[0];
  const dayName  = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr  = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
  const name     = profile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'there';

  useEffect(() => {
    // Demo mode — load from localStorage seed
    if (isDemoMode()) {
      const demoMeds = getDemoMedicines();
      const demoProf = getDemoProfile();
      setMedicines(demoMeds);
      setDoseLogs(DEMO_LOGS);
      if (demoProf) setProfile(demoProf);
      setLoading(false);
      return;
    }
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const unsubMeds = subscribeMedicines(user.uid, (meds) => {
      setMedicines(meds);
      setLoading(false);
    });
    const unsubLogs = subscribeDoseLogs(user.uid, today, setDoseLogs);
    getUserProfile(user.uid).then(p => p && setProfile(p));
    return () => { unsubMeds(); unsubLogs(); };
  }, [user, authLoading, today]);

  const allSlots = medicines.flatMap(m => (m.times || []).map(t => ({ medId: m.id, time: t })));
  const takenCount   = doseLogs.filter(l => l.status === 'taken').length;
  const skippedCount = doseLogs.filter(l => l.status === 'skipped').length;
  // pendingCount = slots that have NO log entry at all yet
  const loggedSlotKeys = new Set(doseLogs.map(l => `${l.medicineId}_${l.timeSlot}`));
  const pendingCount   = allSlots.filter(s => !loggedSlotKeys.has(`${s.medId}_${s.time}`)).length;
  const adherence      = allSlots.length > 0 ? Math.round((takenCount / allSlots.length) * 100) : 100;
  const streak         = profile?.streak || 0;
  const points         = profile?.points || 0;

  // Next upcoming dose
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const upcomingSlots = allSlots
    .filter(s => {
      const [h, m] = s.time.split(':').map(Number);
      const slotMins = h * 60 + m;
      const logged = doseLogs.find(l => l.medicineId === s.medId && l.timeSlot === s.time);
      return slotMins > nowMins && !logged;
    })
    .sort((a, b) => {
      const [ah, am] = a.time.split(':').map(Number);
      const [bh, bm] = b.time.split(':').map(Number);
      return (ah * 60 + am) - (bh * 60 + bm);
    })
    .slice(0, 3);

  // All today's slots with status
  const todaySchedule = allSlots.map(s => {
    const med    = medicines.find(m => m.id === s.medId);
    const log    = doseLogs.find(l => l.medicineId === s.medId && l.timeSlot === s.time);
    const [h, m] = s.time.split(':').map(Number);
    const slotMins = h * 60 + m;
    const isPast = slotMins < nowMins;
    return { ...s, med, log, isPast, status: log?.status || (isPast ? 'missed' : 'pending') };
  }).sort((a, b) => a.time.localeCompare(b.time));

  // Week data — real zeros for real users (only today's actual count is known from live data)
  const weekData = isDemoMode()
    ? [
        { taken: 3, total: 3 }, { taken: 2, total: 3 }, { taken: 3, total: 3 },
        { taken: 3, total: 3 }, { taken: 1, total: 3 }, { taken: 3, total: 3 },
        { taken: takenCount, total: allSlots.length || 3 },
      ]
    : [
        { taken: 0, total: 1 }, { taken: 0, total: 1 }, { taken: 0, total: 1 },
        { taken: 0, total: 1 }, { taken: 0, total: 1 }, { taken: 0, total: 1 },
        { taken: takenCount, total: allSlots.length || 1 },
      ];

  return (
    <div className="flex-col gap-6 animate-fade-in">

      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title" style={{ fontSize: '1.7rem' }}>
            {t('dashboard', 'greeting')}, {name} 👋
          </h1>
          <p className="text-muted text-sm">{dayName}, {dateStr}</p>
        </div>
        <div className="streak-flame animate-float">
          🔥 {streak}
        </div>
      </div>

      {/* Hero stats card */}
      <div className={`glass-card ${styles.heroCard}`}>
        <div className={styles.ringSection}>
          <AdherenceRing percent={adherence} todayText={t('dashboard', 'today')} />
          <div className={styles.ringStats}>
            <div className={styles.statItem}>
              <span className="text-success font-bold" style={{ fontSize: '1.3rem' }}>{takenCount}</span>
              <span className="text-xs text-muted">{t('dashboard', 'taken')}</span>
            </div>
            <div className={styles.statItem}>
              <span className="text-warning font-bold" style={{ fontSize: '1.3rem' }}>{skippedCount}</span>
              <span className="text-xs text-muted">{t('dashboard', 'skipped')}</span>
            </div>
            <div className={styles.statItem}>
              <span className="text-muted font-bold" style={{ fontSize: '1.3rem' }}>{pendingCount}</span>
              <span className="text-xs text-muted">{t('dashboard', 'pending')}</span>
            </div>
          </div>
        </div>

        <div className={styles.chartSection}>
          <p className="text-xs text-muted font-bold uppercase mb-2">{t('dashboard', 'thisWeek')}</p>
          <WeekChart data={weekData} />
        </div>
      </div>

      {/* Quick stat pills */}
      <div className="flex gap-3">
        <div className="glass-card-sm flex items-center gap-2" style={{ flex: 1 }}>
          <span style={{ fontSize: '1.3rem' }}>💎</span>
          <div>
            <div className="font-bold">{points.toLocaleString()}</div>
            <div className="text-xs text-muted">{t('dashboard', 'points')}</div>
          </div>
        </div>
        <div className="glass-card-sm flex items-center gap-2" style={{ flex: 1 }}>
          <span style={{ fontSize: '1.3rem' }}>📅</span>
          <div>
            <div className="font-bold">{medicines.length}</div>
            <div className="text-xs text-muted">{t('dashboard', 'medicines')}</div>
          </div>
        </div>
        <Link href="/dashboard/achievements" className="glass-card-sm flex items-center gap-2" style={{ flex: 1, textDecoration: 'none' }}>
          <span style={{ fontSize: '1.3rem' }}>🏆</span>
          <div>
            <div className="font-bold">{t('dashboard', 'badges')}</div>
            <div className="text-xs text-muted">{t('dashboard', 'viewAll')}</div>
          </div>
        </Link>
      </div>

      {/* Today's schedule */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold" style={{ fontSize: '1.1rem' }}>{t('dashboard', 'todaysSchedule')}</h2>
          <Link href="/dashboard/medicines" className="text-xs" style={{ color: 'var(--primary)' }}>{t('dashboard', 'allMedicines')} →</Link>
        </div>

        {todaySchedule.length === 0 && (
          <div className="glass-card text-center" style={{ padding: 'var(--space-8)' }}>
            <p style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</p>
            <p className="font-bold">{t('dashboard', 'noMedicinesToday')}</p>
            <p className="text-sm text-muted mt-1">{t('dashboard', 'addFirstMedicine')}</p>
            <Link href="/dashboard/medicines/add" className="btn btn-primary btn-sm mt-4">+ {t('dashboard', 'addMedicine')}</Link>
          </div>
        )}

        <div className="flex-col gap-3">
          {todaySchedule.map((slot, i) => (
            <div key={i} className={`glass-card-sm flex items-center justify-between ${styles.doseRow}`}
              style={{
                borderLeft: `3px solid ${slot.status === 'taken' ? 'var(--success)' : slot.status === 'missed' ? 'var(--danger)' : slot.status === 'skipped' ? 'var(--warning)' : 'var(--border)'}`,
                opacity: slot.status === 'taken' ? 0.7 : 1,
              }}
            >
              <div className="flex items-center gap-3">
                <span style={{ fontSize: '1.4rem' }}>💊</span>
                <div>
                  <div className="font-bold text-sm" style={{ textDecoration: slot.status === 'taken' ? 'line-through' : 'none' }}>
                    {slot.med?.name}
                  </div>
                  <div className="text-xs text-muted">{slot.med?.dosage} · {slot.time}</div>
                </div>
              </div>

              <div>
                {slot.status === 'taken' && <span className="badge badge-success">✓ {t('dashboard', 'taken')}</span>}
                {slot.status === 'skipped' && <span className="badge badge-warning">{t('dashboard', 'skipped')}</span>}
                {slot.status === 'missed' && <span className="badge badge-danger">{t('dashboard', 'missed')}</span>}
                {slot.status === 'pending' && (
                  <Link href="/dashboard/medicines" className="btn btn-sm btn-primary" style={{ minHeight: 32, padding: '0 12px', textDecoration: 'none' }}>
                    {t('dashboard', 'take')}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Interaction banner (if 2+ medicines) */}
      {medicines.length >= 2 && (
        <Link href="/dashboard/medicines/interactions" style={{ textDecoration: 'none' }}>
          <div className="glass-card-primary flex items-center gap-4">
            <div className="btn-icon animate-glow" style={{ background: 'var(--primary)', color: 'white', flexShrink: 0 }}>🤖</div>
            <div>
              <div className="font-bold text-sm">{t('dashboard', 'aiInteractionCheck')}</div>
              <div className="text-xs text-secondary">{t('dashboard', 'aiAnalyzing')}</div>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--primary)' }}>→</span>
          </div>
        </Link>
      )}

    </div>
  );
}
