'use client';
/**
 * app/dashboard/reminders/page.js  [UPDATED]
 *
 * Full medication reminder UI:
 * - Create reminders (medicineName + scheduledTime)
 * - List with status badges
 * - In-app alert modal: Taken / Snooze / Skip
 * - Missed reminder detection on page load
 * - Honest offline limitation notice
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getReminders, createReminder, updateReminder,
  deleteReminder, collectMissedReminders,
} from '@/lib/reminderStore';
import {
  startReminderEngine, cancelReminderTimers, setInAppAlertHandler,
} from '@/lib/reminderEngine';

// Snooze default = 10 minutes
const SNOOZE_MINUTES = 10;

// ─── Status badge config ──────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:  { label: '⏳ Pending',   color: 'var(--warning)'  },
  taken:    { label: '✅ Taken',     color: 'var(--success)'  },
  snoozed:  { label: '⏰ Snoozed',  color: 'var(--primary)'  },
  skipped:  { label: '⏭️ Skipped',  color: 'var(--text-muted)' },
  missed:   { label: '❌ Missed',   color: 'var(--danger)'   },
};

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium', timeStyle: 'short',
  });
}

export default function RemindersPage() {
  const { user } = useAuth();
  const userId = user?.uid || 'demo';

  // ── Reminders list ─────────────────────────────────────────────────────
  const [reminders,     setReminders]     = useState([]);
  const [missedAlerts,  setMissedAlerts]  = useState([]); // missed on load
  const [activeAlert,   setActiveAlert]   = useState(null); // in-app reminder alert

  // ── Create form ────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    medicineName:  '',
    scheduledTime: '',
  });
  const [formError, setFormError] = useState('');
  const [creating,  setCreating]  = useState(false);

  // ── Notification permission ────────────────────────────────────────────
  const [notifPermission, setNotifPermission] = useState('default');

  // ─── Engine cleanup ref ───────────────────────────────────────────────
  const stopEngineRef = useRef(null);

  // ─────────────────────────────────────────────────────────────────────
  // Load reminders + detect missed + start engine
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // 1. Detect missed reminders from the last session
    const missed = collectMissedReminders(userId);
    if (missed.length > 0) setMissedAlerts(missed);

    // 2. Load all reminders
    setReminders(getReminders(userId));

    // 3. Register in-app alert callback
    setInAppAlertHandler((reminder) => {
      setActiveAlert(reminder);
      setReminders(getReminders(userId)); // refresh list
    });

    // 4. Start engine
    stopEngineRef.current = startReminderEngine(userId);

    // 5. Check notification permission
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }

    return () => {
      // Cleanup engine on unmount
      if (stopEngineRef.current) stopEngineRef.current();
      setInAppAlertHandler(null);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ─────────────────────────────────────────────────────────────────────
  // Notification permission request
  // ─────────────────────────────────────────────────────────────────────
  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
  };

  // ─────────────────────────────────────────────────────────────────────
  // Create reminder
  // ─────────────────────────────────────────────────────────────────────
  const handleCreate = useCallback(() => {
    setFormError('');
    if (!form.medicineName.trim()) { setFormError('Enter medicine name.'); return; }
    if (!form.scheduledTime)       { setFormError('Select a date & time.'); return; }

    const due = new Date(form.scheduledTime);
    if (due <= new Date()) { setFormError('Scheduled time must be in the future.'); return; }

    setCreating(true);
    const r = createReminder({ userId, medicineName: form.medicineName, scheduledTime: form.scheduledTime });
    setReminders(getReminders(userId));
    setForm({ medicineName: '', scheduledTime: '' });
    setCreating(false);

    console.log('[Reminders] Created:', r);
  }, [form, userId]);

  // ─────────────────────────────────────────────────────────────────────
  // Alert actions: Taken / Snooze / Skip
  // ─────────────────────────────────────────────────────────────────────
  const handleTaken = useCallback((reminder) => {
    cancelReminderTimers(reminder.id);
    updateReminder(reminder.id, { status: 'taken' });
    setReminders(getReminders(userId));
    setActiveAlert(null);
  }, [userId]);

  const handleSnooze = useCallback((reminder) => {
    cancelReminderTimers(reminder.id);
    const newTime = new Date(Date.now() + SNOOZE_MINUTES * 60_000).toISOString();
    updateReminder(reminder.id, { status: 'pending', scheduledTime: newTime, retryCount: 0 });
    setReminders(getReminders(userId));
    setActiveAlert(null);
  }, [userId]);

  const handleSkip = useCallback((reminder) => {
    cancelReminderTimers(reminder.id);
    updateReminder(reminder.id, { status: 'skipped' });
    setReminders(getReminders(userId));
    setActiveAlert(null);
  }, [userId]);

  const handleDelete = useCallback((id) => {
    cancelReminderTimers(id);
    deleteReminder(id);
    setReminders(getReminders(userId));
  }, [userId]);

  // ─────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex-col gap-6 animate-fade-in">

      {/* ── Page header ── */}
      <div className="page-header">
        <h1 className="page-title">🔔 Reminders</h1>
        <p className="page-subtitle">Create and manage medication reminders</p>
      </div>

      {/* ── Honest limitation banner (MANDATORY per spec) ── */}
      <div
        className="glass-card"
        style={{
          borderLeft: '4px solid var(--warning)',
          padding: 'var(--space-4)',
          background: 'rgba(255,190,0,0.08)',
        }}
      >
        <p className="text-sm" style={{ color: 'var(--warning)' }}>
          ⚠️ <strong>Heads up:</strong> Reminders work best when the app is active and internet is
          available. Offline support and advanced background alerts are coming soon.
        </p>
      </div>

      {/* ── Missed reminders alert (detected on load) ── */}
      {missedAlerts.length > 0 && (
        <div
          className="glass-card flex-col gap-3"
          style={{ borderLeft: '4px solid var(--danger)' }}
        >
          <p className="font-bold" style={{ color: 'var(--danger)' }}>
            ❌ Missed Medication{missedAlerts.length > 1 ? 's' : ''}
          </p>
          {missedAlerts.map((r) => (
            <p key={r.id} className="text-sm text-secondary">
              You missed <strong>{r.medicineName}</strong> scheduled at{' '}
              {formatDateTime(r.scheduledTime)}.
            </p>
          ))}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setMissedAlerts([])}
            style={{ alignSelf: 'flex-start' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Notification permission ── */}
      {notifPermission !== 'granted' && (
        <div
          className="glass-card flex items-center justify-between gap-4"
          style={{ flexWrap: 'wrap' }}
        >
          <div>
            <p className="font-bold text-sm">🔔 Enable Push Notifications</p>
            <p className="text-xs text-muted">
              Get reminders even if you switch tabs (requires browser permission).
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={requestPermission}
            disabled={notifPermission === 'denied'}
          >
            {notifPermission === 'denied' ? 'Blocked in browser' : 'Enable'}
          </button>
        </div>
      )}

      {/* ── Create reminder form ── */}
      <div className="glass-card flex-col gap-4">
        <h3 className="font-bold">➕ New Reminder</h3>

        <div className="flex-col gap-3">
          <div>
            <label className="input-label">Medicine Name</label>
            <input
              id="reminder-medicine-name"
              className="input"
              placeholder="e.g. Metformin 500mg"
              value={form.medicineName}
              onChange={(e) => setForm((f) => ({ ...f, medicineName: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <div>
            <label className="input-label">Date &amp; Time</label>
            <input
              id="reminder-scheduled-time"
              className="input"
              type="datetime-local"
              value={form.scheduledTime}
              min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
              onChange={(e) => setForm((f) => ({ ...f, scheduledTime: e.target.value }))}
            />
          </div>
        </div>

        {formError && (
          <p className="text-sm" style={{ color: 'var(--danger)' }}>{formError}</p>
        )}

        <button
          id="create-reminder-btn"
          className="btn btn-primary"
          onClick={handleCreate}
          disabled={creating}
        >
          {creating ? 'Adding...' : '✅ Add Reminder'}
        </button>
      </div>

      {/* ── Reminder list ── */}
      <div className="glass-card flex-col gap-3">
        <h3 className="font-bold">📋 Your Reminders</h3>

        {reminders.length === 0 && (
          <div className="text-center" style={{ padding: 'var(--space-8)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔔</div>
            <p className="text-secondary text-sm">No reminders yet. Add one above.</p>
          </div>
        )}

        {[...reminders]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((r) => {
            const st = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
            return (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--bg-glass)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex-col gap-1" style={{ flex: 1 }}>
                  <p className="font-bold text-sm">{r.medicineName}</p>
                  <p className="text-xs text-muted">{formatDateTime(r.scheduledTime)}</p>
                  {r.retryCount > 0 && (
                    <p className="text-xs" style={{ color: 'var(--warning)' }}>
                      Retry {r.retryCount}/{3}
                    </p>
                  )}
                  <span
                    className="badge"
                    style={{
                      background: st.color + '22',
                      color: st.color,
                      border: `1px solid ${st.color}`,
                      alignSelf: 'flex-start',
                      fontSize: '0.7rem',
                    }}
                  >
                    {st.label}
                  </span>
                </div>

                {/* Quick actions for pending reminders */}
                <div className="flex gap-2" style={{ flexShrink: 0 }}>
                  {r.status === 'pending' && (
                    <>
                      <button
                        className="btn btn-sm"
                        style={{ background: 'var(--success)', color: 'white', border: 'none' }}
                        onClick={() => handleTaken(r)}
                        title="Mark as Taken"
                      >✅</button>
                      <button
                        className="btn btn-sm"
                        style={{ background: 'var(--primary)', color: 'white', border: 'none' }}
                        onClick={() => handleSnooze(r)}
                        title={`Snooze ${SNOOZE_MINUTES} min`}
                      >⏰</button>
                      <button
                        className="btn btn-sm"
                        style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}
                        onClick={() => handleSkip(r)}
                        title="Skip"
                      >⏭️</button>
                    </>
                  )}
                  <button
                    className="btn btn-sm"
                    style={{ background: 'var(--danger-glow)', color: 'var(--danger)', border: 'none' }}
                    onClick={() => handleDelete(r.id)}
                    title="Delete"
                  >🗑️</button>
                </div>
              </div>
            );
          })}
      </div>

      {/* ── In-app alert modal (fires when engine triggers a reminder) ── */}
      {activeAlert && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-5)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            className="glass-card flex-col gap-5"
            style={{
              maxWidth: 400, width: '100%',
              border: '2px solid var(--warning)',
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <div className="text-center">
              <div style={{ fontSize: '3rem', marginBottom: 8 }}>💊</div>
              <h2 className="font-bold" style={{ fontSize: '1.3rem' }}>Medication Reminder</h2>
              <p className="text-secondary mt-2">
                Time to take <strong>{activeAlert.medicineName}</strong>
              </p>
              {activeAlert.retryCount > 0 && (
                <p className="text-sm" style={{ color: 'var(--warning)', marginTop: 4 }}>
                  Retry {activeAlert.retryCount} of {3}
                </p>
              )}
            </div>

            <div className="flex-col gap-3">
              <button
                id="alert-taken-btn"
                className="btn btn-primary btn-lg w-full"
                style={{ background: 'var(--success)' }}
                onClick={() => handleTaken(activeAlert)}
              >
                ✅ Mark as Taken
              </button>
              <button
                id="alert-snooze-btn"
                className="btn btn-lg w-full"
                style={{ background: 'var(--primary)', color: 'white' }}
                onClick={() => handleSnooze(activeAlert)}
              >
                ⏰ Snooze {SNOOZE_MINUTES} Minutes
              </button>
              <button
                id="alert-skip-btn"
                className="btn btn-ghost btn-lg w-full"
                onClick={() => handleSkip(activeAlert)}
              >
                ⏭️ Skip This Dose
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
