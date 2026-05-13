'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { subscribeMedicines, subscribeDoseLogs, getUserProfile, logDose } from '@/lib/firestore';
import { isDemoMode, getDemoMedicines, getDemoProfile } from '@/lib/demo';
import styles from './dashboard.module.css';

const DEMO_LOGS = [
  { medicineId: 'demo-1', timeSlot: '08:00', status: 'taken' },
  { medicineId: 'demo-3', timeSlot: '10:00', status: 'taken' },
  { medicineId: 'demo-4', timeSlot: '07:30', status: 'taken' },
];

const WEEK_DEMO = [88, 93, 100, 72, 96, 91, 64];

const MODE_COPY = {
  today: {
    title: 'Dose flow',
    body: 'Morning, lunch, night, and SOS actions are staged for fast handoff.',
  },
  refills: {
    title: 'Refill runway',
    body: 'Low inventory and shopping reminders are visible before doses run out.',
  },
  risks: {
    title: 'Safety scan',
    body: 'AI checks surface interactions, food warnings, and missed-dose advice.',
  },
};

const QUICK_LINKS = [
  { label: 'Add Rx', href: '/dashboard/medicines/add', tone: 'teal', icon: 'plus' },
  { label: 'Pill Scan', href: '/dashboard/medicines/identify', tone: 'blue', icon: 'scan' },
  { label: 'Drug Check', href: '/dashboard/medicines/interactions', tone: 'violet', icon: 'nodes' },
  { label: 'SOS', href: '/dashboard/sos', tone: 'red', icon: 'alert' },
  { label: 'Calendar', href: '/dashboard/calendar', tone: 'amber', icon: 'calendar' },
  { label: 'Doctor PDF', href: '/dashboard/export', tone: 'slate', icon: 'file' },
];

const CARE_CARDS = [
  ['Caregiver ping', 'Send Raj Kumar summary to family after the next missed dose.', 'Ready'],
  ['Doctor visit', 'Cardiology follow-up, Thursday 11:30 AM.', 'Soon'],
  ['Weekly reward', '2 doses away from the Perfect Week badge.', 'Active'],
];

function Icon({ name }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    scan: <><path d="M4 7V5a1 1 0 0 1 1-1h2" /><path d="M17 4h2a1 1 0 0 1 1 1v2" /><path d="M20 17v2a1 1 0 0 1-1 1h-2" /><path d="M7 20H5a1 1 0 0 1-1-1v-2" /><path d="M8 12h8" /></>,
    nodes: <><circle cx="6" cy="6" r="3" /><circle cx="18" cy="18" r="3" /><path d="M9 6h4a5 5 0 0 1 5 5v4" /><path d="M6 9v9" /></>,
    alert: <><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="3" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></>,
    file: <><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" /><path d="M14 2v5h5" /><path d="M9 13h6" /><path d="M9 17h6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function MedicineBottle({ medicine, nextDose }) {
  return (
    <div className={styles.bottleWrap} aria-hidden="true">
      <div className={styles.bottleCap} />
      <div className={styles.bottleBody} style={{ '--medicine-color': medicine?.color || '#0D9488' }}>
        <div className={styles.bottleLabel}>
          <span className={styles.bottleMark} />
          <strong>{medicine?.name || 'Care Plan'}</strong>
          <small>{medicine?.dosage || '250 mg'} · {nextDose || 'Today'}</small>
        </div>
        <div className={styles.pillGlass}>
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

function AdherenceRing({ percent }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg className={styles.ring} viewBox="0 0 112 112" aria-label={`Today adherence ${percent}%`}>
      <circle cx="56" cy="56" r={radius} />
      <circle cx="56" cy="56" r={radius} style={{ strokeDasharray: circumference, strokeDashoffset: offset }} />
      <text x="56" y="53" textAnchor="middle">{percent}%</text>
      <text x="56" y="70" textAnchor="middle">today</text>
    </svg>
  );
}

function WeekChart() {
  return (
    <div className={styles.weekChart} aria-label="Weekly adherence">
      {WEEK_DEMO.map((value, index) => (
        <div key={index} className={styles.weekBar}>
          <span style={{ height: `${value}%` }} />
          <small>{['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}</small>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [doseLogs, setDoseLogs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState({});
  const [mode, setMode] = useState('today');

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const hourNow = new Date().getHours();
  const greeting = hourNow < 12 ? 'Good morning' : hourNow < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const name = profile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'there';

  useEffect(() => {
    if (isDemoMode()) {
      setMedicines(getDemoMedicines());
      setDoseLogs(DEMO_LOGS);
      setProfile(getDemoProfile());
      setLoading(false);
      return;
    }
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubMeds = subscribeMedicines(user.uid, (meds) => {
      setMedicines(meds);
      setLoading(false);
    });
    const unsubLogs = subscribeDoseLogs(user.uid, today, setDoseLogs);
    getUserProfile(user.uid).then((p) => p && setProfile(p));
    return () => {
      unsubMeds();
      unsubLogs();
    };
  }, [user, authLoading, today]);

  const allSlots = useMemo(() => {
    return medicines
      .flatMap((medicine) => (medicine.times || []).map((time) => ({
        medId: medicine.id,
        time,
        name: medicine.name,
        dosage: medicine.dosage,
        color: medicine.color || '#0D9488',
        category: medicine.category || 'Daily',
        pillsLeft: medicine.pillCount ?? medicine.pillsRemaining ?? null,
        pillsTotal: medicine.pillsTotal ?? null,
      })))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [medicines]);

  const loggedKeys = new Set(doseLogs.map((log) => `${log.medicineId}_${log.timeSlot}`));
  const takenCount = doseLogs.filter((log) => log.status === 'taken').length;
  const adherence = allSlots.length > 0 ? Math.round((takenCount / allSlots.length) * 100) : 100;
  const pendingSlots = allSlots.filter((slot) => !loggedKeys.has(`${slot.medId}_${slot.time}`));
  const nextSlot = pendingSlots[0] || allSlots[0] || null;
  const nextMedicine = medicines.find((medicine) => medicine.id === nextSlot?.medId) || medicines[0] || null;
  const lowStock = medicines
    .filter((medicine) => typeof medicine.pillCount === 'number' && medicine.pillCount <= 14)
    .slice(0, 3);
  const riskScore = medicines.length > 2 ? 'Moderate' : 'Low';
  const selectedCopy = MODE_COPY[mode];

  const markDose = async (slot, status = 'taken') => {
    const key = `${slot.medId}_${slot.time}_${status}`;
    setMarking((current) => ({ ...current, [key]: true }));
    try {
      if (user && !isDemoMode()) {
        await logDose(user.uid, { medicineId: slot.medId, timeSlot: slot.time, status, date: today });
      } else {
        setDoseLogs((current) => {
          const filtered = current.filter((log) => !(log.medicineId === slot.medId && log.timeSlot === slot.time));
          return [...filtered, { medicineId: slot.medId, timeSlot: slot.time, status }];
        });
      }
    } finally {
      setMarking((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <span />
        <p>Loading MedManage cockpit...</p>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <header className={styles.greeting}>
        <div>
          <p>{dateStr}</p>
          <h1>{greeting}, {name}</h1>
        </div>
        <Link href="/dashboard/settings" className={styles.profileChip}>
          {profile?.points || 420} pts
        </Link>
      </header>

      <section className={`${styles.heroCard} ${mode === 'risks' ? styles.heroRose : mode === 'refills' ? styles.heroGold : styles.heroTeal}`}>
        <div className={styles.heroTop}>
          <div>
            <p>{selectedCopy.title}</p>
            <h2>{nextSlot ? `${nextSlot.name} ${nextSlot.time}` : 'Set up first dose'}</h2>
          </div>
          <AdherenceRing percent={adherence} />
        </div>

        <div className={styles.modeSwitch} role="tablist" aria-label="Dashboard mode">
          {Object.keys(MODE_COPY).map((key) => (
            <button
              key={key}
              type="button"
              className={mode === key ? styles.activeMode : ''}
              onClick={() => setMode(key)}
            >
              {key}
            </button>
          ))}
        </div>

        <div className={styles.productArea}>
          <MedicineBottle medicine={nextMedicine} nextDose={nextSlot?.time} />
          <div className={styles.doseRail}>
            <strong>{pendingSlots.length || 0}</strong>
            <span>{lowStock.length}</span>
            <span>{riskScore === 'Low' ? 'OK' : 'AI'}</span>
          </div>
        </div>

        <div className={styles.actionSheet}>
          <p>{selectedCopy.body}</p>
          {nextSlot ? (
            <>
              <div className={styles.nextDose}>
                <span>
                  <small>Next dose</small>
                  <strong>{nextSlot.name}</strong>
                </span>
                <b>{nextSlot.dosage || nextSlot.category}</b>
              </div>
              <div className={styles.actionRow}>
                <button type="button" onClick={() => markDose(nextSlot, 'skipped')}>Skip</button>
                <button
                  type="button"
                  className={styles.takeButton}
                  onClick={() => markDose(nextSlot, 'taken')}
                  disabled={Boolean(marking[`${nextSlot.medId}_${nextSlot.time}_taken`])}
                >
                  {marking[`${nextSlot.medId}_${nextSlot.time}_taken`] ? 'Saving' : 'Take now'}
                </button>
              </div>
            </>
          ) : (
            <Link href="/dashboard/medicines/add" className={styles.emptyCta}>Add first medicine</Link>
          )}
        </div>
      </section>

      <section className={styles.summaryGrid}>
        <article>
          <strong>{takenCount}/{allSlots.length || 0}</strong>
          <span>Doses logged</span>
        </article>
        <article>
          <strong>{profile?.streak || 14}</strong>
          <span>Day streak</span>
        </article>
        <article>
          <strong>{riskScore}</strong>
          <span>AI risk</span>
        </article>
      </section>

      <section className={styles.quickActions}>
        {QUICK_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={`${styles.quickAction} ${styles[link.tone]}`}>
            <span><Icon name={link.icon} /></span>
            <b>{link.label}</b>
          </Link>
        ))}
      </section>

      <section className={styles.todayPanel}>
        <div className={styles.sectionHead}>
          <div>
            <p>Today</p>
            <h2>Care timeline</h2>
          </div>
          <Link href="/dashboard/calendar">Calendar</Link>
        </div>

        {allSlots.length === 0 ? (
          <div className={styles.emptyPanel}>
            <strong>No medicines yet</strong>
            <p>Add one medicine to unlock reminders, refills, streaks, and AI checks.</p>
            <Link href="/dashboard/medicines/add">Add medicine</Link>
          </div>
        ) : (
          <div className={styles.doseList}>
            {allSlots.slice(0, 6).map((slot) => {
              const log = doseLogs.find((item) => item.medicineId === slot.medId && item.timeSlot === slot.time);
              const status = log?.status || 'pending';
              return (
                <article key={`${slot.medId}_${slot.time}`} className={styles.doseItem}>
                  <time>{slot.time}</time>
                  <span style={{ '--slot-color': slot.color }} />
                  <div>
                    <strong>{slot.name}</strong>
                    <small>{slot.dosage || slot.category}</small>
                  </div>
                  {status === 'pending' ? (
                    <button type="button" onClick={() => markDose(slot, 'taken')}>Take</button>
                  ) : (
                    <b className={status === 'taken' ? styles.taken : styles.skipped}>
                      {status}
                    </b>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className={styles.intelGrid}>
        <article className={styles.weekPanel}>
          <div className={styles.sectionHead}>
            <div>
              <p>Adherence</p>
              <h2>7-day signal</h2>
            </div>
          </div>
          <WeekChart />
        </article>

        <article className={styles.refillPanel}>
          <div className={styles.sectionHead}>
            <div>
              <p>Inventory</p>
              <h2>Refill watch</h2>
            </div>
            <Link href="/dashboard/medicines">Manage</Link>
          </div>
          {(lowStock.length ? lowStock : medicines.slice(0, 2)).map((medicine) => (
            <div key={medicine.id} className={styles.refillItem}>
              <span style={{ '--stock-color': medicine.color || '#0D9488' }} />
              <div>
                <strong>{medicine.name}</strong>
                <small>{medicine.pillCount ?? medicine.pillsRemaining ?? 24} pills left</small>
              </div>
              <b>{medicine.pillCount && medicine.pillCount <= 14 ? 'low' : 'ok'}</b>
            </div>
          ))}
        </article>
      </section>

      <section className={styles.careBoard}>
        <div className={styles.sectionHead}>
          <div>
            <p>Pro layer</p>
            <h2>Care team board</h2>
          </div>
          <Link href="/dashboard/profiles">Family</Link>
        </div>
        {CARE_CARDS.map(([title, body, status]) => (
          <article key={title}>
            <div>
              <strong>{title}</strong>
              <p>{body}</p>
            </div>
            <span>{status}</span>
          </article>
        ))}
      </section>
    </div>
  );
}
