import { AnalysisResult } from '@/types/analysis'

export default function PrintReport({ result }: { result: AnalysisResult }) {
  const sentimentColor = (s: string) =>
    s === 'positive' ? '#22c55e' : s === 'negative' ? '#ef4444' : '#888888'

  return (
    <div className="print-report">
      {/* Header */}
      <div className="pr-header">
        <div>
          <div className="pr-label">Google Review Analysis</div>
          <h1 className="pr-title">
            {result.query}
            {result.location && <span className="pr-location"> — {result.location}</span>}
          </h1>
          <p className="pr-meta">
            {result.totalReviews} reviews · {result.placesCount} places ·{' '}
            {new Date(result.analyzedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="pr-kpis">
          <div className="pr-kpi">
            <div className="pr-kpi-val">{result.averageRating}/5</div>
            <div className="pr-label">Avg Rating</div>
          </div>
          <div className="pr-kpi">
            <div className="pr-kpi-val" style={{ color: '#22c55e' }}>{result.sentiment.positive}%</div>
            <div className="pr-label">Positive</div>
          </div>
          <div className="pr-kpi">
            <div className="pr-kpi-val" style={{ color: '#ef4444' }}>{result.sentiment.negative}%</div>
            <div className="pr-label">Negative</div>
          </div>
        </div>
      </div>

      {/* Executive summary */}
      <div className="pr-section">
        <div className="pr-section-title">Executive Summary</div>
        <p className="pr-summary">{result.executiveSummary}</p>
      </div>

      {/* Pros & Cons */}
      <div className="pr-section pr-two-col">
        <div>
          <div className="pr-section-title" style={{ color: '#22c55e' }}>Top Pros</div>
          <ul className="pr-list">
            {result.topPros.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
        <div>
          <div className="pr-section-title" style={{ color: '#ef4444' }}>Top Cons</div>
          <ul className="pr-list">
            {result.topCons.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      </div>

      {/* Key Themes */}
      <div className="pr-section">
        <div className="pr-section-title">Key Themes</div>
        <div className="pr-themes">
          {result.keyThemes.map((t, i) => (
            <div key={i} className="pr-theme-chip" style={{ borderColor: sentimentColor(t.sentiment) }}>
              <span className="pr-theme-dot" style={{ background: sentimentColor(t.sentiment) }} />
              {t.theme} <span className="pr-theme-count">×{t.mentions}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pitch Angles */}
      <div className="pr-section">
        <div className="pr-section-title">Pitch Angles</div>
        {result.pitchAngles.map((a, i) => (
          <div key={i} className="pr-pitch">
            <div className="pr-pitch-num">{i + 1}</div>
            <div>
              <div className="pr-pitch-angle">{a.angle}</div>
              <p className="pr-pitch-support">{a.supporting}</p>
              {a.quote && <blockquote className="pr-pitch-quote">"{a.quote}"</blockquote>}
            </div>
          </div>
        ))}
      </div>

      {/* Notable Quotes */}
      <div className="pr-section">
        <div className="pr-section-title">Notable Quotes</div>
        <div className="pr-quotes">
          {result.notableQuotes.map((q, i) => (
            <div key={i} className="pr-quote">
              <p className="pr-quote-text">"{q.text}"</p>
              <div className="pr-quote-meta">
                {'★'.repeat(q.rating)}{'☆'.repeat(5 - q.rating)}
                {q.author && <span> · {q.author}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
