'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subscribeMedicines, subscribeDoseLogs, updateStreak, getUserProfile } from '@/lib/firestore';
import Link from 'next/link';
import styles from './dashboard.module.css';

// SVG Adherence Ring
function AdherenceRing({ percent }) {
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
      <text x="70" y="84" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="Inter,sans-serif">today</text>
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

const DEMO_MEDICINES = [
  { id: '1', name: 'Metformin',  dosage: '500mg', times: ['08:00', '20:00'], category: 'Chronic' },
  { id: '2', name: 'Aspirin',    dosage: '75mg',  times: ['09:00'],          category: 'Chronic' },
  { id: '3', name: 'Vitamin D3', dosage: '1000IU',times: ['08:00'],          category: 'Vitamin' },
];

const DEMO_LOGS = [
  { medicineId: '1', timeSlot: '08:00', status: 'taken' },
  { medicineId: '3', timeSlot: '08:00', status: 'taken' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [medicines, setMedicines]   = useState(DEMO_MEDICINES);
  const [doseLogs,  setDoseLogs]    = useState(DEMO_LOGS);
  const [profile,   setProfile]     = useState(null);
  const [loading,   setLoading]     = useState(false);
  const countRef                    = useRef(null);

  const today    = new Date().toISOString().split('T')[0];
  const dayName  = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr  = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
  const name     = profile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'there';

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsubMeds = subscribeMedicines(user.uid, (meds) => {
      setMedicines(meds.length ? meds : DEMO_MEDICINES);
      setLoading(false);
    });
    const unsubLogs = subscribeDoseLogs(user.uid, today, setDoseLogs);
    getUserProfile(user.uid).then(p => p && setProfile(p));
    return () => { unsubMeds(); unsubLogs(); };
  }, [user, today]);

  // Compute stats
  const allSlots = medicines.flatMap(m => (m.times || []).map(t => ({ medId: m.id, time: t })));
  const takenCount  = doseLogs.filter(l => l.status === 'taken').length;
  const skippedCount = doseLogs.filter(l => l.status === 'skipped').length;
  const pendingCount = allSlots.length - doseLogs.length;
  const adherence   = allSlots.length > 0 ? Math.round((takenCount / allSlots.length) * 100) : 100;
  const streak      = profile?.streak || (user ? 0 : 14);
  const points      = profile?.points || (user ? 0 : 1250);

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

  // Demo week data
  const weekData = [
    { taken: 3, total: 3 }, { taken: 2, total: 3 }, { taken: 3, total: 3 },
    { taken: 3, total: 3 }, { taken: 1, total: 3 }, { taken: 3, total: 3 },
    { taken: takenCount, total: allSlots.length || 3 },
  ];

  return (
    <div className="flex-col gap-6 animate-fade-in">

      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title" style={{ fontSize: '1.7rem' }}>
            Hey, {name} 👋
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
          <AdherenceRing percent={adherence} />
          <div className={styles.ringStats}>
            <div className={styles.statItem}>
              <span className="text-success font-bold" style={{ fontSize: '1.3rem' }}>{takenCount}</span>
              <span className="text-xs text-muted">Taken</span>
            </div>
            <div className={styles.statItem}>
              <span className="text-warning font-bold" style={{ fontSize: '1.3rem' }}>{skippedCount}</span>
              <span className="text-xs text-muted">Skipped</span>
            </div>
            <div className={styles.statItem}>
              <span className="text-muted font-bold" style={{ fontSize: '1.3rem' }}>{pendingCount > 0 ? pendingCount : 0}</span>
              <span className="text-xs text-muted">Pending</span>
            </div>
          </div>
        </div>

        <div className={styles.chartSection}>
          <p className="text-xs text-muted font-bold uppercase mb-2">This week</p>
          <WeekChart data={weekData} />
        </div>
      </div>

      {/* Quick stat pills */}
      <div className="flex gap-3">
        <div className="glass-card-sm flex items-center gap-2" style={{ flex: 1 }}>
          <span style={{ fontSize: '1.3rem' }}>💎</span>
          <div>
            <div className="font-bold">{points.toLocaleString()}</div>
            <div className="text-xs text-muted">Points</div>
          </div>
        </div>
        <div className="glass-card-sm flex items-center gap-2" style={{ flex: 1 }}>
          <span style={{ fontSize: '1.3rem' }}>📅</span>
          <div>
            <div className="font-bold">{medicines.length}</div>
            <div className="text-xs text-muted">Medicines</div>
          </div>
        </div>
        <Link href="/dashboard/achievements" className="glass-card-sm flex items-center gap-2" style={{ flex: 1, textDecoration: 'none' }}>
          <span style={{ fontSize: '1.3rem' }}>🏆</span>
          <div>
            <div className="font-bold">Badges</div>
            <div className="text-xs text-muted">View all</div>
          </div>
        </Link>
      </div>

      {/* Today's schedule */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold" style={{ fontSize: '1.1rem' }}>Today's Schedule</h2>
          <Link href="/dashboard/medicines" className="text-xs" style={{ color: 'var(--primary)' }}>All medicines →</Link>
        </div>

        {todaySchedule.length === 0 && (
          <div className="glass-card text-center" style={{ padding: 'var(--space-8)' }}>
            <p style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</p>
            <p className="font-bold">No medicines today!</p>
            <p className="text-sm text-muted mt-1">Or add your first medicine to get started.</p>
            <Link href="/dashboard/medicines/add" className="btn btn-primary btn-sm mt-4">+ Add Medicine</Link>
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
                {slot.status === 'taken' && <span className="badge badge-success">✓ Taken</span>}
                {slot.status === 'skipped' && <span className="badge badge-warning">Skipped</span>}
                {slot.status === 'missed' && <span className="badge badge-danger">Missed</span>}
                {slot.status === 'pending' && (
                  <Link href="/dashboard/medicines" className="btn btn-sm btn-primary" style={{ minHeight: 32, padding: '0 12px', textDecoration: 'none' }}>
                    Take
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
              <div className="font-bold text-sm">AI Drug Interaction Check</div>
              <div className="text-xs text-secondary">Analyzing {medicines.length} medicines — tap to view</div>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--primary)' }}>→</span>
          </div>
        </Link>
      )}

    </div>
  );
}
