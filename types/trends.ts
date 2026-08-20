export interface TrendPoint {
  date: string
  value: number
  keyword: string
}

export interface RelatedQuery {
  query: string
  value: number
  formattedValue: string
  isRising: boolean
  keyword: string
}

export interface RelatedTopic {
  topic: string
  topicTitle: string
  value: number
  formattedValue: string
  isRising: boolean
  keyword: string
}

export interface TrendInsight {
  summary: string
  peakPeriod: string
  trend: 'rising' | 'falling' | 'stable' | 'volatile'
  keyObservations: string[]
  opportunityAngles: string[]
  contentIdeas: string[]
}

export interface TrendsAnalysisResult {
  keywords: string[]
  location: string
  timePeriod: string
  interestOverTime: TrendPoint[]
  relatedQueries: RelatedQuery[]
  relatedTopics: RelatedTopic[]
  insights: TrendInsight
  analyzedAt: string
}

export type TrendsRunPhase = 'scraping' | 'analyzing' | 'complete' | 'error'

export interface TrendsRunStatus {
  phase: TrendsRunPhase
  progress: number
  error?: string
}

export interface TrendsRunState {
  apifyRunId: string | null
  keywords: string[]
  location?: string
  status: TrendsRunStatus
  result?: TrendsAnalysisResult
}
