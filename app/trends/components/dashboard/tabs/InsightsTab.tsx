import { TrendsAnalysisResult } from '@/types/trends'
import Card from '@/app/components/ui/Card'
import Label from '@/app/components/ui/Label'

export default function TrendsInsightsTab({ result }: { result: TrendsAnalysisResult }) {
  const { insights } = result

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Opportunity Angles */}
      {insights.opportunityAngles?.length > 0 && (
        <Card>
          <Label style={{ marginBottom: 20 }}>Strategic Opportunities</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {insights.opportunityAngles.map((angle, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: 14,
                padding: '14px 16px',
                background: 'var(--surface-raised)',
                borderRadius: 8,
                border: '1px solid var(--border)',
              }}>
                <span style={{
                  fontFamily: 'Space Grotesk',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: 'var(--accent)',
                  lineHeight: 1,
                  flexShrink: 0,
                  paddingTop: 2,
                }}>
                  {i + 1}
                </span>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                  {angle}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Content Ideas */}
      {insights.contentIdeas?.length > 0 && (
        <Card>
          <Label style={{ marginBottom: 20 }}>Content Ideas</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {insights.contentIdeas.map((idea, i) => (
              <div key={i} style={{
                padding: '14px 16px',
                background: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                borderLeft: '3px solid var(--accent)',
                borderRadius: '0 8px 8px 0',
              }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                  {idea}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
