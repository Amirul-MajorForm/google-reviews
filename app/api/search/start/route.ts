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
      const locationStr = location || 'Singapore'
      // Append location to query for geo-specific results unless user already included it
      const geoQuery = query.toLowerCase().includes(locationStr.toLowerCase())
        ? query
        : `${query} ${locationStr}`

      // apify/google-search-scraper input: each item returned is a full SERP page,
      // not an individual result — organic/paid results are nested arrays inside each page.
      const actorInput = {
        queries: geoQuery,
        maxPagesPerQuery: 3,
        resultsPerPage: 10,
        countryCode: locationToCountryCode(locationStr),
        languageCode: 'en',
        mobileResults: false,
        includeUnfilteredResults: false,
        saveHtml: false,
        saveHtmlToKeyValueStore: false,
      }
      console.log('[search-apify] input:', JSON.stringify(actorInput))
      const apifyRunId = await startApifyRun('apify~google-search-scraper', actorInput)
      s.apifyRunId = apifyRunId
      s.status = { phase: 'scraping', progress: 15 }

      const pages = await pollApifyRun(apifyRunId, 120000)

      s.status = { phase: 'analyzing', progress: 65 }

      if (pages.length === 0) {
        throw new Error('No search results returned from Apify. Try a different query.')
      }

      // Each page item contains nested organicResults[] and paidResults[] — flatten them.
      const flatResults: Record<string, unknown>[] = []
      for (const page of pages) {
        const p = page as Record<string, unknown>
        const organic = (p.organicResults as Record<string, unknown>[]) || []
        const paid = (p.paidResults as Record<string, unknown>[]) || []
        for (const r of organic) flatResults.push(r)
        for (const r of paid) flatResults.push(r)
      }

      console.log(`[search-apify] flattened ${flatResults.length} results from ${pages.length} SERP pages`)
      if (flatResults.length === 0) {
        throw new Error(`Apify returned ${pages.length} pages but 0 results after flattening. Check actor output format.`)
      }

      if (flatResults.length > 0) {
        console.log('[search-apify] first result keys:', Object.keys(flatResults[0]))
        console.log('[search-apify] first result:', JSON.stringify(flatResults[0]).substring(0, 400))
      }

      const { analyzeSearchResults, buildSearchResult } = await import('@/lib/claude-search')
      const insights = await analyzeSearchResults(query, flatResults, context || '')
      const result = buildSearchResult(query, locationStr, flatResults, insights)

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
