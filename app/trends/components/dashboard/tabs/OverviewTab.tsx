import { TrendsAnalysisResult, TrendPoint } from '@/types/trends'
import Card from '@/app/components/ui/Card'
import Label from '@/app/components/ui/Label'

const KEYWORD_COLORS = ['#C8F54A', '#60a5fa', '#f472b6', '#fb923c', '#a78bfa']

function InterestChart({ points, keywords }: { points: TrendPoint[]; keywords: string[] }) {
  if (points.length === 0) return null

  const byKeyword: Record<string, TrendPoint[]> = {}
  for (const kw of keywords) byKeyword[kw] = []
  for (const pt of points) {
    if (byKeyword[pt.keyword]) byKeyword[pt.keyword].push(pt)
  }

  // Use dates from the first keyword as x-axis
  const dates = (byKeyword[keywords[0]] ?? points).map(p => p.date)
  const maxVal = Math.max(...points.map(p => p.value), 1)

  const W = 800
  const H = 200
  const PAD = { top: 12, right: 16, bottom: 32, left: 32 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const x = (i: number) => PAD.left + (i / Math.max(dates.length - 1, 1)) * innerW
  const y = (v: number) => PAD.top + innerH - (v / maxVal) * innerH

  const gridLines = [0, 25, 50, 75, 100]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {/* Grid lines */}
      {gridLines.map(v => {
        if (v > maxVal) return null
        const yp = y(v)
        return (
          <g key={v}>
            <line x1={PAD.left} y1={yp} x2={W - PAD.right} y2={yp} stroke="var(--border)" strokeWidth="1" />
            <text x={PAD.left - 4} y={yp + 4} fontSize="10" fill="var(--text-muted)" textAnchor="end">{v}</text>
          </g>
        )
      })}

      {/* Lines per keyword */}
      {keywords.map((kw, ki) => {
        const pts = byKeyword[kw] ?? []
        if (pts.length < 2) return null
        const color = KEYWORD_COLORS[ki % KEYWORD_COLORS.length]
        const d = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(pt.value)}`).join(' ')
        return <path key={kw} d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      })}

      {/* X-axis labels — show ~6 evenly spaced */}
      {dates.filter((_, i) => {
        const step = Math.max(1, Math.floor(dates.length / 6))
        return i % step === 0 || i === dates.length - 1
      }).map((date, _, arr) => {
        const i = dates.indexOf(date)
        return (
          <text key={date} x={x(i)} y={H - 4} fontSize="9" fill="var(--text-muted)" textAnchor="middle">
            {date.length > 10 ? date.slice(0, 7) : date}
          </text>
        )
      })}
    </svg>
  )
}

export default function TrendsOverviewTab({ result }: { result: TrendsAnalysisResult }) {
  const { keywords, interestOverTime, insights } = result

  const avgByKeyword = keywords.map(kw => {
    const pts = interestOverTime.filter(p => p.keyword === kw)
    const avg = pts.length ? Math.round(pts.reduce((s, p) => s + p.value, 0) / pts.length) : 0
    const peak = pts.length ? Math.max(...pts.map(p => p.value)) : 0
    const latest = pts.length ? pts[pts.length - 1].value : 0
    return { kw, avg, peak, latest, count: pts.length }
  })

  const totalPoints = interestOverTime.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
        {avgByKeyword.map(({ kw, avg, peak, latest }, i) => (
          <div key={kw} className="card">
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: KEYWORD_COLORS[i % KEYWORD_COLORS.length],
              marginBottom: 6,
            }} />
            <Label style={{ marginBottom: 4 }}>{kw}</Label>
            <div className="kpi-value">{latest}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              peak {peak} · avg {avg}
            </div>
          </div>
        ))}
        <div className="card">
          <Label style={{ marginBottom: 8 }}>Data Points</Label>
          <div className="kpi-value">{totalPoints}</div>
        </div>
      </div>

      {/* Chart */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Label>Interest Over Time</Label>
          <div style={{ display: 'flex', gap: 12 }}>
            {keywords.map((kw, i) => (
              <div key={kw} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 2, background: KEYWORD_COLORS[i % KEYWORD_COLORS.length], borderRadius: 1 }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{kw}</span>
              </div>
            ))}
          </div>
        </div>
        <InterestChart points={interestOverTime} keywords={keywords} />
      </Card>

      {/* AI Summary */}
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
      {insights.keyObservations?.length > 0 && (
        <Card>
          <Label style={{ marginBottom: 16 }}>Key Observations</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {insights.keyObservations.map((obs, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{
                  minWidth: 22, height: 22,
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontFamily: 'Space Grotesk', fontWeight: 700,
                  color: 'var(--text-muted)', flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                  {obs}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
