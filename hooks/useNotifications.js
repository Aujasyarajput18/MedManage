'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { requestNotificationPermission, onForegroundMessage } from '@/lib/notifications';

/**
 * useNotifications — manages FCM permission + foreground messages.
 * Usage:
 *   const { permission, enabled, token, requestPermission, messages } = useNotifications();
 */
export function useNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState('default');
  const [token,      setToken]      = useState(null);
  const [messages,   setMessages]   = useState([]);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Listen for foreground messages
  useEffect(() => {
    const unsub = onForegroundMessage((msg) => {
      setMessages((prev) => [msg, ...prev].slice(0, 20)); // keep last 20
    });
    return () => unsub();
  }, []);

  const requestPermission = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const tok = await requestNotificationPermission(user.uid);
      setToken(tok);
      setPermission(Notification.permission);
    } catch (e) {
      console.error('Notification permission error:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    permission,
    enabled: permission === 'granted',
    token,
    messages,
    loading,
    requestPermission,
  };
}
