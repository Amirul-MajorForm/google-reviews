import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { RunState } from '@/types/analysis'
import { startApifyRun } from '@/lib/apify'
import { getMockAnalysisResult } from '@/lib/mock'

const runs = new Map<string, RunState>()

export function getRunsStore() {
  return runs
}

export async function POST(req: NextRequest) {
  const { query, location, maxReviews } = await req.json()

  if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 })

  const runId = uuidv4()
  const USE_MOCK = process.env.USE_MOCK === 'true' || !process.env.APIFY_TOKEN

  const state: RunState = {
    apifyRunId: null,
    query,
    location: location || undefined,
    status: { phase: 'scraping', progress: 5 },
  }
  runs.set(runId, state)

  if (USE_MOCK) {
    ;(async () => {
      const s = runs.get(runId)!
      await new Promise(r => setTimeout(r, 2000))
      s.status = { phase: 'scraping', progress: 50 }
      await new Promise(r => setTimeout(r, 2000))
      s.status = { phase: 'analyzing', progress: 65 }
      await new Promise(r => setTimeout(r, 2500))
      s.status = { phase: 'complete', progress: 100 }
      s.result = getMockAnalysisResult(query, location || undefined)
    })()
    return NextResponse.json({ runId })
  }

  ;(async () => {
    const s = runs.get(runId)!
    try {
      const searchQuery = location ? `${query} ${location}` : query
      // web_wanderer/google-reviews-scraper expects startUrls with Google Maps search URLs
      const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`
      const actorInput = {
        startUrls: [{ url: mapsUrl }],
        maxReviews: maxReviews || 100,
        language: 'en',
        sort: 'newest',
      }
      console.log('[apify] input:', JSON.stringify(actorInput))
      const apifyRunId = await startApifyRun('web_wanderer~google-reviews-scraper', actorInput)
      s.apifyRunId = apifyRunId
      s.status = { phase: 'scraping', progress: 15 }

      const { pollApifyRun } = await import('@/lib/apify')
      const items = await pollApifyRun(apifyRunId, 300000)

      s.status = { phase: 'analyzing', progress: 65 }

      const { analyzeReviews, buildAnalysisResult } = await import('@/lib/claude')

      // Log first item to help debug field names in Railway logs
      if (items.length > 0) {
        console.log('[apify] first item keys:', Object.keys(items[0] as object))
        console.log('[apify] first item sample:', JSON.stringify(items[0]).substring(0, 500))
      } else {
        console.log('[apify] WARNING: dataset returned 0 items')
      }

      const rawReviews = (items as Record<string, unknown>[]).map(item => {
        // Try every known field name variant from this actor
        const reviewer = item.reviewer as Record<string, unknown> | undefined
        const author = String(
          reviewer?.name ??
          item.reviewerName ??
          item.authorName ??
          item.name ??
          'Anonymous'
        )

        const rating = Number(
          item.stars ??
          item.rating ??
          item.reviewRating ??
          item.ratingValue ??
          0
        )

        const date = String(
          item.publishedAtDate ??
          item.publishAt ??
          item.reviewDate ??
          item.date ??
          item.relativeDate ??
          ''
        ).substring(0, 10)

        const text = String(
          item.reviewText ??
          item.text ??
          item.snippet ??
          item.reviewBody ??
          item.body ??
          ''
        )

        const place = String(
          item.placeName ??
          item.placeTitle ??
          item.title ??
          item.businessName ??
          item.locationName ??
          ''
        ) || undefined

        return { author, rating, date, text, place }
      }).filter(r => r.rating > 0 && r.text.trim().length > 10)

      console.log(`[apify] mapped ${rawReviews.length} valid reviews from ${items.length} raw items`)
      if (rawReviews.length === 0) throw new Error(`Apify returned ${items.length} items but none had valid rating+text. Check Railway logs for field names.`)

      const insights = await analyzeReviews(query, rawReviews)
      const result = buildAnalysisResult(query, location || undefined, rawReviews, insights)

      s.status = { phase: 'complete', progress: 100 }
      s.result = result
    } catch (err) {
      const s2 = runs.get(runId)
      if (s2) s2.status = { phase: 'error', progress: 0, error: String(err) }
    }
  })()

  return NextResponse.json({ runId })
}
