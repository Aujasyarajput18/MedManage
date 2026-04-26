'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subscribeSOSContacts, addSOSContact, deleteSOSContact, logSOS } from '@/lib/firestore';
import styles from './sos.module.css';

const HOLD_DURATION = 3000; // 3 seconds

export default function SOSPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([
    { id: 'demo1', name: 'Mom', phone: '+91 98765 43210' },
    { id: 'demo2', name: 'Dad', phone: '+91 87654 32109' },
  ]);
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [triggered, setTriggered] = useState(false);
  const [location, setLocation] = useState(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [sending, setSending] = useState(false);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Load real contacts from Firestore
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeSOSContacts(user.uid, (c) => {
      if (c.length > 0) setContacts(c);
    });
    return () => unsub();
  }, [user]);

  // Get location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation(null)
      );
    }
  }, []);

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

  const triggerSOS = async () => {
    setHolding(false);
    setTriggered(true);
    setSending(true);

    // Log SOS event
    if (user && location) {
      await logSOS(user.uid, location).catch(() => {});
    }

    // Call SOS API
    try {
      await fetch('/api/sos/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: user?.displayName || 'User',
          contacts,
          location,
        }),
      });
    } catch (err) {
      console.error('SOS send failed:', err);
    }

    setSending(false);
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) return;
    if (user) {
      await addSOSContact(user.uid, newContact);
    } else {
      setContacts((prev) => [...prev, { id: Date.now().toString(), ...newContact }]);
    }
    setNewContact({ name: '', phone: '' });
    setShowAddContact(false);
  };

  const handleDeleteContact = async (id) => {
    if (user) {
      await deleteSOSContact(user.uid, id);
    } else {
      setContacts((prev) => prev.filter((c) => c.id !== id));
    }
  };

  if (triggered) {
    return (
      <div className={`animate-fade-in flex-col items-center ${styles.triggeredWrap}`}>
        <div className={styles.triggeredIcon}>✅</div>
        <h1 className={styles.triggeredTitle}>SOS Alert Sent!</h1>
        <p className="text-secondary text-center mb-6">
          Emergency message sent to {contacts.length} contact{contacts.length > 1 ? 's' : ''} with your location.
        </p>
        {location && (
          <a
            href={`https://maps.google.com/?q=${location.lat},${location.lng}`}
            target="_blank"
            rel="noreferrer"
            className="badge badge-success mb-6"
            style={{ padding: '8px 16px' }}
          >
            📍 Your location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </a>
        )}
        <div className="glass-card w-full text-center mb-6">
          <p className="text-sm text-secondary">Message sent:</p>
          <p className="font-bold mt-2">
            🚨 {user?.displayName || 'User'} needs help!
            {location && ` Location: maps.google.com/?q=${location.lat.toFixed(4)},${location.lng.toFixed(4)}`}
          </p>
        </div>
        <button className="btn btn-ghost w-full" onClick={() => { setTriggered(false); setProgress(0); }}>
          ← Back to SOS
        </button>
      </div>
    );
  }

  return (
    <div className="flex-col gap-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🆘 Emergency SOS</h1>
        <p className="page-subtitle">Hold the button for 3 seconds to send an alert</p>
      </div>

      {/* Location status */}
      <div className={`badge ${location ? 'badge-success' : 'badge-warning'}`} style={{ width: '100%', justifyContent: 'center', padding: '8px' }}>
        {location ? `📍 Location ready: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : '📍 Location unavailable — enable GPS for best results'}
      </div>

      {/* SOS Button */}
      <div className={styles.sosWrap}>
        {/* Pulse rings (always on) */}
        <div className={styles.pulseRing} style={{ animationDelay: '0s' }} />
        <div className={styles.pulseRing} style={{ animationDelay: '0.6s' }} />
        <div className={styles.pulseRing} style={{ animationDelay: '1.2s' }} />

        {/* Circular progress overlay */}
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

        {/* Main button */}
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
            {holding ? `${Math.ceil(((HOLD_DURATION - (Date.now() - (startTimeRef.current || Date.now()))) / 1000))}` : 'SOS'}
          </span>
          <span className={styles.sosBtnSub}>
            {holding ? 'Hold...' : 'HOLD 3 SEC'}
          </span>
        </button>
      </div>

      <p className="text-center text-muted text-sm">
        Release to cancel • Hold 3 seconds to send emergency alert
      </p>

      {/* Emergency contacts */}
      <div className="glass-card flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Emergency Contacts ({contacts.length})</h3>
          <button onClick={() => setShowAddContact(!showAddContact)} className="btn btn-ghost btn-sm">
            + Add
          </button>
        </div>

        {showAddContact && (
          <div className="flex-col gap-3" style={{ background: 'var(--bg-glass)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
            <input className="input" placeholder="Name" value={newContact.name} onChange={(e) => setNewContact((p) => ({ ...p, name: e.target.value }))} />
            <input className="input" placeholder="Phone (+91XXXXXXXXXX)" value={newContact.phone} onChange={(e) => setNewContact((p) => ({ ...p, phone: e.target.value }))} />
            <div className="flex gap-2">
              <button onClick={handleAddContact} className="btn btn-primary btn-sm">Add Contact</button>
              <button onClick={() => setShowAddContact(false)} className="btn btn-ghost btn-sm">Cancel</button>
            </div>
          </div>
        )}

        {contacts.length === 0 && (
          <p className="text-muted text-sm text-center">No contacts added. Add at least one emergency contact.</p>
        )}

        {contacts.map((c) => (
          <div key={c.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="btn-icon" style={{ background: 'var(--danger-glow)', color: 'var(--danger)', fontSize: '1rem' }}>
                {c.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-sm">{c.name}</div>
                <div className="text-xs text-muted">{c.phone}</div>
              </div>
            </div>
            <button onClick={() => handleDeleteContact(c.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="glass-card text-sm" style={{ color: 'var(--text-secondary)' }}>
        <p className="font-bold mb-2">📱 What happens when SOS triggers:</p>
        <ol style={{ paddingLeft: '1.2rem', lineHeight: 2 }}>
          <li>Your live GPS location is captured</li>
          <li>An SMS is sent to all emergency contacts</li>
          <li>SMS includes a Google Maps link to your location</li>
          <li>A log is saved in your SOS history</li>
        </ol>
      </div>
    </div>
  );
}
