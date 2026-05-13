import styles from '../onboarding.module.css';

const POSITIONS = {
  top: styles.tooltipTop,
  right: styles.tooltipRight,
  bottom: styles.tooltipBottom,
  left: styles.tooltipLeft,
};

export default function CoachTooltip({ children, position = 'top', active = false, style = {} }) {
  return (
    <div
      className={`${styles.coachTooltip} ${POSITIONS[position] || styles.tooltipTop} ${active ? styles.tooltipVisible : ''}`}
      style={style}
      aria-hidden={!active}
    >
      {children}
    </div>
  );
}
