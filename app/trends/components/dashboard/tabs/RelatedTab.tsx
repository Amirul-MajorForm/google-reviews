import { TrendsAnalysisResult } from '@/types/trends'
import Card from '@/app/components/ui/Card'
import Label from '@/app/components/ui/Label'

function QueryList({ title, items, accent }: {
  title: string
  items: { query: string; formattedValue: string }[]
  accent: string
}) {
  if (items.length === 0) return null
  const maxVal = Math.max(...items.map(i => {
    const n = parseFloat(i.formattedValue.replace(/[^0-9.]/g, ''))
    return isNaN(n) ? 100 : n
  }))

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Label>{title}</Label>
        <span style={{
          fontSize: '0.65rem', fontFamily: 'Space Grotesk', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: accent, background: `${accent}18`, padding: '2px 7px', borderRadius: 4,
        }}>
          {accent === 'var(--positive)' ? 'RISING' : 'TOP'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.slice(0, 10).map((item, i) => {
          const n = parseFloat(item.formattedValue.replace(/[^0-9.]/g, ''))
          const pct = isNaN(n) ? 100 : Math.min(100, (n / maxVal) * 100)
          return (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.query}</span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'Space Grotesk', fontWeight: 600, color: accent }}>
                  {item.formattedValue}
                </span>
              </div>
              <div style={{ height: 3, background: 'var(--border)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: accent, borderRadius: 2 }} />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function TopicList({ title, items, accent }: {
  title: string
  items: { topicTitle: string; formattedValue: string }[]
  accent: string
}) {
  if (items.length === 0) return null
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Label>{title}</Label>
        <span style={{
          fontSize: '0.65rem', fontFamily: 'Space Grotesk', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: accent, background: `${accent}18`, padding: '2px 7px', borderRadius: 4,
        }}>
          {accent === 'var(--positive)' ? 'RISING' : 'TOP'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.slice(0, 10).map((item, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 10px',
            background: 'var(--surface-raised)',
            borderRadius: 6,
            border: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.topicTitle}</span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'Space Grotesk', fontWeight: 600, color: accent }}>
              {item.formattedValue}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function TrendsRelatedTab({ result }: { result: TrendsAnalysisResult }) {
  const { relatedQueries, relatedTopics } = result

  const risingQueries = relatedQueries.filter(q => q.isRising)
  const topQueries = relatedQueries.filter(q => !q.isRising)
  const risingTopics = relatedTopics.filter(t => t.isRising)
  const topTopics = relatedTopics.filter(t => !t.isRising)

  const hasData = relatedQueries.length > 0 || relatedTopics.length > 0

  if (!hasData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
        No related queries or topics returned for this keyword.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <QueryList title="Rising Queries" items={risingQueries} accent="var(--positive)" />
        <QueryList title="Top Queries" items={topQueries} accent="var(--accent)" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <TopicList title="Rising Topics" items={risingTopics} accent="var(--positive)" />
        <TopicList title="Top Topics" items={topTopics} accent="var(--accent)" />
      </div>
    </div>
  )
}
