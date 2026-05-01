'use client';
import { useState, useEffect, useCallback } from 'react';
import { setPin, verifyPin, isPinSet, clearPin, shouldLock, setLocked, isLocked, recordActivity } from '@/lib/pin';

/**
 * usePin — manages PIN lock state.
 * Usage:
 *   const { pinSet, locked, lock, unlock, setupPin, removePin } = usePin();
 */
export function usePin(inactivityMinutes = 5) {
  const [pinSet,  setPinSet]  = useState(false);
  const [locked,  setLockedState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    // Initialize state from localStorage
    const pinExists = isPinSet();
    setPinSet(pinExists);
    
    if (pinExists && shouldLock(inactivityMinutes)) {
      setLocked(true);
      setLockedState(true);
    } else {
      setLockedState(isLocked());
    }
    setLoading(false);

    // Record activity on mount
    recordActivity();

    // Record activity on any user interaction
    const onActivity = () => recordActivity();
    window.addEventListener('click', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('touchstart', onActivity);

    // Check for inactivity every minute
    const interval = setInterval(() => {
      if (isPinSet() && shouldLock(inactivityMinutes)) {
        setLocked(true);
        setLockedState(true);
      }
    }, 60_000);

    return () => {
      window.removeEventListener('click', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('touchstart', onActivity);
      clearInterval(interval);
    };
  }, [inactivityMinutes]);

  const setupPin = useCallback(async (pin) => {
    try {
      await setPin(pin);
      setPinSet(true);
      setLockedState(false);
      setLocked(false);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const unlock = useCallback(async (pin) => {
    const correct = await verifyPin(pin);
    if (correct) {
      setLocked(false);
      setLockedState(false);
      recordActivity();
      setError(null);
    } else {
      setError('Incorrect PIN');
    }
    return correct;
  }, []);

  const lock = useCallback(() => {
    setLocked(true);
    setLockedState(true);
  }, []);

  const removePin = useCallback(() => {
    clearPin();
    setPinSet(false);
    setLockedState(false);
    setLocked(false);
  }, []);

  return { pinSet, locked, loading, error, setupPin, unlock, lock, removePin };
}
