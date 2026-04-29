'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import FloatingSOS from '@/components/ui/FloatingSOS';
import styles from './layout.module.css';

const NAV_ITEMS = [
  { href: '/dashboard',               icon: '🏠', label: 'Home'    },
  { href: '/dashboard/medicines',     icon: '💊', label: 'Meds'    },
  { href: '/dashboard/medicines/add', icon: '➕', label: 'Add', isPrimary: true },
  { href: '/dashboard/journal',       icon: '📓', label: 'Journal' },
  { href: '/dashboard/analytics',     icon: '📊', label: 'Insights'},
];

const MORE_ITEMS = [
  { href: '/dashboard/calendar',     icon: '📅', label: 'Calendar'     },
  { href: '/dashboard/achievements', icon: '🏆', label: 'Achievements' },
  { href: '/dashboard/appointments', icon: '🩺', label: 'Appointments' },
  { href: '/dashboard/reminders',    icon: '🔔', label: 'Reminders'    },
  { href: '/dashboard/profiles',     icon: '👨‍👩‍👧', label: 'Profiles'     },
  { href: '/dashboard/sos',          icon: '🆘', label: 'SOS'          },
  { href: '/dashboard/export',       icon: '📄', label: 'Export PDF'   },
  { href: '/dashboard/settings',     icon: '⚙️', label: 'Settings'     },
];

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isDemo, setIsDemo] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const urlDemo   = typeof window !== 'undefined' && window.location.search.includes('demo=true');
    const storeDemo = typeof window !== 'undefined' && localStorage.getItem('demo_active') === 'true';
    const demo = urlDemo || storeDemo;
    setIsDemo(demo);
    if (!loading && !user && !demo) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  // Close more sheet on route change
  useEffect(() => { setShowMore(false); }, [pathname]);

  if (loading && !isDemo) {
    return <div className="page flex items-center justify-center">Loading...</div>;
  }

  const handleSOS = () => router.push('/dashboard/sos');

  return (
    <div className={styles.dashboardWrapper}>
      {/* Top Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>💊</span>
          <span className={styles.logoText}>MedManage</span>
          {isDemo && <span className="badge badge-warning ml-2" style={{ marginLeft: 8 }}>DEMO</span>}
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.sosBtn}
            onClick={handleSOS}
            title="Hold for 3s in emergencies"
          >
            SOS
          </button>
          <Link href="/dashboard/settings" className={styles.avatar}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" />
            ) : (
              <span>{user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'D'}</span>
            )}
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {children}
      </main>

      {/* More Sheet backdrop */}
      {showMore && (
        <div
          onClick={() => setShowMore(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 90, backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* More Sheet */}
      <div style={{
        position: 'fixed',
        bottom: showMore ? 72 : '-300px',
        left: 0, right: 0,
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
        zIndex: 95,
        padding: 'var(--space-5)',
        transition: 'bottom 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          width: 40, height: 4, background: 'var(--border)',
          borderRadius: 2, margin: '0 auto var(--space-5)',
        }} />
        <p className="text-xs text-muted font-bold mb-3">MORE PAGES</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
          {MORE_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setShowMore(false)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 6, padding: 'var(--space-3)',
                background: pathname === item.href ? 'var(--primary)' : 'var(--bg-glass)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: pathname === item.href ? 'white' : 'var(--text-primary)',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className={styles.bottomNav}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          if (item.isPrimary) {
            return (
              <Link key={item.href} href={item.href} className={styles.navItemPrimary}>
                <div className={styles.primaryIconWrap}>
                  {item.icon}
                </div>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setShowMore((v) => !v)}
          className={`${styles.navItem} ${showMore ? styles.active : ''}`}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span className={styles.navIcon}>☰</span>
          <span className={styles.navLabel}>More</span>
        </button>
      </nav>

      <FloatingSOS />
    </div>
  );
}
