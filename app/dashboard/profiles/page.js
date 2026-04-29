'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';

const DEMO_PROFILES = [
  { id: 'p1', name: 'Ravi Sharma', relation: 'Father', dob: '1958-04-12', avatar: '👴', medicines: 4, lastSync: 'Today 10:30am' },
  { id: 'p2', name: 'Sunita Sharma', relation: 'Mother', dob: '1962-08-23', avatar: '👩', medicines: 2, lastSync: 'Today 09:15am' },
];

const RELATIONS = ['Father', 'Mother', 'Spouse', 'Child', 'Sibling', 'Grandparent', 'Other'];
const AVATARS   = ['👴', '👩', '👨', '👵', '🧒', '👦', '👧', '🧑', '👶'];

export default function ProfilesPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', relation: 'Father', dob: '', avatar: '👴', notes: '' });
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // ── Load profiles ──
  useEffect(() => {
    if (!user) {
      setProfiles(DEMO_PROFILES);
      setLoading(false);
      return;
    }
    getDocs(collection(db, 'users', user.uid, 'familyProfiles')).then((snap) => {
      setProfiles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [user]);

  // ── Add profile ──
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError('');
    try {
      if (user) {
        const ref = await addDoc(collection(db, 'users', user.uid, 'familyProfiles'), {
          ...form,
          createdAt: serverTimestamp(),
        });
        setProfiles((prev) => [...prev, { id: ref.id, ...form }]);
      } else {
        const demo = { id: `p${Date.now()}`, ...form, medicines: 0, lastSync: 'Just now' };
        setProfiles((prev) => [...prev, demo]);
      }
      setForm({ name: '', relation: 'Father', dob: '', avatar: '👴', notes: '' });
      setShowAdd(false);
      showToast('✅ Profile added!');
    } catch (err) {
      setError(err.message || 'Failed to add profile');
    }
    setSaving(false);
  };

  // ── Delete profile ──
  const handleDelete = async (profileId) => {
    if (DEMO_PROFILES.find((p) => p.id === profileId)) {
      setProfiles((prev) => prev.filter((p) => p.id !== profileId));
      showToast('🗑️ Profile removed');
      return;
    }
    try {
      if (user) await deleteDoc(doc(db, 'users', user.uid, 'familyProfiles', profileId));
      setProfiles((prev) => prev.filter((p) => p.id !== profileId));
      showToast('🗑️ Profile removed');
    } catch (err) {
      showToast('❌ Failed to remove');
    }
  };

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  return (
    <div className="flex-col gap-6 animate-fade-in">
      {toast && (
        <div className="badge badge-success w-full" style={{ padding: '10px 16px', justifyContent: 'center', position: 'sticky', top: 8, zIndex: 50 }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">Family Profiles</h1>
          <p className="page-subtitle">Manage unlimited family members — free forever</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          + Add
        </button>
      </div>

      {/* Add Profile Form */}
      {showAdd && (
        <div className="glass-card" style={{ border: '1px solid var(--primary)', padding: 'var(--space-5)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">New Family Member</h3>
            <button onClick={() => { setShowAdd(false); setError(''); }} className="btn btn-ghost btn-sm">✕</button>
          </div>
          {error && (
            <div className="badge badge-danger w-full mb-3" style={{ padding: '8px 12px', justifyContent: 'center' }}>{error}</div>
          )}
          <form onSubmit={handleAdd} className="flex-col gap-4">
            {/* Avatar picker */}
            <div>
              <label className="input-label">Avatar</label>
              <div className="flex gap-2 flex-wrap">
                {AVATARS.map((a) => (
                  <button
                    key={a} type="button"
                    onClick={() => set('avatar', a)}
                    style={{
                      width: 40, height: 40, fontSize: '1.4rem',
                      border: `2px solid ${form.avatar === a ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)', background: form.avatar === a ? 'var(--primary)20' : 'var(--bg-glass)',
                      cursor: 'pointer',
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Full Name *</label>
              <input className="input" placeholder="e.g. Ravi Sharma" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>

            <div className="flex gap-3">
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="input-label">Relation</label>
                <select className="input" value={form.relation} onChange={(e) => set('relation', e.target.value)}>
                  {RELATIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="input-label">Date of Birth</label>
                <input type="date" className="input" value={form.dob} onChange={(e) => set('dob', e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Notes (optional)</label>
              <input className="input" placeholder="e.g. Allergic to penicillin" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={saving}>
              {saving ? 'Adding...' : '✅ Add Profile'}
            </button>
          </form>
        </div>
      )}

      {/* Loading */}
      {loading && [1, 2].map((i) => (
        <div key={i} className="skeleton skeleton-card" style={{ height: 96 }} />
      ))}

      {/* Empty state */}
      {!loading && profiles.length === 0 && (
        <div className="glass-card text-center" style={{ padding: 'var(--space-12)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>👨‍👩‍👧‍👦</div>
          <h3 className="font-bold mb-2">No family profiles yet</h3>
          <p className="text-secondary mb-6">Add family members to track their medications too.</p>
          <button onClick={() => setShowAdd(true)} className="btn btn-primary">Add Family Member</button>
        </div>
      )}

      {/* Profile Cards */}
      <div className="flex-col gap-4">
        {profiles.map((profile) => {
          const age = profile.dob
            ? Math.floor((Date.now() - new Date(profile.dob)) / (1000 * 60 * 60 * 24 * 365.25))
            : null;
          return (
            <div key={profile.id} className="glass-card">
              <div className="flex items-center gap-4">
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'var(--bg-glass)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.8rem', border: '2px solid var(--border)',
                }}>
                  {profile.avatar || '👤'}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{profile.name}</h3>
                    <span className="badge" style={{ background: 'var(--primary)20', color: 'var(--primary-light)', fontSize: '0.7rem' }}>
                      {profile.relation}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-1" style={{ flexWrap: 'wrap' }}>
                    {age !== null && (
                      <span className="text-xs text-muted">Age: {age}</span>
                    )}
                    {profile.medicines !== undefined && (
                      <span className="text-xs text-muted">💊 {profile.medicines} medicines</span>
                    )}
                    {profile.lastSync && (
                      <span className="text-xs text-muted">🔄 {profile.lastSync}</span>
                    )}
                  </div>
                  {profile.notes && (
                    <p className="text-xs text-secondary mt-1">📝 {profile.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(profile.id)}
                    className="btn btn-ghost btn-sm btn-icon"
                    style={{ color: 'var(--danger)', width: 32, height: 32 }}
                    title="Remove"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Caregiver invite card */}
      <div className="glass-card-primary">
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '2rem' }}>🤝</span>
          <div>
            <p className="font-bold">Invite a Caregiver</p>
            <p className="text-sm text-secondary">Give read-only access to a doctor or nurse</p>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <input className="input" placeholder="Caregiver's email" style={{ flex: 1 }} readOnly onClick={() => alert('Feature coming soon — invite via email to share your medication view')} />
          <button className="btn btn-primary btn-sm" onClick={() => alert('Caregiver invite link copied!\n(Full feature requires backend setup)')}>
            Invite
          </button>
        </div>
      </div>
    </div>
  );
}
