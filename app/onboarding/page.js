'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './onboarding.module.css';

const SLIDES = [
  {
    id: 'welcome',
    emoji: '💊',
    emojiAnim: 'float',
    title: 'Your Health,\nSimplified.',
    sub: 'Never miss a dose again. MedManage keeps you on track — intelligently, simply, for free.',
    gradient: 'linear-gradient(135deg, #0D9488, #14B8A6)',
    glow: 'rgba(13,148,136,0.35)',
  },
  {
    id: 'medicines',
    emoji: '📋',
    emojiAnim: 'float',
    title: 'Add Medicines\nin Seconds.',
    sub: 'Track name, dosage, frequency, and timing. Check interactions from your medicine list anytime.',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
    glow: 'rgba(16,185,129,0.35)',
  },
  {
    id: 'reminders',
    emoji: '🔔',
    emojiAnim: 'bell',
    title: 'Smart Reminders\nEvery Day.',
    sub: 'Create reminders, snooze them, and mark doses taken. Stay consistent and earn rewards.',
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    glow: 'rgba(245,158,11,0.35)',
  },
  {
    id: 'sos',
    emoji: '🆘',
    emojiAnim: 'pulse',
    title: 'Emergency SOS\nin One Hold.',
    sub: 'Hold the SOS button for 3 seconds. Emergency contacts get your location via SMS instantly.',
    gradient: 'linear-gradient(135deg, #DC2626, #B91C1C)',
    glow: 'rgba(220,38,38,0.4)',
  },
  {
    id: 'getstarted',
    emoji: '✅',
    emojiAnim: 'check',
    title: "You're All Set!",
    sub: "Free forever. AI-powered. India's most caring medication app. Let's begin.",
    gradient: 'linear-gradient(135deg, #FB923C, #EA7A22)',
    glow: 'rgba(251,146,60,0.35)',
  },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const [animDir, setAnimDir] = useState('');
  const router   = useRouter();
  const touchStartX = useRef(null);

  const goTo = (idx, dir = 'next') => {
    setAnimDir(dir);
    setTimeout(() => {
      setCurrent(idx);
      setAnimDir('');
    }, 50);
  };

  const next = () => {
    if (current < SLIDES.length - 1) goTo(current + 1, 'next');
    else finish();
  };

  const prev = () => {
    if (current > 0) goTo(current - 1, 'prev');
  };

  const finish = () => {
    localStorage.setItem('medmanage_onboarding_done', 'true');
    router.push('/auth/login');
  };

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd   = (e) => {
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50)       next();
    else if (diff < -50) prev();
    touchStartX.current = null;
  };

  const slide = SLIDES[current];

  return (
    <div
      className={styles.wrapper}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background glow */}
      <div className={styles.bgGlow} style={{ background: slide.glow }} />

      {/* Skip button */}
      {current < SLIDES.length - 1 && (
        <button className={styles.skip} onClick={finish}>
          Skip
        </button>
      )}

      {/* Slide content */}
      <div className={`${styles.slide} ${animDir ? styles[animDir] : ''}`} key={slide.id}>
        {/* Emoji illustration */}
        <div className={`${styles.emojiWrap} ${styles[slide.emojiAnim]}`}>
          {slide.id === 'sos' && (
            <>
              <div className={styles.pulseRing} style={{ animationDelay: '0s' }} />
              <div className={styles.pulseRing} style={{ animationDelay: '0.5s' }} />
              <div className={styles.pulseRing} style={{ animationDelay: '1s' }} />
            </>
          )}
          <div className={styles.emojiCircle} style={{ background: slide.gradient, boxShadow: `0 20px 60px ${slide.glow}` }}>
            <span className={styles.emoji}>{slide.emoji}</span>
          </div>
        </div>

        {/* Text */}
        <div className={styles.textBlock}>
          <h1 className={styles.title} style={{ whiteSpace: 'pre-line' }}>
            {slide.title}
          </h1>
          <p className={styles.sub}>{slide.sub}</p>
        </div>

        {/* Progress dots */}
        <div className={styles.dots}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              onClick={() => goTo(i, i > current ? 'next' : 'prev')}
              style={i === current ? { background: slide.gradient } : {}}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className={styles.actions}>
          {current === SLIDES.length - 1 ? (
            <button className={styles.btnFinish} onClick={finish}>
              Get Started →
            </button>
          ) : (
            <button className={styles.btnNext} onClick={next} style={{ background: slide.gradient }}>
              Next →
            </button>
          )}
        </div>

        {/* Demo mode link */}
        {current === SLIDES.length - 1 && (
          <button
            className={styles.demoLink}
            onClick={() => {
              localStorage.setItem('medmanage_onboarding_done', 'true');
              router.push('/dashboard?demo=true');
            }}
          >
            Try Demo (no sign-up)
          </button>
        )}
      </div>
    </div>
  );
}
