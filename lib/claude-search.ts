import { SearchAnalysisResult, SearchInsights, SearchResult, DomainCount } from '@/types/search'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

interface RawSearchItem {
  title?: string
  url?: string
  description?: string
  snippet?: string
  position?: number
  type?: string
  searchQuery?: { query?: string }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export async function analyzeSearchResults(
  query: string,
  rawItems: RawSearchItem[],
  context = ''
): Promise<SearchInsights> {
  const organic = rawItems.filter(i => !i.type || i.type === 'organic' || i.type === 'searchResult')
  const resultsForAnalysis = organic.slice(0, 50)

  const resultsText = resultsForAnalysis
    .map((r, i) =>
      `[${i + 1}] ${r.type || 'organic'} | ${r.url || ''}\nTitle: ${r.title || 'N/A'}\nSnippet: ${(r.description || r.snippet || '').substring(0, 400)}`
    )
    .join('\n\n')

  const contextSection = context
    ? `\nANALYSIS GOAL (from user): ${context}\nUse this to shape the positioning angles and emphasis of your insights.\n`
    : ''

  const prompt = `You are analyzing Google search results for "${query}".

These results reveal the competitive landscape, content types ranking, and what the market is saying about this topic.
${contextSection}

SEARCH RESULTS (${resultsForAnalysis.length} items):
${resultsText}

Extract strategic insights. Return ONLY valid JSON with no markdown, exactly matching this schema:

{
  "executiveSummary": "2-3 sentence synthesis of the search landscape and what's dominating results",
  "searchIntent": "1 sentence describing the primary user intent behind this query",
  "dominantThemes": [
    { "theme": "string", "count": number, "sentiment": "positive|neutral|negative" }
  ],
  "topDomains": [
    { "domain": "example.com", "count": number, "type": "news|clinic|ecommerce|directory|social|other" }
  ],
  "contentGaps": ["content angles or topics NOT represented in results that could be an opportunity"],
  "positioningAngles": [
    { "angle": "concise positioning claim", "supporting": "1-2 sentence evidence from what's missing or underrepresented", "evidence": "optional: specific result or URL that supports this" }
  ],
  "keyTakeaways": ["6-8 actionable observations about the search landscape"],
  "competitorInsights": ["4-6 observations about who is dominating and why"]
}

Rules:
- dominantThemes: 5-7 themes across titles/snippets (e.g. price, before/after, pain, safety, results, comparison)
- topDomains: top 5-8 domains by frequency, identify their type
- contentGaps: 4-6 genuine gaps — content formats, angles, or topics absent from the results
- positioningAngles: 4-5 angles tailored to the analysis goal if provided, otherwise strategic opportunities
- keyTakeaways and competitorInsights: specific, actionable, grounded in the actual results
- Be specific — reference actual titles, domains, or content types from the results`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) throw new Error(`Claude API failed: ${res.status} ${await res.text()}`)
  const data = await res.json()

  if (!data.content || !Array.isArray(data.content)) {
    throw new Error(`Unexpected Claude response shape: ${JSON.stringify(data).substring(0, 300)}`)
  }

  const textBlock = data.content.find((b: { type: string }) => b.type === 'text')
  if (!textBlock || !textBlock.text) {
    throw new Error(`No text block in Claude response. Blocks: ${data.content.map((b: { type: string }) => b.type).join(', ')}`)
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`Claude did not return valid JSON. Preview: ${textBlock.text.substring(0, 200)}`)
  return JSON.parse(jsonMatch[0]) as SearchInsights
}

export function buildSearchResult(
  query: string,
  location: string | undefined,
  rawItems: RawSearchItem[],
  insights: SearchInsights
): SearchAnalysisResult {
  const results: SearchResult[] = rawItems
    .filter(i => i.title || i.url)
    .slice(0, 100)
    .map(i => ({
      title: i.title || '',
      url: i.url || '',
      description: i.description || i.snippet || '',
      position: i.position || 0,
      type: i.type || 'organic',
      domain: i.url ? extractDomain(i.url) : '',
    }))

  const organic = results.filter(r => !r.type || r.type === 'organic' || r.type === 'searchResult')
  const paid = results.filter(r => r.type === 'paid' || r.type === 'ad')

  // Count domains
  const domainMap = new Map<string, { count: number; type: string }>()
  for (const r of results) {
    if (!r.domain) continue
    const existing = domainMap.get(r.domain)
    if (existing) existing.count++
    else domainMap.set(r.domain, { count: 1, type: r.type })
  }

  const topDomains: DomainCount[] = Array.from(domainMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([domain, { count, type }]) => ({ domain, count, type }))

  return {
    query,
    location,
    totalResults: results.length,
    organicResults: organic.length,
    paidResults: paid.length,
    insights: {
      ...insights,
      topDomains: insights.topDomains?.length ? insights.topDomains : topDomains,
    },
    results,
    analyzedAt: new Date().toISOString(),
  }
}
