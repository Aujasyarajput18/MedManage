'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subscribeMedicines, subscribeJournalEntries, getUserProfile } from '@/lib/firestore';
import { getDemoJournal, getDemoMedicines, getDemoProfile, isDemoMode } from '@/lib/demo';
import styles from './export.module.css';

export default function ExportPage() {
  const { user, loading: authLoading } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [journal, setJournal]     = useState([]);
  const [profile, setProfile]     = useState(null);

  const name  = profile?.name || user?.displayName || 'Patient';
  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    if (authLoading) return;

    if (!user && isDemoMode()) {
      setMedicines(getDemoMedicines());
      setJournal(getDemoJournal());
      setProfile(getDemoProfile());
      return;
    }

    if (!user) {
      setMedicines([]);
      setJournal([]);
      setProfile(null);
      return;
    }
    const unsubMeds = subscribeMedicines(user.uid, setMedicines);
    const unsubJournal = subscribeJournalEntries(user.uid, setJournal);
    getUserProfile(user.uid).then(p => p && setProfile(p));
    return () => { unsubMeds(); unsubJournal(); };
  }, [user, authLoading]);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `🏥 My MedManage Health Report\n\n` +
      `📋 Medicines: ${medicines.map(m => `${m.name} ${m.dosage}`).join(', ')}\n` +
      `📅 Generated: ${today}\n\n` +
      `Download MedManage (free): https://medmanage-web.vercel.app`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleExportJSON = () => {
    const data = { profile: { name, exportedAt: today }, medicines, journal };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'medmanage-data.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-col gap-6 animate-fade-in">
      {/* Hide this header when printing */}
      <div className="page-header no-print" style={{ marginBottom: 0 }}>
        <h1 className="page-title">📄 Doctor's Report</h1>
        <p className="page-subtitle">Export your full health summary as PDF</p>
      </div>
      <div className="no-print flex-col gap-3">
        <button onClick={handlePrint} className="btn btn-primary w-full" style={{ minHeight: 52 }}>
          🖨️ Save as PDF / Print
        </button>
        <button onClick={handleWhatsApp} className="btn w-full" style={{ background: '#25D366', color: '#fff', minHeight: 52, border: 'none' }}>
          <span style={{ marginRight: 8 }}>💬</span>Share via WhatsApp
        </button>
        <button onClick={handleExportJSON} className="btn btn-ghost w-full">
          📥 Download Raw Data (JSON)
        </button>
      </div>

      {/* The Printable Report */}
      <div className={`${styles.reportContainer} print-only-bg`}>
        <div className={styles.reportHeader}>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: '#0D9488', margin: 0, fontFamily: 'Nunito,sans-serif', fontWeight: 900 }}>Medication & Health Summary</h1>
            <p style={{ color: '#6B7280', margin: 0, fontSize: '0.9rem' }}>Generated via MedManage App</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 'bold', color: '#1C1917', margin: 0 }}>{name}</p>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>Date: {today}</p>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Current Medications ({medicines.length})</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Schedule</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {medicines.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center' }}>No medicines recorded.</td></tr>
              ) : (
                medicines.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 'bold' }}>{m.name}</td>
                    <td>{m.dosage || '-'}</td>
                    <td>{m.times?.join(', ') || m.frequency}</td>
                    <td style={{ fontSize: '0.85rem' }}>{m.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Health Vitals</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Blood Pressure</th>
                <th>Blood Glucose</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {journal.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center' }}>No vitals recorded.</td></tr>
              ) : (
                journal.slice(0, 10).map(j => (
                  <tr key={j.id}>
                    <td>{new Date(j.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>{j.bp || '-'}</td>
                    <td>{j.glucose ? `${j.glucose} mg/dL` : '-'}</td>
                    <td>{j.weight ? `${j.weight} kg` : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '8px' }}>* Showing up to 10 most recent entries.</p>
        </div>

        <div className={styles.footer}>
          <p>This report was automatically generated by MedManage. It is for informational purposes only and does not constitute medical advice.</p>
        </div>
      </div>
    </div>
  );
}
