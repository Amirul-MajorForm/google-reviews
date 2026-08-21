import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { TrendsRunState, TrendPoint, RelatedQuery, RelatedTopic } from '@/types/trends'
import { startApifyRun, pollApifyRun } from '@/lib/apify'

const runs = new Map<string, TrendsRunState>()

export function getTrendsRunsStore() {
  return runs
}

function geoCode(location: string): string {
  const map: Record<string, string> = {
    singapore: 'SG', australia: 'AU', sydney: 'AU', melbourne: 'AU',
    'united states': 'US', usa: 'US', uk: 'GB', 'united kingdom': 'GB',
    canada: 'CA', 'new zealand': 'NZ', malaysia: 'MY', indonesia: 'ID',
    thailand: 'TH', india: 'IN', worldwide: '', global: '',
  }
  return map[location.toLowerCase()] ?? 'SG'
}

function timePeriodValue(period: string): string {
  const map: Record<string, string> = {
    '7days': 'now 7-d',
    '1month': 'today 1-m',
    '3months': 'today 3-m',
    '12months': 'today 12-m',
    '5years': 'today 5-y',
  }
  return map[period] ?? 'today 12-m'
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
      // apify~google-trends-scraper accepts multiple keywords at once
      const actorInput = {
        searchTerms: keywords,
        geo: geoCode(locationStr),
        timePeriod: timePeriodValue(timePeriod || '12months'),
        category: '',
        gprop: '',
      }

      console.log('[trends] actor input:', JSON.stringify(actorInput))

      const apifyRunId = await startApifyRun('apify~google-trends-scraper', actorInput)
      s.apifyRunId = apifyRunId
      s.status = { phase: 'scraping', progress: 15 }

      const items = await pollApifyRun(apifyRunId, 180000)

      s.status = { phase: 'analyzing', progress: 60 }

      console.log(`[trends] received ${items.length} items`)
      if (items.length > 0) {
        console.log('[trends] first item keys:', Object.keys(items[0] as object))
        console.log('[trends] first item (full):', JSON.stringify(items[0]).substring(0, 3000))
      }

      if (items.length === 0) {
        throw new Error('No trend data returned. Try different keywords.')
      }

      // Actor returns one item per keyword. Structure (confirmed):
      // {
      //   searchTerm / inputUrlOrTerm: string,
      //   interestOverTime_timelineData: [{ formattedAxisTime, value: [n], hasData: [bool] }],
      //   relatedQueries_top:    [{ query, value, formattedValue }],
      //   relatedQueries_rising: [{ query, value, formattedValue }],
      //   relatedTopics_top:     [{ topic: { mid, title, type }, value, formattedValue }],
      //   relatedTopics_rising:  [{ topic: { mid, title, type }, value, formattedValue }],
      // }
      const rawItems = items as Record<string, unknown>[]
      const timePoints: TrendPoint[] = []
      const queries: RelatedQuery[] = []
      const topics: RelatedTopic[] = []

      for (const item of rawItems) {
        const kw = String(item.searchTerm ?? item.inputUrlOrTerm ?? keywords[0])

        // Interest over time — value is an array [n]
        const timeline = item.interestOverTime_timelineData as Record<string, unknown>[] | undefined
        if (Array.isArray(timeline)) {
          for (const pt of timeline) {
            const valArr = pt.value as number[]
            const hasData = pt.hasData as boolean[]
            if (Array.isArray(hasData) && hasData[0] === false) continue
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
            queries.push({
              query: String(q.query ?? ''),
              value: Number(q.value ?? 0),
              formattedValue: String(q.formattedValue ?? q.value ?? ''),
              isRising: false,
              keyword: kw,
            })
          }
        }
        const risingQ = item.relatedQueries_rising as Record<string, unknown>[] | undefined
        if (Array.isArray(risingQ)) {
          for (const q of risingQ) {
            queries.push({
              query: String(q.query ?? ''),
              value: Number(q.value ?? 0),
              formattedValue: String(q.formattedValue ?? q.value ?? ''),
              isRising: true,
              keyword: kw,
            })
          }
        }

        // Related topics — title is nested at topic.title
        const topT = item.relatedTopics_top as Record<string, unknown>[] | undefined
        if (Array.isArray(topT)) {
          for (const t of topT) {
            const topicObj = t.topic as Record<string, unknown> | undefined
            topics.push({
              topic: String(topicObj?.mid ?? ''),
              topicTitle: String(topicObj?.title ?? ''),
              value: Number(t.value ?? 0),
              formattedValue: String(t.formattedValue ?? t.value ?? ''),
              isRising: false,
              keyword: kw,
            })
          }
        }
        const risingT = item.relatedTopics_rising as Record<string, unknown>[] | undefined
        if (Array.isArray(risingT)) {
          for (const t of risingT) {
            const topicObj = t.topic as Record<string, unknown> | undefined
            topics.push({
              topic: String(topicObj?.mid ?? ''),
              topicTitle: String(topicObj?.title ?? ''),
              value: Number(t.value ?? 0),
              formattedValue: String(t.formattedValue ?? t.value ?? ''),
              isRising: true,
              keyword: kw,
            })
          }
        }
      }

      // Sort time series chronologically
      timePoints.sort((a, b) => a.date.localeCompare(b.date))

      console.log(`[trends] extracted: ${timePoints.length} time points, ${queries.length} queries, ${topics.length} topics`)

      const { analyzeTrends, buildTrendsResult } = await import('@/lib/claude-trends')
      const insights = await analyzeTrends(keywords, timePoints, queries, topics, context || '')
      const result = buildTrendsResult(keywords, locationStr, timePeriod || '12months', timePoints, queries, topics, insights)

      s.status = { phase: 'complete', progress: 100 }
      s.result = result
    } catch (err) {
      console.error('[trends] error:', err)
      const s2 = runs.get(runId)
      if (s2) s2.status = { phase: 'error', progress: 0, error: String(err) }
    }
  })()

  return NextResponse.json({ runId })
}
