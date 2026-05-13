'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { LANGUAGES } from '@/lib/translations';
import FloatingSOS from '@/components/ui/FloatingSOS';
import { startReminderEngine, cancelReminderTimers } from '@/lib/reminderEngine';
import { updateReminder } from '@/lib/reminderStore';
import styles from './layout.module.css';

/* ─── Nav definitions with inline SVG icons (no emojis) ─── */
const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Home',
    transKey: 'home',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/medicines',
    label: 'Medicines',
    transKey: 'meds',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a9.93 9.93 0 0 0 7.07-2.93 10 10 0 0 0-14.14 0A9.93 9.93 0 0 0 12 22z"/>
        <line x1="12" y1="2" x2="12" y2="22"/>
        <path d="M12 2a10 10 0 0 1 10 10"/>
        <path d="M12 2a10 10 0 0 0-10 10"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/medicines/add',
    label: 'Add',
    transKey: 'add',
    isPrimary: true,
    icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/journal',
    label: 'Journal',
    transKey: 'journal',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/analytics',
    label: 'Insights',
    transKey: 'insights',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
];

/* ─── Drawer items (no emojis — use SVG) ─── */
const DRAWER_ITEMS = [
  {
    href: '/dashboard/calendar',
    label: 'Calendar',
    transKey: 'calendar',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/appointments',
    label: 'Appointments',
    transKey: 'appointments',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/reminders',
    label: 'Reminders',
    transKey: 'reminders',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/achievements',
    label: 'Achievements',
    transKey: 'achievements',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7"/>
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/profiles',
    label: 'Family',
    transKey: 'profiles',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/sos',
    label: 'SOS',
    transKey: 'sos',
    isSOS: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/export',
    label: 'Doctor Report',
    transKey: 'exportPdf',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/medicines/identify',
    label: 'Pill Scan',
    transKey: 'identify',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/medicines/interactions',
    label: 'Drug Check',
    transKey: 'interactions',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/>
        <path d="M13 6h3a2 2 0 0 1 2 2v7"/>
        <line x1="6" y1="9" x2="6" y2="21"/>
      </svg>
    ),
  },
  {
    href: '/onboarding',
    label: 'Tutorial',
    transKey: 'tutorial',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    transKey: 'settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const { t, langCode, setLang } = useLanguage();
  const router   = useRouter();
  const pathname = usePathname();
  const [isDemo, setIsDemo]       = useState(false);
  const [drawerOpen, setDrawer]   = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const stopEngineRef             = useRef(null);

  useEffect(() => {
    const urlDemo   = typeof window !== 'undefined' && window.location.search.includes('demo=true');
    const storeDemo = typeof window !== 'undefined' && localStorage.getItem('demo_active') === 'true';
    const demo = urlDemo || storeDemo;
    setIsDemo(demo);
    if (!loading && !user && !demo) router.replace('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (loading) return;
    if (!user || isDemo) {
      setOnboardingChecked(true);
      return;
    }
    const done = typeof window !== 'undefined' && localStorage.getItem('medmanage_onboarding_done') === 'true';
    if (!done) {
      setOnboardingChecked(false);
      router.replace('/onboarding');
      return;
    }
    setOnboardingChecked(true);
  }, [user, loading, isDemo, router]);

  useEffect(() => {
    if (loading) return;
    const userId = user?.uid || (isDemo ? 'demo' : null);
    if (!userId) return;
    stopEngineRef.current = startReminderEngine(userId);
    const pollActions = async () => {
      try {
        const res = await fetch('/api/reminders/action');
        if (!res.ok) return;
        const { actions } = await res.json();
        Object.entries(actions).forEach(([reminderId, { action }]) => {
          if (action === 'taken') {
            cancelReminderTimers(reminderId);
            updateReminder(reminderId, { status: 'taken' });
          } else if (action === 'snooze') {
            cancelReminderTimers(reminderId);
            const newTime = new Date(Date.now() + 10 * 60_000).toISOString();
            updateReminder(reminderId, { status: 'pending', scheduledTime: newTime, retryCount: 0 });
          } else if (action === 'skip') {
            cancelReminderTimers(reminderId);
            updateReminder(reminderId, { status: 'skipped' });
          }
        });
      } catch { /* network failure — ignore */ }
    };
    pollActions();
    const pollInterval = setInterval(pollActions, 30_000);
    return () => {
      if (stopEngineRef.current) stopEngineRef.current();
      clearInterval(pollInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, isDemo]);

  // Close drawer on route change
  useEffect(() => { setDrawer(false); }, [pathname]);

  const showBack = pathname !== '/dashboard';
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/dashboard');
  };

  if (loading && !isDemo) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
          </div>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>Loading MedManage...</p>
        </div>
      </div>
    );
  }

  if (!isDemo && user && !onboardingChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="m5 12 4 4L19 6" />
            </svg>
          </div>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>Preparing your MedManage walkthrough...</p>
        </div>
      </div>
    );
  }

  const userInitial = user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'M';

  return (
    <div className={styles.dashboardWrapper}>

      {/* ── TOP HEADER ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {showBack && (
            <button
              className={styles.backBtn}
              onClick={handleBack}
              aria-label="Go back"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Hamburger → opens side drawer */}
          <button
            className={styles.menuBtn}
            onClick={() => setDrawer(v => !v)}
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={styles.logo}>
          <div className={styles.logoMark}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/></svg>
          </div>
          <span className={styles.logoText}>MedManage</span>
          {isDemo && <span className={styles.demoBadge}>DEMO</span>}
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.sosBtn}
            onClick={() => router.push('/dashboard/sos')}
          >
            SOS
          </button>
          <Link href="/dashboard/settings" className={styles.avatar}>
            {user?.photoURL
              ? <img src={user.photoURL} alt="Profile" />
              : <span>{userInitial}</span>
            }
          </Link>
        </div>
      </header>

      {/* ── SIDE DRAWER BACKDROP ── */}
      <div
        className={`${styles.drawerBackdrop} ${drawerOpen ? styles.drawerBackdropOpen : ''}`}
        onClick={() => setDrawer(false)}
      />

      {/* ── SIDE DRAWER ── */}
      <aside className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}>
        {/* Drawer header */}
        <div className={styles.drawerHeader}>
          <div>
            <p className={styles.drawerName}>{user?.displayName || 'My Account'}</p>
            <p className={styles.drawerEmail}>{user?.email || 'Demo mode'}</p>
          </div>
          <button className={styles.drawerClose} onClick={() => setDrawer(false)} aria-label="Close menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={styles.drawerLanguage}>
          <label htmlFor="drawer-language">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>{t('settings', 'language')}</span>
          </label>
          <select
            id="drawer-language"
            value={langCode}
            onChange={(event) => setLang(event.target.value)}
            aria-label={t('settings', 'language')}
          >
            {LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.native} · {language.name}
              </option>
            ))}
          </select>
        </div>

        {/* Drawer nav */}
        <nav className={styles.drawerNav}>
          {DRAWER_ITEMS.map(item => {
            const isActive = item.href === '/onboarding'
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.drawerItem} ${isActive ? styles.drawerItemActive : ''} ${item.isSOS ? styles.drawerItemSOS : ''}`}
                onClick={() => setDrawer(false)}
              >
                <span className={styles.drawerItemIcon}>{item.icon}</span>
                <span className={styles.drawerItemLabel}>{item.label}</span>
                {isActive && <span className={styles.drawerActiveIndicator} />}
              </Link>
            );
          })}
        </nav>

        <div className={styles.drawerFooter}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>MedManage v1.0 · Free forever</p>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className={styles.mainContent}>
        {children}
      </main>

      {/* ── BOTTOM NAV ── */}
      <nav className={styles.bottomNav}>
        {NAV_ITEMS.map(item => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname === item.href || pathname.startsWith(item.href + '/');

          if (item.isPrimary) {
            return (
              <Link key={item.href} href={item.href} className={styles.navItemPrimary} aria-label="Add medicine">
                <div className={styles.primaryIconWrap}>
                  {item.icon()}
                </div>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              aria-label={item.label}
            >
              <span className={styles.navIcon}>{item.icon(isActive)}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <FloatingSOS />
    </div>
  );
}
