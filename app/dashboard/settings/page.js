'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, updateUserProfile } from '@/lib/firestore';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './settings.module.css';

export default function SettingsPage() {
  const { user } = useAuth();
  const router   = useRouter();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [theme, setTheme]     = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const handleTheme = (t) => {
    setTheme(t);
    localStorage.setItem('theme', t);
    document.documentElement.setAttribute('data-theme', t);
  };

  useEffect(() => {
    if (!user) {
      setProfile({ name: 'Demo User', email: 'demo@medmanage.app' });
      return;
    }
    getUserProfile(user.uid).then(p => {
      if (p) setProfile(p);
      else setProfile({ name: user.displayName || '', email: user.email || '' });
    });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    if (user) {
      await updateUserProfile(user.uid, { name: profile.name });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  const handleSignOut = async () => {
    if (!confirm('Sign out of MedManage?')) return;
    await signOut();
    router.push('/');
  };

  const handleResetOnboarding = () => {
    localStorage.removeItem('onboarding_complete');
    router.push('/onboarding');
  };

  const Section = ({ title, children }) => (
    <div className="glass-card flex-col gap-4">
      <h3 className="font-bold" style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>{title}</h3>
      {children}
    </div>
  );

  const Row = ({ icon, label, children }) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span style={{ fontSize: '1.2rem', width: 24 }}>{icon}</span>
        <span className="text-sm font-bold">{label}</span>
      </div>
      <div>{children}</div>
    </div>
  );

  return (
    <div className="flex-col gap-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">⚙️ Settings</h1>
      </div>

      {/* Profile */}
      <Section title="Profile">
        <div className={styles.avatar}>
          {user?.photoURL
            ? <img src={user.photoURL} alt="avatar" />
            : <span>{(profile.name || 'D').charAt(0).toUpperCase()}</span>
          }
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Display Name</label>
          <input
            className="input"
            value={profile.name || ''}
            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Email</label>
          <input className="input" value={profile.email || user?.email || ''} disabled style={{ opacity: 0.6 }} />
        </div>
        <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={saving}>
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </Section>

      {/* App Preferences */}
      <Section title="Preferences">
        <Row icon="🎨" label="Theme">
          <div className={styles.themeToggle}>
            {['dark', 'light'].map(t => (
              <button key={t}
                onClick={() => handleTheme(t)}
                className={`${styles.themeBtn} ${theme === t ? styles.active : ''}`}
              >
                {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </button>
            ))}
          </div>
        </Row>
        <Row icon="🔔" label="Notifications">
          <label className={styles.toggle}>
            <input type="checkbox" defaultChecked />
            <span className={styles.toggleSlider} />
          </label>
        </Row>
        <Row icon="🌐" label="Language">
          <select className="input" style={{ width: 120, minHeight: 36, padding: '4px 8px' }}>
            <option>English</option>
            <option>हिंदी</option>
          </select>
        </Row>
      </Section>

      {/* Quick Links */}
      <Section title="Quick Links">
        <Row icon="🏥" label="Doctor Appointments">
          <Link href="/dashboard/appointments" className="btn btn-ghost btn-sm">View →</Link>
        </Row>
        <Row icon="🆘" label="SOS Emergency">
          <Link href="/dashboard/sos" className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>Open →</Link>
        </Row>
        <Row icon="📷" label="Identify a Pill (AI)">
          <Link href="/dashboard/medicines/identify" className="btn btn-ghost btn-sm">Scan →</Link>
        </Row>
        <Row icon="🤖" label="Drug Interactions">
          <Link href="/dashboard/medicines/interactions" className="btn btn-ghost btn-sm">Check →</Link>
        </Row>
        <Row icon="📄" label="Doctor's Report">
          <Link href="/dashboard/export" className="btn btn-ghost btn-sm">PDF →</Link>
        </Row>
      </Section>

      {/* Privacy & Data */}
      <Section title="Privacy & Data">
        <Row icon="🔒" label="We never sell your data">
          <span className="badge badge-success">✓ Protected</span>
        </Row>
      </Section>

      {/* App */}
      <Section title="App">
        <Row icon="🔄" label="Reset Onboarding">
          <button className="btn btn-ghost btn-sm" onClick={handleResetOnboarding}>Reset</button>
        </Row>
        <Row icon="ℹ️" label="Version">
          <span className="text-muted text-sm">v1.0.0 (Jury Build)</span>
        </Row>
        <Row icon="📋" label="Privacy Policy">
          <a href="/privacy" className="btn btn-ghost btn-sm">View</a>
        </Row>
        <Row icon="📋" label="Terms of Service">
          <a href="/terms" className="btn btn-ghost btn-sm">View</a>
        </Row>
      </Section>

      {/* Account */}
      <Section title="Account">
        <button
          onClick={handleSignOut}
          className="btn btn-ghost w-full"
          style={{ color: 'var(--danger)', borderColor: 'rgba(255,71,87,0.3)' }}
        >
          🚪 Sign Out
        </button>
        <button
          className="btn btn-ghost w-full text-xs"
          style={{ color: 'var(--text-muted)' }}
          onClick={() => alert('Contact support@medmanage.app to delete your account')}
        >
          Delete Account
        </button>
      </Section>
    </div>
  );
}
