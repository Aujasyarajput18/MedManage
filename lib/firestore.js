import { db } from './firebase';
import {
  collection, doc, addDoc, getDoc, getDocs, setDoc,
  updateDoc, deleteDoc, onSnapshot, query, where,
  orderBy, limit, serverTimestamp, increment, writeBatch,
} from 'firebase/firestore';

/* ─── MEDICINES ─── */
export function subscribeMedicines(userId, callback) {
  const q = query(
    collection(db, 'users', userId, 'medicines'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function addMedicine(userId, data) {
  return addDoc(collection(db, 'users', userId, 'medicines'), {
    ...data,
    pillCount: data.pillCount || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateMedicine(userId, medId, data) {
  return updateDoc(doc(db, 'users', userId, 'medicines', medId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMedicine(userId, medId) {
  return deleteDoc(doc(db, 'users', userId, 'medicines', medId));
}

export async function getMedicine(userId, medId) {
  const snap = await getDoc(doc(db, 'users', userId, 'medicines', medId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/* ─── DOSE LOGS ─── */
// doseKey format: "YYYY-MM-DD_medId_timeSlot"
export async function logDose(userId, doseLog) {
  const { medicineId, date, timeSlot, status } = doseLog;
  const doseKey = `${date}_${medicineId}_${timeSlot.replace(':', '')}`;
  
  await setDoc(doc(db, 'users', userId, 'doseLogs', doseKey), {
    medicineId,
    date,
    timeSlot,
    status, // 'taken' | 'skipped' | 'missed'
    loggedAt: serverTimestamp(),
  }, { merge: true });

  // Update points if taken on time
  if (status === 'taken') {
    await updateDoc(doc(db, 'users', userId), { points: increment(10) });
  }

  // Decrement pill count if tracked
  if (status === 'taken') {
    await updateDoc(doc(db, 'users', userId, 'medicines', medicineId), {
      pillCount: increment(-1),
    }).catch(() => {}); // ignore if pillCount not set
  }
}

export async function getDoseLogs(userId, date) {
  const q = query(
    collection(db, 'users', userId, 'doseLogs'),
    where('date', '==', date)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeDoseLogs(userId, date, callback) {
  const q = query(
    collection(db, 'users', userId, 'doseLogs'),
    where('date', '==', date)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/* ─── STREAK ─── */
export async function updateStreak(userId) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;
  
  const data = snap.data();
  const today = new Date().toISOString().split('T')[0];
  const lastDate = data.lastDoseDate;
  
  if (!lastDate) {
    await updateDoc(userRef, { streak: 1, lastDoseDate: today });
    return;
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (lastDate === yesterday) {
    await updateDoc(userRef, {
      streak: increment(1),
      lastDoseDate: today,
      points: increment(5), // streak bonus
    });
  } else if (lastDate !== today) {
    await updateDoc(userRef, { streak: 1, lastDoseDate: today });
  }
}

/* ─── SOS CONTACTS ─── */
export function subscribeSOSContacts(userId, callback) {
  const q = query(collection(db, 'users', userId, 'sosContacts'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function addSOSContact(userId, contact) {
  return addDoc(collection(db, 'users', userId, 'sosContacts'), {
    ...contact,
    createdAt: serverTimestamp(),
  });
}

export async function deleteSOSContact(userId, contactId) {
  return deleteDoc(doc(db, 'users', userId, 'sosContacts', contactId));
}

export async function logSOS(userId, location) {
  return addDoc(collection(db, 'users', userId, 'sosHistory'), {
    location,
    timestamp: serverTimestamp(),
  });
}

/* ─── HEALTH JOURNAL ─── */
export async function addJournalEntry(userId, entry) {
  return addDoc(collection(db, 'users', userId, 'journal'), {
    ...entry,
    date: new Date().toISOString().split('T')[0],
    createdAt: serverTimestamp(),
  });
}

export function subscribeJournalEntries(userId, callback) {
  const q = query(
    collection(db, 'users', userId, 'journal'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/* ─── USER PROFILE ─── */
export async function getUserProfile(userId) {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? snap.data() : null;
}

export async function updateUserProfile(userId, data) {
  return updateDoc(doc(db, 'users', userId), { ...data, updatedAt: serverTimestamp() });
}

/* ─── BADGES ─── */
export async function unlockBadge(userId, badgeId) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    [`badges.${badgeId}`]: { unlockedAt: serverTimestamp() },
    points: increment(50),
  });
}

/* ─── INTERACTIONS CACHE ─── */
export async function getCachedInteraction(medicineKey) {
  const snap = await getDoc(doc(db, 'interactionCache', medicineKey));
  return snap.exists() ? snap.data() : null;
}

export async function cacheInteraction(medicineKey, result) {
  await setDoc(doc(db, 'interactionCache', medicineKey), {
    result,
    cachedAt: serverTimestamp(),
  });
}

/* ─── APPOINTMENTS ─── */
export async function addAppointment(userId, appointment) {
  return addDoc(collection(db, 'users', userId, 'appointments'), {
    ...appointment,
    createdAt: serverTimestamp(),
  });
}

export function subscribeAppointments(userId, callback) {
  const q = query(
    collection(db, 'users', userId, 'appointments'),
    orderBy('dateTime', 'asc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
