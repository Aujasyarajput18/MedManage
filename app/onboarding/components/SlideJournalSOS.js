import Icon from '@/components/ui/Icon';
import styles from '../onboarding.module.css';
import PhoneMockup from './PhoneMockup';
import AppSnapshot from './AppSnapshot';
import SpotlightRing from './SpotlightRing';
import CoachTooltip from './CoachTooltip';

const MOODS = ['mood_bad', 'mood_low', 'mood_ok', 'mood_good', 'mood_great'];

export default function SlideJournalSOS({ activeHighlight = 0 }) {
  return (
    <section className={styles.featureSlide}>
      <div className={styles.phoneBand}>
        <div className={styles.mockupCluster}>
          <PhoneMockup>
            <AppSnapshot title="Care & SOS" route="/dashboard/sos" activeNav="journal">
              <div className={styles.mockScreen}>
                <div className={styles.careSnapshotGrid}>
                  <div className={`glass-card ${styles.journalSnapshotCard}`}>
                    <div className={styles.snapshotSectionTitle}>
                      <Icon name="journal" size={14} color="var(--primary)" />
                      <strong>Health Journal</strong>
                    </div>
                    <div className={styles.moodRow}>
                      {MOODS.map((mood, index) => (
                        <button key={mood} type="button" className={`${styles.moodButton} ${index === 3 ? styles.moodButtonActive : ''}`}>
                          <Icon name={mood} size={16} color={index === 3 ? 'var(--primary)' : 'var(--text-muted)'} />
                        </button>
                      ))}
                    </div>
                    <div className={styles.vitalsGrid}>
                      {['BP 120/80', 'Glucose 96', '68 kg'].map((item) => (
                        <div key={item} className={`glass-card ${styles.vitalCard}`}>
                          <small>{item}</small>
                        </div>
                      ))}
                    </div>
                    <p className={styles.recentEntryLine}>Recent: Good mood, no headache, all doses taken.</p>
                  </div>

                  <div className={`glass-card ${styles.sosSnapshotCard}`}>
                    <div className={styles.sosHero}>
                      <div className={styles.sosPulseA} />
                      <div className={styles.sosPulseB} />
                      <button type="button" className={styles.sosHoldButton}>
                        <Icon name="sos" size={24} color="white" />
                      </button>
                      <small>Hold 3 seconds to send GPS + SMS</small>
                    </div>
                  </div>

                  <div className={styles.careBottomGrid}>
                    <div className={`glass-card ${styles.contactsCard}`}>
                      <strong>Emergency Contacts</strong>
                      <div className={styles.contactList}>
                        <span><b>Mom</b><small>+91 98xxxx1245</small></span>
                        <span><b>Caregiver</b><small>+91 99xxxx8472</small></span>
                      </div>
                    </div>
                    <div className={styles.careMiniStack}>
                      <span className={styles.gpsBadge}>
                        <Icon name="location" size={12} color="var(--success)" />
                        GPS shared
                      </span>
                      <span className={styles.reportBadge}>
                        <Icon name="file" size={12} />
                        Doctor PDF
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </AppSnapshot>
          </PhoneMockup>

          <SpotlightRing active={activeHighlight === 0} delay={0} style={{ top: 112, left: 20, width: 200, height: 42, borderRadius: 999 }} />
          <CoachTooltip active={activeHighlight === 0} position="bottom" style={{ top: 156, left: 42 }}>
            Pick your mood daily
          </CoachTooltip>

          <SpotlightRing active={activeHighlight === 1} delay={0.4} style={{ top: 158, left: 16, width: 210, height: 52, borderRadius: 18 }} />
          <CoachTooltip active={activeHighlight === 1} position="bottom" style={{ top: 212, left: 44 }}>
            Log BP, glucose, and weight
          </CoachTooltip>

          <SpotlightRing active={activeHighlight === 2} delay={0.8} style={{ top: 224, left: 58, width: 124, height: 124, borderRadius: 999 }} />
          <CoachTooltip active={activeHighlight === 2} position="top" style={{ top: 178, left: 50 }}>
            Hold 3 seconds to send SOS
          </CoachTooltip>

          <SpotlightRing active={activeHighlight === 3} delay={1.2} style={{ top: 342, left: 14, width: 138, height: 58, borderRadius: 18 }} />
          <CoachTooltip active={activeHighlight === 3} position="top" style={{ top: 296, left: 28 }}>
            Add family or caregivers
          </CoachTooltip>

          <SpotlightRing active={activeHighlight === 4} delay={1.6} style={{ top: 342, right: 14, width: 72, height: 26, borderRadius: 999 }} />
          <CoachTooltip active={activeHighlight === 4} position="top" style={{ top: 296, left: 84 }}>
            GPS location is shared automatically
          </CoachTooltip>

          <SpotlightRing active={activeHighlight === 5} delay={2} style={{ top: 374, right: 14, width: 76, height: 26, borderRadius: 999 }} />
          <CoachTooltip active={activeHighlight === 5} position="top" style={{ top: 326, left: 84 }}>
            Export doctor-ready reports
          </CoachTooltip>
        </div>
      </div>

      <div className={`glass-card ${styles.copyPanel}`}>
        <span className={styles.copyKicker}>Daily care + emergency support</span>
        <h2>Journal, Reports & SOS</h2>
        <p>Log BP, glucose, weight, mood, symptoms, and notes. In an emergency, hold SOS to share your GPS location with saved contacts.</p>
        <div className={styles.detailList}>
          <span><Icon name="blooddrop" size={13} /> BP, glucose, weight</span>
          <span><Icon name="users" size={13} /> Family profiles</span>
          <span><Icon name="calendar" size={13} /> Doctor appointments</span>
          <span><Icon name="sos" size={13} /> Emergency GPS SMS</span>
          <span><Icon name="file" size={13} /> Doctor reports</span>
        </div>
      </div>
    </section>
  );
}
