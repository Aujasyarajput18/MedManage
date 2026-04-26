'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { addJournalEntry, subscribeJournalEntries } from '@/lib/firestore';
import { useEffect } from 'react';
import styles from './journal.module.css';

const MOODS = ['😄','😊','😐','😔','😫'];
const MOOD_LABELS = ['Great', 'Good', 'Okay', 'Low', 'Rough'];

// Mini SVG line chart
function LineChart({ data, color, unit }) {
  if (!data || data.length < 2) return <p className="text-xs text-muted">Not enough data yet</p>;
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 200, H = 60;
  const points = values.map((v, i) =>
    `${(i / (values.length - 1)) * W},${H - ((v - min) / range) * (H - 10) - 5}`
  ).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 60 }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle key={i}
          cx={(i / (values.length - 1)) * W}
          cy={H - ((v - min) / range) * (H - 10) - 5}
          r="3.5" fill={color}
        />
      ))}
    </svg>
  );
}

const DEMO_ENTRIES = [
  { id: '1', date: '2026-04-25', mood: '😊', bp: '120/80', glucose: 98, weight: 72, symptoms: 'Mild headache in the morning' },
  { id: '2', date: '2026-04-24', mood: '😄', bp: '118/76', glucose: 95, weight: 72, symptoms: '' },
  { id: '3', date: '2026-04-23', mood: '😐', bp: '125/82', glucose: 102, weight: 72.5, symptoms: 'Fatigue after lunch' },
  { id: '4', date: '2026-04-22', mood: '😊', bp: '119/79', glucose: 97, weight: 72.5, symptoms: '' },
];

export default function JournalPage() {
  const { user } = useAuth();
  const [entries, setEntries]     = useState(DEMO_ENTRIES);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({
    mood: '😊', bpSys: '', bpDia: '', glucose: '', weight: '', symptoms: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeJournalEntries(user.uid, (e) => {
      if (e.length > 0) setEntries(e);
    });
    return () => unsub();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    const entry = {
      mood: form.mood,
      bp: form.bpSys && form.bpDia ? `${form.bpSys}/${form.bpDia}` : null,
      glucose: form.glucose ? Number(form.glucose) : null,
      weight: form.weight ? Number(form.weight) : null,
      symptoms: form.symptoms,
    };
    if (user) {
      await addJournalEntry(user.uid, entry);
    } else {
      setEntries(prev => [{ id: Date.now().toString(), date: new Date().toISOString().split('T')[0], ...entry }, ...prev]);
    }
    setForm({ mood: '😊', bpSys: '', bpDia: '', glucose: '', weight: '', symptoms: '' });
    setShowForm(false);
    setSaving(false);
  };

  // Chart data
  const glucoseData = entries.filter(e => e.glucose).map(e => ({ value: e.glucose, date: e.date })).reverse();
  const weightData  = entries.filter(e => e.weight).map(e => ({ value: e.weight,  date: e.date })).reverse();

  return (
    <div className="flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">📓 Health Journal</h1>
          <p className="page-subtitle">{entries.length} entries logged</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
          + Log Today
        </button>
      </div>

      {/* Quick log form */}
      {showForm && (
        <div className="glass-card flex-col gap-4 animate-fade-in">
          <h3 className="font-bold">Today's Entry</h3>

          {/* Mood */}
          <div>
            <p className="input-label">How are you feeling?</p>
            <div className="flex gap-3">
              {MOODS.map((m, i) => (
                <button key={m} onClick={() => set('mood', m)}
                  className={styles.moodBtn}
                  style={{ opacity: form.mood === m ? 1 : 0.4, transform: form.mood === m ? 'scale(1.3)' : 'scale(1)' }}
                  title={MOOD_LABELS[i]}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* BP */}
          <div>
            <p className="input-label">Blood Pressure (mmHg)</p>
            <div className="flex gap-2 items-center">
              <input type="number" className="input" placeholder="Systolic" value={form.bpSys} onChange={e => set('bpSys', e.target.value)} style={{ width: 120 }} />
              <span className="text-muted font-bold">/</span>
              <input type="number" className="input" placeholder="Diastolic" value={form.bpDia} onChange={e => set('bpDia', e.target.value)} style={{ width: 120 }} />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="input-label">Blood Glucose (mg/dL)</label>
              <input type="number" className="input" placeholder="e.g. 95" value={form.glucose} onChange={e => set('glucose', e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="input-label">Weight (kg)</label>
              <input type="number" className="input" placeholder="e.g. 72" value={form.weight} onChange={e => set('weight', e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Symptoms / Notes</label>
            <textarea className="input" rows={2} placeholder="Any symptoms or notes today..." value={form.symptoms} onChange={e => set('symptoms', e.target.value)} />
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Entry'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {/* Trend charts */}
      {glucoseData.length >= 2 && (
        <div className="glass-card flex-col gap-4">
          <h3 className="font-bold">Trends</h3>
          <div>
            <p className="text-xs text-muted font-bold uppercase mb-2">Blood Glucose (mg/dL)</p>
            <LineChart data={glucoseData} color="var(--primary)" />
          </div>
          {weightData.length >= 2 && (
            <div>
              <p className="text-xs text-muted font-bold uppercase mb-2">Weight (kg)</p>
              <LineChart data={weightData} color="var(--success)" />
            </div>
          )}
        </div>
      )}

      {/* Entry list */}
      <div>
        <h2 className="font-bold mb-4">Recent Entries</h2>
        <div className="flex-col gap-3">
          {entries.map((entry) => (
            <div key={entry.id} className="glass-card-sm flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: '1.8rem' }}>{entry.mood}</span>
                  <div>
                    <div className="font-bold text-sm">
                      {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                    {entry.symptoms && <div className="text-xs text-muted">{entry.symptoms}</div>}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                {entry.bp && (
                  <span className="badge badge-muted text-xs">❤️ {entry.bp} mmHg</span>
                )}
                {entry.glucose && (
                  <span className="badge badge-muted text-xs">🩸 {entry.glucose} mg/dL</span>
                )}
                {entry.weight && (
                  <span className="badge badge-muted text-xs">⚖️ {entry.weight} kg</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
