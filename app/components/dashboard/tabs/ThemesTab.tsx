import { AnalysisResult } from '@/types/analysis'
import Card from '@/app/components/ui/Card'
import Label from '@/app/components/ui/Label'

const SENTIMENT_COLOR = {
  positive: 'var(--positive)',
  neutral: 'var(--warning)',
  negative: 'var(--danger)',
}

export default function ThemesTab({ result }: { result: AnalysisResult }) {
  const { topPros, topCons, keyThemes } = result

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Pros & Cons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <Label style={{ marginBottom: 16 }}>What patients love</Label>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topPros.map((p, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.875rem', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--positive)', flexShrink: 0, fontWeight: 700 }}>+</span>
                {p}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <Label style={{ marginBottom: 16 }}>Common concerns</Label>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topCons.map((c, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.875rem', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--danger)', flexShrink: 0, fontWeight: 700 }}>−</span>
                {c}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Key Themes */}
      <Card>
        <Label style={{ marginBottom: 20 }}>Key Themes</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {keyThemes.map((t, i) => (
            <div key={i} style={{
              padding: '14px 16px',
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 }}>
                  {t.theme}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {t.mentions} mentions
                </div>
              </div>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: SENTIMENT_COLOR[t.sentiment],
                flexShrink: 0,
              }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span><span style={{ color: 'var(--positive)' }}>●</span> Positive</span>
          <span><span style={{ color: 'var(--warning)' }}>●</span> Neutral</span>
          <span><span style={{ color: 'var(--danger)' }}>●</span> Negative</span>
        </div>
      </Card>
    </div>
  )
}
