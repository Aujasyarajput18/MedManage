'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isDemoMode } from '@/lib/demo';
import styles from './appointments.module.css';

const DEMO_APPOINTMENTS = [
  { id: 'a1', doctor: 'Dr. Sharma (Cardiologist)', date: '2026-05-03', time: '10:30', hospital: 'Apollo Hospital, Delhi', notes: 'Monthly BP review. Bring last 30-day log.', done: false },
  { id: 'a2', doctor: 'Dr. Patel (Diabetologist)', date: '2026-05-15', time: '09:00', hospital: 'Fortis Hospital', notes: 'HbA1c test results follow-up.', done: false },
  { id: 'a3', doctor: 'Dr. Mehta (General)', date: '2026-04-20', time: '11:00', hospital: 'City Clinic', notes: 'Routine check-up.', done: true },
];

const EMPTY_FORM = { doctor: '', date: '', time: '', hospital: '', notes: '' };

export default function AppointmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [storageKey, setStorageKey] = useState(null);
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [filter, setFilter]             = useState('upcoming'); // 'upcoming' | 'done' | 'all'

  useEffect(() => {
    if (authLoading) return;

    const demo = isDemoMode();
    const key = user ? `appointments_${user.uid}` : demo ? 'appointments_demo' : null;
    setStorageKey(key);

    if (!key) {
      setAppointments([]);
      return;
    }

    const stored = localStorage.getItem(key);
    if (stored) {
      setAppointments(JSON.parse(stored));
    } else {
      const initial = demo ? DEMO_APPOINTMENTS : [];
      setAppointments(initial);
      localStorage.setItem(key, JSON.stringify(initial));
    }
  }, [user, authLoading]);

  const save = (updated) => {
    setAppointments(updated);
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleAdd = () => {
    if (!form.doctor || !form.date) return;
    const newAppt = { ...form, id: `a-${Date.now()}`, done: false };
    save([newAppt, ...appointments]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const toggleDone = (id) => {
    save(appointments.map(a => a.id === id ? { ...a, done: !a.done } : a));
  };

  const handleDelete = (id) => {
    save(appointments.filter(a => a.id !== id));
  };

  const today = new Date().toISOString().split('T')[0];

  const filtered = appointments.filter(a => {
    if (filter === 'upcoming') return !a.done && a.date >= today;
    if (filter === 'done')     return a.done;
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date));

  const upcomingCount = appointments.filter(a => !a.done && a.date >= today).length;

  const daysUntil = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
    if (diff === 0) return 'Today!';
    if (diff === 1) return 'Tomorrow';
    if (diff < 0)  return `${Math.abs(diff)}d ago`;
    return `in ${diff} days`;
  };

  return (
    <div className="flex-col gap-6 animate-fade-in">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">🏥 Appointments</h1>
            <p className="page-subtitle">{upcomingCount} upcoming</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(v => !v)}>
            {showForm ? '✕ Cancel' : '+ Add'}
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="glass-card flex-col gap-4 animate-fade-in">
          <h3 className="font-bold">New Appointment</h3>
          <div className="form-group">
            <label className="input-label">Doctor / Specialist *</label>
            <input className="input" placeholder="e.g. Dr. Sharma (Cardiologist)"
              value={form.doctor} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="input-label">Date *</label>
              <input className="input" type="date" min={today}
                value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="input-label">Time</label>
              <input className="input" type="time"
                value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="input-label">Hospital / Clinic</label>
            <input className="input" placeholder="e.g. Apollo Hospital, Delhi"
              value={form.hospital} onChange={e => setForm(f => ({ ...f, hospital: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="input-label">Notes</label>
            <textarea className="input" rows={2} placeholder="What to bring, tests to mention..."
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <button className="btn btn-primary w-full" onClick={handleAdd}>Save Appointment</button>
        </div>
      )}

      {/* Filter tabs */}
      <div className={styles.tabs}>
        {[['upcoming','Upcoming'],['done','Completed'],['all','All']].map(([val, label]) => (
          <button key={val}
            className={`${styles.tab} ${filter === val ? styles.active : ''}`}
            onClick={() => setFilter(val)}
          >{label}</button>
        ))}
      </div>

      {/* Appointment cards */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🗓️</span>
          <p>No {filter === 'done' ? 'completed' : 'upcoming'} appointments.</p>
          <button className="btn btn-primary btn-sm mt-4" onClick={() => setShowForm(true)}>Add Appointment</button>
        </div>
      ) : (
        <div className="flex-col gap-4">
          {filtered.map(appt => (
            <div key={appt.id} className={`glass-card flex-col gap-3 ${appt.done ? styles.doneCard : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex-col gap-1">
                  <span className={`font-bold ${appt.done ? 'text-muted' : ''}`} style={{ fontSize: '1rem' }}>
                    {appt.done ? '✅ ' : '🏥 '}{appt.doctor}
                  </span>
                  {appt.hospital && (
                    <span className="text-muted text-sm">📍 {appt.hospital}</span>
                  )}
                </div>
                <div className={`${styles.badge} ${appt.done ? styles.badgeDone : styles.badgeUpcoming}`}>
                  {appt.done ? 'Done' : daysUntil(appt.date)}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-muted">
                  📅 {new Date(appt.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                </span>
                {appt.time && <span className="text-sm text-muted">🕐 {appt.time}</span>}
              </div>

              {appt.notes && (
                <p className="text-sm text-muted" style={{ borderLeft: '2px solid var(--primary)', paddingLeft: 10 }}>
                  {appt.notes}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  className={`btn btn-sm ${appt.done ? 'btn-ghost' : 'btn-primary'}`}
                  onClick={() => toggleDone(appt.id)}
                >
                  {appt.done ? 'Mark Pending' : '✓ Mark Done'}
                </button>
                <button className="btn btn-ghost btn-sm text-danger" onClick={() => handleDelete(appt.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
