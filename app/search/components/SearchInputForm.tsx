'use client'

import { useState } from 'react'

interface SearchInputFormProps {
  onSubmit: (data: { query: string; location: string; context: string }) => void
  loading?: boolean
}

export default function SearchInputForm({ onSubmit, loading }: SearchInputFormProps) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('Singapore')
  const [context, setContext] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ query: query.trim(), location: location.trim(), context: context.trim() })
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '60px 24px' }}>
      <div style={{ marginBottom: 40 }}>
        <div className="section-label" style={{ marginBottom: 12 }}>Google Search Intelligence</div>
        <h1 style={{
          fontFamily: 'Space Grotesk',
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          marginBottom: 12,
        }}>
          See what's ranking and why
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          Scrape Google search results for any keyword and extract strategic insights — content gaps, dominant players, positioning angles, and opportunities your competitors are missing.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>Search query *</label>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. Ultherapy Singapore, best CrossFit gym, Kumon vs Mathnasium"
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
            Defaults to Singapore. Change to target a different market.
          </p>
        </div>

        <div>
          <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>What do you want to know? (optional)</label>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="e.g. I want to understand how to position my clinic against competitors ranking on page 1. Focus on content gaps and angles they're not covering."
            rows={3}
            style={{ resize: 'vertical' }}
          />
          <p style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Give the AI context on your goal so it surfaces more relevant insights.
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
          {loading ? 'Starting…' : 'Analyse Search Results →'}
        </button>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
          Scraping takes ~30–60 sec · AI analysis adds ~20 seconds
        </p>
      </form>
    </div>
  )
}
