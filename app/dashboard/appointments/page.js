'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isDemoMode } from '@/lib/demo';
import styles from './appointments.module.css';

const DEMO_APPTS = [
  { id: '1', doctor: 'Dr. Priya Kumar', specialty: 'Cardiologist', date: '2026-05-10', time: '10:30 AM', location: 'City Heart Clinic', notes: 'Annual heart checkup', status: 'upcoming', emoji: '❤️' },
  { id: '2', doctor: 'Dr. Ramesh Iyer', specialty: 'Endocrinologist', date: '2026-05-18', time: '2:00 PM', location: 'Apollo Hospital', notes: 'Diabetes review, bring last 3 reports', status: 'upcoming', emoji: '🩺' },
  { id: '3', doctor: 'Dr. Sunita Rao', specialty: 'General Physician', date: '2026-04-22', time: '11:00 AM', location: 'Family Clinic', notes: 'Routine checkup', status: 'past', emoji: '🏥' },
];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDayOfMonth(dateStr) {
  return new Date(dateStr).getDate();
}

function getMonthShort(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [tab, setTab]           = useState('upcoming');
  const [appointments, setAppts] = useState(DEMO_APPTS);
  const [showForm, setShowForm]  = useState(false);
  const [form, setForm]          = useState({ doctor: '', specialty: '', date: '', time: '', location: '', notes: '', emoji: '🩺' });
  const [saving, setSaving]      = useState(false);

  const filtered = appointments.filter(a => a.status === tab);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    const newAppt = { ...form, id: Date.now().toString(), status: 'upcoming' };
    setAppts(prev => [newAppt, ...prev]);
    setForm({ doctor: '', specialty: '', date: '', time: '', location: '', notes: '', emoji: '🩺' });
    setShowForm(false);
    setSaving(false);
  };

  const deleteAppt = (id) => {
    if (!confirm('Delete this appointment?')) return;
    setAppts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="flex-col gap-5 animate-fade-in">
      <div className="page-header" style={{ marginBottom: 0 }}>
        <h1 className="page-title">🩺 Appointments</h1>
        <p className="page-subtitle">Manage your doctor visits</p>
      </div>

      {/* Tab bar */}
      <div className={styles.tabBar}>
        {['upcoming', 'past'].map(t => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.active : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Appointment cards */}
      {filtered.length === 0 ? (
        <div className="glass-card text-center flex-col gap-3" style={{ padding: 'var(--space-8)' }}>
          <span style={{ fontSize: '3rem' }}>📅</span>
          <p className="font-bold">No {tab} appointments</p>
          <button className="btn btn-primary btn-sm" style={{ alignSelf: 'center' }} onClick={() => setShowForm(true)}>
            + Add Appointment
          </button>
        </div>
      ) : (
        <div className="flex-col gap-3">
          {filtered.map(appt => (
            <div key={appt.id} className={`glass-card flex gap-3 ${styles.apptCard}`} style={{ padding: 'var(--space-4)' }}>
              {/* Date chip */}
              <div className={styles.dateChip}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{getDayOfMonth(appt.date)}</div>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{getMonthShort(appt.date)}</div>
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="font-bold" style={{ margin: 0, fontSize: '0.95rem' }}>{appt.doctor}</p>
                <p className="text-xs text-muted" style={{ margin: '2px 0' }}>{appt.specialty}</p>
                <p className="text-xs" style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  ⏰ {appt.time} · 📍 {appt.location}
                </p>
                {appt.notes && (
                  <p className="text-xs text-muted" style={{ margin: '4px 0 0', fontStyle: 'italic' }}>📝 {appt.notes}</p>
                )}
              </div>
              <button
                onClick={() => deleteAppt(appt.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem', flexShrink: 0, alignSelf: 'flex-start' }}
              >🗑️</button>
            </div>
          ))}
        </div>
      )}

      {/* Add button */}
      <button className="btn btn-primary w-full" onClick={() => setShowForm(true)}>
        + Book New Appointment
      </button>

      {/* Add form modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">New Appointment</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form onSubmit={handleAdd} className="flex-col gap-4">
              {[
                { label: 'Doctor Name', key: 'doctor', type: 'text', placeholder: 'Dr. Sharma', required: true },
                { label: 'Specialty', key: 'specialty', type: 'text', placeholder: 'Cardiologist' },
                { label: 'Date', key: 'date', type: 'date', required: true },
                { label: 'Time', key: 'time', type: 'time', required: true },
                { label: 'Hospital / Location', key: 'location', type: 'text', placeholder: 'Apollo Hospital' },
                { label: 'Notes', key: 'notes', type: 'text', placeholder: 'Bring last reports...' },
              ].map(f => (
                <div key={f.key} className="form-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">{f.label}</label>
                  <input
                    type={f.type}
                    className="input"
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    required={f.required}
                  />
                </div>
              ))}
              <button type="submit" className="btn btn-primary w-full" disabled={saving}>
                {saving ? 'Saving...' : 'Book Appointment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
