import Icon from '@/components/ui/Icon';
import styles from '../onboarding.module.css';
import PhoneMockup from './PhoneMockup';
import AppSnapshot from './AppSnapshot';
import SpotlightRing from './SpotlightRing';
import CoachTooltip from './CoachTooltip';

const ACTIONS = [
  { label: 'Add Medicine', icon: 'add', tone: 'var(--primary)' },
  { label: 'Check AI', icon: 'nodes', tone: 'var(--warning)' },
  { label: 'SOS', icon: 'sos', tone: 'var(--danger)' },
  { label: 'Journal', icon: 'journal', tone: 'var(--success)' },
];

export default function SlideDashboard({ activeHighlight = 0 }) {
  return (
    <section className={styles.featureSlide}>
      <div className={styles.phoneBand}>
        <div className={styles.mockupCluster}>
          <PhoneMockup>
            <AppSnapshot title="Dashboard" route="/dashboard" activeNav="home">
              <div className={styles.mockScreen}>
              <div className={styles.mockHeader}>
                <div>
                  <p className={styles.mockEyebrow}>/dashboard</p>
                  <h3>Good evening, Asha</h3>
                </div>
                <span className={styles.streakChip}>
                  <Icon name="fire" size={12} color="var(--warning)" />
                  12 day streak
                </span>
              </div>

              <div className={`glass-card ${styles.dashboardHero}`}>
                <div className={styles.dashboardHeroTop}>
                  <div className={styles.mockRingWrap}>
                    <svg className={styles.mockRing} viewBox="0 0 120 120" aria-hidden="true">
                      <circle cx="60" cy="60" r="44" />
                      <circle className={styles.mockRingProgress} cx="60" cy="60" r="44" />
                    </svg>
                    <div className={styles.mockRingLabel}>
                      <strong>82%</strong>
                      <small>today</small>
                    </div>
                  </div>

                  <div className={styles.dashboardHeroSide}>
                    <strong>Upcoming</strong>
                    <small>Metformin at 8:00 PM</small>
                    <span className={styles.heroMiniStat}>4 doses left today</span>
                  </div>
                </div>
              </div>

              <div className={styles.quickGrid}>
                {ACTIONS.map((action) => (
                  <div key={action.label} className={`glass-card ${styles.quickCard}`}>
                    <span className={styles.quickIcon} style={{ background: `${action.tone}22` }}>
                      <Icon name={action.icon} size={14} color={action.tone} />
                    </span>
                    <small>{action.label}</small>
                  </div>
                ))}
                <div className={styles.shimmerSweep} aria-hidden="true" />
              </div>

              <div className={`glass-card ${styles.upcomingCard}`}>
                <div>
                  <strong>Upcoming Reminders</strong>
                  <small>Vitamin D3 · 7:30 AM tomorrow</small>
                </div>
                <span className="badge badge-success">On track</span>
              </div>
              </div>
            </AppSnapshot>
          </PhoneMockup>

          <SpotlightRing active={activeHighlight === 0} delay={0} style={{ top: 134, left: 22, width: 104, height: 104, borderRadius: 999 }} />
          <CoachTooltip active={activeHighlight === 0} position="right" style={{ top: 166, left: 116 }}>
            Today's adherence rate at a glance
          </CoachTooltip>

          <SpotlightRing active={activeHighlight === 1} delay={0.4} style={{ top: 96, right: 12, width: 104, height: 32, borderRadius: 999 }} />
          <CoachTooltip active={activeHighlight === 1} position="bottom" style={{ top: 132, left: 62 }}>
            Your current daily streak - keep it going!
          </CoachTooltip>

          <SpotlightRing active={activeHighlight === 2} delay={0.8} style={{ top: 268, left: 14, width: 212, height: 110, borderRadius: 20 }} />
          <CoachTooltip active={activeHighlight === 2} position="top" style={{ top: 220, left: 46 }}>
            Jump to any feature in one tap
          </CoachTooltip>

          <SpotlightRing active={activeHighlight === 3} delay={1.2} style={{ top: 374, left: 14, width: 212, height: 42, borderRadius: 18 }} />
          <CoachTooltip active={activeHighlight === 3} position="top" style={{ top: 330, left: 34 }}>
            Next dose always visible on your home screen
          </CoachTooltip>
        </div>
      </div>

      <div className={`glass-card ${styles.copyPanel}`}>
        <span className={styles.copyKicker}>Home base</span>
        <h2>Your Health at a Glance</h2>
        <p>Your home screen shows the next dose, today's adherence, your streak, refill risks, and one-tap shortcuts to the most important tools.</p>
        <div className={styles.detailList}>
          <span><Icon name="insights" size={13} /> Adherence analytics</span>
          <span><Icon name="fire" size={13} /> Streaks and points</span>
          <span><Icon name="calendar" size={13} /> Upcoming schedule</span>
        </div>
      </div>
    </section>
  );
}
