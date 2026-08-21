'use client'

import { useState } from 'react'

interface TrendsInputFormProps {
  onSubmit: (data: { keywords: string[]; location: string; timePeriod: string; context: string }) => void
  loading?: boolean
}

const TIME_PERIODS = [
  { value: '7days', label: 'Last 7 days' },
  { value: '1month', label: 'Last month' },
  { value: '3months', label: 'Last 3 months' },
  { value: '12months', label: 'Last 12 months' },
  { value: '5years', label: 'Last 5 years' },
]

export default function TrendsInputForm({ onSubmit, loading }: TrendsInputFormProps) {
  const [keywordsRaw, setKeywordsRaw] = useState('')
  const [location, setLocation] = useState('Singapore')
  const [timePeriod, setTimePeriod] = useState('12months')
  const [context, setContext] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const keywords = keywordsRaw
      .split(',')
      .map(k => k.trim())
      .filter(Boolean)
      .slice(0, 3)
    if (keywords.length === 0) return
    onSubmit({ keywords, location: location.trim(), timePeriod, context: context.trim() })
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '60px 24px' }}>
      <div style={{ marginBottom: 40 }}>
        <div className="section-label" style={{ marginBottom: 12 }}>Google Trends Intelligence</div>
        <h1 style={{
          fontFamily: 'Space Grotesk',
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          marginBottom: 12,
        }}>
          See how interest changes over time
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          Track search interest for any keyword or compare up to 3 terms. Identify seasonal patterns, growth trends, and timing opportunities backed by real Google data.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>
            Keywords (up to 3, comma-separated) *
          </label>
          <input
            value={keywordsRaw}
            onChange={e => setKeywordsRaw(e.target.value)}
            placeholder="e.g. Ultherapy, HIFU, Facelift"
            required
          />
          <p style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Separate multiple keywords with commas. Max 3.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>Location</label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Singapore, United States"
            />
          </div>
          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>Time period</label>
            <select
              value={timePeriod}
              onChange={e => setTimePeriod(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
              }}
            >
              {TIME_PERIODS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>
            What do you want to know? (optional)
          </label>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="e.g. I want to understand when to time our campaign launches and which treatment has the most growing interest."
            rows={3}
            style={{ resize: 'vertical' }}
          />
          <p style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Give the AI context so it surfaces more relevant insights.
          </p>
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
          {loading ? 'Starting…' : 'Analyse Trends →'}
        </button>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
          Takes ~30–90 sec per keyword · AI analysis adds ~20 seconds
        </p>
      </form>
    </div>
  )
}
