export interface Review {
  author: string
  rating: number
  date: string
  text: string
  place?: string
  url?: string
  sentiment: 'positive' | 'neutral' | 'negative'
  themes: string[]
}

export interface RatingBar {
  stars: number
  count: number
  pct: number
}

export interface Theme {
  theme: string
  mentions: number
  sentiment: 'positive' | 'neutral' | 'negative'
}

export interface PitchAngle {
  angle: string
  supporting: string
  quote?: string
}

export interface NotableQuote {
  text: string
  rating: number
  author?: string
}

export interface AnalysisResult {
  query: string
  location?: string
  totalReviews: number
  placesCount: number
  averageRating: number
  ratingDistribution: RatingBar[]
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  executiveSummary: string
  topPros: string[]
  topCons: string[]
  keyThemes: Theme[]
  pitchAngles: PitchAngle[]
  notableQuotes: NotableQuote[]
  reviews: Review[]
  analyzedAt: string
}

export type RunPhase = 'scraping' | 'analyzing' | 'complete' | 'error'

export interface RunStatus {
  phase: RunPhase
  progress: number
  error?: string
}

export interface RunState {
  apifyRunId: string | null
  query: string
  location?: string
  status: RunStatus
  result?: AnalysisResult
}
