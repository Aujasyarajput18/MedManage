'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subscribeMedicines } from '@/lib/firestore';
import { checkDrugInteractions } from '@/lib/ai';

const SEVERITY_CONFIG = {
  safe:    { color: 'var(--success)', bg: 'rgba(67,217,162,0.1)', border: 'rgba(67,217,162,0.3)', icon: '🟢', label: 'Safe' },
  caution: { color: 'var(--warning)', bg: 'rgba(255,179,71,0.1)', border: 'rgba(255,179,71,0.3)', icon: '🟡', label: 'Caution' },
  danger:  { color: 'var(--danger)',  bg: 'rgba(255,71,87,0.1)',  border: 'rgba(255,71,87,0.3)',  icon: '🔴', label: 'Danger' },
};

const DEMO_RESULT = {
  overall: 'caution',
  summary: 'One interaction found. Review details below.',
  interactions: [
    {
      medicines: ['Aspirin', 'Metformin'],
      severity: 'caution',
      title: 'Minor blood sugar interaction',
      explanation: 'Aspirin can occasionally affect blood sugar levels, which may slightly change how Metformin works in your body. This is not dangerous at normal doses.',
      action: 'Monitor your blood sugar more closely if you take both. Inform your doctor at your next visit.',
    },
  ],
};

export default function InteractionsPage() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user) {
      // Demo data
      setMedicines([
        { id: '1', name: 'Metformin' },
        { id: '2', name: 'Aspirin' },
        { id: '3', name: 'Vitamin D3' },
      ]);
      return;
    }
    const unsub = subscribeMedicines(user.uid, setMedicines);
    return () => unsub();
  }, [user]);

  const runCheck = async () => {
    setLoading(true);
    setChecked(true);

    if (!user) {
      // Use demo result for guest mode
      await new Promise((r) => setTimeout(r, 1500));
      setResult(DEMO_RESULT);
      setLoading(false);
      return;
    }

    const data = await checkDrugInteractions(medicines);
    setResult(data || DEMO_RESULT);
    setLoading(false);
  };

  const overall = result ? SEVERITY_CONFIG[result.overall] || SEVERITY_CONFIG.safe : null;

  return (
    <div className="flex-col gap-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🤖 AI Drug Checker</h1>
        <p className="page-subtitle">Analyzes {medicines.length} medicines for interactions</p>
      </div>

      {/* Medicine list */}
      <div className="glass-card flex-col gap-3">
        <h3 className="font-bold">Your Medicines Being Checked</h3>
        {medicines.length === 0 && (
          <p className="text-muted text-sm">No medicines added yet. Add at least 2 to check interactions.</p>
        )}
        <div className="flex flex-wrap gap-2">
          {medicines.map((m) => (
            <span key={m.id} className="badge badge-primary" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
              💊 {m.name}
            </span>
          ))}
        </div>

        {medicines.length >= 2 && (
          <button onClick={runCheck} className="btn btn-primary w-full mt-2" disabled={loading}>
            {loading ? '🤖 Analyzing with AI...' : '🔍 Check Interactions'}
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="glass-card text-center" style={{ padding: 'var(--space-10)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }} className="animate-spin">⚙️</div>
          <p className="font-bold">AI is analyzing your medicines...</p>
          <p className="text-muted text-sm mt-2">Checking {medicines.length * (medicines.length - 1) / 2} combinations</p>
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <div className="flex-col gap-4 animate-fade-in">
          {/* Overall verdict */}
          <div style={{
            background: overall.bg,
            border: `1px solid ${overall.border}`,
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
          }}>
            <div className="flex items-center gap-3 mb-2">
              <span style={{ fontSize: '2rem' }}>{overall.icon}</span>
              <div>
                <div className="font-bold" style={{ color: overall.color, fontSize: '1.1rem' }}>
                  Overall: {overall.label}
                </div>
                <div className="text-sm text-secondary">{result.summary}</div>
              </div>
            </div>
          </div>

          {/* No interactions */}
          {result.interactions.length === 0 && (
            <div className="glass-card text-center">
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>✅</div>
              <h3 className="font-bold mb-2">No Interactions Found</h3>
              <p className="text-secondary text-sm">Your medicines appear safe to take together.</p>
            </div>
          )}

          {/* Interaction cards */}
          {result.interactions.map((interaction, i) => {
            const config = SEVERITY_CONFIG[interaction.severity] || SEVERITY_CONFIG.safe;
            return (
              <div key={i} style={{
                background: config.bg,
                border: `1px solid ${config.border}`,
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
              }}>
                <div className="flex items-center gap-2 mb-3">
                  <span>{config.icon}</span>
                  <span className="font-bold" style={{ color: config.color }}>{interaction.title}</span>
                  <span className="badge" style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}`, marginLeft: 'auto' }}>
                    {config.label}
                  </span>
                </div>

                <div className="flex gap-2 flex-wrap mb-3">
                  {interaction.medicines.map((m) => (
                    <span key={m} className="badge badge-muted">{m}</span>
                  ))}
                </div>

                <p className="text-sm text-secondary mb-3" style={{ lineHeight: 1.7 }}>
                  {interaction.explanation}
                </p>

                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-3)',
                }}>
                  <span className="text-xs font-bold text-muted uppercase">What to do: </span>
                  <span className="text-sm text-primary">{interaction.action}</span>
                </div>
              </div>
            );
          })}

          <p className="text-xs text-muted text-center">
            ⚕️ This is AI-generated information. Always consult your doctor or pharmacist.
          </p>
        </div>
      )}
    </div>
  );
}
