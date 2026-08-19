'use client'

import { RunPhase } from '@/types/analysis'

const PHASES = [
  { key: 'scraping-start', label: 'Finding Google reviews…', phase: 'scraping' },
  { key: 'scraping-fetch', label: 'Scraping review data…', phase: 'scraping' },
  { key: 'analyzing', label: 'AI extracting insights…', phase: 'analyzing' },
  { key: 'complete', label: 'Building dashboard…', phase: 'complete' },
]

function getPhaseIndex(phase: RunPhase, progress: number): number {
  if (phase === 'scraping') return progress > 30 ? 1 : 0
  if (phase === 'analyzing') return 2
  return 3
}

export default function LoadingScreen({ phase, progress }: { phase: RunPhase; progress: number }) {
  const currentIndex = getPhaseIndex(phase, progress)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 56px)',
      padding: 24,
    }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            width: 48,
            height: 48,
            border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            margin: '0 auto 24px',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.3rem', marginBottom: 8 }}>
            {phase === 'analyzing' ? 'Analysing with AI…' : 'Scraping reviews…'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {phase === 'analyzing' ? 'Claude is extracting pitch-ready insights' : 'Pulling real patient reviews from Google'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {PHASES.map((p, i) => {
            const done = i < currentIndex
            const active = i === currentIndex
            const future = i > currentIndex
            return (
              <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: future ? 0.35 : 1 }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: done ? 'var(--accent)' : active ? 'transparent' : 'var(--border)',
                  border: active ? '2px solid var(--accent)' : 'none',
                  animation: active ? 'pulse 1.4s ease-in-out infinite' : 'none',
                }}>
                  {done && (
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M2 5.5L4.5 8L9 3" stroke="#0A0A0A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span style={{
                  fontSize: '0.875rem',
                  color: done ? 'var(--text-primary)' : active ? 'var(--accent)' : 'var(--text-muted)',
                  fontWeight: active ? 600 : 400,
                }}>
                  {p.label}
                </span>
              </div>
            )
          })}
        </div>

        {phase === 'scraping' && (
          <div style={{
            marginTop: 32,
            padding: '14px 18px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: '0.825rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}>
            The Apify actor is browsing Google Maps to collect real patient reviews. This usually takes 2–5 minutes depending on the search volume.
          </div>
        )}

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </div>
    </div>
  )
}
