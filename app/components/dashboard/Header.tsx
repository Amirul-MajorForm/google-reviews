import { AnalysisResult } from '@/types/analysis'

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: 'var(--warning)', fontSize: '1rem', letterSpacing: 2 }}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    </span>
  )
}

export default function DashboardHeader({ result }: { result: AnalysisResult }) {
  return (
    <div style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '24px 32px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 6 }}>Review Analysis</div>
            <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.5rem', marginBottom: 4 }}>
              {result.query}
              {result.location && (
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '1.1rem' }}>
                  {' '}— {result.location}
                </span>
              )}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {result.totalReviews} reviews across {result.placesCount} places · analysed {new Date(result.analyzedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '2rem', color: 'var(--accent)' }}>
                {result.averageRating}
              </div>
              <Stars rating={result.averageRating} />
              <div className="section-label" style={{ marginTop: 4 }}>Avg Rating</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '2rem', color: 'var(--positive)' }}>
                {result.sentiment.positive}%
              </div>
              <div className="section-label" style={{ marginTop: 4 }}>Positive</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '2rem', color: 'var(--text-primary)' }}>
                {result.totalReviews}
              </div>
              <div className="section-label" style={{ marginTop: 4 }}>Reviews</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
