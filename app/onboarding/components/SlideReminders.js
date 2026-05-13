import Icon from '@/components/ui/Icon';
import styles from '../onboarding.module.css';
import PhoneMockup from './PhoneMockup';
import AppSnapshot from './AppSnapshot';
import SpotlightRing from './SpotlightRing';
import CoachTooltip from './CoachTooltip';

const REMINDERS = [
  { name: 'Metformin', time: 'Today · 8:00 PM', status: 'Pending', tone: 'var(--warning)' },
  { name: 'Vitamin D3', time: 'Tomorrow · 7:30 AM', status: 'Taken', tone: 'var(--success)' },
];

export default function SlideReminders({ activeHighlight = 0 }) {
  return (
    <section className={styles.featureSlide}>
      <div className={styles.phoneBand}>
        <div className={styles.mockupCluster}>
          <PhoneMockup>
            <AppSnapshot title="Reminders" route="/dashboard/reminders" activeNav="home">
              <div className={styles.mockScreen}>
              <div className={styles.mockHeader}>
                <div>
                  <p className={styles.mockEyebrow}>/dashboard/reminders</p>
                  <h3>Reminders</h3>
                </div>
                <span className="badge badge-primary">Offline ready</span>
              </div>

              <div className={`glass-card ${styles.mockFormCard}`}>
                <div className={styles.formCardTitle}>
                  <Icon name="bell" size={14} color="var(--primary-light)" />
                  <span>New Reminder</span>
                </div>
                <div className={styles.mockField}>
                  <label>Medicine Name</label>
                  <span>Metformin 500mg</span>
                </div>
                <div className={styles.mockField}>
                  <label>Date &amp; Time</label>
                  <span>14 May, 8:00 PM</span>
                </div>
                <button type="button" className={styles.mockPrimaryWide}>Add Reminder</button>
              </div>

              <div className={styles.mockStack}>
                {REMINDERS.map((item) => (
                  <div key={item.name} className={`glass-card ${styles.reminderMockCard}`}>
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.time}</small>
                    </div>
                    <span className={styles.statusBadge} style={{ '--status-tone': item.tone }}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.mockModal}>
                <div className={styles.modalIcon}>
                  <Icon name="bell" size={16} color="white" />
                </div>
                <div className={styles.modalCopy}>
                  <strong>Medication Reminder</strong>
                  <small>Metformin 500mg is due now.</small>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.modalActionTaken}>Taken</button>
                  <button type="button" className={styles.modalActionSnooze}>Snooze</button>
                  <button type="button" className={styles.modalActionSkip}>Skip</button>
                </div>
              </div>
              </div>
            </AppSnapshot>
          </PhoneMockup>

          <SpotlightRing active={activeHighlight === 0} delay={0} style={{ top: 136, left: 14, width: 212, height: 128, borderRadius: 18 }} />
          <CoachTooltip active={activeHighlight === 0} position="bottom" style={{ top: 268, left: 44 }}>
            Schedule reminders for any date &amp; time
          </CoachTooltip>

          <SpotlightRing active={activeHighlight === 1} delay={0.4} style={{ top: 274, left: 32, width: 176, height: 112, borderRadius: 22 }} />
          <CoachTooltip active={activeHighlight === 1} position="top" style={{ top: 222, left: 42 }}>
            In-app alerts fire at the exact time - no internet needed
          </CoachTooltip>

          <SpotlightRing active={activeHighlight === 2} delay={0.8} className={styles.bounceHighlight} style={{ top: 350, left: 92, width: 60, height: 30, borderRadius: 12 }} />
          <CoachTooltip active={activeHighlight === 2} position="top" style={{ top: 306, left: 54 }}>
            Snooze for 10 minutes if you're busy
          </CoachTooltip>

          <SpotlightRing active={activeHighlight === 3} delay={1.2} style={{ top: 246, right: 14, width: 80, height: 82, borderRadius: 18 }} />
          <CoachTooltip active={activeHighlight === 3} position="top" style={{ top: 202, left: 74 }}>
            Color-coded status for every reminder
          </CoachTooltip>
        </div>
      </div>

      <div className={`glass-card ${styles.copyPanel}`}>
        <span className={styles.copyKicker}>Smart reminders</span>
        <h2>Never Miss a Dose</h2>
        <p>Create reminders for exact dates and times. When a dose is due, MedManage shows Taken, Snooze, and Skip actions immediately.</p>
        <div className={styles.detailList}>
          <span><Icon name="clock" size={13} /> Exact date and time</span>
          <span><Icon name="snooze" size={13} /> Snooze or skip</span>
          <span><Icon name="bell" size={13} /> Push support</span>
        </div>
      </div>
    </section>
  );
}
