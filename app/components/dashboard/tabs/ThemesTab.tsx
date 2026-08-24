'use client'

import { useState } from 'react'
import { AnalysisResult, Theme } from '@/types/analysis'
import Card from '@/app/components/ui/Card'
import Label from '@/app/components/ui/Label'
import SentimentPill from '@/app/components/ui/SentimentPill'

const SENTIMENT_COLOR = {
  positive: 'var(--positive)',
  neutral: 'var(--warning)',
  negative: 'var(--danger)',
}

function ThemeDrillDown({ theme, result, onBack }: { theme: Theme; result: AnalysisResult; onBack: () => void }) {
  const reviews = result.reviews.filter(r => r.themes.includes(theme.theme))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '6px 12px',
            fontFamily: 'Space Grotesk',
            fontWeight: 600,
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          ← Back to Themes
        </button>
        <div>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1rem' }}>{theme.theme}</span>
          <span style={{ marginLeft: 10, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </span>
        </div>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: SENTIMENT_COLOR[theme.sentiment],
          flexShrink: 0,
        }} />
      </div>

      {reviews.length === 0 ? (
        <Card>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '24px 0' }}>
            No reviews tagged with this theme.
          </p>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div className="scrollable-table">
            <table>
              <thead>
                <tr>
                  <th>Reviewer</th>
                  <th>Rating</th>
                  <th>Place</th>
                  <th>Date</th>
                  <th>Review</th>
                  <th>Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{r.author}</td>
                    <td>
                      <span style={{ color: 'var(--warning)', fontFamily: 'Space Grotesk', fontWeight: 700 }}>
                        {'★'.repeat(r.rating)}
                      </span>
                      <span style={{ color: 'var(--border)' }}>{'★'.repeat(5 - r.rating)}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.place || '—'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{r.date}</td>
                    <td style={{ maxWidth: 400, lineHeight: 1.5 }}>{r.text.substring(0, 200)}{r.text.length > 200 ? '…' : ''}</td>
                    <td><SentimentPill value={r.sentiment} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

export default function ThemesTab({ result }: { result: AnalysisResult }) {
  const { topPros, topCons, keyThemes } = result
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)

  if (selectedTheme) {
    return <ThemeDrillDown theme={selectedTheme} result={result} onBack={() => setSelectedTheme(null)} />
  }

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
            <button
              key={i}
              onClick={() => setSelectedTheme(t)}
              style={{
                padding: '14px 16px',
                background: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'
                ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-raised)'
              }}
            >
              <div>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 }}>
                  {t.theme}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {t.mentions} mentions · tap to view
                </div>
              </div>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: SENTIMENT_COLOR[t.sentiment],
                flexShrink: 0,
              }} />
            </button>
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
