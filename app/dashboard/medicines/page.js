'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { subscribeMedicines, logDose } from '@/lib/firestore';
import styles from './medicines.module.css';

const CATEGORY_COLORS = {
  Chronic:     { bg: 'rgba(108,99,255,0.15)', color: 'var(--primary-light)' },
  Acute:       { bg: 'rgba(255,71,87,0.15)',  color: '#ff8090' },
  Vitamin:     { bg: 'rgba(67,217,162,0.15)', color: 'var(--success)' },
  Supplement:  { bg: 'rgba(255,179,71,0.15)', color: 'var(--warning)' },
  Ayurvedic:   { bg: 'rgba(100,200,100,0.15)',color: '#78d878' },
};

export default function MedicinesPage() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const userId = user?.uid || 'demo';
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user) {
      // Demo mode: static data
      setMedicines([
        { id: '1', name: 'Metformin', dosage: '500mg', category: 'Chronic', frequency: 'daily', times: ['08:00', '20:00'], pillCount: 28 },
        { id: '2', name: 'Aspirin', dosage: '75mg', category: 'Chronic', frequency: 'daily', times: ['09:00'], pillCount: 60 },
        { id: '3', name: 'Vitamin D3', dosage: '1000 IU', category: 'Vitamin', frequency: 'daily', times: ['08:00'], pillCount: 45 },
      ]);
      setLoading(false);
      return;
    }
    const unsub = subscribeMedicines(user.uid, (meds) => {
      setMedicines(meds);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const filtered = medicines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDose = async (medId, timeSlot, status) => {
    if (!user) return;
    await logDose(user.uid, { medicineId: medId, date: today, timeSlot, status });
  };

  return (
    <div className="flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">My Medicines</h1>
          <p className="page-subtitle">{medicines.length} tracked</p>
        </div>
        <Link href="/dashboard/medicines/add" className="btn btn-primary">
          + Add
        </Link>
      </div>

      {/* Search */}
      <input
        type="search"
        className="input"
        placeholder="🔍  Search medicines..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Loading */}
      {loading && (
        <div className="flex-col gap-3">
          {[1,2,3].map((i) => <div key={i} className="skeleton skeleton-card" />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="glass-card text-center" style={{ padding: 'var(--space-12)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>💊</div>
          <h3 className="font-bold mb-2">No medicines yet</h3>
          <p className="text-secondary mb-6">Add your first medicine to start tracking.</p>
          <Link href="/dashboard/medicines/add" className="btn btn-primary">
            Add Medicine
          </Link>
        </div>
      )}

      {/* Medicine Cards */}
      <div className="flex-col gap-4">
        {filtered.map((med) => {
          const catStyle = CATEGORY_COLORS[med.category] || CATEGORY_COLORS.Chronic;
          const refillLow = med.pillCount !== null && med.pillCount <= 7;
          return (
            <div key={med.id} className={`glass-card ${styles.medCard}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={styles.medIcon} style={{ background: catStyle.bg }}>
                    💊
                  </div>
                  <div>
                    <h3 className="font-bold">{med.name}</h3>
                    <span className="text-xs text-muted">{med.dosage}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge" style={{ background: catStyle.bg, color: catStyle.color }}>
                    {med.category}
                  </span>
                  <Link href={`/dashboard/medicines/${med.id}`} className="btn btn-ghost btn-sm btn-icon" style={{ width: 32, height: 32 }}>
                    ›
                  </Link>
                </div>
              </div>

              {/* Refill warning */}
              {refillLow && (
                <div className="badge badge-warning w-full mb-3" style={{ justifyContent: 'center', padding: '6px' }}>
                  ⚠️ Only {med.pillCount} pills left — refill soon
                </div>
              )}

              {/* Time slots */}
              {med.times && (
                <div className="flex gap-2 flex-wrap">
                  {med.times.map((t) => (
                    <div key={t} className={styles.timeSlot}>
                      <span className="text-xs font-bold">{t}</span>
                      <div className="flex gap-1 mt-1">
                        <button
                          onClick={() => handleDose(med.id, t, 'taken')}
                          className="btn btn-sm btn-success"
                          style={{ minHeight: 28, padding: '0 8px', fontSize: '0.75rem' }}
                        >
                          ✓ Taken
                        </button>
                        <button
                          onClick={() => handleDose(med.id, t, 'skipped')}
                          className="btn btn-sm btn-ghost"
                          style={{ minHeight: 28, padding: '0 8px', fontSize: '0.75rem' }}
                        >
                          Skip
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pill count */}
              {med.pillCount !== null && med.pillCount !== undefined && (
                <div className={styles.pillBar}>
                  <span className="text-xs text-muted">Pills remaining:</span>
                  <div className="flex items-center gap-2">
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{ 
                        width: `${Math.min(100, (med.pillCount / 30) * 100)}%`,
                        background: refillLow ? 'var(--warning)' : undefined,
                      }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: refillLow ? 'var(--warning)' : 'var(--text-secondary)' }}>
                      {med.pillCount}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Interaction Checker Link */}
      {medicines.length >= 2 && (
        <Link href="/dashboard/medicines/interactions" className="glass-card-primary flex items-center gap-4" style={{ textDecoration: 'none', padding: 'var(--space-4)' }}>
          <span style={{ fontSize: '1.5rem' }}>🤖</span>
          <div>
            <div className="font-bold text-sm">Check Drug Interactions</div>
            <div className="text-xs text-secondary">AI analyzes your {medicines.length} medicines for conflicts</div>
          </div>
          <span style={{ marginLeft: 'auto', color: 'var(--primary)' }}>→</span>
        </Link>
      )}
    </div>
  );
}
