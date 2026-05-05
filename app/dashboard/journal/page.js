'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subscribeMedicines } from '@/lib/firestore';
import { isDemoMode, getDemoMedicines } from '@/lib/demo';
import styles from './journal.module.css';

const MOODS = [
  { emoji: '😄', label: 'Great',   value: 5, color: '#10B981' },
  { emoji: '🙂', label: 'Good',    value: 4, color: '#0D9488' },
  { emoji: '😐', label: 'Okay',    value: 3, color: '#F59E0B' },
  { emoji: '😔', label: 'Low',     value: 2, color: '#FB923C' },
  { emoji: '😢', label: 'Bad',     value: 1, color: '#DC2626' },
];

const DEMO_ENTRIES = [
  { id: '1', date: '2026-05-03', mood: { emoji: '😄', label: 'Great', value: 5, color: '#10B981' }, notes: 'Felt energetic today. All medicines taken on time.', vitals: { bp: '118/76', sugar: '92', weight: '68' }, symptoms: ['No headache', 'Good sleep'] },
  { id: '2', date: '2026-05-02', mood: { emoji: '😐', label: 'Okay', value: 3, color: '#F59E0B' }, notes: 'Slight dizziness in morning. Spoke to doctor.', vitals: { bp: '128/82', sugar: '105', weight: '68.2' }, symptoms: ['Mild dizziness', 'Fatigue'] },
  { id: '3', date: '2026-05-01', mood: { emoji: '🙂', label: 'Good', value: 4, color: '#0D9488' }, notes: 'Good day overall. Walk in the evening helped.', vitals: { bp: '122/78', sugar: '98', weight: '67.8' }, symptoms: [] },
];

export default function JournalPage() {
  const { user } = useAuth();
  const [entries, setEntries]   = useState(DEMO_ENTRIES);
  const [showForm, setShowForm]  = useState(false);
  const [selectedMood, setMood]  = useState(null);
  const [notes, setNotes]        = useState('');
  const [vitals, setVitals]      = useState({ bp: '', sugar: '', weight: '' });
  const [symptoms, setSymptoms]  = useState('');
  const [saving, setSaving]      = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedMood) return;
    setSaving(true);
    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      mood: selectedMood,
      notes,
      vitals,
      symptoms: symptoms.split(',').map(s => s.trim()).filter(Boolean),
    };
    setEntries(prev => [entry, ...prev]);
    setShowForm(false);
    setMood(null); setNotes(''); setVitals({ bp: '', sugar: '', weight: '' }); setSymptoms('');
    setSaving(false);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="flex-col gap-5 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Health Journal</h1>
          <p className="page-subtitle">Track how you feel each day</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Log Today</button>
      </div>

      {/* Mood trend row */}
      <div className="glass-card flex-col gap-3">
        <p className="text-xs font-bold uppercase text-muted">Recent Mood Trend</p>
        <div className="flex gap-2 items-end">
          {entries.slice(0, 7).reverse().map((e, i) => (
            <div key={i} className="flex-col items-center gap-1" style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: `${(e.mood.value / 5) * 50}px`,
                background: e.mood.color,
                borderRadius: 'var(--radius-full)',
                width: '100%',
                minHeight: 8,
                transition: 'height 0.4s ease',
              }} />
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {new Date(e.date).getDate()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="glass-card text-center flex-col gap-3" style={{ padding: 'var(--space-8)' }}>
          <span style={{ fontSize: '3rem' }}>📓</span>
          <p className="font-bold">No journal entries yet</p>
          <button className="btn btn-primary btn-sm" style={{ alignSelf: 'center' }} onClick={() => setShowForm(true)}>
            + Log First Entry
          </button>
        </div>
      ) : (
        <div className="flex-col gap-3">
          {entries.map(entry => (
            <div key={entry.id} className={`glass-card ${styles.entryCard}`} style={{ padding: 'var(--space-4)' }}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '1.4rem' }}>{entry.mood.emoji}</span>
                  <div>
                    <p className="font-bold text-sm" style={{ margin: 0 }}>{entry.mood.label}</p>
                    <p className="text-xs text-muted" style={{ margin: 0 }}>{formatDate(entry.date)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {entry.vitals?.bp && <span className="badge badge-muted text-xs">BP: {entry.vitals.bp}</span>}
                  {entry.vitals?.sugar && <span className="badge badge-muted text-xs">🩸 {entry.vitals.sugar}</span>}
                </div>
              </div>
              {entry.notes && (
                <p className="text-sm" style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>{entry.notes}</p>
              )}
              {entry.symptoms?.length > 0 && (
                <div className="flex gap-2 flex-wrap" style={{ marginTop: 8 }}>
                  {entry.symptoms.map((s, i) => (
                    <span key={i} className="badge badge-warning" style={{ fontSize: '0.7rem' }}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">📓 Log Today</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form onSubmit={handleSave} className="flex-col gap-4">
              {/* Mood */}
              <div>
                <label className="input-label">How do you feel today?</label>
                <div className={styles.moodGrid}>
                  {MOODS.map(m => (
                    <button
                      type="button"
                      key={m.value}
                      className={`${styles.moodBtn} ${selectedMood?.value === m.value ? styles.selected : ''}`}
                      onClick={() => setMood(m)}
                      style={{ borderColor: selectedMood?.value === m.value ? m.color : undefined }}
                    >
                      <span style={{ fontSize: '1.3rem' }}>{m.emoji}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Vitals */}
              <div>
                <label className="input-label">Vitals (optional)</label>
                <div className="flex gap-2">
                  {[
                    { key: 'bp', placeholder: 'BP e.g. 120/80' },
                    { key: 'sugar', placeholder: 'Sugar mg/dL' },
                    { key: 'weight', placeholder: 'Weight kg' },
                  ].map(v => (
                    <input
                      key={v.key}
                      className="input"
                      placeholder={v.placeholder}
                      value={vitals[v.key]}
                      onChange={e => setVitals(p => ({ ...p, [v.key]: e.target.value }))}
                      style={{ flex: 1, fontSize: '0.8rem', minHeight: 42 }}
                    />
                  ))}
                </div>
              </div>
              {/* Symptoms */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Symptoms (comma-separated)</label>
                <input className="input" placeholder="e.g. Headache, Fatigue" value={symptoms} onChange={e => setSymptoms(e.target.value)} />
              </div>
              {/* Notes */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Journal Notes</label>
                <textarea
                  className="input"
                  placeholder="How was your day? Any changes?"
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={!selectedMood || saving}>
                {saving ? 'Saving...' : '💾 Save Entry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
