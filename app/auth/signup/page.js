'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUpWithEmail, signInWithGoogle } from '@/lib/auth';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signUpWithEmail(email, password, name);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Google sign-up failed');
    }
  };

  return (
    <div className="page flex-col items-center justify-center" style={{ minHeight: '100vh', padding: 'var(--space-6)' }}>
      <div className="glass-card w-full" style={{ maxWidth: 400 }}>
        <div className="text-center mb-6">
          <div style={{
            width: 48, height: 48,
            background: 'linear-gradient(135deg, var(--success), var(--primary))',
            borderRadius: '50%',
            margin: '0 auto var(--space-4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: 'var(--shadow-md)'
          }}>✨</div>
          <h1 className="page-title" style={{ fontSize: '1.8rem' }}>Create Account</h1>
          <p className="page-subtitle">Join MedManage for free, forever.</p>
        </div>

        {error && (
          <div className="badge badge-danger w-full mb-4" style={{ padding: '8px 12px', justifyContent: 'center', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="flex-col gap-4">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Full Name</label>
            <input 
              type="text" 
              className="input" 
              placeholder="John Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>

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
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className="input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              minLength="6"
            />
          </div>

          <button type="submit" className="btn btn-success btn-lg mt-4 w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
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
          Already have an account?{' '}
          <Link href="/auth/login" className="font-bold">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
