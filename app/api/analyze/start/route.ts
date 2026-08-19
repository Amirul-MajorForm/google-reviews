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
      const apifyRunId = await startApifyRun('web_wanderer~google-reviews-scraper', {
        searchQuery,
        maxReviews: maxReviews || 100,
        language: 'en',
        sort: 'newest',
      })
      s.apifyRunId = apifyRunId
      s.status = { phase: 'scraping', progress: 15 }

      const { pollApifyRun } = await import('@/lib/apify')
      const items = await pollApifyRun(apifyRunId, 300000)

      s.status = { phase: 'analyzing', progress: 65 }

      const { analyzeReviews, buildAnalysisResult } = await import('@/lib/claude')

      const rawReviews = (items as Record<string, unknown>[]).map(item => ({
        author: String(
          (item.reviewer as Record<string, unknown>)?.name ??
          item.name ??
          item.authorName ??
          'Anonymous'
        ),
        rating: Number(item.stars ?? item.rating ?? item.reviewRating ?? 0),
        date: String(
          item.publishedAtDate ??
          item.publishAt ??
          item.date ??
          item.reviewDate ??
          ''
        ).substring(0, 10),
        text: String(item.text ?? item.reviewText ?? item.snippet ?? ''),
        place: String(
          item.placeTitle ??
          item.title ??
          item.businessName ??
          ''
        ) || undefined,
      })).filter(r => r.rating > 0 && r.text.trim().length > 10)

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
