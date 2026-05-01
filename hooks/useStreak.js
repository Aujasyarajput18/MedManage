'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile } from '@/lib/firestore';

/**
 * useStreak — reads streak, points, badges from Firestore user profile.
 */
export function useStreak() {
  const { user } = useAuth();
  const [streak,  setStreak]  = useState(0);
  const [points,  setPoints]  = useState(0);
  const [badges,  setBadges]  = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getUserProfile(user.uid).then((profile) => {
      if (profile) {
        setStreak(profile.streak  || 0);
        setPoints(profile.points  || 0);
        setBadges(profile.badges  || {});
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  return { streak, points, badges, loading };
}
