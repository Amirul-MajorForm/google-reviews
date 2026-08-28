'use client'

import { useState } from 'react'
import { InstagramAnalysisResult } from '@/types/instagram'
import Card from '@/app/components/ui/Card'
import Label from '@/app/components/ui/Label'

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

type SortKey = 'likes' | 'comments' | 'views' | 'er'

export default function InstagramPostsTab({ result }: { result: InstagramAnalysisResult }) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('likes')
  const [localOnly, setLocalOnly] = useState(true)

  const localCount = result.posts.filter(p => p.hasGeoSignal).length

  const posts = result.posts
    .filter(p => {
      if (localOnly && !p.hasGeoSignal) return false
      if (search && !p.caption.toLowerCase().includes(search.toLowerCase()) && !p.ownerUsername.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .map(p => ({
      ...p,
      er: p.ownerFollowers > 0 ? (((p.likes + p.comments) / p.ownerFollowers) * 100) : 0,
    }))
    .sort((a, b) => b[sortBy] - a[sortBy])

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => setSortBy(k)}
      style={{
        padding: '5px 12px',
        borderRadius: 5,
        border: '1px solid var(--border)',
        background: sortBy === k ? 'var(--accent)' : 'var(--surface-raised)',
        color: sortBy === k ? '#FFFFFF' : 'var(--text-muted)',
        fontFamily: 'Space Grotesk',
        fontWeight: 600,
        fontSize: '0.78rem',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Label>Sort by:</Label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <SortBtn k="likes" label="Likes" />
            <SortBtn k="comments" label="Comments" />
            <SortBtn k="views" label="Views" />
            <SortBtn k="er" label="Eng. Rate" />
          </div>
          <button
            onClick={() => setLocalOnly(!localOnly)}
            style={{
              padding: '5px 12px',
              borderRadius: 5,
              border: '1px solid var(--border)',
              background: localOnly ? 'var(--accent)22' : 'var(--surface-raised)',
              color: localOnly ? 'var(--accent)' : 'var(--text-muted)',
              fontFamily: 'Space Grotesk',
              fontWeight: 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
            }}
          >
            LOCAL only {localOnly ? `(${localCount})` : ''}
          </button>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search captions or creators…"
            style={{ maxWidth: 240, marginLeft: 'auto' }}
          />
        </div>
      </Card>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '0.875rem' }}>
            {posts.length} posts
          </span>
        </div>
        <div className="scrollable-table">
          <table>
            <thead>
              <tr>
                <th>Creator</th>
                <th>Type</th>
                <th>Caption</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Views</th>
                <th>ER</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p, i) => (
                <tr key={p.id || i}>
                  <td style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      @{p.ownerUsername}
                      {p.hasGeoSignal && (
                        <span title="Contains local market signal" style={{
                          fontSize: '0.65rem', fontFamily: 'Space Grotesk', fontWeight: 700,
                          color: 'var(--accent)', background: 'var(--accent)22',
                          padding: '1px 5px', borderRadius: 3,
                        }}>
                          LOCAL
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {p.type === 'video' ? '▶ Video' : p.type === 'sidecar' ? '⊞ Album' : '◻ Image'}
                  </td>
                  <td style={{ maxWidth: 320, lineHeight: 1.5, fontSize: '0.85rem' }}>
                    {p.caption.substring(0, 120)}{p.caption.length > 120 ? '…' : ''}
                  </td>
                  <td style={{ fontFamily: 'Space Grotesk', fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--accent)' }}>{fmt(p.likes)}</td>
                  <td style={{ fontFamily: 'Space Grotesk', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{fmt(p.comments)}</td>
                  <td style={{ fontFamily: 'Space Grotesk', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{p.views ? fmt(p.views) : '—'}</td>
                  <td style={{ fontFamily: 'Space Grotesk', fontWeight: 600, whiteSpace: 'nowrap', color: p.er >= 3 ? 'var(--positive)' : 'var(--text-primary)' }}>
                    {p.er > 0 ? p.er.toFixed(2) + '%' : '—'}
                  </td>
                  <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{p.createdAt}</td>
                  <td>
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noopener noreferrer"
                        style={{ color: 'var(--accent)', fontSize: '0.8rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        ↗
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
