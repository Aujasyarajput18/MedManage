import Icon from '@/components/ui/Icon';
import styles from '../onboarding.module.css';
import PhoneMockup from './PhoneMockup';
import AppSnapshot from './AppSnapshot';

const FEATURES = ['Medicines', 'Reminders', 'AI Safety', 'SOS', 'Reports', '12 Languages'];

const WHAT_IT_DOES = [
  { icon: 'pill', label: 'Track medicines, dosage, timing, and refills' },
  { icon: 'bell', label: 'Remind you exactly when a dose is due' },
  { icon: 'shield', label: 'Use AI to identify pills and check safety' },
  { icon: 'sos', label: 'Send SOS location alerts to emergency contacts' },
];

export default function SlideWelcome() {
  return (
    <section className={styles.heroSlide}>
      <div className={styles.welcomePhonePreview}>
        <PhoneMockup>
          <AppSnapshot title="Dashboard" route="/dashboard" activeNav="home" menuOpen>
            <div className={styles.welcomeSnapshotContent}>
              <div className={`glass-card ${styles.welcomeScoreCard}`}>
                <strong>170 pts</strong>
                <small>Today adherence · caregiver ready</small>
              </div>
              <div className={styles.welcomeMiniCards}>
                <span><Icon name="pill" size={14} /> Medicines</span>
                <span><Icon name="bell" size={14} /> Reminders</span>
                <span><Icon name="sos" size={14} /> SOS</span>
              </div>
            </div>
          </AppSnapshot>
        </PhoneMockup>
      </div>

      <div className={styles.heroCopy}>
        <span className={styles.heroEyebrow}>MedManage</span>
        <h1>Your Health, Simplified.</h1>
        <p>MedManage is a medicine care app that helps you remember doses, track refills, check safety with AI, record health notes, and send SOS alerts.</p>
      </div>

      <div className={styles.whatAppDoes}>
        {WHAT_IT_DOES.map((item) => (
          <span key={item.label}>
            <Icon name={item.icon} size={14} />
            {item.label}
          </span>
        ))}
      </div>

      <div className={styles.featurePills}>
        {FEATURES.map((feature) => (
          <span key={feature} className="badge badge-primary">
            {feature}
          </span>
        ))}
      </div>
    </section>
  );
}
