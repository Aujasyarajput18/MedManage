import Icon from '@/components/ui/Icon';
import styles from '../onboarding.module.css';
import PhoneMockup from './PhoneMockup';
import AppSnapshot from './AppSnapshot';
import SpotlightRing from './SpotlightRing';
import CoachTooltip from './CoachTooltip';

const MED_NAMES = ['Metformin', 'Amlodipine', 'Vitamin D3'];

export default function SlideAI({ activeHighlight = 0 }) {
  return (
    <section className={styles.featureSlide}>
      <div className={styles.splitBand}>
        <div className={styles.splitMockups}>
          <div className={styles.dualCluster}>
            <div className={styles.dualPhone}>
              <PhoneMockup mini>
                <AppSnapshot title="Drug Check" route="/interactions" activeNav="meds">
                  <div className={styles.mockScreen}>
                  <div className={styles.miniHeader}>
                    <p>/interactions</p>
                    <h4>AI Drug Checker</h4>
                  </div>
                  <div className={styles.medicineBadgeRow}>
                    {MED_NAMES.map((name) => (
                      <span key={name} className="badge badge-primary">
                        {name}
                      </span>
                    ))}
                  </div>
                  <button type="button" className={styles.mockPrimaryWide}>
                    <Icon name="nodes" size={14} color="white" />
                    Check Interactions
                  </button>
                  <div className={`glass-card ${styles.severityCard}`}>
                    <div className={styles.severityTitle}>
                      <span className={styles.severityDot} />
                      <strong>Overall: Caution</strong>
                    </div>
                    <small>Monitor blood pressure and take with food.</small>
                  </div>
                  </div>
                </AppSnapshot>
              </PhoneMockup>
            </div>

            <div className={styles.dualPhone}>
              <PhoneMockup mini>
                <AppSnapshot title="Pill Scan" route="/identify" activeNav="meds">
                  <div className={styles.mockScreen}>
                  <div className={styles.miniHeader}>
                    <p>/identify</p>
                    <h4>Pill Identifier</h4>
                  </div>
                  <div className={styles.cameraPanel}>
                    <div className={styles.cameraFrame}>
                      <Icon name="camera" size={24} color="rgba(255,255,255,0.9)" />
                    </div>
                    <small>Tap to take photo or upload</small>
                  </div>
                  <div className={`glass-card ${styles.aiResultCard}`}>
                    <strong>Vitamin D3</strong>
                    <small>1000 IU · Vitamin</small>
                    <span className={styles.aiAddLink}>Add to My Medicines</span>
                  </div>
                  </div>
                </AppSnapshot>
              </PhoneMockup>
            </div>

            <SpotlightRing active={activeHighlight === 0} delay={0} style={{ top: 60, left: 8, width: 148, height: 58, borderRadius: 18 }} />
            <CoachTooltip active={activeHighlight === 0} position="bottom" style={{ top: 122, left: 4 }}>
              AI checks all your medicines together
            </CoachTooltip>

            <SpotlightRing active={activeHighlight === 1} delay={0.4} style={{ top: 126, left: 16, width: 132, height: 38, borderRadius: 14 }} />
            <CoachTooltip active={activeHighlight === 1} position="right" style={{ top: 118, left: 152 }}>
              Powered by Google Gemini AI
            </CoachTooltip>

            <SpotlightRing active={activeHighlight === 2} delay={0.8} style={{ top: 174, left: 20, width: 136, height: 62, borderRadius: 18 }} />
            <CoachTooltip active={activeHighlight === 2} position="bottom" style={{ top: 240, left: 16 }}>
              Safe, Caution, or Danger - in seconds
            </CoachTooltip>

            <SpotlightRing active={activeHighlight === 3} delay={1.2} style={{ top: 52, right: 14, width: 144, height: 106, borderRadius: 18 }} />
            <CoachTooltip active={activeHighlight === 3} position="left" style={{ top: 84, right: 160 }}>
              Photograph any pill
            </CoachTooltip>

            <SpotlightRing active={activeHighlight === 4} delay={1.6} style={{ top: 168, right: 16, width: 140, height: 74, borderRadius: 18 }} />
            <CoachTooltip active={activeHighlight === 4} position="bottom" style={{ top: 246, right: 0 }}>
              Name, dosage, and category identified automatically
            </CoachTooltip>

            <SpotlightRing active={activeHighlight === 5} delay={2} className={styles.bounceHighlight} style={{ top: 220, right: 30, width: 110, height: 24, borderRadius: 999 }} />
            <CoachTooltip active={activeHighlight === 5} position="top" style={{ top: 184, right: 18 }}>
              Pre-fills your medicine form instantly
            </CoachTooltip>
          </div>
        </div>
      </div>

      <div className={`glass-card ${styles.copyPanel}`}>
        <span className={styles.copyKicker}>AI features</span>
        <h2>AI That Protects You</h2>
        <p>Scan an unknown pill with the camera, or check all saved medicines together for safe, caution, and danger interaction results.</p>
        <div className={styles.detailList}>
          <span><Icon name="camera" size={13} /> Pill and box scan</span>
          <span><Icon name="nodes" size={13} /> Interaction checker</span>
          <span><Icon name="shield" size={13} /> Safe, caution, danger</span>
        </div>
      </div>
    </section>
  );
}
