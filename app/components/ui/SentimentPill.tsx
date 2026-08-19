export default function SentimentPill({
  value,
}: {
  value: 'positive' | 'neutral' | 'negative' | null | undefined
}) {
  const map = {
    positive: { label: 'Positive', color: 'var(--positive)', bg: 'rgba(74,222,128,0.1)' },
    neutral: { label: 'Neutral', color: 'var(--text-muted)', bg: 'var(--surface-raised)' },
    negative: { label: 'Negative', color: 'var(--danger)', bg: 'rgba(248,113,113,0.1)' },
  }
  const v = value && map[value] ? map[value] : map.neutral
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: '0.75rem',
      fontFamily: 'Space Grotesk',
      fontWeight: 600,
      color: v.color,
      background: v.bg,
    }}>
      {v.label}
    </span>
  )
}
