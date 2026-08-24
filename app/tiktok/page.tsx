'use client'

import { useState } from 'react'
import Sidebar from '@/app/components/Sidebar'
import LoadingScreen from '@/app/components/LoadingScreen'
import TikTokInputForm from './components/TikTokInputForm'
import TikTokDashboardHeader from './components/dashboard/Header'
import TikTokTabBar from './components/dashboard/TabBar'
import TikTokOverviewTab from './components/dashboard/tabs/OverviewTab'
import TikTokVideosTab from './components/dashboard/tabs/VideosTab'
import TikTokInsightsTab from './components/dashboard/tabs/InsightsTab'
import { TikTokAnalysisResult } from '@/types/tiktok'
import { RunPhase } from '@/types/analysis'

type AppState = 'input' | 'loading' | 'dashboard'

export default function TikTokPage() {
  const [appState, setAppState] = useState<AppState>('input')
  const [loadingPhase, setLoadingPhase] = useState<RunPhase>('scraping')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [result, setResult] = useState<TikTokAnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (data: { query: string; context: string }) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/tiktok/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to start')
      }
      const { runId } = await res.json()
      setAppState('loading')
      setSubmitting(false)
      pollStatus(runId)
    } catch (err) {
      setSubmitting(false)
      alert(String(err) || 'Failed to start analysis. Please try again.')
    }
  }

  const pollStatus = (runId: string) => {
    let notFoundCount = 0
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/tiktok/status?id=${runId}`)

        if (res.status === 404) {
          notFoundCount++
          if (notFoundCount >= 3) {
            clearInterval(interval)
            alert('Analysis session expired. Please try again.')
            setAppState('input')
          }
          return
        }
        notFoundCount = 0

        if (!res.ok) {
          clearInterval(interval)
          const text = await res.text()
          alert(`Error: ${text || res.statusText}`)
          setAppState('input')
          return
        }

        const data = await res.json()
        if (data.phase) setLoadingPhase(data.phase)
        if (data.progress != null) setLoadingProgress(data.progress)

        if (data.phase === 'complete' && data.result) {
          clearInterval(interval)
          setResult(data.result)
          setAppState('dashboard')
        } else if (data.phase === 'error') {
          clearInterval(interval)
          alert(data.error || 'Analysis failed. Please try again.')
          setAppState('input')
        }
      } catch {
        // Network hiccup — keep polling
      }
    }, 5000)
  }

  const handleReset = () => {
    setAppState('input')
    setResult(null)
    setActiveTab('overview')
    setLoadingPhase('scraping')
    setLoadingProgress(0)
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        activeTool="tiktok"
        onNewAnalysis={handleReset}
        showNew={appState === 'dashboard'}
      />

      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        {appState === 'input' && (
          <TikTokInputForm onSubmit={handleSubmit} loading={submitting} />
        )}

        {appState === 'loading' && (
          <LoadingScreen phase={loadingPhase} progress={loadingProgress} />
        )}

        {appState === 'dashboard' && result && (
          <>
            <TikTokDashboardHeader result={result} onDownload={() => window.print()} />
            <TikTokTabBar active={activeTab} onChange={setActiveTab} />
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px' }}>
              {activeTab === 'overview' && <TikTokOverviewTab result={result} />}
              {activeTab === 'videos' && <TikTokVideosTab result={result} />}
              {activeTab === 'insights' && <TikTokInsightsTab result={result} />}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
