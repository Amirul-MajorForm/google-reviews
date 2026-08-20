import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MajorForm Intelligence',
  description: 'Scrape and analyse Google reviews and search results for pitch-ready insights',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ overflow: 'hidden' }}>{children}</body>
    </html>
  )
}
