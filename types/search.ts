export interface SearchResult {
  title: string
  url: string
  description: string
  position: number
  type: string
  domain: string
}

export interface DomainCount {
  domain: string
  count: number
  type: string
}

export interface SearchTheme {
  theme: string
  count: number
  sentiment: 'positive' | 'neutral' | 'negative'
}

export interface PositioningAngle {
  angle: string
  supporting: string
  evidence?: string
}

export interface SearchInsights {
  executiveSummary: string
  searchIntent: string
  dominantThemes: SearchTheme[]
  topDomains: DomainCount[]
  contentGaps: string[]
  positioningAngles: PositioningAngle[]
  keyTakeaways: string[]
  competitorInsights: string[]
}

export interface SearchAnalysisResult {
  query: string
  location?: string
  totalResults: number
  organicResults: number
  paidResults: number
  insights: SearchInsights
  results: SearchResult[]
  analyzedAt: string
}

export type SearchRunPhase = 'scraping' | 'analyzing' | 'complete' | 'error'

export interface SearchRunStatus {
  phase: SearchRunPhase
  progress: number
  error?: string
}

export interface SearchRunState {
  apifyRunId: string | null
  query: string
  location?: string
  status: SearchRunStatus
  result?: SearchAnalysisResult
}
