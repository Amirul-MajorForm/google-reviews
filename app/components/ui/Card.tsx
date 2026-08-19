import { CSSProperties } from 'react'

export default function Card({
  children,
  style,
}: {
  children: React.ReactNode
  style?: CSSProperties
}) {
  return (
    <div className="card" style={style}>
      {children}
    </div>
  )
}
