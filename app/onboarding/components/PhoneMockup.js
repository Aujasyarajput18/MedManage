import styles from '../onboarding.module.css';

export default function PhoneMockup({ children, mini = false, className = '' }) {
  return (
    <div className={`${styles.phoneShellWrap} ${mini ? styles.phoneShellWrapMini : ''} ${className}`}>
      <div className={`${styles.phoneShell} ${mini ? styles.phoneShellMini : ''}`}>
        <div className={styles.phoneButtons} aria-hidden="true" />
        <div className={styles.phoneIsland} aria-hidden="true" />

        <div className={styles.phoneStatusBar} aria-hidden="true">
          <span>9:41</span>
          <div className={styles.phoneStatusIcons}>
            <span className={styles.signalBars}>
              <i />
              <i />
              <i />
            </span>
            <span className={styles.wifiGlyph} />
            <span className={styles.batteryGlyph}>
              <b />
            </span>
          </div>
        </div>

        <div className={styles.phoneViewport}>{children}</div>

        <div className={styles.homeIndicator} aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
