'use client'

import { TrendsAnalysisResult } from '@/types/trends'
import Card from '@/app/components/ui/Card'
import Label from '@/app/components/ui/Label'

export default function TrendsInsightsTab({ result }: { result: TrendsAnalysisResult }) {
  const { insights } = result

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Opportunity Angles */}
      <Card>
        <Label style={{ marginBottom: 16 }}>Strategic Opportunity Angles</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(insights.opportunityAngles || []).map((angle, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
              padding: '12px 14px',
              background: 'var(--surface-raised)',
              borderRadius: 8,
              border: '1px solid var(--border)',
            }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontFamily: 'Space Grotesk',
                fontWeight: 700,
                fontSize: '0.75rem',
                color: '#0A0A0A',
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.65, paddingTop: 4 }}>
                {angle}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Content Ideas */}
      <Card>
        <Label style={{ marginBottom: 16 }}>Content & Campaign Ideas</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {(insights.contentIdeas || []).map((idea, i) => (
            <div key={i} style={{
              padding: '14px 16px',
              background: 'var(--surface-raised)',
              borderRadius: 8,
              border: '1px solid var(--border)',
              borderLeft: '3px solid var(--accent)',
            }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                <span style={{
                  fontSize: '0.65rem',
                  fontFamily: 'Space Grotesk',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Idea {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                {idea}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Key Observations repeated for reference */}
      <Card>
        <Label style={{ marginBottom: 16 }}>Data-Backed Observations</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(insights.keyObservations || []).map((obs, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{
                fontFamily: 'Space Grotesk',
                fontWeight: 700,
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
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
