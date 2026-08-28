'use client'

import { useState } from 'react'
import { TikTokAnalysisResult } from '@/types/tiktok'
import Card from '@/app/components/ui/Card'
import Label from '@/app/components/ui/Label'

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

type SortKey = 'plays' | 'likes' | 'comments' | 'shares' | 'er'

export default function TikTokVideosTab({ result }: { result: TikTokAnalysisResult }) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('plays')
  const [localOnly, setLocalOnly] = useState(true)

  const localCount = result.videos.filter(v => v.hasGeoSignal).length

  const videos = result.videos
    .filter(v => {
      if (localOnly && !v.hasGeoSignal) return false
      if (search && !v.caption.toLowerCase().includes(search.toLowerCase()) && !v.authorUsername.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .map(v => ({
      ...v,
      er: v.plays > 0 ? (((v.likes + v.comments + v.shares) / v.plays) * 100) : 0,
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
        color: sortBy === k ? '#0A0A0A' : 'var(--text-muted)',
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
            <SortBtn k="plays" label="Views" />
            <SortBtn k="likes" label="Likes" />
            <SortBtn k="comments" label="Comments" />
            <SortBtn k="shares" label="Shares" />
            <SortBtn k="er" label="Eng. Rate" />
          </div>
          <button
            onClick={() => setLocalOnly(!localOnly)}
            style={{
              padding: '5px 12px',
              borderRadius: 5,
              border: '1px solid var(--border)',
              background: localOnly ? 'var(--positive)18' : 'var(--surface-raised)',
              color: localOnly ? 'var(--positive)' : 'var(--text-muted)',
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
            {videos.length} videos
          </span>
        </div>
        <div className="scrollable-table">
          <table>
            <thead>
              <tr>
                <th>Creator</th>
                <th>Caption</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Shares</th>
                <th>ER</th>
                <th>Duration</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {videos.map((v, i) => (
                <tr key={v.id || i}>
                  <td style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      @{v.authorUsername || v.author}
                      {v.hasGeoSignal && (
                        <span title="Contains local market signal (e.g. #singapore)" style={{
                          fontSize: '0.65rem', fontFamily: 'Space Grotesk', fontWeight: 700,
                          color: 'var(--positive)', background: 'var(--positive)18',
                          padding: '1px 5px', borderRadius: 3,
                        }}>
                          LOCAL
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ maxWidth: 320, lineHeight: 1.5, fontSize: '0.85rem' }}>
                    {v.caption.substring(0, 120)}{v.caption.length > 120 ? '…' : ''}
                  </td>
                  <td style={{ fontFamily: 'Space Grotesk', fontWeight: 600, whiteSpace: 'nowrap' }}>{fmt(v.plays)}</td>
                  <td style={{ fontFamily: 'Space Grotesk', fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--positive)' }}>{fmt(v.likes)}</td>
                  <td style={{ fontFamily: 'Space Grotesk', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{fmt(v.comments)}</td>
                  <td style={{ fontFamily: 'Space Grotesk', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{fmt(v.shares)}</td>
                  <td style={{ fontFamily: 'Space Grotesk', fontWeight: 600, whiteSpace: 'nowrap', color: v.er >= 5 ? 'var(--positive)' : 'var(--text-primary)' }}>
                    {v.er.toFixed(1)}%
                  </td>
                  <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>{v.duration}s</td>
                  <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{v.createdAt}</td>
                  <td>
                    {v.url && (
                      <a href={v.url} target="_blank" rel="noopener noreferrer"
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
