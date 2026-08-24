'use client'

import { useState } from 'react'
import { AnalysisResult } from '@/types/analysis'
import Card from '@/app/components/ui/Card'
import Label from '@/app/components/ui/Label'
import SentimentPill from '@/app/components/ui/SentimentPill'

export default function ReviewsTab({ result }: { result: AnalysisResult }) {
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all')
  const [search, setSearch] = useState('')

  const filtered = result.reviews.filter(r => {
    if (filter !== 'all' && r.sentiment !== filter) return false
    if (search && !r.text.toLowerCase().includes(search.toLowerCase()) && !r.author.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filters */}
      <Card style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Label>Filter:</Label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['all', 'positive', 'neutral', 'negative'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 5,
                  border: '1px solid var(--border)',
                  background: filter === f ? 'var(--accent)' : 'var(--surface-raised)',
                  color: filter === f ? '#0A0A0A' : 'var(--text-muted)',
                  fontFamily: 'Space Grotesk',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reviews…"
            style={{ maxWidth: 220, marginLeft: 'auto' }}
          />
        </div>
      </Card>

      {/* Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '0.875rem' }}>
            {filtered.length} reviews
          </span>
        </div>
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
              {filtered.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {r.author}
                      {r.url && (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on Google Maps"
                          style={{ color: 'var(--accent)', fontSize: '0.75rem', lineHeight: 1, textDecoration: 'none', flexShrink: 0 }}
                        >
                          ↗
                        </a>
                      )}
                    </div>
                  </td>
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
                  <td style={{ maxWidth: 400, lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: r.text }} />
                  <td><SentimentPill value={r.sentiment} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
