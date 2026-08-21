import { TrendsAnalysisResult } from '@/types/trends'

const TREND_COLORS: Record<string, string> = {
  rising: 'var(--positive)',
  falling: 'var(--danger)',
  stable: 'var(--text-muted)',
  volatile: '#f59e0b',
}

export default function TrendsDashboardHeader({
  result,
  onDownload,
}: {
  result: TrendsAnalysisResult
  onDownload: () => void
}) {
  const { insights } = result
  const trendColor = TREND_COLORS[insights.trend] ?? 'var(--text-muted)'

  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      padding: '20px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h2 style={{
            fontFamily: 'Space Grotesk',
            fontWeight: 700,
            fontSize: '1.1rem',
            color: 'var(--text-primary)',
            margin: 0,
          }}>
            {result.keywords.join(' · ')}
          </h2>
          <span style={{
            fontSize: '0.7rem',
            fontFamily: 'Space Grotesk',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: trendColor,
            background: `${trendColor}18`,
            padding: '3px 8px',
            borderRadius: 4,
          }}>
            {insights.trend}
          </span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {result.location} · {result.timePeriod} · {result.interestOverTime.length} data points
        </div>
      </div>

      <button
        onClick={onDownload}
        style={{
          background: 'var(--surface-raised)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: '8px 16px',
          color: 'var(--text-primary)',
          fontFamily: 'Space Grotesk',
          fontWeight: 600,
          fontSize: '0.8rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download PDF
      </button>
    </div>
  )
}
