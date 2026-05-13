'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { LANGUAGES } from '@/lib/translations';
import Icon from '@/components/ui/Icon';
import styles from './onboarding.module.css';
import SlideWelcome from './components/SlideWelcome';
import SlideMedicines from './components/SlideMedicines';
import SlideReminders from './components/SlideReminders';
import SlideAI from './components/SlideAI';
import SlideDashboard from './components/SlideDashboard';
import SlideJournalSOS from './components/SlideJournalSOS';
import SlideGetStarted from './components/SlideGetStarted';

const SLIDES = [
  { id: 'welcome', component: SlideWelcome, highlightCount: 1 },
  { id: 'medicines', component: SlideMedicines, highlightCount: 4 },
  { id: 'reminders', component: SlideReminders, highlightCount: 4 },
  { id: 'ai', component: SlideAI, highlightCount: 6 },
  { id: 'dashboard', component: SlideDashboard, highlightCount: 4 },
  { id: 'journal-sos', component: SlideJournalSOS, highlightCount: 6 },
  { id: 'get-started', component: SlideGetStarted, highlightCount: 1 },
];

function readReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { langCode, setLang } = useLanguage();
  const touchStartX = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState('next');
  const [activeHighlight, setActiveHighlight] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const highlightCount = SLIDES[currentSlide]?.highlightCount || 1;

  useEffect(() => {
    setReducedMotion(readReducedMotion());
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event) => setReducedMotion(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    setActiveHighlight(0);
  }, [currentSlide]);

  useEffect(() => {
    if (reducedMotion || highlightCount <= 1) return undefined;
    const timer = window.setInterval(() => {
      setActiveHighlight((value) => (value + 1) % highlightCount);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [currentSlide, highlightCount, reducedMotion]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') {
        if (currentSlide === SLIDES.length - 1) {
          setCompleteAndRoute('/auth/login');
          return;
        }
        setDirection('next');
        setCurrentSlide((value) => Math.min(value + 1, SLIDES.length - 1));
      }

      if (event.key === 'ArrowLeft') {
        setDirection('prev');
        setCurrentSlide((value) => Math.max(value - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, router]);

  const setCompleteAndRoute = (href) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('medmanage_onboarding_done', 'true');
    }
    router.push(href);
  };

  const goTo = (index) => {
    if (index === currentSlide || index < 0 || index >= SLIDES.length) return;
    setDirection(index > currentSlide ? 'next' : 'prev');
    setCurrentSlide(index);
  };

  const goNext = () => {
    if (currentSlide === SLIDES.length - 1) {
      setCompleteAndRoute('/auth/login');
      return;
    }
    setDirection('next');
    setCurrentSlide((value) => Math.min(value + 1, SLIDES.length - 1));
  };

  const goPrev = () => {
    if (currentSlide === 0) return;
    setDirection('prev');
    setCurrentSlide((value) => Math.max(value - 1, 0));
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0]?.clientX || null;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX || 0;
    const diff = touchStartX.current - endX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  const renderedSlides = useMemo(
    () => new Set([currentSlide - 1, currentSlide, currentSlide + 1].filter((index) => index >= 0 && index < SLIDES.length)),
    [currentSlide]
  );

  return (
    <div
      className={styles.onboardingRoot}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.bgMesh} aria-hidden="true" />
      <div className={styles.bgGlowPrimary} aria-hidden="true" />
      <div className={styles.bgGlowSecondary} aria-hidden="true" />

      <label className={styles.onboardingLanguage}>
        <Icon name="globe" size={16} />
        <select
          value={langCode}
          onChange={(event) => setLang(event.target.value)}
          aria-label="Choose app language"
        >
          {LANGUAGES.map((language) => (
            <option key={language.code} value={language.code}>
              {language.native} · {language.name}
            </option>
          ))}
        </select>
      </label>

      <main className={styles.viewport}>
        <div className={styles.stage} style={{ willChange: reducedMotion ? 'auto' : 'transform' }}>
          {SLIDES.map((slide, index) => {
            const SlideComponent = slide.component;
            const isCurrent = index === currentSlide;
            const shouldRender = renderedSlides.has(index);
            const stateClass = isCurrent
              ? direction === 'prev'
                ? styles.slideCurrentPrev
                : styles.slideCurrentNext
              : index < currentSlide
                ? styles.slideBefore
                : styles.slideAfter;

            return (
              <section
                key={slide.id}
                className={`${styles.slideShell} ${stateClass} ${isCurrent ? styles.slideCurrent : ''}`}
                aria-hidden={!isCurrent}
              >
                {shouldRender ? (
                  <div className={styles.slideFrame}>
                    <SlideComponent
                      activeHighlight={activeHighlight}
                      reducedMotion={reducedMotion}
                      onTryDemo={() => setCompleteAndRoute('/dashboard?demo=true')}
                    />
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </main>

      <div className={styles.bottomBar}>
        <div className={styles.dots}>
          {SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(index)}
              className={`${styles.dot} ${index === currentSlide ? styles.dotActive : ''}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className={styles.actionRow}>
          {currentSlide > 0 ? (
            <button type="button" onClick={goPrev} className="btn btn-ghost" aria-label="Previous slide">
              <span className={styles.arrowBtn}>←</span>
            </button>
          ) : (
            <div className={styles.actionSpacer} aria-hidden="true" />
          )}

          <button type="button" onClick={goNext} className="btn btn-primary">
            {currentSlide === SLIDES.length - 1 ? 'Get Started →' : 'Next →'}
          </button>
        </div>

        {currentSlide < SLIDES.length - 1 ? (
          <button
            type="button"
            className={styles.skipLink}
            onClick={() => setCompleteAndRoute('/auth/login')}
          >
            Skip for now
          </button>
        ) : null}
      </div>
    </div>
  );
}
