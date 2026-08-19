import { AnalysisResult } from '@/types/analysis'
import Card from '@/app/components/ui/Card'
import Label from '@/app/components/ui/Label'

export default function PitchTab({ result }: { result: AnalysisResult }) {
  const { executiveSummary, pitchAngles, notableQuotes } = result

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Executive Summary */}
      <Card>
        <Label style={{ marginBottom: 12 }}>Executive Summary</Label>
        <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-primary)' }}>
          {executiveSummary}
        </p>
      </Card>

      {/* Pitch Angles */}
      <div>
        <Label style={{ marginBottom: 16 }}>Pitch Angles</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
          {pitchAngles.map((angle, i) => (
            <Card key={i}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Space Grotesk',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: '#0A0A0A',
                  flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontFamily: 'Space Grotesk',
                    fontWeight: 700,
                    fontSize: '1rem',
                    marginBottom: 10,
                    color: 'var(--text-primary)',
                  }}>
                    {angle.angle}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: angle.quote ? 16 : 0 }}>
                    {angle.supporting}
                  </p>
                  {angle.quote && (
                    <blockquote style={{
                      borderLeft: '3px solid var(--accent)',
                      paddingLeft: 16,
                      margin: 0,
                      fontStyle: 'italic',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      lineHeight: 1.6,
                    }}>
                      &ldquo;{angle.quote}&rdquo;
                    </blockquote>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Notable Quotes */}
      <div>
        <Label style={{ marginBottom: 16 }}>Notable Quotes</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, marginTop: 12 }}>
          {notableQuotes.map((q, i) => (
            <Card key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--warning)', fontSize: '0.95rem' }}>
                  {'★'.repeat(q.rating)}{'☆'.repeat(5 - q.rating)}
                </span>
                {q.author && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{q.author}</span>
                )}
              </div>
              <p style={{
                fontSize: '0.875rem',
                lineHeight: 1.6,
                fontStyle: 'italic',
                color: 'var(--text-primary)',
                flex: 1,
              }}>
                &ldquo;{q.text}&rdquo;
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
