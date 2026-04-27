'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './calendar.module.css';

// Demo data for guest mode
const DEMO_DATA = {};
const today = new Date();
for (let i = 0; i < 30; i++) {
  const d = new Date(today);
  d.setDate(today.getDate() - i);
  const key = d.toISOString().split('T')[0];
  const rand = Math.random();
  DEMO_DATA[key] = rand > 0.85 ? 'missed' : rand > 0.65 ? 'partial' : 'taken';
}

export default function CalendarPage() {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [adherenceMap, setAdherenceMap] = useState(DEMO_DATA);

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentMonth.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const getStatus = (day) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return adherenceMap[key] || null;
  };

  const colorFor = (status) => {
    if (status === 'taken')   return styles.taken;
    if (status === 'partial') return styles.partial;
    if (status === 'missed')  return styles.missed;
    return '';
  };

  const labelFor = (status) => {
    if (status === 'taken')   return '✅ All doses taken';
    if (status === 'partial') return '⚠️ Some doses missed';
    if (status === 'missed')  return '❌ Doses missed';
    return 'No medicines scheduled';
  };

  const todayKey = today.toISOString().split('T')[0];

  // Stats for this month
  const monthKeys = Object.keys(adherenceMap).filter(k => k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`));
  const takenCount   = monthKeys.filter(k => adherenceMap[k] === 'taken').length;
  const missedCount  = monthKeys.filter(k => adherenceMap[k] === 'missed').length;
  const partialCount = monthKeys.filter(k => adherenceMap[k] === 'partial').length;
  const adherencePct = monthKeys.length > 0
    ? Math.round(((takenCount + partialCount * 0.5) / monthKeys.length) * 100)
    : 0;

  return (
    <div className="flex-col gap-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📅 Calendar</h1>
        <p className="page-subtitle">Your dose history at a glance</p>
      </div>

      {/* Month stats */}
      <div className="grid-4">
        <div className="glass-card text-center">
          <div className="stat-value text-success">{takenCount}</div>
          <div className="stat-label">Perfect Days</div>
        </div>
        <div className="glass-card text-center">
          <div className="stat-value text-warning">{partialCount}</div>
          <div className="stat-label">Partial Days</div>
        </div>
        <div className="glass-card text-center">
          <div className="stat-value text-danger">{missedCount}</div>
          <div className="stat-label">Missed Days</div>
        </div>
        <div className="glass-card text-center">
          <div className="stat-value text-primary-color">{adherencePct}%</div>
          <div className="stat-label">Adherence</div>
        </div>
      </div>

      {/* Calendar card */}
      <div className="glass-card flex-col gap-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <button className="btn btn-ghost btn-sm" onClick={prevMonth}>‹ Prev</button>
          <h2 className="font-bold" style={{ fontSize: '1.1rem' }}>{monthName}</h2>
          <button className="btn btn-ghost btn-sm" onClick={nextMonth}>Next ›</button>
        </div>

        {/* Day-of-week headers */}
        <div className={styles.weekHeaders}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className={styles.weekLabel}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className={styles.grid}>
          {/* Empty cells for first day offset */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className={styles.emptyCell} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const status = getStatus(day);
            const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = key === todayKey;
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                className={`${styles.dayCell} ${colorFor(status)} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
                onClick={() => setSelectedDay(isSelected ? null : day)}
              >
                <span className={styles.dayNumber}>{day}</span>
                {status && <span className={styles.dot} />}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className={styles.legend}>
          <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.taken}`} /> All taken</span>
          <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.partial}`} /> Partial</span>
          <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.missed}`} /> Missed</span>
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="glass-card flex-col gap-3 animate-fade-in">
          <h3 className="font-bold">
            {new Date(year, month, selectedDay).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          <p className="text-muted">
            {labelFor(getStatus(selectedDay))}
          </p>
        </div>
      )}
    </div>
  );
}
