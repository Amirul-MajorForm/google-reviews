import { InstagramPost, InstagramInsight, InstagramAnalysisResult } from '@/types/instagram'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

export async function analyzeInstagramPosts(
  query: string,
  queryType: string,
  posts: InstagramPost[],
  context = ''
): Promise<InstagramInsight> {
  const topPosts = [...posts]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 25)

  const postSummaries = topPosts.map((p, i) => {
    const er = p.ownerFollowers > 0
      ? (((p.likes + p.comments) / p.ownerFollowers) * 100).toFixed(2)
      : 'n/a'
    return `[${i + 1}] @${p.ownerUsername} | ${p.type} | ${p.likes.toLocaleString()} likes | ${p.comments.toLocaleString()} comments${p.views ? ` | ${p.views.toLocaleString()} views` : ''}${p.ownerFollowers ? ` | ${p.ownerFollowers.toLocaleString()} followers` : ''} | ER: ${er}%
Caption: "${p.caption.substring(0, 300)}"
Hashtags: ${p.hashtags.slice(0, 8).map(h => '#' + h).join(' ')}${p.locationName ? `\nLocation: ${p.locationName}` : ''}`
  }).join('\n\n')

  const contextSection = context
    ? `\nGOAL: ${context}\nShape your insights to serve this goal.\n`
    : ''

  const prompt = `You are an Instagram content strategist analyzing ${posts.length} Instagram posts for the query "${query}" (type: ${queryType}).
${contextSection}
TOP ${topPosts.length} POSTS BY LIKES:
${postSummaries}

Return ONLY valid JSON with no markdown, exactly matching this schema:
{
  "summary": "2-3 sentence synthesis of what's working on Instagram for this query",
  "topContentThemes": ["6-8 recurring content themes or formats you see across the top posts"],
  "captionPatterns": ["5-7 caption styles, writing patterns, or storytelling approaches in high-performing posts"],
  "bestPostingPractices": ["4-6 observations about post type (image/video/carousel), hashtag use, caption length, visual style"],
  "contentGaps": ["4-6 angles or formats that are underrepresented but could perform well"],
  "creatorLandscape": "1-2 sentences describing who's creating this content (brands, influencers, clinics, etc.)",
  "engagementObservations": ["4-6 observations about what drives likes and comments in this space"],
  "recommendedAngles": [
    { "angle": "concise angle headline", "rationale": "1-2 sentence rationale based on the data" }
  ]
}

Rules:
- recommendedAngles: 4-6 specific, actionable content angles
- Be specific — cite actual patterns from the posts, not generic Instagram advice
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

  const raw: string = textBlock.text
  const stripped = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '')
  const jsonMatch = stripped.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error('[claude-instagram] No JSON in response, first 500 chars:', raw.substring(0, 500))
    throw new Error('Claude response had no JSON')
  }
  return JSON.parse(jsonMatch[0]) as InstagramInsight
}

export function buildInstagramResult(
  query: string,
  queryType: 'hashtag' | 'profile' | 'keyword',
  posts: InstagramPost[],
  insights: InstagramInsight
): InstagramAnalysisResult {
  const totalLikes = posts.reduce((s, p) => s + p.likes, 0)
  const totalComments = posts.reduce((s, p) => s + p.comments, 0)
  const postsWithFollowers = posts.filter(p => p.ownerFollowers > 0)
  const avgEngagementRate = postsWithFollowers.length > 0
    ? Math.round(
        postsWithFollowers.reduce((s, p) => s + ((p.likes + p.comments) / p.ownerFollowers) * 100, 0)
        / postsWithFollowers.length * 10
      ) / 10
    : 0

  const tagCounts: Record<string, number> = {}
  for (const p of posts) {
    for (const tag of p.hashtags) {
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
    totalPosts: posts.length,
    totalLikes,
    totalComments,
    avgEngagementRate,
    topHashtags,
    posts,
    insights,
    analyzedAt: new Date().toISOString(),
  }
}
