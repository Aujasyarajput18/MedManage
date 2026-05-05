'use client';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function PhoneFrame({ children }) {
  const pathname = usePathname();
  const isFullWidth = pathname === '/' || pathname === '/privacy' || pathname === '/terms';
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => setTime(
      new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
    );
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  if (isFullWidth) return <>{children}</>;

  return (
    <>
      {/* ── MOBILE: true full-screen ── */}
      <div className="pfm">{children}</div>

      {/* ── DESKTOP: phone shell ── */}
      <div className="pfd">
        <div className="ps">
          {/* Dynamic island / notch */}
          <div className="ps-island" />

          {/* Status bar */}
          <div className="ps-status">
            <span className="ps-time">{time}</span>
            <div className="ps-status-icons">
              <svg width="13" height="10" viewBox="0 0 16 12" fill="white">
                <rect x="0" y="8" width="3" height="4" rx="1" opacity="0.4"/>
                <rect x="4.5" y="5" width="3" height="7" rx="1" opacity="0.65"/>
                <rect x="9" y="2" width="3" height="10" rx="1" opacity="0.85"/>
                <rect x="13.5" y="0" width="2.5" height="12" rx="1"/>
              </svg>
              <svg width="13" height="10" viewBox="0 0 24 18" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M1 6C5.5 1.5 18.5 1.5 23 6" opacity="0.4"/>
                <path d="M4.5 10C7.5 7 16.5 7 19.5 10" opacity="0.7"/>
                <path d="M8 14c1.5-1.5 7-1.5 8.5 0"/>
                <circle cx="12" cy="17" r="1.5" fill="white"/>
              </svg>
              <svg width="22" height="11" viewBox="0 0 25 12">
                <rect x="0" y="0" width="21" height="12" rx="3" stroke="white" strokeWidth="1.5" fill="none"/>
                <rect x="21.5" y="3.5" width="3" height="5" rx="1.5" fill="white" opacity="0.5"/>
                <rect x="1.5" y="1.5" width="16" height="9" rx="2" fill="white"/>
              </svg>
            </div>
          </div>

          {/* Scrollable app content — STRICTLY clipped */}
          <div className="ps-viewport">
            {children}
          </div>

          {/* Home indicator */}
          <div className="ps-home"><div className="ps-bar" /></div>
        </div>

        <p className="ps-label">MedManage · Mobile Preview</p>
      </div>

      <style>{`
        /* MOBILE */
        .pfm { display: block; width: 100%; min-height: 100vh; }
        .pfd { display: none; }

        /* DESKTOP ≥ 900px */
        @media (min-width: 900px) {
          .pfm { display: none; }

          .pfd {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            padding: 28px 24px 48px;
            background: linear-gradient(155deg, #134E4A 0%, #0D9488 45%, #0A7A70 100%);
            overflow-y: auto;
          }

          /* The physical phone shell */
          .ps {
            width: 390px;
            height: 844px;
            background: #FFFBF7;
            border-radius: 50px;
            overflow: hidden;              /* <-- critical: clips ALL children */
            position: relative;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            box-shadow:
              0 0 0 1px rgba(255,255,255,0.1) inset,
              0 0 0 10px #18181B,
              0 0 0 11px #3F3F46,
              0 50px 90px rgba(0,0,0,0.65);
          }

          /* Side buttons */
          .ps::before {
            content: '';
            position: absolute;
            left: -14px; top: 110px;
            width: 4px; height: 32px;
            background: #27272A; border-radius: 2px 0 0 2px;
            box-shadow: 0 48px 0 #27272A, 0 96px 0 #27272A;
            z-index: 10;
          }
          .ps::after {
            content: '';
            position: absolute;
            right: -14px; top: 148px;
            width: 4px; height: 64px;
            background: #27272A; border-radius: 0 2px 2px 0;
            z-index: 10;
          }

          /* Dynamic island */
          .ps-island {
            position: absolute;
            top: 12px;
            left: 50%;
            transform: translateX(-50%);
            width: 126px;
            height: 34px;
            background: #09090B;
            border-radius: 20px;
            z-index: 20;
          }

          /* Status bar */
          .ps-status {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 22px 6px;
            background: #0D9488;
            flex-shrink: 0;
            position: relative;
            z-index: 5;
            min-height: 50px;
          }
          .ps-time {
            font-family: 'Nunito', sans-serif;
            font-weight: 800;
            font-size: 0.88rem;
            color: white;
            padding-left: 4px;
          }
          .ps-status-icons {
            display: flex; align-items: center; gap: 5px;
          }

          /* THE KEY FIX: viewport is position:relative, overflow:hidden, flex:1 */
          .ps-viewport {
            flex: 1;
            position: relative;          /* establishes new containing block */
            overflow-y: auto;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
            /* The dashboard layout uses position:sticky/fixed for header+bottom-nav
               which would escape overflow:hidden. We use overflow:clip to hard-clip. */
            overflow: clip;
            overflow-y: scroll;
          }
          .ps-viewport::-webkit-scrollbar { display: none; }

          /* Home bar */
          .ps-home {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px 0 14px;
            background: #FFFBF7;
            flex-shrink: 0;
            border-top: 1px solid #E7E5E4;
          }
          .ps-bar {
            width: 130px; height: 5px;
            background: #1C1917;
            border-radius: 3px;
            opacity: 0.15;
          }

          /* Label */
          .ps-label {
            margin-top: 18px;
            color: rgba(255,255,255,0.55);
            font-family: 'Nunito', sans-serif;
            font-size: 0.76rem;
            font-weight: 600;
            letter-spacing: 0.06em;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}
