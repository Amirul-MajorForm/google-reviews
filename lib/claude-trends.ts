import { TrendsAnalysisResult, TrendPoint, TrendInsight } from '@/types/trends'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

export async function analyzeTrends(
  keywords: string[],
  interestOverTime: TrendPoint[],
  context = ''
): Promise<TrendInsight> {
  // Build a compact time-series representation per keyword
  const byKeyword: Record<string, TrendPoint[]> = {}
  for (const pt of interestOverTime) {
    if (!byKeyword[pt.keyword]) byKeyword[pt.keyword] = []
    byKeyword[pt.keyword].push(pt)
  }

  const seriesText = Object.entries(byKeyword).map(([kw, pts]) => {
    const last20 = pts.slice(-20).map(p => `${p.date}:${p.value}`).join(', ')
    return `${kw}: ${last20}`
  }).join('\n')

  const contextSection = context
    ? `\nANALYSIS GOAL: ${context}\nTailor insights to this goal.\n`
    : ''

  const prompt = `You are analyzing Google Trends data for: ${keywords.join(', ')}.
${contextSection}
INTEREST OVER TIME (0-100 scale, most recent 20 data points per keyword):
${seriesText}

Return ONLY valid JSON with no markdown:
{
  "summary": "2-3 sentence synthesis of the trend story — is interest growing, declining, seasonal, or stable?",
  "peakPeriod": "When did peak interest occur (date or period)?",
  "trend": "rising|falling|stable|volatile",
  "keyObservations": ["5-7 specific, data-backed observations referencing actual dates and values"],
  "opportunityAngles": ["4-5 strategic opportunities based on the trend pattern"],
  "contentIdeas": ["5-6 specific content or campaign ideas inspired by the trend"]
}

Rules:
- Reference specific dates and values from the data
- keyObservations must be factual (e.g. "Interest peaked at 91 in March 2024 then declined to 62 by June")
- opportunityAngles and contentIdeas must be actionable and specific`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) throw new Error(`Claude API failed: ${res.status} ${await res.text()}`)
  const data = await res.json()

  const textBlock = data.content?.find((b: { type: string }) => b.type === 'text')
  if (!textBlock?.text) throw new Error('No text in Claude response')

  const match = textBlock.text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Claude did not return valid JSON')
  return JSON.parse(match[0]) as TrendInsight
}

export function buildTrendsResult(
  keywords: string[],
  location: string,
  timePeriod: string,
  interestOverTime: TrendPoint[],
  insights: TrendInsight
): TrendsAnalysisResult {
  return {
    keywords,
    location,
    timePeriod,
    interestOverTime,
    insights,
    analyzedAt: new Date().toISOString(),
  }
}
