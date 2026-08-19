export default function ScoreBar({
  value,
  max = 100,
  color = 'var(--accent)',
}: {
  value: number
  max?: number
  color?: string
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div style={{
      height: 4,
      background: 'var(--border)',
      borderRadius: 2,
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: color,
        borderRadius: 2,
        transition: 'width 0.4s ease',
      }} />
    </div>
  )
}
