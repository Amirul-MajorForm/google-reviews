import { InstagramAnalysisResult } from '@/types/instagram'
import Card from '@/app/components/ui/Card'
import Label from '@/app/components/ui/Label'

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <div style={{ fontSize: '0.72rem', fontFamily: 'Space Grotesk', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.8rem', color: 'var(--text-primary)', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>}
    </Card>
  )
}

function typeLabel(type: string) {
  if (type === 'video') return '▶'
  if (type === 'sidecar') return '⊞'
  return '◻'
}

export default function InstagramOverviewTab({ result }: { result: InstagramAnalysisResult }) {
  const sorted = [...result.posts].sort((a, b) => b.likes - a.likes)
  const top5 = sorted.slice(0, 5)
  const totalViews = result.posts.reduce((s, p) => s + p.views, 0)
  const localCount = result.posts.filter(p => p.hasGeoSignal).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        <StatCard label="Posts Analysed" value={String(result.totalPosts)} />
        <StatCard label="Total Likes" value={fmt(result.totalLikes)} />
        <StatCard label="Total Comments" value={fmt(result.totalComments)} />
        {totalViews > 0 && <StatCard label="Total Video Views" value={fmt(totalViews)} />}
        <StatCard label="Avg Engagement Rate" value={result.avgEngagementRate + '%'} sub="(likes+comments) / followers" />
        <StatCard label="Local Posts" value={String(localCount)} sub="with market geo signal" />
      </div>

      <Card>
        <Label style={{ marginBottom: 12 }}>AI Summary</Label>
        <p style={{ color: 'var(--text-primary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
          {result.insights.summary}
        </p>
      </Card>

      <Card>
        <Label style={{ marginBottom: 16 }}>Top 5 Posts by Likes</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {top5.map((p, i) => (
            <div key={p.id || i} style={{
              display: 'flex', gap: 14, alignItems: 'flex-start',
              padding: '12px 14px',
              background: 'var(--surface-raised)',
              borderRadius: 8,
              border: '1px solid var(--border)',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: i === 0 ? 'var(--accent)' : 'var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.85rem',
                color: i === 0 ? '#FFFFFF' : 'var(--text-muted)',
                flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {typeLabel(p.type)} @{p.ownerUsername}
                    {p.hasGeoSignal && (
                      <span style={{ marginLeft: 6, fontSize: '0.65rem', fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--accent)', background: 'var(--accent)22', padding: '1px 5px', borderRadius: 3 }}>
                        LOCAL
                      </span>
                    )}
                  </span>
                  <div style={{ display: 'flex', gap: 14, flexShrink: 0 }}>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'Space Grotesk', fontWeight: 600 }}>{fmt(p.likes)} likes</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>{fmt(p.comments)} comments</span>
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none' }}>↗</a>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                  {p.caption.substring(0, 200)}{p.caption.length > 200 ? '…' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {result.topHashtags.length > 0 && (
        <Card>
          <Label style={{ marginBottom: 16 }}>Top Hashtags</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {result.topHashtags.map(({ tag, count }) => (
              <span key={tag} style={{
                padding: '5px 12px',
                background: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                fontSize: '0.82rem',
                fontFamily: 'Space Grotesk',
                fontWeight: 500,
              }}>
                #{tag} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({count})</span>
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
