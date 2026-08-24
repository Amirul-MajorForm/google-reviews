const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'videos', label: 'All Videos' },
  { key: 'insights', label: 'AI Insights' },
]

export default function TikTokTabBar({ active, onChange }: { active: string; onChange: (t: string) => void }) {
  return (
    <div style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 4 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            style={{
              padding: '14px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: active === t.key ? '2px solid var(--accent)' : '2px solid transparent',
              color: active === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'Space Grotesk',
              fontWeight: active === t.key ? 600 : 400,
              fontSize: '0.875rem',
              cursor: 'pointer',
              marginBottom: -1,
              transition: 'color 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
