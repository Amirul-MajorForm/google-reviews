'use client'

import { useState } from 'react'
import Sidebar from '@/app/components/Sidebar'
import LoadingScreen from '@/app/components/LoadingScreen'
import TrendsInputForm from './components/TrendsInputForm'
import TrendsDashboardHeader from './components/dashboard/Header'
import TrendsTabBar from './components/dashboard/TabBar'
import TrendsOverviewTab from './components/dashboard/tabs/OverviewTab'
import TrendsRelatedTab from './components/dashboard/tabs/RelatedTab'
import TrendsInsightsTab from './components/dashboard/tabs/InsightsTab'
import { TrendsAnalysisResult } from '@/types/trends'
import { RunPhase } from '@/types/analysis'

type AppState = 'input' | 'loading' | 'dashboard'

export default function TrendsPage() {
  const [appState, setAppState] = useState<AppState>('input')
  const [loadingPhase, setLoadingPhase] = useState<RunPhase>('scraping')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [result, setResult] = useState<TrendsAnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (data: { keywords: string[]; location: string; timePeriod: string; context: string }) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/trends/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const { runId } = await res.json()
      setAppState('loading')
      setSubmitting(false)
      pollStatus(runId)
    } catch {
      setSubmitting(false)
      alert('Failed to start analysis. Please try again.')
    }
  }

  const pollStatus = (runId: string) => {
    let notFoundCount = 0
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/trends/status?id=${runId}`)

        if (res.status === 404) {
          notFoundCount++
          if (notFoundCount >= 3) {
            clearInterval(interval)
            alert('Analysis session expired (server restarted). Please try again.')
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
        activeTool="trends"
        onNewAnalysis={handleReset}
        showNew={appState === 'dashboard'}
      />

      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        {appState === 'input' && (
          <TrendsInputForm onSubmit={handleSubmit} loading={submitting} />
        )}

        {appState === 'loading' && (
          <LoadingScreen phase={loadingPhase} progress={loadingProgress} />
        )}

        {appState === 'dashboard' && result && (
          <div className="print-report">
            <TrendsDashboardHeader result={result} onDownload={() => window.print()} />
            <TrendsTabBar active={activeTab} onChange={setActiveTab} />
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px' }}>
              {activeTab === 'overview' && <TrendsOverviewTab result={result} />}
              {activeTab === 'related' && <TrendsRelatedTab result={result} />}
              {activeTab === 'insights' && <TrendsInsightsTab result={result} />}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
