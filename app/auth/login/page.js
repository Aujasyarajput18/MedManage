'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmail, signInWithGoogle, resetPassword } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    }
  };

  const handleReset = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    try {
      await resetPassword(email);
      alert('Password reset link sent to your email');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page flex-col items-center justify-center" style={{ minHeight: '100vh', padding: 'var(--space-6)' }}>
      <div className="glass-card w-full" style={{ maxWidth: 400 }}>
        <div className="text-center mb-6">
          <div style={{
            width: 48, height: 48,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            borderRadius: '50%',
            margin: '0 auto var(--space-4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: 'var(--shadow-primary)'
          }}>💊</div>
          <h1 className="page-title" style={{ fontSize: '1.8rem' }}>Welcome Back</h1>
          <p className="page-subtitle">Sign in to continue tracking your health</p>
        </div>

        {error && (
          <div className="badge badge-danger w-full mb-4" style={{ padding: '8px 12px', justifyContent: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex-col gap-4">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Email</label>
            <input 
              type="email" 
              className="input" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <div className="flex justify-between items-center mb-2">
              <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
              <button type="button" onClick={handleReset} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', cursor: 'pointer' }}>
                Forgot?
              </button>
            </div>
            <input 
              type="password" 
              className="input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg mt-4 w-full" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center gap-4 mt-6 mb-6">
          <div className="divider w-full" style={{ margin: 0 }}></div>
          <span className="text-muted text-xs font-bold">OR</span>
          <div className="divider w-full" style={{ margin: 0 }}></div>
        </div>

        <button onClick={handleGoogle} className="btn btn-ghost w-full">
          <span style={{ fontSize: '1.2rem' }}>G</span> Continue with Google
        </button>

        <p className="text-center mt-6 text-sm text-secondary">
          New to MedManage?{' '}
          <Link href="/auth/signup" className="font-bold">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
