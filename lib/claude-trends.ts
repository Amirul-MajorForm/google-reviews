import { TrendsAnalysisResult, TrendPoint, RelatedQuery, RelatedTopic, TrendInsight } from '@/types/trends'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

export async function analyzeTrends(
  keywords: string[],
  interestOverTime: TrendPoint[],
  relatedQueries: RelatedQuery[],
  relatedTopics: RelatedTopic[],
  context = ''
): Promise<TrendInsight> {
  const timeSeriesText = interestOverTime
    .slice(-52) // last 52 data points
    .map(p => `${p.date}: ${p.keyword}=${p.value}`)
    .join(', ')

  const risingQueries = relatedQueries.filter(q => q.isRising).slice(0, 10)
  const topQueries = relatedQueries.filter(q => !q.isRising).slice(0, 10)
  const risingTopics = relatedTopics.filter(t => t.isRising).slice(0, 8)

  const contextSection = context
    ? `\nANALYSIS GOAL: ${context}\nTailor insights and opportunities to this goal.\n`
    : ''

  const prompt = `You are analyzing Google Trends data for the keyword(s): ${keywords.join(', ')}.
${contextSection}

INTEREST OVER TIME (0-100 scale, recent ${interestOverTime.length} data points):
${timeSeriesText}

RISING QUERIES (breakout trends):
${risingQueries.map(q => `"${q.query}" (${q.formattedValue})`).join(', ')}

TOP QUERIES (consistently searched):
${topQueries.map(q => `"${q.query}" (${q.value})`).join(', ')}

RISING TOPICS:
${risingTopics.map(t => `"${t.topicTitle}" (${t.formattedValue})`).join(', ')}

Return ONLY valid JSON with no markdown:
{
  "summary": "2-3 sentence synthesis of the trend story — is interest growing, declining, seasonal, or stable?",
  "peakPeriod": "When did peak interest occur (date or period)?",
  "trend": "rising|falling|stable|volatile",
  "keyObservations": ["5-7 specific, data-backed observations about the trend pattern"],
  "opportunityAngles": ["4-5 strategic opportunities based on the trend data — timing, positioning, or content angles"],
  "contentIdeas": ["5-6 specific content or campaign ideas inspired by the rising queries and topics"]
}

Rules:
- Reference specific dates, values, or queries from the data
- keyObservations should be factual (e.g. "Interest peaked at 91 in March 2024")
- opportunityAngles and contentIdeas should be actionable and grounded in the rising queries`

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
  if (!textBlock?.text) throw new Error('No text block in Claude response')

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Claude did not return valid JSON')
  return JSON.parse(jsonMatch[0]) as TrendInsight
}

export function buildTrendsResult(
  keywords: string[],
  location: string,
  timePeriod: string,
  interestOverTime: TrendPoint[],
  relatedQueries: RelatedQuery[],
  relatedTopics: RelatedTopic[],
  insights: TrendInsight
): TrendsAnalysisResult {
  return {
    keywords,
    location,
    timePeriod,
    interestOverTime,
    relatedQueries,
    relatedTopics,
    insights,
    analyzedAt: new Date().toISOString(),
  }
}
