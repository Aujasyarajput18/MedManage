'use client';
import { useEffect, useState } from 'react';

const APP_URL = 'https://medmanage-web-aujmed-manage.vercel.app';

export default function QRCode({ url = APP_URL, size = 180 }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=12122A&color=6C63FF&qzone=1&format=png`;

  return (
    <div style={{ textAlign: 'center' }}>
      <img
        src={qrUrl}
        alt="Scan to open MedManage"
        width={size}
        height={size}
        style={{ borderRadius: 12, border: '2px solid rgba(108,99,255,0.3)' }}
      />
      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
        Scan to open on your phone
      </p>
    </div>
  );
}
