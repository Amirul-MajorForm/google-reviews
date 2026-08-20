import { SearchAnalysisResult } from '@/types/search'
import Card from '@/app/components/ui/Card'
import Label from '@/app/components/ui/Label'

const SENTIMENT_COLOR = {
  positive: 'var(--positive)',
  neutral: 'var(--text-muted)',
  negative: 'var(--danger)',
}

export default function SearchOverviewTab({ result }: { result: SearchAnalysisResult }) {
  const { insights } = result

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
        {[
          { label: 'Results Scraped', value: result.totalResults.toString() },
          { label: 'Organic', value: result.organicResults.toString() },
          { label: 'Paid / Ads', value: result.paidResults.toString() },
          { label: 'Unique Domains', value: (insights.topDomains?.length || 0).toString() },
          { label: 'Content Gaps', value: (insights.contentGaps?.length || 0).toString() },
        ].map(k => (
          <div key={k.label} className="card">
            <Label>{k.label}</Label>
            <div className="kpi-value" style={{ marginTop: 8 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Executive Summary + Search Intent */}
      <Card>
        <Label style={{ marginBottom: 12 }}>Executive Summary</Label>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-primary)', marginBottom: 16 }}>
          {insights.executiveSummary}
        </p>
        {insights.searchIntent && (
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
              INTENT
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {insights.searchIntent}
            </span>
          </div>
        )}
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Dominant Themes */}
        <Card>
          <Label style={{ marginBottom: 16 }}>Dominant Themes</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(insights.dominantThemes || []).map(t => (
              <div key={t.theme} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: SENTIMENT_COLOR[t.sentiment] || 'var(--text-muted)',
                  flexShrink: 0,
                }} />
                <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{t.theme}</span>
                <span style={{
                  fontSize: '0.75rem',
                  fontFamily: 'Space Grotesk',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  background: 'var(--surface-raised)',
                  borderRadius: 4,
                  padding: '2px 7px',
                }}>
                  {t.count}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Domains */}
        <Card>
          <Label style={{ marginBottom: 16 }}>Top Domains Ranking</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(insights.topDomains || []).map((d, i) => (
              <div key={d.domain} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontFamily: 'Space Grotesk',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  width: 18,
                  flexShrink: 0,
                  textAlign: 'right',
                }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>
                  {d.domain}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  background: 'var(--surface-raised)',
                  borderRadius: 4,
                  padding: '2px 6px',
                  flexShrink: 0,
                }}>
                  {d.type}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontFamily: 'Space Grotesk',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  width: 28,
                  textAlign: 'right',
                  flexShrink: 0,
                }}>
                  ×{d.count}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Key Takeaways */}
      <Card>
        <Label style={{ marginBottom: 16 }}>Key Takeaways</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(insights.keyTakeaways || []).map((t, i) => (
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
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{t}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
