'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile } from '@/lib/firestore';
import { isDemoMode } from '@/lib/demo';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';

const BADGES = [
  { id: 'first_dose',    icon: 'sparkle',   title: 'First Dose',       desc: 'Logged your very first dose',           color: '#10B981', unlocked: true  },
  { id: 'week_streak',   icon: 'fire',       title: '7-Day Streak',     desc: 'Took all doses for 7 days straight',    color: '#F59E0B', unlocked: true  },
  { id: 'month_master',  icon: 'trophy',     title: 'Month Master',     desc: 'Perfect adherence for 30 days',         color: '#8B5CF6', unlocked: false },
  { id: 'med_detective', icon: 'microscope', title: 'Med Detective',    desc: 'Ran your first drug interaction check', color: '#3B82F6', unlocked: true  },
  { id: 'journal_star',  icon: 'book',       title: 'Journal Star',     desc: 'Logged 7 health journal entries',       color: '#EC4899', unlocked: false },
  { id: 'pill_spotter',  icon: 'camera',     title: 'Pill Spotter',     desc: 'Used AI to identify a pill',            color: '#0D9488', unlocked: true  },
  { id: 'care_giver',    icon: 'users',      title: 'Care Giver',       desc: 'Added a family member profile',         color: '#FB923C', unlocked: false },
  { id: 'sos_ready',     icon: 'sos',        title: 'SOS Ready',        desc: 'Set up emergency contacts',             color: '#DC2626', unlocked: true  },
  { id: 'consistent',    icon: 'gem',        title: 'Consistent',       desc: '30-day streak — legendary!',            color: '#6366F1', unlocked: false },
];

const LEVELS = [
  { min: 0,    label: 'Beginner',    next: 100  },
  { min: 100,  label: 'Consistent',  next: 300  },
  { min: 300,  label: 'Committed',   next: 600  },
  { min: 600,  label: 'Champion',    next: 1000 },
  { min: 1000, label: 'Legend',      next: null },
];

export default function AchievementsPage() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(14);
  const [points, setPoints] = useState(340);
  const [tab, setTab]       = useState('badges');

  const level     = LEVELS.reduce((acc, l) => points >= l.min ? l : acc, LEVELS[0]);
  const nextLevel = LEVELS.find(l => l.min > points);
  const progress  = nextLevel ? Math.round(((points - level.min) / (nextLevel.min - level.min)) * 100) : 100;
  const unlocked  = BADGES.filter(b => b.unlocked);

  useEffect(() => {
    if (!user || isDemoMode()) return;
    getUserProfile(user.uid).then(p => {
      if (p?.streak) setStreak(p.streak);
      if (p?.points) setPoints(p.points);
    });
  }, [user]);

  return (
    <div className="flex-col gap-5 animate-fade-in">
      <div>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="trophy" size={24} color="var(--primary)" /> Achievements
        </h1>
        <p className="page-subtitle">Your health milestones</p>
      </div>

      {/* Level card */}
      <div style={{ background: 'linear-gradient(135deg, #0D9488, #0A7A70)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', color: 'white' }}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>CURRENT LEVEL</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Nunito,sans-serif' }}>{level.label}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900 }}>{points}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>total points</p>
          </div>
        </div>
        {nextLevel && (
          <>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'white', borderRadius: 'var(--radius-full)', transition: 'width 0.8s ease' }} />
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
              {nextLevel.min - points} pts to {LEVELS[LEVELS.indexOf(level) + 1]?.label}
            </p>
          </>
        )}
      </div>

      {/* Stats row */}
      <div className="flex gap-3">
        <div className="glass-card flex-col items-center gap-1" style={{ flex: 1, padding: 'var(--space-4)', textAlign: 'center' }}>
          <Icon name="fire" size={32} color="#F59E0B" />
          <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent)', fontFamily: 'Nunito,sans-serif' }}>{streak}</span>
          <span className="text-xs text-muted font-bold">Day Streak</span>
        </div>
        <div className="glass-card flex-col items-center gap-1" style={{ flex: 1, padding: 'var(--space-4)', textAlign: 'center' }}>
          <Icon name="medal" size={32} color="var(--primary)" />
          <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'Nunito,sans-serif' }}>{unlocked.length}</span>
          <span className="text-xs text-muted font-bold">Badges Earned</span>
        </div>
        <div className="glass-card flex-col items-center gap-1" style={{ flex: 1, padding: 'var(--space-4)', textAlign: 'center' }}>
          <Icon name="sparkle" size={32} color="#8B5CF6" />
          <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#8B5CF6', fontFamily: 'Nunito,sans-serif' }}>{BADGES.length - unlocked.length}</span>
          <span className="text-xs text-muted font-bold">Remaining</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, background: 'var(--border)', borderRadius: 'var(--radius-md)', padding: 4 }}>
        {['badges', 'history'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px', border: 'none', borderRadius: 'var(--radius-sm)',
            background: tab === t ? 'white' : 'transparent',
            color: tab === t ? 'var(--primary)' : 'var(--text-muted)',
            fontFamily: 'Nunito,sans-serif', fontWeight: 700, fontSize: '0.875rem',
            cursor: 'pointer', boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.18s ease',
          }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'badges' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {BADGES.map(badge => (
            <div key={badge.id} className="glass-card-sm flex-col items-center gap-2 text-center" style={{
              padding: 'var(--space-3)',
              opacity: badge.unlocked ? 1 : 0.45,
              filter: badge.unlocked ? 'none' : 'grayscale(1)',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: badge.unlocked ? `${badge.color}18` : 'var(--border)',
                border: badge.unlocked ? `2px solid ${badge.color}40` : '2px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={badge.icon} size={24} color={badge.unlocked ? badge.color : 'var(--text-muted)'} />
              </div>
              <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{badge.title}</p>
              <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{badge.desc}</p>
              {badge.unlocked && (
                <span style={{ background: `${badge.color}18`, color: badge.color, borderRadius: 'var(--radius-full)', padding: '2px 8px', fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Icon name="check" size={10} color={badge.color} /> Earned
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'history' && (
        <div className="flex-col gap-3">
          {[
            { date: 'Today',      event: 'Took all morning medicines', pts: 10 },
            { date: 'Yesterday',  event: '7-day streak reached!',      pts: 50 },
            { date: '2 days ago', event: 'Logged journal entry',       pts: 5  },
            { date: '3 days ago', event: 'AI Pill identified',         pts: 15 },
            { date: '4 days ago', event: 'Took all medicines',         pts: 10 },
          ].map((h, i) => (
            <div key={i} className="glass-card-sm flex justify-between items-center" style={{ padding: 'var(--space-3) var(--space-4)' }}>
              <div>
                <p className="text-sm font-bold" style={{ margin: 0 }}>{h.event}</p>
                <p className="text-xs text-muted" style={{ margin: 0 }}>{h.date}</p>
              </div>
              <span style={{ background: 'rgba(13,148,136,0.12)', color: 'var(--primary)', borderRadius: 'var(--radius-full)', padding: '4px 10px', fontSize: '0.78rem', fontWeight: 700 }}>+{h.pts} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
