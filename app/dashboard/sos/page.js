'use client';
/**
 * app/dashboard/sos/page.js  [UPDATED]
 *
 * Changes:
 * - Shows SMS cost preview before SOS fires (₹5 × contacts)
 * - Shows per-contact SMS delivery result after trigger
 * - "Test SMS" button to send a test without full SOS hold
 * - Wallet balance check on page load
 * - Phone number format hint in contact form
 */

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subscribeSOSContacts, addSOSContact, deleteSOSContact, logSOS } from '@/lib/firestore';
import { getDemoSOSContacts, isDemoMode, setDemoSOSContacts } from '@/lib/demo';
import styles from './sos.module.css';

const HOLD_DURATION = 3000; // 3 seconds
const SMS_COST_PER_MSG = 5; // ₹5 per SMS via Fast2SMS

export default function SOSPage() {
  const { user, loading } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [isDemo,         setIsDemo]         = useState(false);
  const [holding,        setHolding]        = useState(false);
  const [progress,       setProgress]       = useState(0);
  const [triggered,      setTriggered]      = useState(false);
  const [location,       setLocation]       = useState(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact,     setNewContact]     = useState({ name: '', phone: '' });
  const [sending,        setSending]        = useState(false);
  const [sosResult,      setSosResult]      = useState(null);  // API response
  const [smsBalance,     setSmsBalance]     = useState(null);  // wallet balance
  const [testSending,    setTestSending]    = useState(false);
  const [phoneError,     setPhoneError]     = useState('');

  const intervalRef  = useRef(null);
  const startTimeRef = useRef(null);

  // ── Load real contacts from Firestore ──────────────────────────────────
  useEffect(() => {
    if (loading) return;

    const demo = isDemoMode();
    setIsDemo(demo);

    if (user) {
      const unsub = subscribeSOSContacts(user.uid, (c) => {
        setContacts(c);
      });
      return () => unsub();
    }

    if (demo) {
      setContacts(getDemoSOSContacts());
      return;
    }

    setContacts([]);
  }, [user, loading]);

  // ── Get GPS location on mount ──────────────────────────────────────────
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation(null)
      );
    }
  }, []);

  // ── Check Fast2SMS wallet balance on mount ─────────────────────────────
  useEffect(() => {
    fetch('/api/sos/send')
      .then((r) => r.json())
      .then((d) => {
        if (d.configured && d.balance !== undefined) {
          setSmsBalance(d.balance);
        }
      })
      .catch(() => {}); // silently ignore
  }, []);

  // ── Phone validation (Indian mobile: 10 digits, starts 6-9) ───────────
  function validatePhone(raw) {
    let digits = String(raw).replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length === 12) {
      digits = digits.slice(2);
    }
    if (/^[6-9]\d{9}$/.test(digits)) return digits;
    return null;
  }

  // ── SOS hold logic ─────────────────────────────────────────────────────
  const startHold = () => {
    if (triggered) return;
    setHolding(true);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const prog = Math.min(100, (elapsed / HOLD_DURATION) * 100);
      setProgress(prog);
      if (prog >= 100) {
        clearInterval(intervalRef.current);
        triggerSOS();
      }
    }, 50);
  };

  const cancelHold = () => {
    clearInterval(intervalRef.current);
    setHolding(false);
    setProgress(0);
  };

  // ── Main SOS trigger ───────────────────────────────────────────────────
  const triggerSOS = async () => {
    setHolding(false);
    setTriggered(true);
    setSending(true);
    setSosResult(null);

    // Log to Firestore
    if (user && location) {
      await logSOS(user.uid, location).catch(() => {});
    }

    await sendSMSAlert({ userName: user?.displayName || 'MedManage User' });
    setSending(false);
  };

  // ── Shared SMS send function ───────────────────────────────────────────
  const sendSMSAlert = async ({ userName, isTest = false }) => {
    try {
      const res = await fetch('/api/sos/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: isTest ? `${userName} (TEST)` : userName,
          contacts,
          location: isTest ? null : location,
        }),
      });
      const data = await res.json();
      setSosResult({ ...data, isTest });
      return data;
    } catch (err) {
      setSosResult({ success: false, error: err.message, isTest });
      return null;
    }
  };

  // ── Test SMS button ────────────────────────────────────────────────────
  const handleTestSMS = async () => {
    if (contacts.length === 0) return;
    setTestSending(true);
    setSosResult(null);
    await sendSMSAlert({
      userName: user?.displayName || 'MedManage User',
      isTest: true,
    });
    setTestSending(false);
  };

  // ── Add contact ────────────────────────────────────────────────────────
  const handleAddContact = async () => {
    setPhoneError('');
    if (!newContact.name.trim() || !newContact.phone.trim()) return;

    const validNum = validatePhone(newContact.phone);
    if (!validNum) {
      setPhoneError('Enter a valid 10-digit Indian mobile number (starts with 6–9).');
      return;
    }

    const contact = { name: newContact.name.trim(), phone: validNum };
    try {
      if (user) {
        await addSOSContact(user.uid, contact);
      } else if (isDemo) {
        const nextContacts = [...contacts, { id: Date.now().toString(), ...contact }];
        setDemoSOSContacts(nextContacts);
        setContacts(nextContacts);
      } else {
        setContacts((prev) => [...prev, { id: Date.now().toString(), ...contact }]);
      }
      setNewContact({ name: '', phone: '' });
      setShowAddContact(false);
    } catch (err) {
      console.error('Failed to add contact:', err);
      setPhoneError('Failed to save to database. Check Firebase rules.');
    }
  };

  const handleDeleteContact = async (id) => {
    if (user) {
      await deleteSOSContact(user.uid, id);
    } else if (isDemo) {
      const nextContacts = contacts.filter((c) => c.id !== id);
      setDemoSOSContacts(nextContacts);
      setContacts(nextContacts);
    } else {
      setContacts((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // ── Triggered / result screen ──────────────────────────────────────────
  if (triggered) {
    return (
      <div className={`animate-fade-in flex-col items-center ${styles.triggeredWrap}`}>
        <div className={styles.triggeredIcon}>{sending ? '📡' : '✅'}</div>
        <h1 className={styles.triggeredTitle}>
          {sending ? 'Sending SOS...' : 'SOS Alert Sent!'}
        </h1>

        {!sending && sosResult && (
          <>
            {/* SMS result card */}
            <div
              className="glass-card w-full flex-col gap-3 mb-4"
              style={{ borderLeft: `4px solid ${sosResult.smsSent ? 'var(--success)' : sosResult.devMode ? 'var(--warning)' : 'var(--danger)'}` }}
            >
              {sosResult.devMode && (
                <p className="text-sm" style={{ color: 'var(--warning)' }}>
                  ⚠️ <strong>Dev mode:</strong> No API key set — SMS was NOT actually sent.
                  Add <code>FAST2SMS_API_KEY</code> to .env.local to enable.
                </p>
              )}
              {sosResult.smsSent && (
                <p className="text-sm" style={{ color: 'var(--success)' }}>
                  ✅ SMS sent to <strong>{sosResult.valid}</strong> contact{sosResult.valid > 1 ? 's' : ''} via Fast2SMS
                </p>
              )}
              {sosResult.invalid?.length > 0 && (
                <p className="text-sm" style={{ color: 'var(--danger)' }}>
                  ❌ {sosResult.invalid.length} invalid number{sosResult.invalid.length > 1 ? 's' : ''} skipped:{' '}
                  {sosResult.invalid.map((c) => c.name).join(', ')}
                </p>
              )}
              {sosResult.error && !sosResult.devMode && (
                <p className="text-sm" style={{ color: 'var(--danger)' }}>
                  Error: {sosResult.error}
                </p>
              )}
              {sosResult.smsResults?.[0]?.requestId && (
                <p className="text-xs text-muted">
                  Fast2SMS request ID: {sosResult.smsResults[0].requestId}
                </p>
              )}
            </div>

            {/* Message preview */}
            <div className="glass-card w-full text-center mb-4">
              <p className="text-xs text-muted mb-1">Message sent:</p>
              <p className="text-sm font-bold">{sosResult.message}</p>
            </div>

            {/* Location link */}
            {location && (
              <a
                href={`https://maps.google.com/?q=${location.lat},${location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="badge badge-success mb-4"
                style={{ padding: '8px 16px' }}
              >
                📍 Your location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </a>
            )}
          </>
        )}

        {sending && (
          <p className="text-secondary text-sm mb-6">
            Sending emergency SMS to {contacts.length} contact{contacts.length > 1 ? 's' : ''}...
          </p>
        )}

        <button
          className="btn btn-ghost w-full"
          onClick={() => { setTriggered(false); setProgress(0); setSosResult(null); }}
        >
          ← Back to SOS
        </button>
      </div>
    );
  }

  // ── Main SOS screen ────────────────────────────────────────────────────
  return (
    <div className="flex-col gap-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🆘 Emergency SOS</h1>
        <p className="page-subtitle">Hold the button for 3 seconds to send an alert</p>
      </div>

      {/* ── SMS balance badge ── */}
      {smsBalance !== null && (
        <div
          className={`badge ${smsBalance >= SMS_COST_PER_MSG * contacts.length ? 'badge-success' : 'badge-warning'}`}
          style={{ width: '100%', justifyContent: 'center', padding: '8px' }}
        >
          💳 Fast2SMS Balance: ₹{smsBalance}
          {smsBalance < SMS_COST_PER_MSG * contacts.length && (
            <span style={{ marginLeft: 8 }}>
              — ⚠️ Low (need ₹{SMS_COST_PER_MSG * contacts.length} for {contacts.length} SMS)
            </span>
          )}
        </div>
      )}

      {/* ── Location status ── */}
      <div
        className={`badge ${location ? 'badge-success' : 'badge-warning'}`}
        style={{ width: '100%', justifyContent: 'center', padding: '8px' }}
      >
        {location
          ? `📍 Location ready: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
          : '📍 Location unavailable — enable GPS for best results'}
      </div>

      {/* ── SMS cost preview ── */}
      {contacts.length > 0 && (
        <div
          className="glass-card text-sm"
          style={{
            background: 'rgba(108,99,255,0.08)',
            border: '1px solid var(--primary)',
            padding: 'var(--space-3) var(--space-4)',
          }}
        >
          <p style={{ color: 'var(--primary)', fontWeight: 600 }}>
            📱 Will send {contacts.length} SMS × ₹{SMS_COST_PER_MSG} ={' '}
            <strong>₹{contacts.length * SMS_COST_PER_MSG}</strong> per SOS trigger
          </p>
        </div>
      )}

      {/* ── SOS Button ── */}
      <div className={styles.sosWrap}>
        <div className={styles.pulseRing} style={{ animationDelay: '0s' }} />
        <div className={styles.pulseRing} style={{ animationDelay: '0.6s' }} />
        <div className={styles.pulseRing} style={{ animationDelay: '1.2s' }} />

        <svg className={styles.progressSvg} viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,71,87,0.15)" strokeWidth="8" />
          <circle
            cx="100" cy="100" r="85"
            fill="none"
            stroke="var(--danger)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 85}`}
            strokeDashoffset={`${2 * Math.PI * 85 * (1 - progress / 100)}`}
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>

        <button
          className={`${styles.sosBtn} ${holding ? styles.holding : ''}`}
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={(e) => { e.preventDefault(); startHold(); }}
          onTouchEnd={cancelHold}
        >
          <span className={styles.sosBtnIcon}>🆘</span>
          <span className={styles.sosBtnText}>
            {holding
              ? `${Math.ceil(((HOLD_DURATION - (Date.now() - (startTimeRef.current || Date.now()))) / 1000))}`
              : 'SOS'}
          </span>
          <span className={styles.sosBtnSub}>{holding ? 'Hold...' : 'HOLD 3 SEC'}</span>
        </button>
      </div>

      <p className="text-center text-muted text-sm">
        Release to cancel • Hold 3 seconds to send emergency SMS
      </p>

      {/* ── Emergency contacts ── */}
      <div className="glass-card flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">📞 Emergency Contacts ({contacts.length})</h3>
          <button onClick={() => setShowAddContact(!showAddContact)} className="btn btn-ghost btn-sm">
            + Add
          </button>
        </div>

        {showAddContact && (
          <div
            className="flex-col gap-3"
            style={{ background: 'var(--bg-glass)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}
          >
            <input
              className="input"
              placeholder="Name (e.g. Mom)"
              value={newContact.name}
              onChange={(e) => setNewContact((p) => ({ ...p, name: e.target.value }))}
            />
            <div>
              <input
                className="input"
                placeholder="Mobile number (10 digits)"
                value={newContact.phone}
                maxLength={13}
                onChange={(e) => {
                  setPhoneError('');
                  setNewContact((p) => ({ ...p, phone: e.target.value }));
                }}
              />
              {phoneError && (
                <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{phoneError}</p>
              )}
              <p className="text-xs text-muted mt-1">Indian mobile only (10 digits, starts with 6–9)</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddContact} className="btn btn-primary btn-sm">Add Contact</button>
              <button onClick={() => { setShowAddContact(false); setPhoneError(''); }} className="btn btn-ghost btn-sm">Cancel</button>
            </div>
          </div>
        )}

        {contacts.length === 0 && (
          <p className="text-muted text-sm text-center">
            No contacts added. Add at least one emergency contact.
          </p>
        )}

        {contacts.map((c) => (
          <div key={c.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="btn-icon"
                style={{ background: 'var(--danger-glow)', color: 'var(--danger)', fontSize: '1rem' }}
              >
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-sm">{c.name}</div>
                <div className="text-xs text-muted">+91 {c.phone}</div>
              </div>
            </div>
            <button
              onClick={() => handleDeleteContact(c.id)}
              style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* ── Test SMS button ── */}
      {contacts.length > 0 && (
        <div className="glass-card flex-col gap-3">
          <p className="font-bold text-sm">🧪 Test SMS</p>
          <p className="text-xs text-muted">
            Send a test message to verify your contacts receive it. Costs ₹{contacts.length * SMS_COST_PER_MSG}.
          </p>

          {sosResult?.isTest && (
            <div
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                background: sosResult.smsSent ? 'rgba(67,217,173,0.1)' : 'rgba(255,71,87,0.1)',
                border: `1px solid ${sosResult.smsSent ? 'var(--success)' : sosResult.devMode ? 'var(--warning)' : 'var(--danger)'}`,
              }}
            >
              {sosResult.devMode && (
                <p className="text-xs" style={{ color: 'var(--warning)' }}>
                  ⚠️ Dev mode — no FAST2SMS_API_KEY set. Add it to .env.local.
                </p>
              )}
              {sosResult.smsSent && (
                <p className="text-xs" style={{ color: 'var(--success)' }}>
                  ✅ Test SMS sent to {sosResult.valid} number{sosResult.valid > 1 ? 's' : ''} successfully!
                </p>
              )}
              {sosResult.error && !sosResult.devMode && (
                <p className="text-xs" style={{ color: 'var(--danger)' }}>Error: {sosResult.error}</p>
              )}
              {sosResult.smsResults?.[0]?.message && (
                <p className="text-xs text-muted">Provider: {sosResult.smsResults[0].message}</p>
              )}
              {sosResult.smsResults?.[0]?.requestId && (
                <p className="text-xs text-muted">Request ID: {sosResult.smsResults[0].requestId}</p>
              )}
            </div>
          )}

          <button
            className="btn btn-ghost btn-sm"
            onClick={handleTestSMS}
            disabled={testSending}
          >
            {testSending ? '📡 Sending...' : `📲 Send Test SMS (₹${contacts.length * SMS_COST_PER_MSG})`}
          </button>
        </div>
      )}

      {/* ── Info card ── */}
      <div className="glass-card text-sm" style={{ color: 'var(--text-secondary)' }}>
        <p className="font-bold mb-2">📱 What happens when SOS triggers:</p>
        <ol style={{ paddingLeft: '1.2rem', lineHeight: 2 }}>
          <li>Your live GPS location is captured</li>
          <li>SMS sent to {contacts.length > 0 ? `all ${contacts.length} emergency contact${contacts.length !== 1 ? 's' : ''}` : 'your emergency contacts'} via Fast2SMS</li>
          <li>SMS includes Google Maps link to your exact location</li>
          <li>Event is logged in your SOS history</li>
        </ol>
        {contacts.length === 0 && (
          <p className="text-xs mt-3" style={{ color: 'var(--warning)' }}>
            ⚠️ Add at least one emergency contact above before using SOS.
          </p>
        )}
        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
          Cost: ₹{SMS_COST_PER_MSG}/SMS via Fast2SMS · Requires FAST2SMS_API_KEY configured
        </p>
      </div>
    </div>
  );
}
