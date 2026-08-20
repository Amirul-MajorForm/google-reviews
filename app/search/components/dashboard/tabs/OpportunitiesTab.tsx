import { SearchAnalysisResult } from '@/types/search'
import Card from '@/app/components/ui/Card'
import Label from '@/app/components/ui/Label'

export default function OpportunitiesTab({ result }: { result: SearchAnalysisResult }) {
  const { insights } = result

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Positioning Angles */}
      <Card>
        <Label style={{ marginBottom: 20 }}>Positioning Angles</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {(insights.positioningAngles || []).map((angle, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <span style={{
                fontFamily: 'Space Grotesk',
                fontWeight: 700,
                fontSize: '1.4rem',
                color: 'var(--border)',
                flexShrink: 0,
                width: 28,
                lineHeight: 1,
                paddingTop: 2,
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'Space Grotesk',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                  marginBottom: 6,
                }}>
                  {angle.angle}
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: angle.evidence ? 8 : 0 }}>
                  {angle.supporting}
                </p>
                {angle.evidence && (
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    paddingLeft: 10,
                    borderLeft: '2px solid var(--border)',
                    lineHeight: 1.5,
                  }}>
                    {angle.evidence}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Content Gaps */}
        <Card>
          <Label style={{ marginBottom: 16 }}>Content Gaps</Label>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
            Topics and angles absent from current results — opportunities to rank or differentiate.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(insights.contentGaps || []).map((gap, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 1,
                }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{gap}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Competitor Insights */}
        <Card>
          <Label style={{ marginBottom: 16 }}>Competitor Landscape</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(insights.competitorInsights || []).map((insight, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{
                  fontFamily: 'Space Grotesk',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  color: 'var(--accent)',
                  flexShrink: 0,
                  paddingTop: 3,
                }}>
                  ·
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{insight}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
