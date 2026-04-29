'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subscribeMedicines } from '@/lib/firestore';

const SNOOZE_OPTIONS = [
  { label: '15 min',  value: 15 },
  { label: '30 min',  value: 30 },
  { label: '1 hour',  value: 60 },
  { label: '2 hours', value: 120 },
];

const SOUND_OPTIONS = ['Default', 'Gentle', 'Chime', 'Vibrate only', 'Silent'];

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function formatTime(t) {
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour   = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

export default function RemindersPage() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading]     = useState(true);

  // Global notification settings
  const [settings, setSettings] = useState({
    enabled:        true,
    advanceMinutes: 5,
    snooze:         15,
    escalate:       true,
    escalateAfter:  15,
    sound:          'Default',
    caregiverAlert: true,
  });

  const setSetting = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  // Per-medicine overrides
  const [overrides, setOverrides] = useState({});
  const setOverride = (medId, k, v) =>
    setOverrides((o) => ({ ...o, [medId]: { ...(o[medId] || {}), [k]: v } }));

  const [saved, setSaved] = useState(false);

  // ── Load medicines ──
  useEffect(() => {
    if (!user) {
      setMedicines([
        { id: '1', name: 'Metformin',  times: ['08:00', '20:00'], category: 'Chronic' },
        { id: '2', name: 'Aspirin',    times: ['09:00'],           category: 'Chronic' },
        { id: '3', name: 'Vitamin D3', times: ['08:00'],           category: 'Vitamin' },
      ]);
      setLoading(false);
      return;
    }
    const unsub = subscribeMedicines(user.uid, (meds) => {
      setMedicines(meds);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // ── Request permission & save ──
  const handleSave = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        alert('⚠️ Please allow notifications in your browser to receive reminders.');
        return;
      }
    }
    // In a real app: save settings to Firestore + register FCM token
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Build sorted reminder list from medicines
  const allReminders = medicines.flatMap((med) =>
    (med.times || []).map((t) => ({
      medId:    med.id,
      medName:  med.name,
      time:     t,
      category: med.category,
      overrideEnabled: overrides[med.id]?.enabled,
    }))
  ).sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  return (
    <div className="flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Reminders</h1>
        <p className="page-subtitle">Configure when and how you get notified</p>
      </div>

      {/* Notification master toggle */}
      <div className="glass-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold">🔔 Notifications</p>
            <p className="text-xs text-muted">Master switch for all medication reminders</p>
          </div>
          <button
            onClick={() => setSetting('enabled', !settings.enabled)}
            style={{
              width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
              background: settings.enabled ? 'var(--success)' : 'var(--bg-glass)',
              transition: 'background 0.2s',
              position: 'relative',
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: 'white',
              position: 'absolute', top: 3,
              left: settings.enabled ? 27 : 3,
              transition: 'left 0.2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>
      </div>

      {settings.enabled && (
        <>
          {/* Notification settings */}
          <div className="glass-card flex-col gap-4">
            <h3 className="font-bold">⚙️ Notification Settings</h3>

            {/* Advance notice */}
            <div>
              <label className="input-label">Remind me before (minutes)</label>
              <div className="flex gap-2 flex-wrap">
                {[0, 5, 10, 15, 30].map((m) => (
                  <button
                    key={m}
                    onClick={() => setSetting('advanceMinutes', m)}
                    className="btn btn-sm"
                    style={{
                      background: settings.advanceMinutes === m ? 'var(--primary)' : 'var(--bg-glass)',
                      color: settings.advanceMinutes === m ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${settings.advanceMinutes === m ? 'var(--primary)' : 'var(--border)'}`,
                    }}
                  >
                    {m === 0 ? 'At time' : `${m} min`}
                  </button>
                ))}
              </div>
            </div>

            {/* Snooze duration */}
            <div>
              <label className="input-label">Default snooze duration</label>
              <div className="flex gap-2 flex-wrap">
                {SNOOZE_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setSetting('snooze', o.value)}
                    className="btn btn-sm"
                    style={{
                      background: settings.snooze === o.value ? 'var(--primary)' : 'var(--bg-glass)',
                      color: settings.snooze === o.value ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${settings.snooze === o.value ? 'var(--primary)' : 'var(--border)'}`,
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification sound */}
            <div>
              <label className="input-label">Sound</label>
              <select
                className="input"
                value={settings.sound}
                onChange={(e) => setSetting('sound', e.target.value)}
              >
                {SOUND_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Escalating reminders */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold">📢 Escalating Reminders</p>
                <p className="text-xs text-muted">Resend notification if dose not marked after delay</p>
              </div>
              <button
                onClick={() => setSetting('escalate', !settings.escalate)}
                style={{
                  width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: settings.escalate ? 'var(--success)' : 'var(--bg-glass)',
                  transition: 'background 0.2s', position: 'relative',
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: 'white',
                  position: 'absolute', top: 3,
                  left: settings.escalate ? 27 : 3,
                  transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>
            {settings.escalate && (
              <div>
                <label className="input-label">Resend after (minutes)</label>
                <div className="flex gap-2">
                  {[10, 15, 20, 30].map((m) => (
                    <button
                      key={m}
                      onClick={() => setSetting('escalateAfter', m)}
                      className="btn btn-sm"
                      style={{
                        background: settings.escalateAfter === m ? 'var(--warning)' : 'var(--bg-glass)',
                        color: settings.escalateAfter === m ? 'white' : 'var(--text-secondary)',
                        border: `1px solid ${settings.escalateAfter === m ? 'var(--warning)' : 'var(--border)'}`,
                      }}
                    >
                      {m} min
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Caregiver alert */}
          <div className="glass-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">👥 Caregiver SMS Alert</p>
                <p className="text-xs text-muted">Instantly notify caregiver when a dose is missed</p>
              </div>
              <button
                onClick={() => setSetting('caregiverAlert', !settings.caregiverAlert)}
                style={{
                  width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: settings.caregiverAlert ? 'var(--primary)' : 'var(--bg-glass)',
                  transition: 'background 0.2s', position: 'relative',
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: 'white',
                  position: 'absolute', top: 3,
                  left: settings.caregiverAlert ? 27 : 3,
                  transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>
          </div>

          {/* Today's reminder schedule */}
          <div className="glass-card flex-col gap-3">
            <h3 className="font-bold">📋 Today's Reminder Schedule</h3>
            {loading && [1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8 }} />
            ))}
            {!loading && allReminders.length === 0 && (
              <div className="text-center" style={{ padding: 'var(--space-8)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>💊</div>
                <p className="text-secondary text-sm">No medicines added yet</p>
              </div>
            )}
            {allReminders.map((r, idx) => {
              const isDisabled = overrides[r.medId]?.enabled === false;
              return (
                <div
                  key={`${r.medId}-${r.time}-${idx}`}
                  className="flex items-center justify-between"
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'var(--bg-glass)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    opacity: isDisabled ? 0.5 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '1.2rem' }}>🔔</span>
                    <div>
                      <p className="font-bold text-sm">{formatTime(r.time)}</p>
                      <p className="text-xs text-muted">{r.medName}</p>
                    </div>
                  </div>
                  {/* Per-medicine toggle */}
                  <button
                    onClick={() => setOverride(r.medId, 'enabled', isDisabled ? undefined : false)}
                    style={{
                      width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                      background: !isDisabled ? 'var(--success)' : 'var(--bg-glass)',
                      transition: 'background 0.2s', position: 'relative',
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', background: 'white',
                      position: 'absolute', top: 3,
                      left: !isDisabled ? 23 : 3,
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        className="btn btn-primary btn-lg w-full"
      >
        {saved ? '✅ Settings Saved!' : '💾 Save Reminder Settings'}
      </button>

      {/* Info note */}
      <div className="glass-card-primary flex items-start gap-3" style={{ padding: 'var(--space-4)' }}>
        <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
        <p className="text-sm text-secondary">
          For notifications to work even when the browser is closed, allow notification permissions and install MedManage as a PWA (Add to Home Screen).
        </p>
      </div>
    </div>
  );
}
