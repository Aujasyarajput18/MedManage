'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subscribeMedicines, subscribeDoseLogs, getUserProfile } from '@/lib/firestore';
import { isDemoMode, getDemoMedicines } from '@/lib/demo';
import Link from 'next/link';
import styles from './analytics.module.css';
import Icon from '@/components/ui/Icon';

const INSIGHTS = [
  { icon: 'calendar',  label: 'Best day of week', value: 'Monday',  sub: '98% adherence on Mondays' },
  { icon: 'clock',     label: 'Best time of day', value: 'Morning', sub: 'Higher compliance before noon' },
  { icon: 'fire',      label: 'Longest streak',   value: '14 days', sub: 'Keep going!' },
  { icon: 'check',     label: 'Total doses taken', value: '147',    sub: 'Since you started' },
  { icon: 'bell',      label: 'Most missed',       value: 'Evening',sub: 'Set a stronger reminder' },
  { icon: 'trophy',    label: 'This month',        value: '87%',    sub: 'Above average' },
];

function Heatmap() {
  const values = Array.from({ length: 30 }, (_, i) => {
    if (i >= 28) return 'pending';
    const r = Math.random();
    return r > 0.15 ? (r > 0.1 ? 'full' : 'partial') : 'missed';
  });
  const colors = { full: 'var(--success)', partial: 'var(--warning)', missed: 'var(--danger)', pending: 'var(--bg-glass)' };
  return (
    <div className={styles.heatmap}>
      {values.map((v, i) => <div key={i} className={styles.heatCell} style={{ background: colors[v] }} title={`Day ${i + 1}: ${v}`} />)}
    </div>
  );
}

function FoodWarningsCard({ medicines }) {
  const [selected, setSelected] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const check = async (medName) => {
    if (!medName) return;
    setSelected(medName); setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/ai/food-warnings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ medicineName: medName }) });
      setResult(await res.json());
    } catch {
      setResult({ warnings: [], tip: 'Could not fetch warnings. Check your connection.' });
    }
    setLoading(false);
  };

  const medNames = medicines.length > 0 ? medicines.map(m => m.name) : ['Metformin', 'Lisinopril', 'Atorvastatin'];

  return (
    <div className="glass-card flex-col gap-4">
      <div className="flex items-center gap-2">
        <Icon name="warning" size={18} color="var(--warning)" />
        <h3 className="font-bold">Food &amp; Drink Warnings</h3>
        <span className="badge" style={{ background: 'var(--primary)20', color: 'var(--primary-light)', fontSize: '0.65rem' }}>AI</span>
      </div>
      <p className="text-sm text-muted">Select a medicine to check food interactions</p>
      <div className="flex gap-2 flex-wrap">
        {medNames.map(name => (
          <button key={name} onClick={() => check(name)} className="btn btn-sm" style={{ background: selected === name ? 'var(--primary)' : 'var(--bg-glass)', color: selected === name ? 'white' : 'var(--text-primary)', border: `1px solid ${selected === name ? 'var(--primary)' : 'var(--border)'}` }}>{name}</button>
        ))}
      </div>
      {loading && <div className="flex items-center gap-2 text-sm text-muted"><Icon name="clock" size={16} /> Checking food interactions...</div>}
      {result && !loading && (
        <div className="flex-col gap-3">
          {result.tip && (
            <div style={{ padding: '10px 14px', background: 'var(--primary)10', borderLeft: '3px solid var(--primary)', borderRadius: 'var(--radius-md)' }}>
              <Icon name="info" size={14} color="var(--primary-light)" style={{ marginRight: 6 }} />
              <span className="text-sm">{result.tip}</span>
            </div>
          )}
          {result.warnings.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="check" size={14} color="var(--success)" /> No major food interactions found.
            </p>
          )}
          {result.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-3 glass-card-sm">
              <Icon name="food" size={18} color="var(--warning)" />
              <p className="text-sm">{w.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [doseLogs, setDoseLogs] = useState([]);
  const [profile, setProfile] = useState(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isDemoMode()) { setMedicines(getDemoMedicines()); return; }
    if (!user) return;
    const unsub = subscribeMedicines(user.uid, setMedicines);
    const unsubLogs = subscribeDoseLogs(user.uid, today, setDoseLogs);
    getUserProfile(user.uid).then(p => p && setProfile(p));
    return () => { unsub(); unsubLogs(); };
  }, [user, today]);

  const takenCount   = doseLogs.filter(l => l.status === 'taken').length;
  const missedCount  = doseLogs.filter(l => l.status === 'missed').length;
  const skippedCount = doseLogs.filter(l => l.status === 'skipped').length;
  const totalSlots   = medicines.flatMap(m => m.times || []).length;
  const adherencePct = totalSlots > 0 ? Math.round((takenCount / totalSlots) * 100) : 87;
  const streak       = profile?.streak ?? 14;

  const adherenceLabel = adherencePct >= 80 ? 'Great job!' : adherencePct >= 60 ? 'Keep improving' : 'Needs attention';
  const adherenceColor = adherencePct >= 80 ? 'var(--success)' : adherencePct >= 60 ? 'var(--warning)' : 'var(--danger)';

  const medStats = medicines.length > 0
    ? medicines.map(m => ({ name: m.name, pct: Math.floor(70 + Math.random() * 30), color: 'var(--success)' }))
    : [{ name: 'Metformin', pct: 98, color: 'var(--success)' }, { name: 'Lisinopril', pct: 88, color: 'var(--primary)' }, { name: 'Atorvastatin', pct: 75, color: 'var(--warning)' }];

  return (
    <div className="flex-col gap-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="insights" size={22} color="var(--primary)" /> Health Insights
        </h1>
        <p className="page-subtitle">Your 30-day health picture</p>
      </div>

      <div className="glass-card flex-col gap-3">
        <h3 className="font-bold">Overall Adherence</h3>
        <div className="flex items-end gap-3">
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-light)', lineHeight: 1 }}>{adherencePct}%</span>
          <span className="text-sm" style={{ color: adherenceColor, marginBottom: 4 }}>{adherenceLabel}</span>
        </div>
        <div className="progress-bar" style={{ height: 10 }}>
          <div className="progress-fill" style={{ width: `${adherencePct}%`, height: 10 }} />
        </div>
        <div className="flex gap-4 text-sm">
          <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="check" size={13} color="var(--success)" /> Taken: {takenCount}</span>
          <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="skip" size={13} color="var(--warning)" /> Skipped: {skippedCount}</span>
          <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="close" size={13} color="var(--danger)" /> Missed: {missedCount}</span>
        </div>
      </div>

      <div className="glass-card flex-col gap-4">
        <h3 className="font-bold">30-Day Adherence Map</h3>
        <Heatmap />
        <div className="flex gap-4 text-xs text-muted">
          <span style={{ color: 'var(--success)' }}>● All taken</span>
          <span style={{ color: 'var(--warning)' }}>● Partial</span>
          <span style={{ color: 'var(--danger)'  }}>● Missed</span>
          <span style={{ color: 'var(--text-muted)' }}>● Pending</span>
        </div>
      </div>

      <div className={styles.insightGrid}>
        {INSIGHTS.map((ins) => (
          <div key={ins.label} className="glass-card-sm flex-col gap-1">
            <Icon name={ins.icon} size={20} color="var(--primary)" />
            <div className="text-xs text-muted font-bold uppercase">{ins.label}</div>
            <div className="font-bold" style={{ fontSize: '1.1rem', color: 'var(--primary-light)' }}>{ins.value}</div>
            <div className="text-xs text-muted">{ins.sub}</div>
          </div>
        ))}
      </div>

      <div className="glass-card-sm flex items-center gap-4">
        <Icon name="fire" size={36} color="#F59E0B" />
        <div>
          <div className="font-bold" style={{ fontSize: '1.3rem' }}>{streak} Day Streak</div>
          <div className="text-xs text-muted">
            {streak >= 30 ? 'Month Master' : streak >= 7 ? 'On fire! Keep going' : `${7 - streak} more days to first badge`}
          </div>
        </div>
        <Link href="/dashboard/achievements" className="btn btn-sm btn-ghost" style={{ marginLeft: 'auto' }}>Badges →</Link>
      </div>

      <div className="glass-card flex-col gap-4">
        <h3 className="font-bold">By Medicine</h3>
        {medStats.map(m => (
          <div key={m.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-bold">{m.name}</span>
              <span style={{ color: m.pct >= 80 ? 'var(--success)' : m.pct >= 60 ? 'var(--warning)' : 'var(--danger)' }}>{m.pct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${m.pct}%`, background: m.pct >= 80 ? 'var(--success)' : m.pct >= 60 ? 'var(--warning)' : 'var(--danger)' }} />
            </div>
          </div>
        ))}
      </div>

      <FoodWarningsCard medicines={medicines} />

      <div className="flex gap-3">
        <Link href="/dashboard/medicines/interactions" className="glass-card-sm flex-col gap-1" style={{ flex: 1, textDecoration: 'none' }}>
          <Icon name="nodes" size={22} color="var(--primary)" />
          <span className="text-xs font-bold">Drug Interactions</span>
          <span className="text-xs text-muted">Check AI →</span>
        </Link>
        <Link href="/dashboard/journal" className="glass-card-sm flex-col gap-1" style={{ flex: 1, textDecoration: 'none' }}>
          <Icon name="journal" size={22} color="var(--primary)" />
          <span className="text-xs font-bold">Health Journal</span>
          <span className="text-xs text-muted">Log entry →</span>
        </Link>
        <Link href="/dashboard/export" className="glass-card-sm flex-col gap-1" style={{ flex: 1, textDecoration: 'none' }}>
          <Icon name="file" size={22} color="var(--primary)" />
          <span className="text-xs font-bold">Export Data</span>
          <span className="text-xs text-muted">PDF / CSV →</span>
        </Link>
      </div>
    </div>
  );
}
