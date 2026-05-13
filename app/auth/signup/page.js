'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUpWithEmail, signInWithGoogle } from '@/lib/auth';
import { clearDemoData } from '@/lib/demo';
import Icon from '@/components/ui/Icon';

export default function SignUpPage() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  useEffect(() => {
    const done = localStorage.getItem('medmanage_onboarding_done') === 'true';
    if (!done) router.replace('/onboarding');
  }, [router]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signUpWithEmail(email, password, name);
      clearDemoData();
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create account');
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
      setError(err.message || 'Google sign-up failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Top brand section */}
      <div style={{ background: 'var(--primary)', padding: '40px var(--space-6) 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="sparkle" size={28} color="white" strokeWidth={1.5} />
        </div>
        <h1 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '1.6rem', color: '#fff', margin: 0 }}>Create Account</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', margin: 0 }}>Free forever · No credit card</p>
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: 'var(--space-6) var(--space-5)', maxWidth: 480, width: '100%', margin: '0 auto' }}>
        {error && (
          <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', padding: '10px 14px', marginBottom: 20, fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="warning" size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Full Name</label>
            <input type="text" className="input" placeholder="Priya Sharma" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Email Address</label>
            <input type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} className="input" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" autoComplete="new-password" style={{ paddingRight: 48 }} />
              <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <Icon name={showPw ? 'eye_off' : 'eye'} size={18} />
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 8, fontSize: '1.05rem', minHeight: 56 }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="flex items-center gap-4" style={{ margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span className="text-muted text-xs font-bold">OR</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <button onClick={handleGoogle} className="btn btn-ghost" style={{ width: '100%', gap: 10, fontSize: '1rem', minHeight: 52 }}>
          <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#4285F4', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>G</span>
          Sign up with Google
        </button>

        <p className="text-center text-sm" style={{ marginTop: 20, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Sign In →</Link>
        </p>

        <p className="text-center text-sm" style={{ marginTop: 12 }}>
          <Link href="/onboarding" style={{ color: 'var(--text-muted)', fontWeight: 800, textDecoration: 'none' }}>
            Watch tutorial
          </Link>
        </p>
      </div>
    </div>
  );
}
