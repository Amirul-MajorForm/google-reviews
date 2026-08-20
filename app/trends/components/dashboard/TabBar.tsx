'use client'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'related', label: 'Related Queries' },
  { key: 'insights', label: 'AI Insights' },
]

interface TabBarProps {
  active: string
  onChange: (tab: string) => void
}

export default function TrendsTabBar({ active, onChange }: TabBarProps) {
  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      background: 'var(--surface)',
      display: 'flex',
      gap: 0,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', width: '100%' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: active === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
              padding: '12px 20px',
              color: active === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'Space Grotesk',
              fontWeight: active === tab.key ? 600 : 400,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'color 0.15s',
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
