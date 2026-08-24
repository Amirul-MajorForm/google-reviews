import { TikTokVideo, TikTokInsight, TikTokAnalysisResult } from '@/types/tiktok'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

export async function analyzeTikTokVideos(
  query: string,
  queryType: string,
  videos: TikTokVideo[],
  context = ''
): Promise<TikTokInsight> {
  const topVideos = [...videos]
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 40)

  const videoSummaries = topVideos.map((v, i) => {
    const engRate = v.plays > 0 ? (((v.likes + v.comments + v.shares) / v.plays) * 100).toFixed(1) : '0'
    return `[${i + 1}] @${v.authorUsername} | ${v.plays.toLocaleString()} views | ${v.likes.toLocaleString()} likes | ${v.comments.toLocaleString()} comments | ${v.shares.toLocaleString()} shares | ER: ${engRate}% | ${v.duration}s
Caption: "${v.caption.substring(0, 300)}"
Hashtags: ${v.hashtags.slice(0, 8).map(h => '#' + h).join(' ')}
Music: ${v.music}`
  }).join('\n\n')

  const contextSection = context
    ? `\nGOAL: ${context}\nShape your insights to serve this goal.\n`
    : ''

  const prompt = `You are a TikTok content strategist analyzing ${videos.length} TikTok videos for the query "${query}" (type: ${queryType}).
${contextSection}
TOP ${topVideos.length} VIDEOS BY VIEWS:
${videoSummaries}

Return ONLY valid JSON with no markdown, exactly matching this schema:
{
  "summary": "2-3 sentence synthesis of what's working on TikTok for this query",
  "topContentThemes": ["6-8 recurring content themes or formats you see across the top videos"],
  "hookPatterns": ["5-7 opening hook patterns or caption styles that appear in high-performing videos"],
  "bestPostingPractices": ["4-6 observations about duration, hashtag use, music choice, posting style"],
  "contentGaps": ["4-6 angles or formats that are underrepresented but could perform well"],
  "creatorLandscape": "1-2 sentences describing who's creating this content (brands, creators, etc.)",
  "engagementObservations": ["4-6 observations about what drives likes, comments, shares in this space"],
  "recommendedAngles": [
    { "angle": "concise angle headline", "rationale": "1-2 sentence rationale based on the data" }
  ]
}

Rules:
- recommendedAngles: 4-6 specific, actionable content angles
- Be specific — cite actual patterns from the videos, not generic TikTok advice
- Focus on what makes high-performers stand out from lower ones`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) throw new Error(`Claude API failed: ${res.status} ${await res.text()}`)
  const data = await res.json()

  const textBlock = data.content?.find((b: { type: string }) => b.type === 'text')
  if (!textBlock?.text) throw new Error('No text in Claude response')

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Claude response had no JSON')
  return JSON.parse(jsonMatch[0]) as TikTokInsight
}

export function buildTikTokResult(
  query: string,
  queryType: 'hashtag' | 'profile' | 'keyword',
  videos: TikTokVideo[],
  insights: TikTokInsight
): TikTokAnalysisResult {
  const totalPlays = videos.reduce((s, v) => s + v.plays, 0)
  const totalLikes = videos.reduce((s, v) => s + v.likes, 0)
  const totalEngagements = videos.reduce((s, v) => s + v.likes + v.comments + v.shares, 0)
  const avgEngagementRate = totalPlays > 0
    ? Math.round((totalEngagements / totalPlays) * 1000) / 10
    : 0

  const tagCounts: Record<string, number> = {}
  for (const v of videos) {
    for (const tag of v.hashtags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    }
  }
  const topHashtags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([tag, count]) => ({ tag, count }))

  return {
    query,
    queryType,
    totalVideos: videos.length,
    totalPlays,
    totalLikes,
    avgEngagementRate,
    topHashtags,
    videos,
    insights,
    analyzedAt: new Date().toISOString(),
  }
}
