import Icon from '@/components/ui/Icon';
import styles from '../onboarding.module.css';
import PhoneMockup from './PhoneMockup';
import AppSnapshot from './AppSnapshot';
import SpotlightRing from './SpotlightRing';
import CoachTooltip from './CoachTooltip';

const MEDICINES = [
  { name: 'Metformin', dosage: '500 mg', category: 'Chronic', pills: 6, total: 30, time: '08:00', tone: 'var(--primary)' },
  { name: 'Vitamin D3', dosage: '1 tablet', category: 'Vitamin', pills: 18, total: 20, time: '13:00', tone: 'var(--success)' },
  { name: 'Amlodipine', dosage: '5 mg', category: 'Chronic', pills: 11, total: 15, time: '21:00', tone: 'var(--warning)' },
];

export default function SlideMedicines({ activeHighlight = 0 }) {
  return (
    <section className={styles.featureSlide}>
      <div className={styles.phoneBand}>
        <div className={styles.mockupCluster}>
          <PhoneMockup>
            <AppSnapshot title="My Medicines" route="/dashboard/medicines" activeNav="meds">
              <div className={styles.mockScreen}>
              <div className={styles.mockHeader}>
                <div>
                  <p className={styles.mockEyebrow}>/dashboard/medicines</p>
                  <h3>My Medicines</h3>
                </div>
                <button type="button" className={styles.mockAddButton}>
                  <Icon name="add" size={14} color="white" />
                  Add
                </button>
              </div>

              <div className={styles.mockStack}>
                {MEDICINES.map((medicine, index) => {
                  const refillPercent = (medicine.pills / medicine.total) * 100;
                  const refillLow = index === 0;
                  return (
                    <div key={medicine.name} className={`glass-card ${styles.medMockCard}`}>
                      <div className={styles.medMockTop}>
                        <div className={styles.medMockIdentity}>
                          <span className={styles.medMockGlyph} style={{ background: `${medicine.tone}22`, color: medicine.tone }}>
                            <Icon name="pill" size={14} color={medicine.tone} />
                          </span>
                          <div>
                            <strong>{medicine.name}</strong>
                            <small>{medicine.dosage}</small>
                          </div>
                        </div>
                        <span className="badge badge-primary">{medicine.category}</span>
                      </div>

                      <div className={styles.medDoseRow}>
                        <span>{medicine.time}</span>
                        <div className={styles.medDoseActions}>
                          <button type="button" className={styles.mockTakenButton}>
                            <Icon name="check" size={11} color="white" />
                            Taken
                          </button>
                          <button type="button" className={styles.mockSkipButton}>Skip</button>
                        </div>
                      </div>

                      {index === 0 ? (
                        <div className={styles.refillStrip}>
                          <div className={styles.refillMeta}>
                            <span>Refill tracker</span>
                            <span>{medicine.pills} left</span>
                          </div>
                          <div className="progress-bar">
                            <div className={styles.mockProgressFill} style={{ width: `${refillPercent}%` }} />
                          </div>
                          {refillLow ? <div className={styles.barShimmer} aria-hidden="true" /> : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              </div>
            </AppSnapshot>
          </PhoneMockup>

          <SpotlightRing active={activeHighlight === 0} delay={0} style={{ top: 92, right: 12, width: 78, height: 42, borderRadius: 14 }} />
          <CoachTooltip active={activeHighlight === 0} position="bottom" style={{ top: 138, left: 76 }}>
            Add any medicine in under 10 seconds
          </CoachTooltip>

          <SpotlightRing active={activeHighlight === 1} delay={0.4} style={{ top: 178, right: 18, width: 72, height: 28, borderRadius: 999 }} />
          <CoachTooltip active={activeHighlight === 1} position="bottom" style={{ top: 210, left: 54 }}>
            Auto-categorized: Chronic, Acute, Vitamin, Ayurvedic
          </CoachTooltip>

          <SpotlightRing active={activeHighlight === 2} delay={0.8} style={{ top: 266, left: 18, width: 186, height: 42, borderRadius: 14 }} />
          <CoachTooltip active={activeHighlight === 2} position="top" style={{ top: 218, left: 38 }}>
            Refill alerts when &lt; 7 pills remain
          </CoachTooltip>

          <SpotlightRing active={activeHighlight === 3} delay={1.2} className={styles.bounceHighlight} style={{ top: 226, left: 118, width: 78, height: 30, borderRadius: 12 }} />
          <CoachTooltip active={activeHighlight === 3} position="bottom" style={{ top: 260, left: 76 }}>
            One tap to log your dose
          </CoachTooltip>
        </div>
      </div>

      <div className={`glass-card ${styles.copyPanel}`}>
        <span className={styles.copyKicker}>Core tracking</span>
        <h2>Track Every Medicine</h2>
        <p>Add a medicine name, dose, schedule, and pill count. Then tap Taken or Skip each time and get refill alerts before stock runs out.</p>
        <div className={styles.detailList}>
          <span><Icon name="pill" size={13} /> Dosage and timings</span>
          <span><Icon name="warning" size={13} /> Refill alerts</span>
          <span><Icon name="check" size={13} /> Dose history</span>
        </div>
      </div>
    </section>
  );
}
