'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { getUserProfile, updateUserProfile } from '@/lib/firestore';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LANGUAGES } from '@/lib/translations';
import styles from './settings.module.css';

export default function SettingsPage() {
  const { user } = useAuth();
  const { langCode, setLang, t } = useLanguage();
  const router   = useRouter();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [theme, setTheme]           = useState('dark');
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    // Check real notification permission
    if ('Notification' in window) {
      setNotifEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleTheme = (t) => {
    setTheme(t);
    localStorage.setItem('theme', t);
    document.documentElement.setAttribute('data-theme', t);
  };

  useEffect(() => {
    if (!user) {
      setProfile({ name: '', email: '' });
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
    if (!confirm(t('settings', 'signOut') + '?')) return;
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
        <h1 className="page-title">⚙️ {t('settings', 'title')}</h1>
      </div>

      {/* Profile */}
      <Section title={t('settings', 'profile')}>
        <div className={styles.avatar}>
          {user?.photoURL
            ? <img src={user.photoURL} alt="avatar" />
            : <span>{(profile.name || 'D').charAt(0).toUpperCase()}</span>
          }
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="input-label">{t('settings', 'displayName')}</label>
          <input
            className="input"
            value={profile.name || ''}
            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="input-label">{t('settings', 'email')}</label>
          <input className="input" value={profile.email || user?.email || ''} disabled style={{ opacity: 0.6 }} />
        </div>
        <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={saving}>
          {saved ? `✓ ${t('settings', 'saved')}` : saving ? t('settings', 'saving') : t('settings', 'saveChanges')}
        </button>
      </Section>

      {/* App Preferences */}
      <Section title={t('settings', 'preferences')}>
        <Row icon="🎨" label={t('settings', 'theme')}>
          <div className={styles.themeToggle}>
            {['dark', 'light'].map(thm => (
              <button key={thm}
                onClick={() => handleTheme(thm)}
                className={`${styles.themeBtn} ${theme === thm ? styles.active : ''}`}
              >
                {thm === 'dark' ? `🌙 ${t('settings', 'dark')}` : `☀️ ${t('settings', 'light')}`}
              </button>
            ))}
          </div>
        </Row>
        <Row icon="🔔" label={t('settings', 'notifications')}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={notifEnabled}
              disabled={typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied'}
              onChange={async (e) => {
                if (e.target.checked) {
                  if ('Notification' in window) {
                    const perm = await Notification.requestPermission();
                    setNotifEnabled(perm === 'granted');
                  }
                } else {
                  setNotifEnabled(false);
                  // Can't programmatically revoke — guide user
                  alert('To disable notifications, go to your browser site settings and block notifications for this site.');
                }
              }}
            />
            <span className={styles.toggleSlider} />
          </label>
        </Row>
        <Row icon="🌐" label={t('settings', 'language')}>
          <select 
            className="input" 
            style={{ width: 140, minHeight: 36, padding: '4px 8px' }}
            value={langCode}
            onChange={(e) => setLang(e.target.value)}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.native} ({lang.name})</option>
            ))}
          </select>
        </Row>
      </Section>

      {/* Quick Links */}
      <Section title={t('settings', 'quickLinks')}>
        <Row icon="🏥" label={t('settings', 'doctorAppointments')}>
          <Link href="/dashboard/appointments" className="btn btn-ghost btn-sm">{t('settings', 'view')} →</Link>
        </Row>
        <Row icon="🆘" label={t('settings', 'sosEmergency')}>
          <Link href="/dashboard/sos" className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>{t('settings', 'open')} →</Link>
        </Row>
        <Row icon="📷" label={t('settings', 'identifyPill')}>
          <Link href="/dashboard/medicines/identify" className="btn btn-ghost btn-sm">{t('settings', 'scan')} →</Link>
        </Row>
        <Row icon="🤖" label={t('settings', 'drugInteractions')}>
          <Link href="/dashboard/medicines/interactions" className="btn btn-ghost btn-sm">{t('settings', 'check')} →</Link>
        </Row>
        <Row icon="📄" label={t('settings', 'doctorsReport')}>
          <Link href="/dashboard/export" className="btn btn-ghost btn-sm">{t('settings', 'pdf')} →</Link>
        </Row>
      </Section>

      {/* Privacy & Data */}
      <Section title={t('settings', 'privacyData')}>
        <Row icon="🔒" label={t('settings', 'weNeverSell')}>
          <span className="badge badge-success">✓ {t('settings', 'protected')}</span>
        </Row>
      </Section>

      {/* App */}
      <Section title={t('settings', 'app')}>
        <Row icon="🔄" label={t('settings', 'resetOnboarding')}>
          <button className="btn btn-ghost btn-sm" onClick={handleResetOnboarding}>{t('settings', 'reset')}</button>
        </Row>
        <Row icon="ℹ️" label={t('settings', 'version')}>
          <span className="text-muted text-sm">v1.0.0 (Jury Build)</span>
        </Row>
        <Row icon="📋" label={t('settings', 'privacyPolicy')}>
          <a href="/privacy" className="btn btn-ghost btn-sm">{t('settings', 'view')}</a>
        </Row>
        <Row icon="📋" label={t('settings', 'termsOfService')}>
          <a href="/terms" className="btn btn-ghost btn-sm">{t('settings', 'view')}</a>
        </Row>
      </Section>

      {/* Account */}
      <Section title={t('settings', 'account')}>
        <button
          onClick={handleSignOut}
          className="btn btn-ghost w-full"
          style={{ color: 'var(--danger)', borderColor: 'rgba(255,71,87,0.3)' }}
        >
          🚪 {t('settings', 'signOut')}
        </button>
        <button
          className="btn btn-ghost w-full text-xs"
          style={{ color: 'var(--text-muted)' }}
          onClick={() => alert('Contact support@medmanage.app to delete your account')}
        >
          {t('settings', 'deleteAccount')}
        </button>
      </Section>
    </div>
  );
}
