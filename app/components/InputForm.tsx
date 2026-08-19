'use client'

import { useState } from 'react'

interface InputFormProps {
  onSubmit: (data: { query: string; location: string; maxReviews: number }) => void
  loading?: boolean
}

export default function InputForm({ onSubmit, loading }: InputFormProps) {
  const [query, setQuery] = useState('Ultherapy')
  const [location, setLocation] = useState('')
  const [maxReviews, setMaxReviews] = useState(100)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ query: query.trim(), location: location.trim(), maxReviews })
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '60px 24px' }}>
      <div style={{ marginBottom: 40 }}>
        <div className="section-label" style={{ marginBottom: 12 }}>Google Review Intelligence</div>
        <h1 style={{
          fontFamily: 'Space Grotesk',
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          marginBottom: 12,
        }}>
          Analyse what patients are saying
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          Scrape Google reviews for any treatment or brand and extract pitch-ready insights — sentiment, themes, pros, cons, and angles for your response.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>Treatment or Brand *</label>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. Ultherapy, HIFU, CoolSculpting"
            required
          />
        </div>

        <div>
          <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>Location (optional)</label>
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Singapore, Sydney, United States"
          />
          <p style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Leave blank to scrape reviews globally.
          </p>
        </div>

        <div>
          <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>Number of Reviews</label>
          <select value={maxReviews} onChange={e => setMaxReviews(Number(e.target.value))}>
            <option value={50}>50 reviews (faster)</option>
            <option value={100}>100 reviews (recommended)</option>
            <option value={200}>200 reviews (comprehensive)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: 'var(--accent)',
            color: '#0A0A0A',
            border: 'none',
            borderRadius: 6,
            padding: '14px 24px',
            fontFamily: 'Space Grotesk',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            marginTop: 8,
          }}
        >
          {loading ? 'Starting…' : 'Analyse Reviews →'}
        </button>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
          Scraping takes 2–5 min · AI analysis adds ~30 seconds
        </p>
      </form>
    </div>
  )
}
