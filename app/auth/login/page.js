'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmail, signInWithGoogle, resetPassword } from '@/lib/auth';
import { clearDemoData } from '@/lib/demo';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      clearDemoData();
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle();
      clearDemoData();
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    }
  };

  const handleReset = async () => {
    if (!email) { setError('Enter your email first, then tap Forgot.'); return; }
    try {
      await resetPassword(email);
      alert('Password reset link sent to your email.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Top brand section */}
      <div style={{
        background: 'var(--primary)',
        padding: '48px var(--space-6) 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 72, height: 72,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem',
        }}>💊</div>
        <h1 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '1.8rem', color: '#fff', margin: 0 }}>
          MedManage
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', margin: 0 }}>
          Never miss a dose
        </p>
      </div>

      {/* Form section */}
      <div style={{
        flex: 1,
        padding: 'var(--space-6) var(--space-5)',
        maxWidth: 480,
        width: '100%',
        margin: '0 auto',
      }}>

        {error && (
          <div style={{
            background: 'rgba(220,38,38,0.1)',
            border: '1px solid rgba(220,38,38,0.3)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--danger)',
            padding: '10px 14px',
            marginBottom: 20,
            fontSize: '0.9rem',
            fontWeight: 600,
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Email */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Email Address</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
              <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
              <button
                type="button"
                onClick={handleReset}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}
              >
                Forgot?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: 48 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem',
                  color: 'var(--text-muted)',
                }}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Sign In button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: 8, fontSize: '1.05rem', minHeight: 56 }}
          >
            {loading ? '⏳ Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4" style={{ margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span className="text-muted text-xs font-bold">OR</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          className="btn btn-ghost"
          style={{ width: '100%', gap: 10, fontSize: '1rem', minHeight: 52 }}
        >
          <span style={{
            width: 24, height: 24, borderRadius: '50%',
            background: '#4285F4', color: 'white',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 900,
          }}>G</span>
          Continue with Google
        </button>

        {/* Demo mode */}
        <button
          onClick={() => {
            localStorage.setItem('demo_active', 'true');
            router.push('/dashboard?demo=true');
          }}
          style={{
            width: '100%', marginTop: 12,
            background: 'rgba(13,148,136,0.08)',
            border: '1px dashed var(--primary)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--primary)',
            padding: '12px',
            fontSize: '0.9rem',
            fontWeight: 700,
            fontFamily: 'Nunito, sans-serif',
            cursor: 'pointer',
          }}
        >
          🎯 Try Demo (no sign-up needed)
        </button>

        <p className="text-center text-sm" style={{ marginTop: 24, color: 'var(--text-secondary)' }}>
          New here?{' '}
          <Link href="/auth/signup" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Create free account →
          </Link>
        </p>
      </div>
    </div>
  );
}
