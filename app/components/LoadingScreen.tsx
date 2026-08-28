'use client'

import { RunPhase } from '@/types/analysis'

type Tool = 'reviews' | 'search' | 'tiktok' | 'instagram'

const COPY: Record<Tool, {
  scraping: { heading: string; sub: string; note: string }
  analyzing: { heading: string; sub: string }
  phases: string[]
}> = {
  reviews: {
    scraping: {
      heading: 'Scraping reviews…',
      sub: 'Pulling real patient reviews from Google Maps',
      note: 'The Apify actor is browsing Google Maps to collect real reviews. This usually takes 2–5 minutes depending on search volume.',
    },
    analyzing: { heading: 'Analysing with AI…', sub: 'Claude is extracting pitch-ready insights' },
    phases: ['Finding Google listings…', 'Scraping review data…', 'AI extracting insights…', 'Building dashboard…'],
  },
  search: {
    scraping: {
      heading: 'Scraping search results…',
      sub: 'Fetching Google search results pages',
      note: 'The Apify actor is collecting SERP data. This usually takes 30–60 seconds.',
    },
    analyzing: { heading: 'Analysing with AI…', sub: 'Claude is extracting competitive insights' },
    phases: ['Querying Google Search…', 'Scraping result pages…', 'AI extracting insights…', 'Building dashboard…'],
  },
  tiktok: {
    scraping: {
      heading: 'Scraping TikTok…',
      sub: 'Fetching videos from TikTok',
      note: 'The Apify actor is collecting TikTok video data. This usually takes 1–3 minutes depending on the hashtag volume.',
    },
    analyzing: { heading: 'Analysing with AI…', sub: 'Claude is identifying content patterns and opportunities' },
    phases: ['Connecting to TikTok…', 'Fetching video data…', 'AI analysing content…', 'Building dashboard…'],
  },
  instagram: {
    scraping: {
      heading: 'Scraping Instagram…',
      sub: 'Fetching posts from Instagram',
      note: 'The Apify actor is collecting Instagram post data. This usually takes 1–3 minutes depending on the hashtag volume.',
    },
    analyzing: { heading: 'Analysing with AI…', sub: 'Claude is identifying content patterns and opportunities' },
    phases: ['Connecting to Instagram…', 'Fetching post data…', 'AI analysing content…', 'Building dashboard…'],
  },
}

function getPhaseIndex(phase: RunPhase, progress: number): number {
  if (phase === 'scraping') return progress > 30 ? 1 : 0
  if (phase === 'analyzing') return 2
  return 3
}

export default function LoadingScreen({
  phase,
  progress,
  tool = 'reviews',
}: {
  phase: RunPhase
  progress: number
  tool?: Tool
}) {
  const currentIndex = getPhaseIndex(phase, progress)
  const copy = COPY[tool]
  const isAnalyzing = phase === 'analyzing'

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
            {isAnalyzing ? copy.analyzing.heading : copy.scraping.heading}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {isAnalyzing ? copy.analyzing.sub : copy.scraping.sub}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {copy.phases.map((label, i) => {
            const done = i < currentIndex
            const active = i === currentIndex
            const future = i > currentIndex
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: future ? 0.35 : 1 }}>
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
                      <path d="M2 5.5L4.5 8L9 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span style={{
                  fontSize: '0.875rem',
                  color: done ? 'var(--text-primary)' : active ? 'var(--accent)' : 'var(--text-muted)',
                  fontWeight: active ? 600 : 400,
                }}>
                  {label}
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
            {copy.scraping.note}
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
