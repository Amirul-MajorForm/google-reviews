import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { TrendsRunState } from '@/types/trends'
import { startApifyRun, pollApifyRun } from '@/lib/apify'

const runs = new Map<string, TrendsRunState>()

export function getTrendsRunsStore() {
  return runs
}

export async function POST(req: NextRequest) {
  const { keywords, location, timePeriod, context } = await req.json()

  if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
    return NextResponse.json({ error: 'Missing keywords' }, { status: 400 })
  }

  const runId = uuidv4()
  const locationStr = location || 'Singapore'

  const state: TrendsRunState = {
    apifyRunId: null,
    keywords,
    location: locationStr,
    status: { phase: 'scraping', progress: 5 },
  }
  runs.set(runId, state)

  ;(async () => {
    const s = runs.get(runId)!
    try {
      const actorInput = {
        searchTerms: keywords,
        geo: locationToGeoCode(locationStr),
        timePeriod: timePeriodToActorValue(timePeriod || '12months'),
        category: '',
        gprop: '',
      }
      console.log('[trends-apify] input:', JSON.stringify(actorInput))

      const apifyRunId = await startApifyRun('apify~google-trends-scraper', actorInput)
      s.apifyRunId = apifyRunId
      s.status = { phase: 'scraping', progress: 15 }

      const items = await pollApifyRun(apifyRunId, 120000)

      s.status = { phase: 'analyzing', progress: 65 }

      if (items.length === 0) {
        throw new Error('No trend data returned from Apify. Try different keywords.')
      }

      console.log(`[trends-apify] received ${items.length} items`)
      console.log('[trends-apify] first item keys:', Object.keys(items[0] as object))
      console.log('[trends-apify] first item:', JSON.stringify(items[0]).substring(0, 400))

      const rawItems = items as Record<string, unknown>[]

      // Actor returns one item per keyword with nested arrays
      // Fields: interestOverTime_timelineData, relatedQueries_top, relatedQueries_rising,
      //         relatedTopics_top, relatedTopics_rising
      const timePoints: import('@/types/trends').TrendPoint[] = []
      const queries: import('@/types/trends').RelatedQuery[] = []
      const topics: import('@/types/trends').RelatedTopic[] = []

      for (const item of rawItems) {
        const kw = String((item.searchTerm ?? item.inputUrlOrTerm ?? keywords[0]) as string)

        // Interest over time
        const timeline = item.interestOverTime_timelineData as Record<string, unknown>[] | undefined
        if (Array.isArray(timeline)) {
          for (const pt of timeline) {
            const valArr = pt.value as number[]
            timePoints.push({
              date: String(pt.formattedAxisTime ?? pt.time ?? ''),
              value: Array.isArray(valArr) ? (valArr[0] ?? 0) : Number(pt.value ?? 0),
              keyword: kw,
            })
          }
        }

        // Related queries
        const topQ = item.relatedQueries_top as Record<string, unknown>[] | undefined
        if (Array.isArray(topQ)) {
          for (const q of topQ) {
            queries.push({ query: String(q.query ?? ''), value: Number(q.value ?? 0), formattedValue: String(q.formattedValue ?? q.value ?? ''), isRising: false, keyword: kw })
          }
        }
        const risingQ = item.relatedQueries_rising as Record<string, unknown>[] | undefined
        if (Array.isArray(risingQ)) {
          for (const q of risingQ) {
            queries.push({ query: String(q.query ?? ''), value: Number(q.value ?? 0), formattedValue: String(q.formattedValue ?? q.value ?? ''), isRising: true, keyword: kw })
          }
        }

        // Related topics
        const topT = item.relatedTopics_top as Record<string, unknown>[] | undefined
        if (Array.isArray(topT)) {
          for (const t of topT) {
            const topicObj = t.topic as Record<string, unknown> | undefined
            topics.push({ topic: String(topicObj?.mid ?? ''), topicTitle: String(topicObj?.title ?? ''), value: Number(t.value ?? 0), formattedValue: String(t.formattedValue ?? t.value ?? ''), isRising: false, keyword: kw })
          }
        }
        const risingT = item.relatedTopics_rising as Record<string, unknown>[] | undefined
        if (Array.isArray(risingT)) {
          for (const t of risingT) {
            const topicObj = t.topic as Record<string, unknown> | undefined
            topics.push({ topic: String(topicObj?.mid ?? ''), topicTitle: String(topicObj?.title ?? ''), value: Number(t.value ?? 0), formattedValue: String(t.formattedValue ?? t.value ?? ''), isRising: true, keyword: kw })
          }
        }
      }

      console.log(`[trends-apify] ${timePoints.length} time-series, ${queries.length} queries, ${topics.length} topics`)

      const { analyzeTrends, buildTrendsResult } = await import('@/lib/claude-trends')

      const insights = await analyzeTrends(keywords, timePoints, queries, topics, context || '')
      const result = buildTrendsResult(keywords, locationStr, timePeriod || '12months', timePoints, queries, topics, insights)

      s.status = { phase: 'complete', progress: 100 }
      s.result = result
    } catch (err) {
      const s2 = runs.get(runId)
      if (s2) s2.status = { phase: 'error', progress: 0, error: String(err) }
    }
  })()

  return NextResponse.json({ runId })
}

function locationToGeoCode(location: string): string {
  const map: Record<string, string> = {
    singapore: 'SG',
    australia: 'AU',
    sydney: 'AU',
    melbourne: 'AU',
    'united states': 'US',
    usa: 'US',
    'united kingdom': 'GB',
    uk: 'GB',
    canada: 'CA',
    'new zealand': 'NZ',
    malaysia: 'MY',
    indonesia: 'ID',
    thailand: 'TH',
    india: 'IN',
    worldwide: '',
    global: '',
  }
  return map[location.toLowerCase()] ?? 'SG'
}

function timePeriodToActorValue(period: string): string {
  const map: Record<string, string> = {
    '1hour': 'now 1-H',
    '4hours': 'now 4-H',
    '1day': 'now 1-d',
    '7days': 'now 7-d',
    '1month': 'today 1-m',
    '3months': 'today 3-m',
    '12months': 'today 12-m',
    '5years': 'today 5-y',
    all: 'all',
  }
  return map[period] ?? 'today 12-m'
}
