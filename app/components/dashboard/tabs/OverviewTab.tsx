import { AnalysisResult } from '@/types/analysis'
import Card from '@/app/components/ui/Card'
import Label from '@/app/components/ui/Label'
import ScoreBar from '@/app/components/ui/ScoreBar'

const STAR_COLORS = ['#F87171', '#FBBF24', '#A3E635', '#4ADE80', '#22D3EE']

export default function OverviewTab({ result }: { result: AnalysisResult }) {
  const { ratingDistribution, sentiment } = result
  const maxCount = Math.max(...ratingDistribution.map(r => r.count), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
        {[
          { label: 'Avg Rating', value: `${result.averageRating} / 5` },
          { label: 'Total Reviews', value: result.totalReviews.toString() },
          { label: 'Places Scraped', value: result.placesCount.toString() },
          { label: 'Positive Sentiment', value: `${sentiment.positive}%` },
          { label: 'Negative Sentiment', value: `${sentiment.negative}%` },
        ].map(k => (
          <div key={k.label} className="card">
            <Label>{k.label}</Label>
            <div className="kpi-value" style={{ marginTop: 8 }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Rating Distribution */}
        <Card>
          <Label style={{ marginBottom: 20 }}>Rating Distribution</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ratingDistribution.map(r => (
              <div key={r.stars} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  fontFamily: 'Space Grotesk',
                  fontWeight: 600,
                  fontSize: '0.825rem',
                  color: 'var(--text-muted)',
                  width: 20,
                  flexShrink: 0,
                  textAlign: 'right',
                }}>
                  {r.stars}★
                </span>
                <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(r.count / maxCount) * 100}%`,
                    background: STAR_COLORS[r.stars - 1],
                    borderRadius: 4,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: 40, flexShrink: 0 }}>
                  {r.count} ({r.pct}%)
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Sentiment Breakdown */}
        <Card>
          <Label style={{ marginBottom: 20 }}>Sentiment Breakdown</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { label: 'Positive', value: sentiment.positive, color: 'var(--positive)' },
              { label: 'Neutral', value: sentiment.neutral, color: 'var(--text-muted)' },
              { label: 'Negative', value: sentiment.negative, color: 'var(--danger)' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{s.label}</span>
                  <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: s.color }}>{s.value}%</span>
                </div>
                <ScoreBar value={s.value} color={s.color} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
