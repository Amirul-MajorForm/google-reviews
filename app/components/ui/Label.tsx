import { CSSProperties } from 'react'

export default function Label({
  children,
  style,
}: {
  children: React.ReactNode
  style?: CSSProperties
}) {
  return (
    <div className="section-label" style={style}>
      {children}
    </div>
  )
}
