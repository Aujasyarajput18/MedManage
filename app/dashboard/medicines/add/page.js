'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { addMedicine } from '@/lib/firestore';
import { addDemoMedicine, isDemoMode } from '@/lib/demo';

// Popular Indian medicines autocomplete
const INDIAN_MEDICINES = [
  'Metformin','Amlodipine','Atorvastatin','Aspirin','Clopidogrel','Lisinopril',
  'Losartan','Omeprazole','Pantoprazole','Paracetamol','Ibuprofen','Amoxicillin',
  'Azithromycin','Cetirizine','Levothyroxine','Metoprolol','Glimepiride','Insulin',
  'Vitamin D3','Vitamin B12','Calcium','Iron','Folic Acid','Zinc',
  'Crocin','Combiflam','Dolo 650','Cipla','Ranitidine','Pantop',
  'Telma','Telmisartan','Rosuvastatin','Atenolol','Furosemide',
  'Ashwagandha','Triphala','Chyawanprash','Giloy','Turmeric',
];

const CATEGORIES = ['Chronic', 'Acute', 'Vitamin', 'Supplement', 'Ayurvedic'];
const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'alternate', label: 'Every other day' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'interval', label: 'Every X hours' },
  { value: 'asneeded', label: 'As needed' },
];
const DOSE_UNITS = ['mg', 'mcg', 'g', 'ml', 'IU', 'units', 'tablet(s)', 'capsule(s)', 'drop(s)', 'teaspoon'];

export default function AddMedicinePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '', dosage: '', unit: 'mg', category: 'Chronic',
    frequency: 'daily', intervalHours: 8, times: ['08:00'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '', pillCount: '', notes: '',
  });

  // Pre-fill from URL params (set by pill identifier)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    const name   = p.get('name');
    const dosage = p.get('dosage');
    const notes  = p.get('notes');
    if (name || dosage) {
      setForm(f => ({
        ...f,
        name:   name   || f.name,
        dosage: dosage ? dosage.replace(/[a-zA-Z]+$/, '') : f.dosage,
        unit:   dosage ? (dosage.match(/[a-zA-Z]+$/)?.[0] || 'mg') : f.unit,
        notes:  notes  || f.notes,
      }));
    }
  }, []);

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleNameChange = (val) => {
    set('name', val);
    if (val.length >= 2) {
      setSuggestions(
        INDIAN_MEDICINES.filter((m) => m.toLowerCase().includes(val.toLowerCase())).slice(0, 6)
      );
    } else {
      setSuggestions([]);
    }
  };

  const addTimeSlot = () => set('times', [...form.times, '12:00']);
  const removeTimeSlot = (i) => set('times', form.times.filter((_, idx) => idx !== i));
  const updateTime = (i, val) => {
    const t = [...form.times];
    t[i] = val;
    set('times', t);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Medicine name is required'); return; }
    if (form.endDate && form.startDate && form.endDate < form.startDate) {
      setError('End date cannot be before the start date');
      return;
    }
    if (form.frequency === 'interval' && (Number(form.intervalHours) < 1 || Number(form.intervalHours) > 24)) {
      setError('Interval must be between 1 and 24 hours');
      return;
    }
    if (form.frequency !== 'interval' && form.frequency !== 'asneeded' && form.times.some((time) => !time)) {
      setError('Please fill every dose time or remove the empty slot');
      return;
    }
    if (form.pillCount !== '' && Number(form.pillCount) < 0) {
      setError('Pill count cannot be negative');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const medicineData = {
        name: form.name.trim(),
        dosage: `${form.dosage} ${form.unit}`.trim(),
        category: form.category,
        frequency: form.frequency,
        intervalHours: form.frequency === 'interval' ? Number(form.intervalHours) : null,
        times: form.frequency === 'interval' ? [] : form.times,
        startDate: form.startDate,
        endDate: form.endDate || null,
        pillCount: form.pillCount ? Number(form.pillCount) : null,
        notes: form.notes,
      };

      if (user) {
        await addMedicine(user.uid, medicineData);
      } else if (isDemoMode()) {
        addDemoMedicine(medicineData);
      }
      router.push('/dashboard/medicines');
    } catch (err) {
      setError(err.message || 'Failed to add medicine');
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 560 }}>
      <div className="page-header">
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm mb-4" style={{ paddingLeft: '8px' }}>
          ← Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Add Medicine</h1>
            <p className="page-subtitle">Save your medicine, then check interactions from the list</p>
          </div>
          <Link href="/dashboard/medicines/identify" className="btn btn-ghost btn-sm flex-col" style={{ gap: 2 }}>
            <span>📷</span>
            <span style={{ fontSize: '0.65rem' }}>Identify</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="badge badge-danger w-full mb-4" style={{ padding: '8px 12px', justifyContent: 'center' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-col gap-6">

        {/* Medicine Name */}
        <div className="glass-card flex-col gap-4">
          <h3 className="font-bold">Medicine Details</h3>

          <div className="form-group" style={{ position: 'relative', marginBottom: 0 }}>
            <label className="input-label">Medicine Name *</label>
            <input
              type="text"
              className="input"
              placeholder="Start typing (e.g. Metformin)"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
              }}>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { set('name', s); setSuggestions([]); }}
                    style={{
                      width: '100%', padding: '10px 16px', background: 'none',
                      border: 'none', borderBottom: '1px solid var(--border)',
                      textAlign: 'left', color: 'var(--text-primary)', cursor: 'pointer',
                      fontSize: '0.95rem', transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'var(--bg-glass)'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    💊 {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dosage + Unit */}
          <div className="flex gap-3" style={{ alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="input-label">Dosage</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. 500"
                value={form.dosage}
                onChange={(e) => set('dosage', e.target.value)}
              />
            </div>
            <div className="form-group" style={{ width: 120, marginBottom: 0 }}>
              <label className="input-label">Unit</label>
              <select className="input" value={form.unit} onChange={(e) => set('unit', e.target.value)}>
                {DOSE_UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Category</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => set('category', cat)}
                  className="btn btn-sm"
                  style={{
                    background: form.category === cat ? 'var(--primary)' : 'var(--bg-glass)',
                    color: form.category === cat ? 'white' : 'var(--text-secondary)',
                    border: `1px solid ${form.category === cat ? 'var(--primary)' : 'var(--border)'}`,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="glass-card flex-col gap-4">
          <h3 className="font-bold">Schedule</h3>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Frequency</label>
            <select className="input" value={form.frequency} onChange={(e) => set('frequency', e.target.value)}>
              {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>

          {form.frequency === 'interval' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Every X hours</label>
              <input
                type="number"
                className="input"
                min="1" max="24"
                value={form.intervalHours}
                onChange={(e) => set('intervalHours', e.target.value)}
              />
            </div>
          )}

          {form.frequency !== 'interval' && form.frequency !== 'asneeded' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div className="flex items-center justify-between mb-2">
                <label className="input-label" style={{ marginBottom: 0 }}>Times</label>
                <button type="button" onClick={addTimeSlot} className="btn btn-ghost btn-sm" style={{ minHeight: 28, padding: '0 10px' }}>
                  + Add time
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {form.times.map((t, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <input
                      type="time"
                      className="input"
                      style={{ width: 120 }}
                      value={t}
                      onChange={(e) => updateTime(i, e.target.value)}
                    />
                    {form.times.length > 1 && (
                      <button type="button" onClick={() => removeTimeSlot(i)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="input-label">Start Date</label>
              <input type="date" className="input" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="input-label">End Date (optional)</label>
              <input type="date" className="input" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Refill Tracking */}
        <div className="glass-card flex-col gap-4">
          <h3 className="font-bold">Refill Tracking (optional)</h3>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Current Pill Count</label>
            <input
              type="number"
              className="input"
              placeholder="e.g. 30"
              min="0"
              value={form.pillCount}
              onChange={(e) => set('pillCount', e.target.value)}
            />
            <p className="text-xs text-muted mt-2">We'll alert you when less than 7 pills remain</p>
          </div>
        </div>

        {/* Notes */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Notes (optional)</label>
          <textarea
            className="input"
            placeholder="e.g. Take with food, avoid grapefruit..."
            rows={3}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* AI note */}
        <div className="glass-card-primary flex items-center gap-3" style={{ padding: 'var(--space-3)' }}>
          <span>🤖</span>
          <p className="text-sm text-secondary">
            After saving, you can run the interaction checker from the medicines page.
          </p>
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
          {loading ? '💾 Saving...' : '✅ Add Medicine'}
        </button>
      </form>
    </div>
  );
}
