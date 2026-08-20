'use client'

import { TrendsAnalysisResult } from '@/types/trends'
import Card from '@/app/components/ui/Card'
import Label from '@/app/components/ui/Label'

export default function TrendsRelatedTab({ result }: { result: TrendsAnalysisResult }) {
  const risingQueries = result.relatedQueries.filter(q => q.isRising)
  const topQueries = result.relatedQueries.filter(q => !q.isRising)
  const risingTopics = result.relatedTopics.filter(t => t.isRising)
  const topTopics = result.relatedTopics.filter(t => !t.isRising)

  const maxQueryVal = Math.max(...result.relatedQueries.map(q => q.value), 1)
  const maxTopicVal = Math.max(...result.relatedTopics.map(t => t.value), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Rising Queries */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Label>Rising Queries</Label>
            <span style={{
              fontSize: '0.65rem',
              fontFamily: 'Space Grotesk',
              fontWeight: 700,
              color: 'var(--positive)',
              background: 'rgba(34,197,94,0.1)',
              borderRadius: 4,
              padding: '2px 6px',
            }}>BREAKOUT</span>
          </div>
          {risingQueries.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No breakout queries found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {risingQueries.slice(0, 12).map(q => (
                <div key={q.query} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {q.query}
                    </div>
                    <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginTop: 4 }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, (q.value / maxQueryVal) * 100)}%`,
                        background: 'var(--positive)',
                        borderRadius: 2,
                      }} />
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontFamily: 'Space Grotesk',
                    fontWeight: 700,
                    color: 'var(--positive)',
                    flexShrink: 0,
                    minWidth: 48,
                    textAlign: 'right',
                  }}>
                    {q.formattedValue || `+${q.value}%`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top Queries */}
        <Card>
          <Label style={{ marginBottom: 16 }}>Top Queries</Label>
          {topQueries.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No top queries found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topQueries.slice(0, 12).map(q => (
                <div key={q.query} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {q.query}
                    </div>
                    <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginTop: 4 }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, (q.value / maxQueryVal) * 100)}%`,
                        background: 'var(--accent)',
                        borderRadius: 2,
                      }} />
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontFamily: 'Space Grotesk',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                    minWidth: 28,
                    textAlign: 'right',
                  }}>
                    {q.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Rising Topics */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Label>Rising Topics</Label>
            <span style={{
              fontSize: '0.65rem',
              fontFamily: 'Space Grotesk',
              fontWeight: 700,
              color: 'var(--positive)',
              background: 'rgba(34,197,94,0.1)',
              borderRadius: 4,
              padding: '2px 6px',
            }}>BREAKOUT</span>
          </div>
          {risingTopics.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No breakout topics found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {risingTopics.slice(0, 10).map(t => (
                <div key={t.topic || t.topicTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.topicTitle || t.topic}
                    </div>
                    <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginTop: 4 }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, (t.value / maxTopicVal) * 100)}%`,
                        background: 'var(--positive)',
                        borderRadius: 2,
                      }} />
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontFamily: 'Space Grotesk',
                    fontWeight: 700,
                    color: 'var(--positive)',
                    flexShrink: 0,
                    minWidth: 48,
                    textAlign: 'right',
                  }}>
                    {t.formattedValue || `+${t.value}%`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top Topics */}
        <Card>
          <Label style={{ marginBottom: 16 }}>Top Topics</Label>
          {topTopics.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No top topics found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topTopics.slice(0, 10).map(t => (
                <div key={t.topic || t.topicTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.topicTitle || t.topic}
                    </div>
                    <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginTop: 4 }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, (t.value / maxTopicVal) * 100)}%`,
                        background: 'var(--accent)',
                        borderRadius: 2,
                      }} />
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontFamily: 'Space Grotesk',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                    minWidth: 28,
                    textAlign: 'right',
                  }}>
                    {t.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
