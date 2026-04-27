'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './identify.module.css';

export default function PillIdentifyPage() {
  const router = useRouter();
  const fileRef = useRef(null);
  const [preview,  setPreview]  = useState(null);
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setResult(null);
    setError(null);
    identify(file);
  };

  const identify = async (file) => {
    setLoading(true);
    try {
      // Convert to base64
      const base64 = await toBase64(file);
      const res = await fetch('/api/ai/identify-pill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType: file.type }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError('Could not identify. Please try a clearer photo.');
    }
    setLoading(false);
  };

  const toBase64 = (file) => new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result.split(',')[1]);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

  const handleUseResult = () => {
    if (!result) return;
    const params = new URLSearchParams({
      name:    result.name    || '',
      dosage:  result.dosage  || '',
      notes:   result.notes   || '',
    });
    router.push(`/dashboard/medicines/add?${params.toString()}`);
  };

  return (
    <div className="flex-col gap-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📷 Pill Identifier</h1>
        <p className="page-subtitle">Take a photo of your pill or medicine box — AI will identify it</p>
      </div>

      {/* Upload area */}
      <div
        className={`glass-card ${styles.uploadArea}`}
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Uploaded pill" className={styles.preview} />
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.uploadIcon}>📷</span>
            <p className="font-bold">Tap to upload photo</p>
            <p className="text-muted text-sm">Works best with clear, well-lit photos</p>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="glass-card flex items-center gap-4 animate-fade-in">
          <div className="animate-spin" style={{ fontSize: '1.5rem' }}>⚙️</div>
          <div>
            <div className="font-bold">Analysing with AI...</div>
            <div className="text-sm text-muted">Claude Vision is identifying your medicine</div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card animate-fade-in" style={{ borderLeft: '3px solid var(--danger)' }}>
          <p className="text-danger font-bold">❌ {error}</p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="glass-card flex-col gap-4 animate-fade-in" style={{ borderLeft: '3px solid var(--success)' }}>
          <h2 className="font-bold" style={{ fontSize: '1.1rem' }}>✅ Identified</h2>

          <div className={styles.resultGrid}>
            <div className={styles.resultItem}>
              <span className="text-muted text-xs uppercase font-bold">Medicine Name</span>
              <span className="font-bold" style={{ fontSize: '1.1rem' }}>{result.name || 'Unknown'}</span>
            </div>
            {result.dosage && (
              <div className={styles.resultItem}>
                <span className="text-muted text-xs uppercase font-bold">Dosage</span>
                <span className="font-bold">{result.dosage}</span>
              </div>
            )}
            {result.category && (
              <div className={styles.resultItem}>
                <span className="text-muted text-xs uppercase font-bold">Category</span>
                <span className="font-bold">{result.category}</span>
              </div>
            )}
          </div>

          {result.notes && (
            <p className="text-sm text-muted" style={{ borderLeft: '2px solid var(--primary)', paddingLeft: 10 }}>
              {result.notes}
            </p>
          )}

          <div className="flex gap-3">
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleUseResult}>
              ➕ Add This Medicine
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setPreview(null); setResult(null); }}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="glass-card flex-col gap-3">
        <h3 className="font-bold text-sm">📸 Photo Tips for Best Results</h3>
        {[
          'Point camera at the medicine name on the box or strip',
          'Ensure good lighting — avoid shadows',
          'Include the dosage number if visible',
          'Works on pill blister packs, medicine boxes, or loose tablets',
        ].map((tip, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-primary-color font-bold text-sm">{i + 1}.</span>
            <span className="text-sm text-muted">{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
