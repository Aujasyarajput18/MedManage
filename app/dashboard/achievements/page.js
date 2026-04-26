'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, unlockBadge } from '@/lib/firestore';
import styles from './achievements.module.css';

const ALL_BADGES = [
  { id: 'first_week',      icon: '🔥', title: '7-Day Streak',     desc: 'Take your medicines for 7 days straight',        req: 'streak >= 7' },
  { id: 'month_master',    icon: '🏆', title: 'Month Master',      desc: '30-day streak — incredible dedication!',          req: 'streak >= 30' },
  { id: 'health_champion', icon: '⚡', title: 'Health Champion',   desc: '100-day streak — you\'re unstoppable',            req: 'streak >= 100' },
  { id: 'perfect_day',     icon: '✅', title: 'Perfect Day',       desc: 'All doses taken on time for a full day',          req: 'perfect_day' },
  { id: 'family_guardian', icon: '🤝', title: 'Family Guardian',   desc: 'Added a caregiver to your account',               req: 'caregiver' },
  { id: 'safety_first',    icon: '🆘', title: 'Safety First',      desc: 'Set up your SOS emergency contacts',              req: 'sos_contacts' },
  { id: 'ai_explorer',     icon: '🤖', title: 'AI Explorer',       desc: 'Used the AI drug interaction checker',            req: 'ai_check' },
  { id: 'health_tracker',  icon: '📊', title: 'Health Tracker',    desc: 'Added 10 entries to your health journal',         req: 'journal >= 10' },
];

// Demo: some badges unlocked
const DEMO_UNLOCKED = {
  first_week:   { unlockedAt: new Date('2026-04-19') },
  perfect_day:  { unlockedAt: new Date('2026-04-24') },
  safety_first: { unlockedAt: new Date('2026-04-20') },
  ai_explorer:  { unlockedAt: new Date('2026-04-25') },
};

function PointsCounter({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const step = Math.ceil(value / 50);
    let cur = 0;
    const timer = setInterval(() => {
      cur = Math.min(cur + step, value);
      setDisplay(cur);
      if (cur >= value) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
}

export default function AchievementsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [badges, setBadges]   = useState(DEMO_UNLOCKED);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((p) => {
      if (p) {
        setProfile(p);
        setBadges(p.badges || DEMO_UNLOCKED);
      }
    });
  }, [user]);

  const streak = profile?.streak ?? 14;
  const points = profile?.points ?? 1250;
  const unlockedCount = Object.keys(badges).length;

  return (
    <div className="flex-col gap-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🏆 Achievements</h1>
        <p className="page-subtitle">{unlockedCount} of {ALL_BADGES.length} badges unlocked</p>
      </div>

      {/* Streak + Points hero */}
      <div className={styles.heroGrid}>
        <div className="glass-card text-center">
          <div className={`${styles.heroValue} animate-float`}>🔥 {streak}</div>
          <div className="text-sm text-muted mt-2">Day Streak</div>
          <div className={styles.heroSub}>
            {streak >= 30 ? 'Month Master 🏆' : streak >= 7 ? 'On fire! Keep going' : `${7 - streak} days to first badge`}
          </div>
        </div>
        <div className="glass-card text-center">
          <div className={styles.heroValue} style={{ color: 'var(--primary)' }}>
            💎 <PointsCounter value={points} />
          </div>
          <div className="text-sm text-muted mt-2">Total Points</div>
          <div className={styles.heroSub}>+10 per dose on time</div>
        </div>
      </div>

      {/* Progress to next badge */}
      {streak < 7 && (
        <div className="glass-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold">Next: 7-Day Streak 🔥</span>
            <span className="text-sm text-primary">{streak}/7</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(streak / 7) * 100}%` }} />
          </div>
          <p className="text-xs text-muted mt-2">{7 - streak} more days to unlock</p>
        </div>
      )}

      {streak >= 7 && streak < 30 && (
        <div className="glass-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold">Next: Month Master 🏆</span>
            <span className="text-sm text-primary">{streak}/30</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(streak / 30) * 100}%` }} />
          </div>
          <p className="text-xs text-muted mt-2">{30 - streak} more days to unlock</p>
        </div>
      )}

      {/* Badge grid */}
      <div>
        <h2 className="font-bold mb-4">All Badges</h2>
        <div className={styles.badgeGrid}>
          {ALL_BADGES.map((badge) => {
            const unlocked = !!badges[badge.id];
            const unlockedDate = unlocked ? badges[badge.id]?.unlockedAt : null;
            return (
              <div
                key={badge.id}
                className={`${styles.badgeCard} ${unlocked ? styles.unlocked : styles.locked}`}
              >
                <div className={styles.badgeIcon}>
                  {unlocked ? badge.icon : '🔒'}
                </div>
                <div className={styles.badgeTitle}>{badge.title}</div>
                <div className={styles.badgeDesc}>{badge.desc}</div>
                {unlocked && unlockedDate && (
                  <div className={styles.badgeDate}>
                    ✓ {new Date(unlockedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Points breakdown */}
      <div className="glass-card flex-col gap-3">
        <h3 className="font-bold">How to earn points</h3>
        {[
          ['✅', 'Take a dose on time', '+10 pts'],
          ['🔥', 'Daily streak bonus', '+5 pts/day'],
          ['📝', 'Health journal entry', '+5 pts'],
          ['🏆', 'Unlock a badge', '+50 pts'],
          ['🆘', 'Set up SOS contacts', '+20 pts'],
        ].map(([icon, label, pts]) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '1.2rem' }}>{icon}</span>
              <span className="text-sm text-secondary">{label}</span>
            </div>
            <span className="badge badge-primary text-xs">{pts}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
