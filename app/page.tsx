'use client'

import { useState } from 'react'
import Nav from './components/Nav'
import InputForm from './components/InputForm'
import LoadingScreen from './components/LoadingScreen'
import DashboardHeader from './components/dashboard/Header'
import TabBar from './components/dashboard/TabBar'
import OverviewTab from './components/dashboard/tabs/OverviewTab'
import ThemesTab from './components/dashboard/tabs/ThemesTab'
import ReviewsTab from './components/dashboard/tabs/ReviewsTab'
import PitchTab from './components/dashboard/tabs/PitchTab'
import { AnalysisResult, RunPhase } from '@/types/analysis'

type AppState = 'input' | 'loading' | 'dashboard'

export default function Home() {
  const [appState, setAppState] = useState<AppState>('input')
  const [loadingPhase, setLoadingPhase] = useState<RunPhase>('scraping')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (data: { query: string; location: string; maxReviews: number }) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/analyze/start', {
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
        const res = await fetch(`/api/analyze/status?id=${runId}`)
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
    <>
      <Nav onNewAnalysis={handleReset} showNew={appState === 'dashboard'} />

      {appState === 'input' && (
        <InputForm onSubmit={handleSubmit} loading={submitting} />
      )}

      {appState === 'loading' && (
        <LoadingScreen phase={loadingPhase} progress={loadingProgress} />
      )}

      {appState === 'dashboard' && result && (
        <div>
          <DashboardHeader result={result} />
          <TabBar active={activeTab} onChange={setActiveTab} />
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px' }}>
            {activeTab === 'overview' && <OverviewTab result={result} />}
            {activeTab === 'themes' && <ThemesTab result={result} />}
            {activeTab === 'reviews' && <ReviewsTab result={result} />}
            {activeTab === 'pitch' && <PitchTab result={result} />}
          </div>
        </div>
      )}
    </>
  )
}
