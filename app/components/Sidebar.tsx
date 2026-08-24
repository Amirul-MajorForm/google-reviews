'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface SidebarProps {
  activeTool: 'reviews' | 'search' | 'tiktok'
  onNewAnalysis?: () => void
  showNew?: boolean
}

const TOOLS = [
  {
    key: 'reviews',
    label: 'Review Scraper',
    description: 'Google Maps reviews',
    href: '/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    key: 'search',
    label: 'Search Scraper',
    description: 'Google Search results',
    href: '/search',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    key: 'tiktok',
    label: 'TikTok Analyser',
    description: 'TikTok content intelligence',
    href: '/tiktok',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
      </svg>
    ),
  },
]

export default function Sidebar({ activeTool, onNewAnalysis, showNew }: SidebarProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (saved) {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh',
      flexShrink: 0,
    }}>

      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            background: 'var(--accent)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1" fill="#0A0A0A"/>
              <rect x="9" y="2" width="5" height="5" rx="1" fill="#0A0A0A"/>
              <rect x="2" y="9" width="5" height="5" rx="1" fill="#0A0A0A"/>
              <rect x="9" y="9" width="5" height="5" rx="1" fill="#0A0A0A" opacity="0.4"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              MajorForm
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
              Intelligence Suite
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 6 }}>
          <div style={{
            fontSize: '0.6rem',
            fontFamily: 'Space Grotesk',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            padding: '4px 10px 8px',
          }}>
            Tools
          </div>

          {TOOLS.map(tool => {
            const isActive = activeTool === tool.key
            return (
              <Link
                key={tool.key}
                href={tool.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 10px',
                  borderRadius: 7,
                  marginBottom: 2,
                  background: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? '#0A0A0A' : 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  textDecoration: 'none',
                }}
              >
                <span style={{ flexShrink: 0 }}>{tool.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'Space Grotesk',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.85rem',
                    lineHeight: 1.2,
                  }}>
                    {tool.label}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    opacity: isActive ? 0.7 : 1,
                    color: isActive ? '#0A0A0A' : 'var(--text-muted)',
                    lineHeight: 1.2,
                    marginTop: 1,
                  }}>
                    {tool.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom actions */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {showNew && onNewAnalysis && (
          <button
            onClick={onNewAnalysis}
            style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              borderRadius: 7,
              padding: '9px 12px',
              color: 'var(--text-primary)',
              fontFamily: 'Space Grotesk',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Analysis
          </button>
        )}
        <button
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: 7,
            padding: '9px 12px',
            color: 'var(--text-muted)',
            fontFamily: 'Space Grotesk',
            fontSize: '0.8rem',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {theme === 'dark' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </aside>
  )
}
