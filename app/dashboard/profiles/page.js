'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, updateUserProfile, subscribeMedicines } from '@/lib/firestore';
import { isDemoMode } from '@/lib/demo';

const DEMO_PROFILES = [
  { id: 'self', name: 'Priya Sharma', relation: 'Self', dob: '1955-08-12', bloodGroup: 'B+', conditions: ['Type 2 Diabetes', 'Hypertension'], allergies: ['Penicillin'], isMain: true },
  { id: 'son', name: 'Amit Sharma', relation: 'Son (Caregiver)', phone: '+91 98765 43210', canViewMeds: true, canEditMeds: false, isCaregiver: true },
];

const RELATIONS = ['Self', 'Spouse', 'Son', 'Daughter', 'Parent', 'Sibling', 'Caregiver'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function ProfilesPage() {
  const { user } = useAuth();
  const [profiles, setProfiles]   = useState(DEMO_PROFILES);
  const [showForm, setShowForm]   = useState(false);
  const [selected, setSelected]   = useState('self');
  const [form, setForm]           = useState({ name: '', relation: 'Self', dob: '', bloodGroup: 'B+', phone: '', conditions: '', allergies: '', canViewMeds: true, canEditMeds: false });
  const [saving, setSaving]       = useState(false);
  const [inviteCode]              = useState('MED-' + Math.random().toString(36).substring(2, 7).toUpperCase());

  const current = profiles.find(p => p.id === selected) || profiles[0];

  const handleAdd = (e) => {
    e.preventDefault();
    setSaving(true);
    const isCaregiver = form.relation !== 'Self';
    setProfiles(prev => [...prev, {
      id: Date.now().toString(),
      name: form.name,
      relation: form.relation,
      dob: form.dob,
      bloodGroup: form.bloodGroup,
      phone: form.phone,
      conditions: form.conditions.split(',').map(s => s.trim()).filter(Boolean),
      allergies: form.allergies.split(',').map(s => s.trim()).filter(Boolean),
      canViewMeds: form.canViewMeds,
      canEditMeds: form.canEditMeds,
      isCaregiver,
    }]);
    setForm({ name: '', relation: 'Self', dob: '', bloodGroup: 'B+', phone: '', conditions: '', allergies: '', canViewMeds: true, canEditMeds: false });
    setShowForm(false);
    setSaving(false);
  };

  return (
    <div className="flex-col gap-5 animate-fade-in">
      <div>
        <h1 className="page-title">👨‍👩‍👧 Profiles</h1>
        <p className="page-subtitle">Manage family members & caregivers</p>
      </div>

      {/* Profile selector */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
        {profiles.map(p => (
          <button key={p.id} onClick={() => setSelected(p.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            padding: '10px 14px', borderRadius: 'var(--radius-md)',
            border: selected === p.id ? '2px solid var(--primary)' : '1px solid var(--border)',
            background: selected === p.id ? 'rgba(13,148,136,0.08)' : 'var(--bg-card)',
            cursor: 'pointer', flexShrink: 0, minWidth: 80,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: p.isCaregiver ? 'rgba(251,146,60,0.15)' : 'rgba(13,148,136,0.15)',
              border: `2px solid ${p.isCaregiver ? 'rgba(251,146,60,0.4)' : 'rgba(13,148,136,0.4)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', fontWeight: 900, fontFamily: 'Nunito,sans-serif',
              color: p.isCaregiver ? 'var(--accent)' : 'var(--primary)',
            }}>{p.name.charAt(0)}</div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{p.name.split(' ')[0]}</span>
            {p.isCaregiver && <span style={{ fontSize: '0.55rem', background: 'rgba(251,146,60,0.15)', color: 'var(--accent)', borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>Caregiver</span>}
          </button>
        ))}
        <button onClick={() => setShowForm(true)} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '2px dashed var(--border)',
          background: 'transparent', cursor: 'pointer', flexShrink: 0, minWidth: 80, color: 'var(--text-muted)',
        }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>+</div>
          <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Add</span>
        </button>
      </div>

      {/* Current profile detail */}
      {current && (
        <div className="glass-card flex-col gap-4">
          <div className="flex items-center gap-3">
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: current.isCaregiver ? 'rgba(251,146,60,0.15)' : 'rgba(13,148,136,0.15)',
              border: `3px solid ${current.isCaregiver ? 'var(--accent)' : 'var(--primary)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', fontWeight: 900, fontFamily: 'Nunito,sans-serif',
              color: current.isCaregiver ? 'var(--accent)' : 'var(--primary)',
            }}>{current.name.charAt(0)}</div>
            <div>
              <p className="font-bold" style={{ margin: 0, fontSize: '1.1rem' }}>{current.name}</p>
              <p className="text-sm text-muted" style={{ margin: 0 }}>{current.relation}</p>
              {current.phone && <p className="text-xs" style={{ margin: 0, color: 'var(--primary)' }}>📞 {current.phone}</p>}
            </div>
          </div>

          {/* Health info */}
          {(current.dob || current.bloodGroup) && (
            <div className="flex gap-3">
              {current.dob && (
                <div style={{ flex: 1, background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)' }}>
                  <p className="text-xs text-muted font-bold">DATE OF BIRTH</p>
                  <p className="text-sm font-bold" style={{ margin: 0 }}>{new Date(current.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              )}
              {current.bloodGroup && (
                <div style={{ flex: 1, background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)' }}>
                  <p className="text-xs text-muted font-bold">BLOOD GROUP</p>
                  <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--danger)' }}>{current.bloodGroup}</p>
                </div>
              )}
            </div>
          )}

          {current.conditions?.length > 0 && (
            <div>
              <p className="text-xs text-muted font-bold mb-2">CONDITIONS</p>
              <div className="flex gap-2 flex-wrap">
                {current.conditions.map((c, i) => <span key={i} className="badge badge-warning">{c}</span>)}
              </div>
            </div>
          )}

          {current.allergies?.length > 0 && (
            <div>
              <p className="text-xs text-muted font-bold mb-2">ALLERGIES</p>
              <div className="flex gap-2 flex-wrap">
                {current.allergies.map((a, i) => <span key={i} className="badge badge-danger">{a}</span>)}
              </div>
            </div>
          )}

          {current.isCaregiver && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-3)' }}>
              <p className="text-xs text-muted font-bold mb-3">CAREGIVER PERMISSIONS</p>
              {[
                { label: 'Can view medicines', value: current.canViewMeds },
                { label: 'Can edit medicines', value: current.canEditMeds },
              ].map((perm, i) => (
                <div key={i} className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold">{perm.label}</span>
                  <span style={{ background: perm.value ? 'rgba(16,185,129,0.12)' : 'rgba(168,162,158,0.12)', color: perm.value ? 'var(--success)' : 'var(--text-muted)', borderRadius: 'var(--radius-full)', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {perm.value ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invite code */}
      <div className="glass-card-sm flex-col gap-2">
        <p className="text-xs text-muted font-bold">CAREGIVER INVITE CODE</p>
        <div className="flex items-center gap-2">
          <span style={{ flex: 1, fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', background: 'rgba(13,148,136,0.08)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--primary)' }}>
            {inviteCode}
          </span>
          <button className="btn btn-primary btn-sm" onClick={() => navigator.clipboard?.writeText(inviteCode).then(() => alert('Code copied!'))}>
            Copy
          </button>
        </div>
        <p className="text-xs text-muted">Share this code with your caregiver to grant access</p>
      </div>

      {/* Add profile modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Add Profile</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form onSubmit={handleAdd} className="flex-col gap-4">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Full Name</label>
                <input className="input" placeholder="Priya Sharma" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Relation</label>
                <select className="input" value={form.relation} onChange={e => setForm(p => ({ ...p, relation: e.target.value }))}>
                  {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="input-label">Date of Birth</label>
                  <input type="date" className="input" value={form.dob} onChange={e => setForm(p => ({ ...p, dob: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="input-label">Blood Group</label>
                  <select className="input" value={form.bloodGroup} onChange={e => setForm(p => ({ ...p, bloodGroup: e.target.value }))}>
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Phone (for caregiver)</label>
                <input className="input" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Medical Conditions (comma-separated)</label>
                <input className="input" placeholder="Diabetes, Hypertension" value={form.conditions} onChange={e => setForm(p => ({ ...p, conditions: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Allergies (comma-separated)</label>
                <input className="input" placeholder="Penicillin, Sulfa" value={form.allergies} onChange={e => setForm(p => ({ ...p, allergies: e.target.value }))} />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={saving}>
                {saving ? 'Adding...' : 'Add Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
