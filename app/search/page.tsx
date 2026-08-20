'use client'

import { useState } from 'react'
import Sidebar from '@/app/components/Sidebar'
import LoadingScreen from '@/app/components/LoadingScreen'
import SearchInputForm from './components/SearchInputForm'
import SearchDashboardHeader from './components/dashboard/Header'
import SearchTabBar from './components/dashboard/TabBar'
import SearchOverviewTab from './components/dashboard/tabs/OverviewTab'
import SearchResultsTab from './components/dashboard/tabs/ResultsTab'
import OpportunitiesTab from './components/dashboard/tabs/OpportunitiesTab'
import { SearchAnalysisResult } from '@/types/search'
import { RunPhase } from '@/types/analysis'

type AppState = 'input' | 'loading' | 'dashboard'

export default function SearchPage() {
  const [appState, setAppState] = useState<AppState>('input')
  const [loadingPhase, setLoadingPhase] = useState<RunPhase>('scraping')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [result, setResult] = useState<SearchAnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (data: { query: string; location: string; context: string }) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/search/start', {
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
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/search/status?id=${runId}`)
        const data = await res.json()

        setLoadingPhase(data.phase)
        setLoadingProgress(data.progress)

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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        activeTool="search"
        onNewAnalysis={handleReset}
        showNew={appState === 'dashboard'}
      />

      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        {appState === 'input' && (
          <SearchInputForm onSubmit={handleSubmit} loading={submitting} />
        )}

        {appState === 'loading' && (
          <LoadingScreen phase={loadingPhase} progress={loadingProgress} />
        )}

        {appState === 'dashboard' && result && (
          <>
            <SearchDashboardHeader result={result} onDownload={() => window.print()} />
            <SearchTabBar active={activeTab} onChange={setActiveTab} />
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px' }}>
              {activeTab === 'overview' && <SearchOverviewTab result={result} />}
              {activeTab === 'results' && <SearchResultsTab result={result} />}
              {activeTab === 'opportunities' && <OpportunitiesTab result={result} />}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
