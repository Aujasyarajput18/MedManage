'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getMedicine, updateMedicine, deleteMedicine, logDose } from '@/lib/firestore';
import styles from '../medicines.module.css';

const CATEGORIES = ['Chronic', 'Acute', 'Vitamin', 'Supplement', 'Ayurvedic'];
const FREQUENCIES = [
  { value: 'daily',     label: 'Daily' },
  { value: 'alternate', label: 'Every other day' },
  { value: 'weekly',   label: 'Weekly' },
  { value: 'interval', label: 'Every X hours' },
  { value: 'asneeded', label: 'As needed' },
];
const DOSE_UNITS = ['mg', 'mcg', 'g', 'ml', 'IU', 'units', 'tablet(s)', 'capsule(s)', 'drop(s)', 'teaspoon'];

const CATEGORY_COLORS = {
  Chronic:    { bg: 'rgba(108,99,255,0.15)', color: 'var(--primary-light)' },
  Acute:      { bg: 'rgba(255,71,87,0.15)',  color: '#ff8090' },
  Vitamin:    { bg: 'rgba(67,217,162,0.15)', color: 'var(--success)' },
  Supplement: { bg: 'rgba(255,179,71,0.15)', color: 'var(--warning)' },
  Ayurvedic:  { bg: 'rgba(100,200,100,0.15)',color: '#78d878' },
};

// Demo medicines data (used when not logged in)
const DEMO_MEDICINES = {
  '1': { id: '1', name: 'Metformin',  dosage: '500mg', category: 'Chronic',  frequency: 'daily', times: ['08:00', '20:00'], pillCount: 28, notes: 'Take with meals. Helps control blood sugar.' },
  '2': { id: '2', name: 'Aspirin',    dosage: '75mg',  category: 'Chronic',  frequency: 'daily', times: ['09:00'],          pillCount: 60, notes: 'Blood thinner. Do not crush.' },
  '3': { id: '3', name: 'Vitamin D3', dosage: '1000 IU', category: 'Vitamin', frequency: 'daily', times: ['08:00'],         pillCount: 45, notes: 'Take with a fatty meal for best absorption.' },
};

export default function MedicineDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const medId = params?.id;

  const [med, setMed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Edit form state
  const [form, setForm] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  // ── Load medicine ──
  useEffect(() => {
    if (!medId) return;
    if (!user) {
      // Demo mode
      const demo = DEMO_MEDICINES[medId];
      if (demo) {
        setMed(demo);
        initForm(demo);
      }
      setLoading(false);
      return;
    }
    getMedicine(user.uid, medId).then((data) => {
      if (data) {
        setMed(data);
        initForm(data);
      }
      setLoading(false);
    });
  }, [user, medId]);

  function initForm(data) {
    // Parse dosage into number + unit
    const dosageParts = (data.dosage || '').split(' ');
    const dosageNum  = dosageParts[0] || '';
    const dosageUnit = dosageParts[1] || 'mg';
    setForm({
      name:          data.name || '',
      dosage:        dosageNum,
      unit:          dosageUnit,
      category:      data.category || 'Chronic',
      frequency:     data.frequency || 'daily',
      intervalHours: data.intervalHours || 8,
      times:         data.times?.length ? data.times : ['08:00'],
      startDate:     data.startDate || today,
      endDate:       data.endDate || '',
      pillCount:     data.pillCount ?? '',
      notes:         data.notes || '',
    });
  }

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const addTime = () => set('times', [...form.times, '12:00']);
  const removeTime = (i) => set('times', form.times.filter((_, idx) => idx !== i));
  const updateTime = (i, val) => {
    const t = [...form.times];
    t[i] = val;
    set('times', t);
  };

  // ── Save edit ──
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Medicine name is required'); return; }
    setSaving(true);
    setError('');
    try {
      const updated = {
        name:          form.name.trim(),
        dosage:        `${form.dosage} ${form.unit}`.trim(),
        category:      form.category,
        frequency:     form.frequency,
        intervalHours: form.frequency === 'interval' ? Number(form.intervalHours) : null,
        times:         form.frequency === 'interval' || form.frequency === 'asneeded' ? [] : form.times,
        startDate:     form.startDate,
        endDate:       form.endDate || null,
        pillCount:     form.pillCount !== '' ? Number(form.pillCount) : null,
        notes:         form.notes,
      };
      if (user) {
        await updateMedicine(user.uid, medId, updated);
      }
      setMed((m) => ({ ...m, ...updated }));
      setEditing(false);
      showToast('✅ Medicine updated!');
    } catch (err) {
      setError(err.message || 'Failed to save');
    }
    setSaving(false);
  };

  // ── Delete ──
  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (user) await deleteMedicine(user.uid, medId);
      router.replace('/dashboard/medicines');
    } catch (err) {
      setError(err.message || 'Failed to delete');
      setDeleting(false);
    }
  };

  // ── Log dose ──
  const handleDose = async (timeSlot, status) => {
    if (!user) { showToast('Sign in to track doses'); return; }
    await logDose(user.uid, { medicineId: medId, date: today, timeSlot, status });
    showToast(status === 'taken' ? '✅ Marked as taken!' : '⏭️ Skipped');
  };

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  // ── Render ──
  if (loading) {
    return (
      <div className="flex-col gap-4 animate-fade-in">
        <div className="skeleton skeleton-card" style={{ height: 80 }} />
        <div className="skeleton skeleton-card" style={{ height: 200 }} />
      </div>
    );
  }

  if (!med) {
    return (
      <div className="glass-card text-center" style={{ padding: 'var(--space-12)' }}>
        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>💊</div>
        <h2 className="font-bold mb-2">Medicine not found</h2>
        <p className="text-secondary mb-6">This medicine may have been deleted.</p>
        <button onClick={() => router.replace('/dashboard/medicines')} className="btn btn-primary">
          ← Back to Medicines
        </button>
      </div>
    );
  }

  const catStyle = CATEGORY_COLORS[med.category] || CATEGORY_COLORS.Chronic;
  const refillLow = med.pillCount !== null && med.pillCount !== undefined && med.pillCount <= 7;

  return (
    <div className="flex-col gap-6 animate-fade-in" style={{ maxWidth: 560 }}>
      {/* Toast */}
      {toast && (
        <div className="badge badge-success w-full" style={{ padding: '10px 16px', justifyContent: 'center', position: 'sticky', top: 8, zIndex: 50 }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ paddingLeft: '8px' }}>
          ← Back
        </button>
        <div className="flex gap-2">
          {!editing && (
            <button
              onClick={() => { setEditing(true); setConfirmDelete(false); }}
              className="btn btn-ghost btn-sm"
            >
              ✏️ Edit
            </button>
          )}
          {!editing && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="btn btn-sm"
              style={{ background: 'rgba(255,71,87,0.1)', color: 'var(--danger)', border: '1px solid var(--danger)' }}
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="glass-card" style={{ border: '1px solid var(--danger)', padding: 'var(--space-5)' }}>
          <h3 className="font-bold mb-2" style={{ color: 'var(--danger)' }}>Delete {med.name}?</h3>
          <p className="text-sm text-secondary mb-4">This will permanently delete this medicine and all its dose history.</p>
          <div className="flex gap-3">
            <button onClick={handleDelete} disabled={deleting} className="btn btn-sm"
              style={{ background: 'var(--danger)', color: 'white', flex: 1 }}>
              {deleting ? 'Deleting...' : '🗑️ Yes, Delete'}
            </button>
            <button onClick={() => setConfirmDelete(false)} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="badge badge-danger w-full" style={{ padding: '8px 12px', justifyContent: 'center' }}>
          {error}
        </div>
      )}

      {/* ── View Mode ── */}
      {!editing && (
        <>
          {/* Identity card */}
          <div className="glass-card">
            <div className="flex items-center gap-4 mb-4">
              <div className={styles.medIcon} style={{ background: catStyle.bg, width: 56, height: 56, fontSize: '1.8rem' }}>
                💊
              </div>
              <div>
                <h1 className="page-title" style={{ marginBottom: 2 }}>{med.name}</h1>
                <div className="flex gap-2 flex-wrap">
                  <span className="badge" style={{ background: catStyle.bg, color: catStyle.color }}>
                    {med.category}
                  </span>
                  <span className="badge" style={{ background: 'var(--bg-glass)' }}>
                    {med.dosage}
                  </span>
                  <span className="badge" style={{ background: 'var(--bg-glass)' }}>
                    {FREQUENCIES.find(f => f.value === med.frequency)?.label || med.frequency}
                  </span>
                </div>
              </div>
            </div>

            {/* Times */}
            {med.times?.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-2 font-bold">TODAY'S DOSES</p>
                <div className="flex gap-2 flex-wrap">
                  {med.times.map((t) => (
                    <div key={t} className={styles.timeSlot}>
                      <span className="text-xs font-bold">{t}</span>
                      <div className="flex gap-1 mt-1">
                        <button
                          onClick={() => handleDose(t, 'taken')}
                          className="btn btn-sm btn-success"
                          style={{ minHeight: 28, padding: '0 8px', fontSize: '0.75rem' }}
                        >
                          ✓ Taken
                        </button>
                        <button
                          onClick={() => handleDose(t, 'skipped')}
                          className="btn btn-sm btn-ghost"
                          style={{ minHeight: 28, padding: '0 8px', fontSize: '0.75rem' }}
                        >
                          Skip
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {med.frequency === 'interval' && med.intervalHours && (
              <p className="text-sm text-secondary mt-2">⏱️ Every {med.intervalHours} hours since last taken</p>
            )}
          </div>

          {/* Refill tracking */}
          {med.pillCount !== null && med.pillCount !== undefined && (
            <div className="glass-card">
              <p className="font-bold mb-3">📦 Refill Tracking</p>
              {refillLow && (
                <div className="badge badge-warning w-full mb-3" style={{ justifyContent: 'center', padding: '6px' }}>
                  ⚠️ Only {med.pillCount} pills left — refill soon!
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div className="progress-fill" style={{
                    width: `${Math.min(100, (med.pillCount / 30) * 100)}%`,
                    background: refillLow ? 'var(--warning)' : undefined,
                  }} />
                </div>
                <span className="font-bold text-sm" style={{ color: refillLow ? 'var(--warning)' : 'var(--text-secondary)', minWidth: 40 }}>
                  {med.pillCount} left
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <a href="https://www.netmeds.com" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                  Netmeds →
                </a>
                <a href="https://www.1mg.com" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                  1mg →
                </a>
                <a href="https://www.apollopharmacy.in" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                  Apollo →
                </a>
              </div>
            </div>
          )}

          {/* Schedule details */}
          <div className="glass-card">
            <p className="font-bold mb-3">📅 Schedule</p>
            <div className="flex-col gap-2">
              {med.startDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Start Date</span>
                  <span className="font-bold">{med.startDate}</span>
                </div>
              )}
              {med.endDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">End Date</span>
                  <span className="font-bold">{med.endDate}</span>
                </div>
              )}
              {med.notes && (
                <div className="mt-2 p-3" style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
                  <p className="text-xs text-muted mb-1 font-bold">NOTES</p>
                  <p className="text-sm">{med.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="flex gap-3">
            <a
              href={`/dashboard/medicines/interactions`}
              className="glass-card flex-1 text-center"
              style={{ textDecoration: 'none', padding: 'var(--space-4)', cursor: 'pointer' }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🤖</div>
              <div className="text-xs font-bold">Check Interactions</div>
            </a>
            <a
              href={`/dashboard/medicines/identify`}
              className="glass-card flex-1 text-center"
              style={{ textDecoration: 'none', padding: 'var(--space-4)', cursor: 'pointer' }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>📷</div>
              <div className="text-xs font-bold">Identify Pill</div>
            </a>
          </div>
        </>
      )}

      {/* ── Edit Mode ── */}
      {editing && form && (
        <form onSubmit={handleSave} className="flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold" style={{ fontSize: '1.2rem' }}>Edit Medicine</h2>
            <button type="button" onClick={() => { setEditing(false); setError(''); }} className="btn btn-ghost btn-sm">
              Cancel
            </button>
          </div>

          {/* Medicine Details */}
          <div className="glass-card flex-col gap-4">
            <h3 className="font-bold">Medicine Details</h3>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Medicine Name *</label>
              <input
                type="text"
                className="input"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
              />
            </div>

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
                  type="number" className="input" min="1" max="24"
                  value={form.intervalHours}
                  onChange={(e) => set('intervalHours', e.target.value)}
                />
              </div>
            )}

            {form.frequency !== 'interval' && form.frequency !== 'asneeded' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div className="flex items-center justify-between mb-2">
                  <label className="input-label" style={{ marginBottom: 0 }}>Times</label>
                  <button type="button" onClick={addTime} className="btn btn-ghost btn-sm" style={{ minHeight: 28, padding: '0 10px' }}>
                    + Add time
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {form.times.map((t, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <input
                        type="time" className="input" style={{ width: 120 }}
                        value={t}
                        onChange={(e) => updateTime(i, e.target.value)}
                      />
                      {form.times.length > 1 && (
                        <button type="button" onClick={() => removeTime(i)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem' }}>×
                        </button>
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

          {/* Refill */}
          <div className="glass-card flex-col gap-4">
            <h3 className="font-bold">Refill Tracking (optional)</h3>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Current Pill Count</label>
              <input
                type="number" className="input" placeholder="e.g. 30" min="0"
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

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={saving}>
            {saving ? '💾 Saving...' : '✅ Save Changes'}
          </button>
        </form>
      )}
    </div>
  );
}
