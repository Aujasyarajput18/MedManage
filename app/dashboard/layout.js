'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './layout.module.css';

const NAV_ITEMS = [
  { href: '/dashboard',               icon: '🏠', label: 'Home'    },
  { href: '/dashboard/medicines',     icon: '💊', label: 'Meds'    },
  { href: '/dashboard/medicines/add', icon: '➕', label: 'Add', isPrimary: true },
  { href: '/dashboard/calendar',      icon: '📅', label: 'Calendar' },
  { href: '/dashboard/achievements',  icon: '🏆', label: 'Awards'  },
];

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Check demo mode from URL safely on client side
    const demo = typeof window !== 'undefined' && window.location.search.includes('demo=true');
    setIsDemo(demo);

    if (!loading && !user && !demo) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  if (loading && !isDemo) {
    return <div className="page flex items-center justify-center">Loading...</div>;
  }

  // SOS Handler
  const handleSOS = () => {
    // We will implement hold-to-SOS later, this is just a stub
    alert('SOS Triggered! Location sent to emergency contacts.');
  };

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

      {/* Bottom Navigation for Mobile / Side Navigation for Desktop */}
      <nav className={styles.bottomNav}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
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
      </nav>
    </div>
  );
}
