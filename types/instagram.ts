export interface InstagramPost {
  id: string
  url: string
  shortCode: string
  caption: string
  type: 'image' | 'video' | 'sidecar'
  ownerUsername: string
  ownerFullName: string
  ownerFollowers: number
  likes: number
  comments: number
  views: number
  hashtags: string[]
  locationName?: string
  createdAt: string
  thumbnail?: string
  hasGeoSignal?: boolean
}

export interface InstagramInsight {
  summary: string
  topContentThemes: string[]
  captionPatterns: string[]
  bestPostingPractices: string[]
  contentGaps: string[]
  creatorLandscape: string
  engagementObservations: string[]
  recommendedAngles: { angle: string; rationale: string }[]
}

export interface InstagramAnalysisResult {
  query: string
  queryType: 'hashtag' | 'profile' | 'keyword'
  totalPosts: number
  totalLikes: number
  totalComments: number
  avgEngagementRate: number
  topHashtags: { tag: string; count: number }[]
  posts: InstagramPost[]
  insights: InstagramInsight
  analyzedAt: string
}

export interface InstagramRunState {
  apifyRunId: string | null
  query: string
  queryType: 'hashtag' | 'profile' | 'keyword'
  status: { phase: 'scraping' | 'analyzing' | 'complete' | 'error'; progress: number; error?: string }
  result?: InstagramAnalysisResult
}
