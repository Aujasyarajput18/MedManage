'use client';
import { useAuth } from '@/context/AuthContext';
import styles from './analytics.module.css';

const INSIGHTS = [
  { icon: '📅', label: 'Best day of week', value: 'Monday', sub: '98% adherence on Mondays' },
  { icon: '⏰', label: 'Best time of day', value: 'Morning', sub: 'Higher compliance before noon' },
  { icon: '🔥', label: 'Longest streak ever', value: '14 days', sub: 'Keep going!' },
  { icon: '✅', label: 'Total doses taken', value: '147', sub: 'Since you started' },
  { icon: '📉', label: 'Most missed medicine', value: 'Evening dose', sub: 'Set a stronger reminder' },
  { icon: '🏆', label: 'Adherence this month', value: '94%', sub: 'Top 10% of users' },
];

// 30-day adherence heatmap
function Heatmap() {
  const values = Array.from({ length: 30 }, (_, i) => {
    if (i >= 28) return 'pending';
    return Math.random() > 0.15 ? (Math.random() > 0.1 ? 'full' : 'partial') : 'missed';
  });

  const colors = { full: 'var(--success)', partial: 'var(--warning)', missed: 'var(--danger)', pending: 'var(--bg-glass)' };

  return (
    <div className={styles.heatmap}>
      {values.map((v, i) => (
        <div key={i} className={styles.heatCell} style={{ background: colors[v] }} title={`Day ${i + 1}: ${v}`} />
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="flex-col gap-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📊 Insights</h1>
        <p className="page-subtitle">Your 30-day health picture</p>
      </div>

      {/* 30-day heatmap */}
      <div className="glass-card flex-col gap-4">
        <h3 className="font-bold">30-Day Adherence Map</h3>
        <Heatmap />
        <div className="flex gap-4 text-xs text-muted">
          <span style={{ color: 'var(--success)' }}>● All taken</span>
          <span style={{ color: 'var(--warning)' }}>● Partial</span>
          <span style={{ color: 'var(--danger)' }}>● Missed</span>
        </div>
      </div>

      {/* Insights grid */}
      <div className={styles.insightGrid}>
        {INSIGHTS.map((ins) => (
          <div key={ins.label} className="glass-card-sm flex-col gap-1">
            <span style={{ fontSize: '1.4rem' }}>{ins.icon}</span>
            <div className="text-xs text-muted font-bold uppercase">{ins.label}</div>
            <div className="font-bold" style={{ fontSize: '1.1rem', color: 'var(--primary-light)' }}>{ins.value}</div>
            <div className="text-xs text-muted">{ins.sub}</div>
          </div>
        ))}
      </div>

      {/* Per-medicine adherence */}
      <div className="glass-card flex-col gap-4">
        <h3 className="font-bold">By Medicine</h3>
        {[
          { name: 'Metformin',  pct: 98, color: 'var(--success)' },
          { name: 'Aspirin',    pct: 92, color: 'var(--primary)' },
          { name: 'Vitamin D3', pct: 88, color: 'var(--warning)' },
        ].map(m => (
          <div key={m.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-bold">{m.name}</span>
              <span style={{ color: m.color }}>{m.pct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${m.pct}%`, background: m.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
