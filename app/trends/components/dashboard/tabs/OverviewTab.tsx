'use client'

import { TrendsAnalysisResult, TrendPoint } from '@/types/trends'
import Card from '@/app/components/ui/Card'
import Label from '@/app/components/ui/Label'

const KEYWORD_COLORS = ['#C8F54A', '#60a5fa', '#f472b6', '#fb923c', '#a78bfa']

function InterestChart({ points, keywords }: { points: TrendPoint[]; keywords: string[] }) {
  if (points.length === 0) return null

  const W = 800
  const H = 200
  const PAD = { top: 16, right: 16, bottom: 40, left: 36 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  // Group by keyword
  const byKeyword: Record<string, TrendPoint[]> = {}
  for (const kw of keywords) byKeyword[kw] = []
  for (const p of points) {
    const key = p.keyword || keywords[0]
    if (!byKeyword[key]) byKeyword[key] = []
    byKeyword[key].push(p)
  }

  const allValues = points.map(p => p.value)
  const maxVal = Math.max(...allValues, 1)

  const dates = [...new Set(points.map(p => p.date))].sort()
  const xScale = (i: number) => PAD.left + (i / Math.max(dates.length - 1, 1)) * chartW
  const yScale = (v: number) => PAD.top + chartH - (v / maxVal) * chartH

  // Y axis tick values
  const yTicks = [0, 25, 50, 75, 100].filter(v => v <= maxVal + 10)

  // X axis: show ~6 labels
  const xStep = Math.max(1, Math.floor(dates.length / 6))
  const xTickIndices = dates.map((_, i) => i).filter(i => i === 0 || i === dates.length - 1 || i % xStep === 0)

  const polylines = keywords.map((kw, ki) => {
    const kwPoints = byKeyword[kw] || []
    if (kwPoints.length < 2) return null
    const sorted = [...kwPoints].sort((a, b) => a.date.localeCompare(b.date))
    const pts = sorted.map(p => {
      const xi = dates.indexOf(p.date)
      return `${xScale(xi).toFixed(1)},${yScale(p.value).toFixed(1)}`
    }).join(' ')
    return { kw, pts, color: KEYWORD_COLORS[ki % KEYWORD_COLORS.length] }
  }).filter(Boolean)

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 400, display: 'block' }}>
        {/* Grid lines */}
        {yTicks.map(v => (
          <g key={v}>
            <line
              x1={PAD.left} y1={yScale(v)}
              x2={PAD.left + chartW} y2={yScale(v)}
              stroke="var(--border)" strokeWidth="1"
            />
            <text
              x={PAD.left - 6} y={yScale(v) + 4}
              fontSize="10" fill="var(--text-muted)" textAnchor="end"
            >{v}</text>
          </g>
        ))}

        {/* X axis labels */}
        {xTickIndices.map(i => (
          <text
            key={i}
            x={xScale(i)} y={H - PAD.bottom + 14}
            fontSize="9" fill="var(--text-muted)" textAnchor="middle"
          >
            {dates[i]?.substring(0, 7) ?? ''}
          </text>
        ))}

        {/* Lines */}
        {polylines.map(pl => pl && (
          <polyline
            key={pl.kw}
            points={pl.pts}
            fill="none"
            stroke={pl.color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Legend */}
      {keywords.length > 1 && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
          {keywords.map((kw, i) => (
            <div key={kw} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 20, height: 3, borderRadius: 2, background: KEYWORD_COLORS[i % KEYWORD_COLORS.length] }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{kw}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TrendsOverviewTab({ result }: { result: TrendsAnalysisResult }) {
  const { insights, interestOverTime, keywords } = result

  const currentVal = interestOverTime.length > 0 ? interestOverTime[interestOverTime.length - 1]?.value ?? 0 : 0
  const peakVal = interestOverTime.length > 0 ? Math.max(...interestOverTime.map(p => p.value)) : 0
  const avgVal = interestOverTime.length > 0
    ? Math.round(interestOverTime.reduce((s, p) => s + p.value, 0) / interestOverTime.length)
    : 0
  const risingQueries = result.relatedQueries.filter(q => q.isRising).length

  const TREND_BADGE: Record<string, { label: string; color: string }> = {
    rising: { label: '↑ Rising', color: 'var(--positive)' },
    falling: { label: '↓ Falling', color: 'var(--danger)' },
    stable: { label: '→ Stable', color: 'var(--text-muted)' },
    volatile: { label: '⚡ Volatile', color: '#f59e0b' },
  }
  const badge = TREND_BADGE[insights.trend] ?? { label: insights.trend, color: 'var(--text-muted)' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
        {[
          { label: 'Current Interest', value: String(currentVal) },
          { label: 'Peak Value', value: String(peakVal) },
          { label: 'Avg Interest', value: String(avgVal) },
          { label: 'Data Points', value: String(interestOverTime.length) },
          { label: 'Rising Queries', value: String(risingQueries) },
        ].map(k => (
          <div key={k.label} className="card">
            <Label>{k.label}</Label>
            <div className="kpi-value" style={{ marginTop: 8 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <Label>Interest Over Time (0–100)</Label>
          <span style={{
            fontSize: '0.7rem',
            fontFamily: 'Space Grotesk',
            fontWeight: 700,
            color: badge.color,
            background: 'var(--surface-raised)',
            border: `1px solid ${badge.color}`,
            borderRadius: 20,
            padding: '2px 10px',
          }}>
            {badge.label}
          </span>
        </div>
        <InterestChart points={interestOverTime} keywords={keywords} />
        {interestOverTime.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '32px 0' }}>
            No time-series data available for this run.
          </p>
        )}
      </Card>

      {/* Summary + Peak */}
      <Card>
        <Label style={{ marginBottom: 12 }}>AI Summary</Label>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-primary)', marginBottom: 16 }}>
          {insights.summary}
        </p>
        {insights.peakPeriod && (
          <div style={{
            background: 'var(--surface-raised)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '10px 14px',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'Space Grotesk', color: 'var(--accent)', fontWeight: 600, flexShrink: 0, paddingTop: 1 }}>
              PEAK
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {insights.peakPeriod}
            </span>
          </div>
        )}
      </Card>

      {/* Key Observations */}
      <Card>
        <Label style={{ marginBottom: 16 }}>Key Observations</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(insights.keyObservations || []).map((obs, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{
                fontFamily: 'Space Grotesk',
                fontWeight: 700,
                fontSize: '0.75rem',
                color: 'var(--accent)',
                width: 20,
                flexShrink: 0,
                paddingTop: 2,
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{obs}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
