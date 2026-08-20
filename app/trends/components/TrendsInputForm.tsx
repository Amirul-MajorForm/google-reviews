'use client'

import { useState } from 'react'

interface TrendsInputFormProps {
  onSubmit: (data: { keywords: string[]; location: string; timePeriod: string; context: string }) => void
  loading?: boolean
}

const TIME_PERIODS = [
  { value: '7days', label: 'Past 7 days' },
  { value: '1month', label: 'Past month' },
  { value: '3months', label: 'Past 3 months' },
  { value: '12months', label: 'Past 12 months' },
  { value: '5years', label: 'Past 5 years' },
]

export default function TrendsInputForm({ onSubmit, loading }: TrendsInputFormProps) {
  const [primaryKeyword, setPrimaryKeyword] = useState('')
  const [compareKeywords, setCompareKeywords] = useState('')
  const [location, setLocation] = useState('Singapore')
  const [timePeriod, setTimePeriod] = useState('12months')
  const [context, setContext] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const keywords = [primaryKeyword.trim(), ...compareKeywords.split(',').map(k => k.trim()).filter(Boolean)]
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
          Track interest and momentum
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          See how search interest for any topic changes over time, discover rising queries, and spot content opportunities before your competitors do.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>Primary keyword *</label>
          <input
            value={primaryKeyword}
            onChange={e => setPrimaryKeyword(e.target.value)}
            placeholder="e.g. Ultherapy, CrossFit, Kumon"
            required
          />
        </div>

        <div>
          <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>Compare with (optional)</label>
          <input
            value={compareKeywords}
            onChange={e => setCompareKeywords(e.target.value)}
            placeholder="e.g. HIFU, Thermage (comma-separated, up to 4)"
          />
          <p style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Add up to 4 comparison terms to see relative interest.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>Location</label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Singapore, Australia"
            />
          </div>
          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>Time period</label>
            <select value={timePeriod} onChange={e => setTimePeriod(e.target.value)}>
              {TIME_PERIODS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>What do you want to know? (optional)</label>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="e.g. I want to understand if Ultherapy is gaining or losing momentum versus HIFU, and identify content opportunities."
            rows={3}
            style={{ resize: 'vertical' }}
          />
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
          Trends data takes ~30 sec to scrape · AI analysis adds ~20 seconds
        </p>
      </form>
    </div>
  )
}
