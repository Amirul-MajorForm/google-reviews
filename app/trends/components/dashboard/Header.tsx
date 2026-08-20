'use client'

import { TrendsAnalysisResult } from '@/types/trends'

interface HeaderProps {
  result: TrendsAnalysisResult
  onDownload: () => void
}

const TREND_LABELS: Record<string, string> = {
  rising: '↑ Rising',
  falling: '↓ Falling',
  stable: '→ Stable',
  volatile: '⚡ Volatile',
}

const TREND_COLORS: Record<string, string> = {
  rising: 'var(--positive)',
  falling: 'var(--danger)',
  stable: 'var(--text-muted)',
  volatile: '#f59e0b',
}

export default function TrendsDashboardHeader({ result, onDownload }: HeaderProps) {
  const { insights } = result
  const trendColor = TREND_COLORS[insights.trend] ?? 'var(--text-muted)'

  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      padding: '20px 24px',
      background: 'var(--surface)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 6 }}>Trends Analysis</div>
          <h1 style={{
            fontFamily: 'Space Grotesk',
            fontSize: '1.4rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}>
            {result.keywords.join(' vs ')}
            {result.location && (
              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · {result.location}</span>
            )}
            <span style={{
              fontSize: '0.75rem',
              fontFamily: 'Space Grotesk',
              fontWeight: 700,
              color: trendColor,
              background: 'var(--surface-raised)',
              border: `1px solid ${trendColor}`,
              borderRadius: 20,
              padding: '2px 10px',
            }}>
              {TREND_LABELS[insights.trend] ?? insights.trend}
            </span>
          </h1>
          <p style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {result.interestOverTime.length} time points · {result.relatedQueries.length} related queries · {result.relatedTopics.length} topics · analysed {new Date(result.analyzedAt).toLocaleString()}
          </p>
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
            flexShrink: 0,
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
    </div>
  )
}
