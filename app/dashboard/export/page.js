'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subscribeMedicines, subscribeJournalEntries, getUserProfile } from '@/lib/firestore';
import styles from './export.module.css';

export default function ExportPage() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [journal, setJournal]     = useState([]);
  const [profile, setProfile]     = useState(null);

  const name  = profile?.name || user?.displayName || 'Raj Kumar';
  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    if (!user) {
      // Demo data
      setMedicines([
        { id: '1', name: 'Metformin', dosage: '500mg', times: ['08:00', '20:00'], category: 'Chronic', notes: 'Take with meals' },
        { id: '2', name: 'Aspirin', dosage: '75mg', times: ['09:00'], category: 'Chronic', notes: '' },
      ]);
      setJournal([
        { id: '1', date: '2026-04-25', bp: '120/80', glucose: 98, weight: 72 },
        { id: '2', date: '2026-04-20', bp: '118/76', glucose: 105, weight: 72.5 },
      ]);
      return;
    }
    const unsubMeds = subscribeMedicines(user.uid, setMedicines);
    const unsubJournal = subscribeJournalEntries(user.uid, setJournal);
    getUserProfile(user.uid).then(p => p && setProfile(p));
    return () => { unsubMeds(); unsubJournal(); };
  }, [user]);

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
      <div className="page-header no-print">
        <h1 className="page-title">📄 Doctor's Report</h1>
        <p className="page-subtitle">Generate a PDF summary of your health data</p>
        <div className="flex-col gap-3 mt-4">
          <button onClick={handlePrint} className="btn btn-primary w-full">
            🖨️ Save as PDF / Print
          </button>
          <button onClick={handleWhatsApp} className="btn w-full" style={{ background: '#25D366', color: '#fff' }}>
            <span style={{ marginRight: 8 }}>💬</span>Share via WhatsApp
          </button>
          <button onClick={handleExportJSON} className="btn btn-ghost w-full">
            📥 Download Raw Data (JSON)
          </button>
        </div>
      </div>

      {/* The Printable Report */}
      <div className={`${styles.reportContainer} print-only-bg`}>
        <div className={styles.reportHeader}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: '#12122A', margin: 0 }}>Medication & Health Summary</h1>
            <p style={{ color: '#4A4A6A', margin: 0 }}>Generated via MedManage App</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 'bold', color: '#12122A', margin: 0 }}>{name}</p>
            <p style={{ color: '#4A4A6A', fontSize: '0.9rem', margin: 0 }}>Date: {today}</p>
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
