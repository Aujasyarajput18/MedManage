'use client';
import { useEffect, useState } from 'react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline  = () => setIsOffline(false);
    setIsOffline(!navigator.onLine);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online',  handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online',  handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 9999,
      background: 'linear-gradient(90deg, #FF4757, #FF6B81)',
      color: 'white',
      textAlign: 'center',
      padding: '8px 16px',
      fontSize: '0.85rem',
      fontWeight: 700,
      fontFamily: 'Inter, sans-serif',
      letterSpacing: '0.02em',
      boxShadow: '0 2px 12px rgba(255,71,87,0.4)',
    }}>
      📴 You're offline — MedManage still works, syncs when you reconnect
    </div>
  );
}
