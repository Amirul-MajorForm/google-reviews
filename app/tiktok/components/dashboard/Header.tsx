import { TikTokAnalysisResult } from '@/types/tiktok'

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

export default function TikTokDashboardHeader({
  result,
  onDownload,
}: {
  result: TikTokAnalysisResult
  onDownload: () => void
}) {
  const queryLabel = result.queryType === 'hashtag'
    ? `#${result.query.replace(/^#/, '')}`
    : result.queryType === 'profile'
    ? `@${result.query.replace(/^@/, '')}`
    : result.query

  return (
    <div style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '20px 32px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div className="section-label">TikTok Intelligence</div>
              <span style={{
                fontSize: '0.65rem',
                fontFamily: 'Space Grotesk',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--accent)',
                background: 'var(--accent)18',
                padding: '2px 7px',
                borderRadius: 4,
              }}>
                {result.queryType}
              </span>
            </div>
            <h1 style={{
              fontFamily: 'Space Grotesk',
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              {queryLabel}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
              {result.totalVideos} videos · analysed {new Date(result.analyzedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                {fmt(result.totalPlays)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Views</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                {fmt(result.totalLikes)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Likes</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.3rem', color: 'var(--positive)' }}>
                {result.avgEngagementRate}%
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avg ER</div>
            </div>
            <button
              onClick={onDownload}
              style={{
                background: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '8px 16px',
                fontFamily: 'Space Grotesk',
                fontWeight: 600,
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
