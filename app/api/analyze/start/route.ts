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
      const actorInput = {
        search: [query],
        search_location: location || 'Singapore',
        search_limit: 20,
        limit: maxReviews || 100,
        lang: 'en',
        order: 'newest',
        source: 'google',
        include_personal: false,
      }
      console.log('[apify] input:', JSON.stringify(actorInput))
      const apifyRunId = await startApifyRun('web_wanderer~google-reviews-scraper', actorInput)
      s.apifyRunId = apifyRunId
      s.status = { phase: 'scraping', progress: 15 }

      const { pollApifyRun } = await import('@/lib/apify')
      const items = await pollApifyRun(apifyRunId, 60000)

      s.status = { phase: 'analyzing', progress: 65 }

      const { analyzeReviews, buildAnalysisResult } = await import('@/lib/claude')

      // Log first item fully so we can see exact field names
      if (items.length > 0) {
        const first = items[0] as Record<string, unknown>
        console.log('[apify] first item keys:', Object.keys(first))
        console.log('[apify] first item full:', JSON.stringify(first).substring(0, 1000))
      } else {
        console.log('[apify] WARNING: dataset returned 0 items')
      }

      const rawReviews = (items as Record<string, unknown>[]).map(item => {
        // web_wanderer/google-reviews-scraper output schema
        const reviewer = item.reviewer as Record<string, unknown> | undefined
        const author = String(
          item.reviewer_name ??
          reviewer?.name ??
          item.reviewerName ??
          item.author ??
          item.authorName ??
          item.name ??
          'Anonymous'
        )

        const rating = Number(
          item.rating ??
          item.stars ??
          item.star_rating ??
          item.reviewRating ??
          item.ratingValue ??
          0
        )

        const date = String(
          item.reviewed_at_date ??
          item.date ??
          item.published_at ??
          item.publishedAtDate ??
          item.reviewDate ??
          ''
        ).substring(0, 10)

        const text = String(
          item.content ??        // actual field name from this actor
          item.text ??
          item.review_text ??
          item.reviewText ??
          item.snippet ??
          item.body ??
          ''
        )

        const place = String(
          item.place_name ??
          item.placeName ??
          item.placeTitle ??
          item.title ??
          item.businessName ??
          ''
        ) || undefined

        return { author, rating, date, text, place }
      }).filter(r => r.rating > 0 && r.text.trim().length > 10)

      console.log(`[apify] mapped ${rawReviews.length} valid reviews from ${items.length} raw items`)
      if (rawReviews.length === 0) {
        const sample = JSON.stringify(items[0]).substring(0, 300)
        throw new Error(`Apify returned ${items.length} items but none had valid rating+text. First item: ${sample}`)
      }

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
