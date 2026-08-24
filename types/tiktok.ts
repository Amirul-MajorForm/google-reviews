export interface TikTokVideo {
  id: string
  url: string
  caption: string
  author: string
  authorUsername: string
  authorFollowers: number
  duration: number
  plays: number
  likes: number
  comments: number
  shares: number
  hashtags: string[]
  music: string
  createdAt: string
  thumbnail?: string
  hasGeoSignal?: boolean
}

export interface TikTokInsight {
  summary: string
  topContentThemes: string[]
  hookPatterns: string[]
  bestPostingPractices: string[]
  contentGaps: string[]
  creatorLandscape: string
  engagementObservations: string[]
  recommendedAngles: { angle: string; rationale: string }[]
}

export interface TikTokAnalysisResult {
  query: string
  queryType: 'hashtag' | 'profile' | 'keyword'
  totalVideos: number
  totalPlays: number
  totalLikes: number
  avgEngagementRate: number
  topHashtags: { tag: string; count: number }[]
  videos: TikTokVideo[]
  insights: TikTokInsight
  analyzedAt: string
}

export interface TikTokRunState {
  apifyRunId: string | null
  query: string
  queryType: 'hashtag' | 'profile' | 'keyword'
  status: { phase: 'scraping' | 'analyzing' | 'complete' | 'error'; progress: number; error?: string }
  result?: TikTokAnalysisResult
}
