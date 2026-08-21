const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'related', label: 'Related Queries' },
  { key: 'insights', label: 'AI Insights' },
]

export default function TrendsTabBar({ active, onChange }: { active: string; onChange: (t: string) => void }) {
  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      display: 'flex',
      gap: 0,
    }}>
      {TABS.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: active === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
            padding: '12px 16px',
            fontFamily: 'Space Grotesk',
            fontWeight: active === tab.key ? 600 : 400,
            fontSize: '0.875rem',
            color: active === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'color 0.15s',
            marginBottom: -1,
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
