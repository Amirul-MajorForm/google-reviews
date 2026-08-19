import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ultherapy Review Analyzer',
  description: 'Pull insights from real patient Google reviews for pitch and strategy',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
