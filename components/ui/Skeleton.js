/* Skeleton loading component for all pages */
export function SkeletonCard({ rows = 3 }) {
  return (
    <div className="glass-card flex-col gap-3" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{ height: 18, width: '60%', borderRadius: 8, background: 'rgba(255,255,255,0.08)' }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          height: 14,
          width: `${80 - i * 15}%`,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.05)',
        }} />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} rows={2} />
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="glass-card text-center flex-col" style={{
      alignItems: 'center', gap: 8,
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ height: 32, width: 60, borderRadius: 8, background: 'rgba(255,255,255,0.08)' }} />
      <div style={{ height: 12, width: 80, borderRadius: 8, background: 'rgba(255,255,255,0.05)' }} />
    </div>
  );
}

/* Empty state component */
export function EmptyState({ icon, title, subtitle, actionLabel, onAction }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '48px 24px', textAlign: 'center', gap: 12,
    }}>
      <span style={{ fontSize: '3rem' }}>{icon}</span>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{title}</h3>
      {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{subtitle}</p>}
      {onAction && (
        <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
