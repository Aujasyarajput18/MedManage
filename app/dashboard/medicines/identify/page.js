'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function PillIdentifyPage() {
  const router  = useRouter();
  const fileRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [apiErr,  setApiErr]  = useState(null);

  /* ── File / Camera handler ── */
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    setApiErr(null);
    identify(file);
  };

  const identify = async (file) => {
    setLoading(true);
    try {
      const base64 = await toBase64(file);
      const res    = await fetch('/api/ai/identify-pill', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ image: base64, mimeType: file.type }),
      });
      const data = await res.json();

      if (data.error) { setApiErr(data.error); }
      else             { setResult(data); }
    } catch (e) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const toBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result.split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  /* ── Pre-fill Add Medicine form with identified details ── */
  const handleAddMedicine = () => {
    if (!result) return;
    const params = new URLSearchParams({
      name:     result.name     || '',
      dosage:   result.dosage   || '',
      category: result.category || '',
      type:     result.type     || '',
      notes:    [result.uses, result.notes].filter(Boolean).join(' | ') || '',
    });
    router.push(`/dashboard/medicines/add?${params.toString()}`);
  };

  const reset = () => { if (preview) URL.revokeObjectURL(preview); setPreview(null); setResult(null); setError(null); setApiErr(null); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Header ── */}
      <div>
        <h1 style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 900, fontSize: '1.5rem', color: '#1C1917', marginBottom: 2 }}>
          Pill Identifier
        </h1>
        <p style={{ color: '#78716C', fontSize: '0.88rem', fontWeight: 500 }}>
          Photo your pill or medicine box — AI identifies it instantly
        </p>
      </div>

      {/* ── Camera / Upload area ── */}
      <div
        onClick={() => !loading && fileRef.current?.click()}
        style={{
          background: preview ? '#000' : 'white',
          border: `2px dashed ${preview ? 'transparent' : '#D6D3D1'}`,
          borderRadius: 16,
          minHeight: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: loading ? 'default' : 'pointer',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 2px 8px rgba(28,25,23,0.08)',
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Captured pill"
            style={{ width: '100%', maxHeight: 260, objectFit: 'contain' }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 24 }}>
            {/* Camera SVG */}
            <div style={{ width: 64, height: 64, background: '#F5F5F4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <p style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: '1rem', color: '#1C1917', marginBottom: 4 }}>
              Tap to take photo or upload
            </p>
            <p style={{ fontSize: '0.8rem', color: '#78716C', fontWeight: 500 }}>
              Point at pill, tablet, capsule, or medicine box
            </p>
          </div>
        )}

        {/* Hidden input — capture=environment opens back camera on mobile */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </div>

      {/* Retake button when image is shown */}
      {preview && !loading && (
        <button onClick={reset} style={{ background: 'white', border: '1px solid #E7E5E4', borderRadius: 10, padding: '10px 16px', fontFamily: 'Nunito,sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#57534E', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
          Retake / New Photo
        </button>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div style={{ background: 'white', border: '1px solid #E7E5E4', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(28,25,23,0.07)' }}>
          <div style={{ width: 44, height: 44, border: '3px solid #E7E5E4', borderTop: '3px solid #0D9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: '0.95rem', color: '#1C1917' }}>Analysing with Gemini AI…</div>
            <div style={{ fontSize: '0.8rem', color: '#78716C', marginTop: 2 }}>Identifying medicine name, dosage and category</div>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── Network / parse error ── */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 14, padding: 14 }}>
          <p style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 700, color: '#DC2626', margin: 0 }}>
            {error}
          </p>
        </div>
      )}

      {/* ── API key not configured ── */}
      {apiErr && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 14, padding: 14 }}>
          <p style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 700, color: '#92400E', margin: 0, marginBottom: 4 }}>
            Gemini AI not configured
          </p>
          <p style={{ fontSize: '0.8rem', color: '#78350F', margin: 0 }}>
            Add <strong>GEMINI_API_KEY</strong> in your Vercel environment variables and redeploy.
          </p>
        </div>
      )}

      {/* ── Result card ── */}
      {result && !loading && (
        <div style={{ background: 'white', border: '2px solid #0D9488', borderRadius: 16, padding: 16, boxShadow: '0 4px 16px rgba(13,148,136,0.12)', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Success badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: '1rem', color: '#0D9488' }}>Medicine Identified</span>
          </div>

          {/* Details grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ResultRow label="Medicine Name" value={result.name || 'Unknown'} highlight />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {result.dosage   && <ResultRow label="Dosage"   value={result.dosage} />}
              {result.type     && <ResultRow label="Type"     value={result.type} />}
              {result.category && <ResultRow label="Category" value={result.category} />}
            </div>
            {result.uses && <ResultRow label="Used For" value={result.uses} />}
          </div>

          {/* Notes */}
          {result.notes && (
            <div style={{ background: '#F9F9F8', borderLeft: '3px solid #0D9488', borderRadius: '0 8px 8px 0', padding: '8px 12px' }}>
              <p style={{ fontSize: '0.82rem', color: '#44403C', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
                {result.notes}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleAddMedicine}
              style={{
                flex: 1,
                background: '#0D9488',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                padding: '12px 16px',
                fontFamily: 'Nunito,sans-serif',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(13,148,136,0.3)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add to My Medicines
            </button>
            <button
              onClick={reset}
              style={{
                background: 'white',
                color: '#57534E',
                border: '1px solid #E7E5E4',
                borderRadius: 12,
                padding: '12px 14px',
                fontFamily: 'Nunito,sans-serif',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              New
            </button>
          </div>
        </div>
      )}

      {/* ── Tips ── */}
      <div style={{ background: 'white', border: '1px solid #E7E5E4', borderRadius: 14, padding: 14, boxShadow: '0 1px 4px rgba(28,25,23,0.06)' }}>
        <h3 style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 800, fontSize: '0.88rem', color: '#1C1917', marginBottom: 10 }}>
          Tips for best results
        </h3>
        {[
          'Point camera at the medicine name on box or blister pack',
          'Ensure good lighting — avoid dark or blurry photos',
          'Include the dosage number if visible (e.g. 500mg)',
          'Works on tablets, capsules, syrups and medicine boxes',
        ].map((tip, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6, alignItems: 'flex-start' }}>
            <div style={{ width: 20, height: 20, background: '#F0FDFA', border: '1px solid #99F6E4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0D9488' }}>{i + 1}</span>
            </div>
            <span style={{ fontSize: '0.82rem', color: '#57534E', fontWeight: 500, lineHeight: 1.5 }}>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultRow({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontFamily: 'Nunito,sans-serif', fontWeight: highlight ? 900 : 700, fontSize: highlight ? '1.2rem' : '0.95rem', color: '#1C1917' }}>{value}</span>
    </div>
  );
}
