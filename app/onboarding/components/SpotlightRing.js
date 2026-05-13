import styles from '../onboarding.module.css';

export default function SpotlightRing({ active = false, delay = 0, style = {}, className = '' }) {
  return (
    <div
      className={`${styles.spotlightRing} ${active ? styles.spotlightActive : ''} ${className}`}
      style={{ animationDelay: `${delay}s`, ...style }}
      aria-hidden="true"
    />
  );
}
