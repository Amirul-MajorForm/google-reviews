import { TikTokAnalysisResult } from '@/types/tiktok'
import Card from '@/app/components/ui/Card'
import Label from '@/app/components/ui/Label'

function BulletList({ items, accent = 'var(--accent)' }: { items: string[]; accent?: string }) {
  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.875rem', lineHeight: 1.6 }}>
          <span style={{ color: accent, flexShrink: 0, fontWeight: 700, marginTop: 1 }}>→</span>
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function TikTokInsightsTab({ result }: { result: TikTokAnalysisResult }) {
  const { insights } = result

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Creator landscape */}
      <Card>
        <Label style={{ marginBottom: 12 }}>Creator Landscape</Label>
        <p style={{ color: 'var(--text-primary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
          {insights.creatorLandscape}
        </p>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Content themes */}
        <Card>
          <Label style={{ marginBottom: 16 }}>Top Content Themes</Label>
          <BulletList items={insights.topContentThemes} accent="var(--accent)" />
        </Card>

        {/* Hook patterns */}
        <Card>
          <Label style={{ marginBottom: 16 }}>Hook Patterns That Work</Label>
          <BulletList items={insights.hookPatterns} accent="var(--warning)" />
        </Card>

        {/* Engagement observations */}
        <Card>
          <Label style={{ marginBottom: 16 }}>What Drives Engagement</Label>
          <BulletList items={insights.engagementObservations} accent="var(--positive)" />
        </Card>

        {/* Best practices */}
        <Card>
          <Label style={{ marginBottom: 16 }}>Best Posting Practices</Label>
          <BulletList items={insights.bestPostingPractices} accent="var(--text-muted)" />
        </Card>
      </div>

      {/* Content gaps */}
      <Card>
        <Label style={{ marginBottom: 16 }}>Content Gaps & Opportunities</Label>
        <BulletList items={insights.contentGaps} accent="var(--positive)" />
      </Card>

      {/* Recommended angles */}
      <Card>
        <Label style={{ marginBottom: 20 }}>Recommended Content Angles</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {insights.recommendedAngles.map((a, i) => (
            <div key={i} style={{
              padding: '16px',
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              borderLeft: '3px solid var(--accent)',
            }}>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '0.9rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                {a.angle}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                {a.rationale}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
