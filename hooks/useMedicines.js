'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subscribeMedicines, logDose, updateStreak } from '@/lib/firestore';

/**
 * useMedicines — subscribe to current user's medicine list in real-time.
 * Also provides logDose helper that updates streak + points.
 */
export function useMedicines() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!user) {
      setMedicines([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeMedicines(user.uid, (meds) => {
      setMedicines(meds);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const markDose = useCallback(async (doseLog) => {
    if (!user) return;
    await logDose(user.uid, doseLog);
    if (doseLog.status === 'taken') {
      await updateStreak(user.uid).catch(() => {});
    }
  }, [user]);

  return { medicines, loading, markDose };
}
