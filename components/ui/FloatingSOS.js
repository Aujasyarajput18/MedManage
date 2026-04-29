'use client';
import { useRouter, usePathname } from 'next/navigation';

export default function FloatingSOS() {
  const router   = useRouter();
  const pathname = usePathname();

  // Don't show on the SOS page itself
  if (pathname === '/dashboard/sos') return null;

  return (
    <button
      onClick={() => router.push('/dashboard/sos')}
      aria-label="SOS Emergency"
      style={{
        position:     'fixed',
        bottom:       96, // above bottom nav
        right:        20,
        zIndex:       200,
        width:        52,
        height:       52,
        borderRadius: '50%',
        background:   'linear-gradient(135deg, #FF4757, #FF2D3A)',
        border:       'none',
        boxShadow:    '0 4px 20px rgba(255,71,87,0.5), 0 0 0 0 rgba(255,71,87,0.4)',
        cursor:       'pointer',
        fontSize:     '1.4rem',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
        animation:    'sos-pulse 2s ease-in-out infinite',
        transition:   'transform 0.15s ease',
      }}
      onMouseEnter={e  => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={e => e.currentTarget.style.transform  = 'scale(1)'}
    >
      🆘
      <style>{`
        @keyframes sos-pulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(255,71,87,0.5), 0 0 0 0 rgba(255,71,87,0.4); }
          50%       { box-shadow: 0 4px 20px rgba(255,71,87,0.5), 0 0 0 10px rgba(255,71,87,0); }
        }
      `}</style>
    </button>
  );
}
