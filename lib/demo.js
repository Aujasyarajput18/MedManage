/**
 * lib/demo.js
 * Pre-loads realistic demo data into localStorage so the jury
 * can tap "Try Demo" and see a fully populated app immediately.
 */

export const DEMO_MEDICINES = [
  {
    id: 'demo-1',
    name: 'Metformin',
    dosage: '500mg',
    category: 'Chronic',
    times: ['08:00', '20:00'],
    pillCount: 42,
    pillsTotal: 60,
    notes: 'Take with meals. For blood sugar control.',
    color: '#0D9488',
  },
  {
    id: 'demo-2',
    name: 'Aspirin',
    dosage: '75mg',
    category: 'Chronic',
    times: ['09:00'],
    pillCount: 24,
    pillsTotal: 30,
    notes: 'Blood thinner — do not take on empty stomach.',
    color: '#E11D48',
  },
  {
    id: 'demo-3',
    name: 'Vitamin D3',
    dosage: '60,000 IU',
    category: 'Vitamin',
    times: ['10:00'],
    pillCount: 8,
    pillsTotal: 12,
    notes: 'Weekly dose. Take with fatty meal.',
    color: '#F59E0B',
  },
  {
    id: 'demo-4',
    name: 'Amlodipine',
    dosage: '5mg',
    category: 'Chronic',
    times: ['07:30'],
    pillCount: 11,
    pillsTotal: 30,
    notes: 'Blood pressure support. Track dizziness or swelling.',
    color: '#2563EB',
  },
  {
    id: 'demo-5',
    name: 'Omega-3',
    dosage: '1000mg',
    category: 'Supplement',
    times: ['14:00'],
    pillCount: 18,
    pillsTotal: 30,
    notes: 'Take after lunch to reduce reflux.',
    color: '#7C3AED',
  },
];

export const DEMO_JOURNAL = [
  { id: 'j1', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], bp: '120/80', glucose: 98,  weight: 72.0, mood: '😊', notes: 'Feeling good today!' },
  { id: 'j2', date: new Date(Date.now() - 2*86400000).toISOString().split('T')[0], bp: '118/78', glucose: 104, weight: 72.2, mood: '😐', notes: 'Slight headache in the evening.' },
  { id: 'j3', date: new Date(Date.now() - 4*86400000).toISOString().split('T')[0], bp: '122/82', glucose: 96,  weight: 71.8, mood: '😄', notes: 'Morning walk helped a lot.' },
  { id: 'j4', date: new Date(Date.now() - 7*86400000).toISOString().split('T')[0], bp: '126/84', glucose: 111, weight: 72.5, mood: '😔', notes: 'Missed morning walk. Stressed.' },
];

export const DEMO_PROFILE = {
  name: 'Raj Kumar',
  email: 'demo@medmanage.app',
  streak: 14,
  points: 420,
  badges: ['streak_7', 'perfect_day', 'ai_explorer'],
};

export const DEMO_SOS_CONTACTS = [];

const LEGACY_DEMO_SOS_PHONES = new Set(['9999999999', '8888888888']);

function normalizeDemoMedicine(medicine) {
  return {
    frequency: 'daily',
    startDate: new Date().toISOString().split('T')[0],
    ...medicine,
    pillCount: medicine.pillCount ?? medicine.pillsRemaining ?? null,
  };
}

export function seedDemoData() {
  if (typeof window === 'undefined') return;
  localStorage.setItem('demo_medicines',    JSON.stringify(DEMO_MEDICINES.map(normalizeDemoMedicine)));
  localStorage.setItem('demo_journal',      JSON.stringify(DEMO_JOURNAL));
  localStorage.setItem('demo_profile',      JSON.stringify(DEMO_PROFILE));
  localStorage.setItem('demo_sos_contacts', JSON.stringify(DEMO_SOS_CONTACTS));
  localStorage.setItem('demo_active',       'true');
}

export function clearDemoData() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('demo_medicines');
  localStorage.removeItem('demo_journal');
  localStorage.removeItem('demo_profile');
  localStorage.removeItem('demo_sos_contacts');
  localStorage.removeItem('demo_active');
}

export function isDemoMode() {
  if (typeof window === 'undefined') return false;
  const urlDemo = window.location.search.includes('demo=true');
  if (urlDemo && localStorage.getItem('demo_active') !== 'true') {
    seedDemoData();
  }
  return urlDemo || localStorage.getItem('demo_active') === 'true';
}

export function getDemoMedicines()   {
  const medicines = JSON.parse(localStorage.getItem('demo_medicines') || 'null');
  return (medicines || DEMO_MEDICINES).map(normalizeDemoMedicine);
}
export function getDemoJournal()     { return JSON.parse(localStorage.getItem('demo_journal')      || 'null') || DEMO_JOURNAL; }
export function getDemoProfile()     { return JSON.parse(localStorage.getItem('demo_profile')      || 'null') || DEMO_PROFILE; }

export function setDemoMedicines(medicines) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('demo_medicines', JSON.stringify(medicines.map(normalizeDemoMedicine)));
}

export function addDemoMedicine(medicine) {
  const next = [
    ...getDemoMedicines(),
    normalizeDemoMedicine({ id: `demo-${Date.now()}`, ...medicine }),
  ];
  setDemoMedicines(next);
  return next[next.length - 1];
}

export function updateDemoMedicine(id, patch) {
  const next = getDemoMedicines().map((medicine) => (
    medicine.id === id ? normalizeDemoMedicine({ ...medicine, ...patch }) : medicine
  ));
  setDemoMedicines(next);
  return next.find((medicine) => medicine.id === id) || null;
}

export function deleteDemoMedicine(id) {
  setDemoMedicines(getDemoMedicines().filter((medicine) => medicine.id !== id));
}

export function getDemoSOSContacts() {
  const contacts = JSON.parse(localStorage.getItem('demo_sos_contacts') || '[]');
  const hasLegacySeed = contacts.some((contact) => LEGACY_DEMO_SOS_PHONES.has(contact.phone));

  if (hasLegacySeed) {
    localStorage.setItem('demo_sos_contacts', JSON.stringify(DEMO_SOS_CONTACTS));
    return [...DEMO_SOS_CONTACTS];
  }

  return contacts;
}

export function setDemoSOSContacts(contacts) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('demo_sos_contacts', JSON.stringify(contacts));
}
