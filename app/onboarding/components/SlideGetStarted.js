import Icon from '@/components/ui/Icon';
import styles from '../onboarding.module.css';

const RECAP = [
  { label: 'Medicines', icon: 'pill' },
  { label: 'Reminders', icon: 'bell' },
  { label: 'AI Safety', icon: 'shield' },
  { label: 'Analytics', icon: 'insights' },
  { label: 'Journal', icon: 'journal' },
  { label: 'SOS', icon: 'sos' },
  { label: 'Family', icon: 'users' },
  { label: 'Reports', icon: 'file' },
  { label: 'Appointments', icon: 'hospital' },
  { label: 'Languages', icon: 'globe' },
];

export default function SlideGetStarted({ onTryDemo }) {
  return (
    <section className={styles.finalSlide}>
      <div className={styles.confettiField} aria-hidden="true">
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={index} style={{ animationDelay: `${index * 0.12}s` }} />
        ))}
      </div>

      <div className={styles.finalCheckWrap}>
        <svg className={styles.finalCheck} viewBox="0 0 84 84" aria-hidden="true">
          <circle cx="42" cy="42" r="34" />
          <path d="M25 43.5 36.5 55 59 31.5" />
        </svg>
      </div>

      <div className={styles.finalCopy}>
        <span className={styles.copyKicker}>You're all set</span>
        <h1>Welcome to MedManage</h1>
        <p>You can now track medicines, receive reminders, use AI safety tools, log health updates, export reports, manage family care, and trigger SOS.</p>
      </div>

      <div className={styles.recapGrid}>
        {RECAP.map((item) => (
          <div key={item.label} className={`glass-card ${styles.recapCard}`}>
            <span className={styles.recapIcon}>
              <Icon name={item.icon} size={16} color="var(--primary-light)" />
            </span>
            <small>{item.label}</small>
          </div>
        ))}
      </div>

      <button type="button" className={styles.demoCta} onClick={onTryDemo}>
        Try Demo - No Sign Up
      </button>

      <p className={styles.finalNote}>Free forever · No credit card · Works offline</p>
    </section>
  );
}
