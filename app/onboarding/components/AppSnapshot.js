import Icon from '@/components/ui/Icon';
import styles from '../onboarding.module.css';

const NAV = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'meds', label: 'Meds', icon: 'medicines' },
  { key: 'add', label: 'Add', icon: 'add', primary: true },
  { key: 'journal', label: 'Journal', icon: 'journal' },
  { key: 'insights', label: 'Insights', icon: 'insights' },
];

const DRAWER = [
  { label: 'Calendar', icon: 'calendar' },
  { label: 'Appointments', icon: 'hospital' },
  { label: 'Reminders', icon: 'bell' },
  { label: 'Achievements', icon: 'medal' },
  { label: 'Family', icon: 'users' },
  { label: 'SOS', icon: 'sos', danger: true },
  { label: 'Doctor Report', icon: 'file' },
  { label: 'Pill Scan', icon: 'camera' },
  { label: 'Drug Check', icon: 'nodes' },
  { label: 'Settings', icon: 'settings' },
];

export default function AppSnapshot({
  title,
  route,
  activeNav = 'home',
  children,
  menuOpen = false,
  rightSlot,
}) {
  return (
    <div className={styles.snapshotApp}>
      <div className={styles.snapshotTopbar}>
        <button type="button" className={styles.snapshotIconButton} aria-label="Menu">
          <span />
          <span />
          <span />
        </button>
        <div className={styles.snapshotBrand}>
          <span className={styles.snapshotLogo}>
            <Icon name="heart" size={12} color="white" strokeWidth={2.4} />
          </span>
          <strong>MedManage</strong>
        </div>
        <div className={styles.snapshotActions}>
          {rightSlot || <span className={styles.snapshotSOS}>SOS</span>}
          <span className={styles.snapshotAvatar}>a</span>
        </div>
      </div>

      <div className={styles.snapshotContent}>
        <div className={styles.snapshotRoute}>
          <span>{route}</span>
          <strong>{title}</strong>
        </div>
        {children}
      </div>

      <div className={styles.snapshotNav}>
        {NAV.map((item) => (
          <span
            key={item.key}
            className={`${styles.snapshotNavItem} ${activeNav === item.key ? styles.snapshotNavActive : ''} ${item.primary ? styles.snapshotNavPrimary : ''}`}
          >
            <Icon name={item.icon} size={item.primary ? 16 : 13} />
            {!item.primary && <small>{item.label}</small>}
          </span>
        ))}
      </div>

      {menuOpen && (
        <div className={styles.snapshotDrawer}>
          <div className={styles.snapshotDrawerHeader}>
            <div>
              <strong>ansh</strong>
              <small>aujasya.r25564@nst.rishihoo...</small>
            </div>
            <span>
              <Icon name="close" size={16} color="white" />
            </span>
          </div>
          <div className={styles.snapshotLanguageRow}>
            <Icon name="globe" size={14} />
            <span>Language</span>
            <b>English</b>
          </div>
          <div className={styles.snapshotDrawerList}>
            {DRAWER.map((item) => (
              <span key={item.label} className={item.danger ? styles.snapshotDrawerDanger : ''}>
                <Icon name={item.icon} size={15} />
                <b>{item.label}</b>
              </span>
            ))}
          </div>
          <p>MedManage v1.0 · Free forever</p>
        </div>
      )}
    </div>
  );
}
