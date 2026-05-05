'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const DAYS   = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const toKey = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

export default function CalendarPage() {
  const { user }  = useAuth();
  const today     = new Date();
  const todayKey  = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  const [cur,        setCur]        = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected,   setSelected]   = useState(today.getDate());
  const [doseMap,    setDoseMap]    = useState({});   // key → 'taken'|'partial'|'missed'
  const [dayDetail,  setDayDetail]  = useState([]);
  const [loading,    setLoading]    = useState(true);

  const year  = cur.getFullYear();
  const month = cur.getMonth();

  // ── Load dose data from Firestore ──────────────────────────────
  const loadMonth = useCallback(async () => {
    setLoading(true);
    const isDemo = typeof window !== 'undefined' &&
      (localStorage.getItem('demo_active') === 'true' || window.location.search.includes('demo=true'));

    if (!user && !isDemo) { setLoading(false); return; }

    // Build date range for the month
    const start = new Date(year, month, 1);
    const end   = new Date(year, month + 1, 0, 23, 59, 59);

    let map = {};

    if (user) {
      try {
        const dosesRef = collection(db, 'users', user.uid, 'doses');
        const q = query(
          dosesRef,
          where('scheduledAt', '>=', Timestamp.fromDate(start)),
          where('scheduledAt', '<=', Timestamp.fromDate(end))
        );
        const snap = await getDocs(q);

        // Group by day
        const dayGroups = {};
        snap.forEach(doc => {
          const d = doc.data();
          const date = d.scheduledAt?.toDate?.() || new Date(d.scheduledAt);
          const key  = toKey(date.getFullYear(), date.getMonth(), date.getDate());
          if (!dayGroups[key]) dayGroups[key] = { total: 0, taken: 0 };
          dayGroups[key].total++;
          if (d.status === 'taken') dayGroups[key].taken++;
        });

        Object.entries(dayGroups).forEach(([key, { total, taken }]) => {
          if (taken === total)  map[key] = 'taken';
          else if (taken > 0)  map[key] = 'partial';
          else                 map[key] = 'missed';
        });
      } catch (e) {
        console.error('Calendar fetch error:', e);
      }
    } else if (isDemo) {
      // Generate realistic-looking demo data (deterministic based on date)
      const days = new Date(year, month + 1, 0).getDate();
      for (let d = 1; d <= days; d++) {
        const key = toKey(year, month, d);
        const date = new Date(year, month, d);
        if (date > today) continue; // no future data
        const seed = (year * 12 + month) * 31 + d;
        const r = ((seed * 1664525 + 1013904223) & 0xffffffff) / 0xffffffff;
        map[key] = r > 0.85 ? 'missed' : r > 0.65 ? 'partial' : 'taken';
      }
    }

    setDoseMap(map);
    setLoading(false);
  }, [user, year, month]);

  useEffect(() => { loadMonth(); }, [loadMonth]);

  // ── Load selected day detail ───────────────────────────────────
  const loadDay = useCallback(async (day) => {
    setDayDetail([]);
    if (!user) return;
    try {
      const date = new Date(year, month, day);
      const next = new Date(year, month, day + 1);
      const dosesRef = collection(db, 'users', user.uid, 'doses');
      const q = query(
        dosesRef,
        where('scheduledAt', '>=', Timestamp.fromDate(date)),
        where('scheduledAt', '<',  Timestamp.fromDate(next))
      );
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDayDetail(items);
    } catch (e) { console.error(e); }
  }, [user, year, month]);

  const handleSelect = (day) => {
    setSelected(day);
    loadDay(day);
  };

  // ── Calendar grid helpers ──────────────────────────────────────
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth  = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCur(new Date(year, month - 1, 1));
  const nextMonth = () => setCur(new Date(year, month + 1, 1));
  const goToday   = () => {
    setCur(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelected(today.getDate());
    loadDay(today.getDate());
  };

  // Month stats
  const monthKeys    = Object.keys(doseMap).filter(k => k.startsWith(`${year}-${String(month+1).padStart(2,'0')}`));
  const takenDays    = monthKeys.filter(k => doseMap[k] === 'taken').length;
  const partialDays  = monthKeys.filter(k => doseMap[k] === 'partial').length;
  const missedDays   = monthKeys.filter(k => doseMap[k] === 'missed').length;
  const adherencePct = monthKeys.length > 0
    ? Math.round(((takenDays + partialDays * 0.5) / monthKeys.length) * 100)
    : 0;

  const selectedKey = selected ? toKey(year, month, selected) : null;
  const selectedStatus = selectedKey ? doseMap[selectedKey] : null;

  // ── Status colours ─────────────────────────────────────────────
  const STATUS_COLOR = {
    taken:   { bg: '#0D9488', text: '#FFFFFF', dot: '#0D9488', label: 'All doses taken' },
    partial: { bg: '#F59E0B', text: '#FFFFFF', dot: '#F59E0B', label: 'Some doses missed' },
    missed:  { bg: '#DC2626', text: '#FFFFFF', dot: '#DC2626', label: 'All doses missed' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Page header ── */}
      <div>
        <h1 style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 900, fontSize: '1.5rem', color: '#1C1917', marginBottom: 2 }}>Calendar</h1>
        <p style={{ color: '#78716C', fontSize: '0.88rem', fontWeight: 500 }}>Dose history at a glance</p>
      </div>

      {/* ── Month stats strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {[
          { val: takenDays,    label: 'Perfect',  color: '#0D9488' },
          { val: partialDays,  label: 'Partial',  color: '#F59E0B' },
          { val: missedDays,   label: 'Missed',   color: '#DC2626' },
          { val: `${adherencePct}%`, label: 'Rate', color: '#7C3AED' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', border: '1px solid #E7E5E4', borderRadius: 12, padding: '10px 6px', textAlign: 'center', boxShadow: '0 1px 4px rgba(28,25,23,0.06)' }}>
            <div style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 900, fontSize: '1.3rem', color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#78716C', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Calendar card ── */}
      <div style={{ background: 'white', border: '1px solid #E7E5E4', borderRadius: 16, padding: '16px 12px', boxShadow: '0 2px 8px rgba(28,25,23,0.07)' }}>

        {/* Month navigator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={prevMonth} style={navBtnStyle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1C1917" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: '1rem', color: '#1C1917' }}>
              {MONTHS[month]} {year}
            </div>
            <button onClick={goToday} style={{ background: 'none', border: 'none', color: '#0D9488', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'Nunito,sans-serif' }}>
              Today
            </button>
          </div>
          <button onClick={nextMonth} style={navBtnStyle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1C1917" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        {/* Day-of-week headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>
          {DAYS.map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontFamily: 'Nunito,sans-serif', fontWeight: 700, fontSize: '0.7rem', color: i === 0 ? '#DC2626' : i === 6 ? '#3B82F6' : '#78716C', paddingBottom: 6 }}>
              {d}
            </div>
          ))}
        </div>

        {/* Date circles grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '6px 2px' }}>
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: '#F5F5F4', margin: '0 auto' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '6px 0' }}>
            {/* Empty offset cells */}
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`e${i}`} />
            ))}

            {/* Date cells */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const key      = toKey(year, month, day);
              const isToday  = key === todayKey;
              const isSel    = day === selected;
              const status   = doseMap[key];
              const sc       = STATUS_COLOR[status];
              const isFuture = new Date(year, month, day) > today;

              // Circle style
              let circleBg    = 'transparent';
              let circleColor = '#1C1917';
              let circleBorder = 'none';

              if (isSel && sc) {
                circleBg    = sc.bg;
                circleColor = sc.text;
              } else if (isSel) {
                circleBg    = '#1C1917';
                circleColor = 'white';
              } else if (isToday) {
                circleBorder = '2px solid #0D9488';
                circleColor  = '#0D9488';
              }

              return (
                <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <button
                    onClick={() => handleSelect(day)}
                    disabled={isFuture}
                    style={{
                      width: 36, height: 36,
                      borderRadius: '50%',
                      background: circleBg,
                      border: circleBorder || 'none',
                      color: isFuture ? '#D6D3D1' : circleColor,
                      fontFamily: 'Nunito,sans-serif',
                      fontWeight: isToday || isSel ? 800 : 600,
                      fontSize: '0.85rem',
                      cursor: isFuture ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      outline: 'none',
                      flexShrink: 0,
                    }}
                  >
                    {day}
                  </button>
                  {/* Status dot below circle */}
                  {status && !isFuture && (
                    <div style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: isSel ? 'transparent' : sc.dot,
                      flexShrink: 0,
                    }} />
                  )}
                  {!status && <div style={{ width: 5, height: 5 }} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 14, paddingTop: 12, borderTop: '1px solid #F5F5F4' }}>
          {[
            { color: '#0D9488', label: 'All taken' },
            { color: '#F59E0B', label: 'Partial' },
            { color: '#DC2626', label: 'Missed' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#57534E' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Selected day detail ── */}
      {selected && (
        <div style={{ background: 'white', border: '1px solid #E7E5E4', borderRadius: 14, padding: 16, boxShadow: '0 2px 8px rgba(28,25,23,0.07)' }}>
          <h3 style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: '0.95rem', color: '#1C1917', marginBottom: 6 }}>
            {new Date(year, month, selected).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>

          {selectedStatus ? (
            <>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${STATUS_COLOR[selectedStatus].bg}15`, borderRadius: 9999, padding: '4px 12px', marginBottom: 10 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLOR[selectedStatus].dot }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: STATUS_COLOR[selectedStatus].dot }}>{STATUS_COLOR[selectedStatus].label}</span>
              </div>

              {user && dayDetail.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {dayDetail.map(dose => (
                    <div key={dose.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#F9F9F8', borderRadius: 10, border: '1px solid #E7E5E4' }}>
                      <span style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#1C1917' }}>{dose.medicineName || 'Medicine'}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: dose.status === 'taken' ? '#0D9488' : dose.status === 'skipped' ? '#F59E0B' : '#DC2626', textTransform: 'capitalize' }}>{dose.status}</span>
                    </div>
                  ))}
                </div>
              ) : user ? (
                <p style={{ color: '#78716C', fontSize: '0.85rem' }}>Loading doses…</p>
              ) : (
                <p style={{ color: '#78716C', fontSize: '0.85rem' }}>Sign in to see dose details.</p>
              )}
            </>
          ) : (
            <p style={{ color: '#78716C', fontSize: '0.85rem', margin: 0 }}>No dose data for this day.</p>
          )}
        </div>
      )}
    </div>
  );
}

const navBtnStyle = {
  width: 36, height: 36,
  borderRadius: '50%',
  border: '1px solid #E7E5E4',
  background: 'white',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
  transition: 'background 0.15s',
};
