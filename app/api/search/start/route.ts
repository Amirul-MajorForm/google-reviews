import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { SearchRunState } from '@/types/search'
import { startApifyRun, pollApifyRun } from '@/lib/apify'

const runs = new Map<string, SearchRunState>()

export function getSearchRunsStore() {
  return runs
}

export async function POST(req: NextRequest) {
  const { query, location, context } = await req.json()

  if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 })

  const runId = uuidv4()

  const state: SearchRunState = {
    apifyRunId: null,
    query,
    location: location || undefined,
    status: { phase: 'scraping', progress: 5 },
  }
  runs.set(runId, state)

  ;(async () => {
    const s = runs.get(runId)!
    try {
      // apify/google-search-scraper input schema
      const actorInput = {
        queries: query,
        maxPagesPerQuery: 3,
        resultsPerPage: 10,
        countryCode: locationToCountryCode(location || 'Singapore'),
        languageCode: 'en',
        includeUnfilteredResults: false,
        saveHtml: false,
        saveHtmlToKeyValueStore: false,
      }
      console.log('[search-apify] input:', JSON.stringify(actorInput))
      const apifyRunId = await startApifyRun('apify~google-search-scraper', actorInput)
      s.apifyRunId = apifyRunId
      s.status = { phase: 'scraping', progress: 15 }

      const items = await pollApifyRun(apifyRunId, 120000)

      s.status = { phase: 'analyzing', progress: 65 }

      if (items.length > 0) {
        const first = items[0] as Record<string, unknown>
        console.log('[search-apify] first item keys:', Object.keys(first))
        console.log('[search-apify] first item:', JSON.stringify(first).substring(0, 500))
      } else {
        console.log('[search-apify] WARNING: dataset returned 0 items')
        throw new Error('No search results returned from Apify. Try a different query.')
      }

      const { analyzeSearchResults, buildSearchResult } = await import('@/lib/claude-search')
      const insights = await analyzeSearchResults(query, items as Record<string, unknown>[], context || '')
      const result = buildSearchResult(query, location || undefined, items as Record<string, unknown>[], insights)

      s.status = { phase: 'complete', progress: 100 }
      s.result = result
    } catch (err) {
      const s2 = runs.get(runId)
      if (s2) s2.status = { phase: 'error', progress: 0, error: String(err) }
    }
  })()

  return NextResponse.json({ runId })
}

function locationToCountryCode(location: string): string {
  const map: Record<string, string> = {
    singapore: 'sg',
    australia: 'au',
    sydney: 'au',
    melbourne: 'au',
    'united states': 'us',
    usa: 'us',
    'united kingdom': 'gb',
    uk: 'gb',
    london: 'gb',
    canada: 'ca',
    'new zealand': 'nz',
    malaysia: 'my',
    indonesia: 'id',
    thailand: 'th',
    india: 'in',
  }
  return map[location.toLowerCase()] || 'sg'
}
