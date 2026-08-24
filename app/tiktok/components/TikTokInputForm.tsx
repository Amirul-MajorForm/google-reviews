'use client'

import { useState } from 'react'

interface Props {
  onSubmit: (data: { query: string; country: string; context: string }) => void
  loading?: boolean
}

const COUNTRIES = [
  { code: 'SG', label: 'Singapore' },
  { code: 'AU', label: 'Australia' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'CA', label: 'Canada' },
  { code: 'NZ', label: 'New Zealand' },
  { code: 'MY', label: 'Malaysia' },
  { code: 'ID', label: 'Indonesia' },
  { code: 'TH', label: 'Thailand' },
  { code: 'IN', label: 'India' },
  { code: 'PH', label: 'Philippines' },
  { code: 'AE', label: 'UAE' },
]

export default function TikTokInputForm({ onSubmit, loading }: Props) {
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('SG')
  const [context, setContext] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ query: query.trim(), country, context: context.trim() })
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '60px 24px' }}>
      <div style={{ marginBottom: 40 }}>
        <div className="section-label" style={{ marginBottom: 12 }}>TikTok Intelligence</div>
        <h1 style={{
          fontFamily: 'Space Grotesk',
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          marginBottom: 12,
        }}>
          Decode what's winning on TikTok
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          Scrape TikTok videos by hashtag, keyword, or creator profile. Get AI analysis of top-performing content — hooks, themes, engagement patterns, and content gaps you can exploit.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>Hashtag, keyword, or @profile *</label>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. #ultherapy, hifu treatment, @clinicname"
            required
          />
          <p style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Use <strong>#hashtag</strong> for hashtag search · <strong>keyword</strong> for topic search · <strong>@username</strong> for a creator's videos
          </p>
        </div>

        <div>
          <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>Country / region</label>
          <select
            value={country}
            onChange={e => setCountry(e.target.value)}
            style={{ width: '100%' }}
          >
            {COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
          <p style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Sets the proxy location so TikTok returns content relevant to that market.
          </p>
        </div>

        <div>
          <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>What do you want to know? (optional)</label>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="e.g. I want to understand what content formats are driving the most engagement in the aesthetics space so I can create a content strategy for my clinic."
            rows={3}
            style={{ resize: 'vertical' }}
          />
          <p style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Give the AI context on your goal for more targeted insights.
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
          {loading ? 'Starting…' : 'Analyse TikToks →'}
        </button>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
          Scraping takes ~60–120 sec · AI analysis adds ~20 seconds
        </p>
      </form>
    </div>
  )
}
