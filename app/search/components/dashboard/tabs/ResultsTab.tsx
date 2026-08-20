import { SearchAnalysisResult } from '@/types/search'
import Card from '@/app/components/ui/Card'
import Label from '@/app/components/ui/Label'

const TYPE_COLOR: Record<string, string> = {
  organic: 'var(--positive)',
  paid: 'var(--warning)',
  ad: 'var(--warning)',
  local: '#60A5FA',
  video: '#A78BFA',
  image: '#F472B6',
  news: '#34D399',
}

export default function SearchResultsTab({ result }: { result: SearchAnalysisResult }) {
  const { results } = result
  const organic = results.filter(r => r.type === 'organic' || r.type === 'searchResult' || !r.type)
  const other = results.filter(r => r.type && r.type !== 'organic' && r.type !== 'searchResult')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Card>
        <Label style={{ marginBottom: 16 }}>Organic Results</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {organic.map((r, i) => (
            <div
              key={i}
              style={{
                padding: '14px 0',
                borderBottom: i < organic.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
              }}
            >
              <span style={{
                fontFamily: 'Space Grotesk',
                fontWeight: 700,
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                width: 24,
                flexShrink: 0,
                paddingTop: 2,
                textAlign: 'right',
              }}>
                {r.position || i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'Space Grotesk',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: 'var(--accent)',
                    textDecoration: 'none',
                    lineHeight: 1.3,
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  {r.title}
                </a>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'Space Grotesk' }}>
                  {r.domain}
                </div>
                {r.description && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5, opacity: 0.85 }}>
                    {r.description.substring(0, 300)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {other.length > 0 && (
        <Card>
          <Label style={{ marginBottom: 16 }}>Other Results (Paid / Local / Rich)</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {other.map((r, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 0',
                  borderBottom: i < other.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                }}
              >
                <span style={{
                  fontSize: '0.7rem',
                  fontFamily: 'Space Grotesk',
                  fontWeight: 600,
                  color: TYPE_COLOR[r.type] || 'var(--text-muted)',
                  background: 'var(--surface-raised)',
                  borderRadius: 4,
                  padding: '2px 7px',
                  flexShrink: 0,
                  marginTop: 2,
                  textTransform: 'uppercase',
                }}>
                  {r.type}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'Space Grotesk',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      display: 'block',
                      marginBottom: 3,
                    }}
                  >
                    {r.title}
                  </a>
                  {r.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {r.description.substring(0, 200)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
