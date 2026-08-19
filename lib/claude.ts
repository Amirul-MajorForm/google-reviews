import { AnalysisResult, Review, RatingBar } from '@/types/analysis'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

interface RawReview {
  author: string
  rating: number
  date: string
  text: string
  place?: string
}

interface ClaudeInsights {
  executiveSummary: string
  sentiment: { positive: number; neutral: number; negative: number }
  topPros: string[]
  topCons: string[]
  keyThemes: { theme: string; mentions: number; sentiment: 'positive' | 'neutral' | 'negative' }[]
  pitchAngles: { angle: string; supporting: string; quote?: string }[]
  notableQuotes: { text: string; rating: number; author?: string }[]
  reviewSentiments: ('positive' | 'neutral' | 'negative')[]
  reviewThemes: string[][]
}

export async function analyzeReviews(
  query: string,
  rawReviews: RawReview[]
): Promise<ClaudeInsights> {
  const reviewsForAnalysis = rawReviews
    .filter(r => r.text && r.text.trim().length > 20)
    .slice(0, 200)

  const reviewsText = reviewsForAnalysis
    .map((r, i) => `[${i + 1}] ★${r.rating} | ${r.date || 'Unknown'} | ${r.place || 'Unknown place'}\n"${r.text.substring(0, 600)}"`)
    .join('\n\n')

  const prompt = `You are analyzing Google reviews for "${query}" — an ultrasound-based skin tightening treatment used in aesthetics clinics.

These ${reviewsForAnalysis.length} reviews come from real patients across multiple clinics and providers.

REVIEWS:
${reviewsText}

Extract pitch-ready insights. Return ONLY valid JSON with no markdown, exactly matching this schema:

{
  "executiveSummary": "2-3 sentence synthesis of what patients are saying overall",
  "sentiment": { "positive": number, "neutral": number, "negative": number },
  "topPros": ["6 most frequently praised aspects, as concise phrases"],
  "topCons": ["6 most common complaints, as concise phrases"],
  "keyThemes": [
    { "theme": "string", "mentions": number, "sentiment": "positive|neutral|negative" }
  ],
  "pitchAngles": [
    { "angle": "concise claim headline", "supporting": "1-2 sentence evidence from reviews", "quote": "optional verbatim quote from a review" }
  ],
  "notableQuotes": [
    { "text": "verbatim quote", "rating": number, "author": "first name or initials only" }
  ],
  "reviewSentiments": ["positive|neutral|negative for each review in order, array length = ${reviewsForAnalysis.length}"],
  "reviewThemes": [["theme1", "theme2"] for each review in order, array length = ${reviewsForAnalysis.length}]
}

Rules:
- pitchAngles: 4-5 angles useful when pitching Ultherapy to potential patients or investors
- keyThemes: 6-8 themes (e.g. pain level, treatment results, downtime, cost-value, provider skill, expectation-setting)
- notableQuotes: 6-8 impactful quotes mixing positive and honest/balanced ones
- reviewSentiments and reviewThemes must have exactly ${reviewsForAnalysis.length} entries (one per review)
- sentiment percentages must sum to 100
- Be specific, cite actual patterns from the reviews`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) throw new Error(`Claude API failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  const content = data.content[0].text

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Claude response did not contain valid JSON')
  return JSON.parse(jsonMatch[0]) as ClaudeInsights
}

export function buildAnalysisResult(
  query: string,
  location: string | undefined,
  rawReviews: RawReview[],
  insights: ClaudeInsights
): AnalysisResult {
  const validReviews = rawReviews.filter(r => r.text && r.text.trim().length > 20).slice(0, 200)

  const ratingCounts = [0, 0, 0, 0, 0]
  for (const r of validReviews) {
    const s = Math.round(r.rating)
    if (s >= 1 && s <= 5) ratingCounts[s - 1]++
  }

  const total = validReviews.length || 1
  const ratingDistribution: RatingBar[] = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: ratingCounts[stars - 1],
    pct: Math.round((ratingCounts[stars - 1] / total) * 100),
  }))

  const avgRating =
    validReviews.reduce((sum, r) => sum + r.rating, 0) / (validReviews.length || 1)

  const places = new Set(validReviews.map(r => r.place).filter(Boolean))

  const reviews: Review[] = validReviews.map((r, i) => ({
    author: r.author || 'Anonymous',
    rating: r.rating,
    date: r.date || '',
    text: r.text,
    place: r.place,
    sentiment: insights.reviewSentiments?.[i] ?? 'neutral',
    themes: insights.reviewThemes?.[i] ?? [],
  }))

  return {
    query,
    location,
    totalReviews: validReviews.length,
    placesCount: places.size,
    averageRating: Math.round(avgRating * 10) / 10,
    ratingDistribution,
    sentiment: insights.sentiment,
    executiveSummary: insights.executiveSummary,
    topPros: insights.topPros,
    topCons: insights.topCons,
    keyThemes: insights.keyThemes,
    pitchAngles: insights.pitchAngles,
    notableQuotes: insights.notableQuotes,
    reviews,
    analyzedAt: new Date().toISOString(),
  }
}
