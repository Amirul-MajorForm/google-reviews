import { TikTokAnalysisResult } from '@/types/tiktok'
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

export default function TikTokOverviewTab({ result }: { result: TikTokAnalysisResult }) {
  const sorted = [...result.videos].sort((a, b) => b.plays - a.plays)
  const top5 = sorted.slice(0, 5)
  const totalComments = result.videos.reduce((s, v) => s + v.comments, 0)
  const totalShares = result.videos.reduce((s, v) => s + v.shares, 0)
  const avgDuration = result.videos.length
    ? Math.round(result.videos.reduce((s, v) => s + v.duration, 0) / result.videos.length)
    : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        <StatCard label="Videos Analysed" value={String(result.totalVideos)} />
        <StatCard label="Total Views" value={fmt(result.totalPlays)} />
        <StatCard label="Total Likes" value={fmt(result.totalLikes)} />
        <StatCard label="Total Comments" value={fmt(totalComments)} />
        <StatCard label="Total Shares" value={fmt(totalShares)} />
        <StatCard label="Avg Engagement Rate" value={result.avgEngagementRate + '%'} sub="(likes+comments+shares) / views" />
        <StatCard label="Avg Video Duration" value={avgDuration + 's'} />
      </div>

      {/* AI Summary */}
      <Card>
        <Label style={{ marginBottom: 12 }}>AI Summary</Label>
        <p style={{ color: 'var(--text-primary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
          {result.insights.summary}
        </p>
      </Card>

      {/* Top 5 videos */}
      <Card>
        <Label style={{ marginBottom: 16 }}>Top 5 Videos by Views</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {top5.map((v, i) => {
            const er = v.plays > 0 ? (((v.likes + v.comments + v.shares) / v.plays) * 100).toFixed(1) : '0'
            return (
              <div key={v.id || i} style={{
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
                  color: i === 0 ? '#0A0A0A' : 'var(--text-muted)',
                  flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      @{v.authorUsername || v.author}
                    </span>
                    <div style={{ display: 'flex', gap: 14, flexShrink: 0 }}>
                      <span style={{ fontSize: '0.8rem', fontFamily: 'Space Grotesk', fontWeight: 600 }}>{fmt(v.plays)} views</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--positive)', fontFamily: 'Space Grotesk', fontWeight: 600 }}>{er}% ER</span>
                      {v.url && (
                        <a href={v.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none' }}>↗</a>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                    {v.caption.substring(0, 160)}{v.caption.length > 160 ? '…' : ''}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Top Hashtags */}
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
