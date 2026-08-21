import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { TrendsRunState, TrendPoint } from '@/types/trends'
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
  const geo = geoCode(locationStr)
  const timeframe = timePeriodValue(timePeriod || '12months')

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
      const allTimePoints: TrendPoint[] = []

      // Actor takes one keyword at a time — run sequentially
      for (let i = 0; i < keywords.length; i++) {
        const kw = keywords[i]
        const progress = 10 + Math.floor((i / keywords.length) * 45)
        s.status = { phase: 'scraping', progress }

        const actorInput = {
          mode: 'keyword',
          keyword: kw,
          predefinedTimeframe: timeframe,
          geo: geo,
          fetchRegionalData: false,
          proxyConfiguration: {
            useApifyProxy: true,
            apifyProxyGroups: ['RESIDENTIAL'],
          },
        }

        console.log(`[trends] running keyword ${i + 1}/${keywords.length}: "${kw}"`)
        console.log('[trends] actor input:', JSON.stringify(actorInput))

        const apifyRunId = await startApifyRun('data_xplorer~google-trends-fast-scraper', actorInput)
        if (i === 0) s.apifyRunId = apifyRunId

        const items = await pollApifyRun(apifyRunId, 120000)

        console.log(`[trends] "${kw}" returned ${items.length} item(s)`)
        if (items.length > 0) {
          console.log('[trends] first item keys:', Object.keys(items[0] as object))
          console.log('[trends] first item (full):', JSON.stringify(items[0]).substring(0, 2000))
        }

        if (items.length === 0) {
          throw new Error(`No data returned for keyword "${kw}". Try a different term.`)
        }

        // Output: { keyword, timeframe, geo, timeline_data: { "2023-W01": 75, ... }, data_granularity }
        const item = items[0] as Record<string, unknown>
        const timelineData = item.timeline_data as Record<string, number> | undefined

        if (!timelineData || typeof timelineData !== 'object') {
          throw new Error(`Unexpected data format for "${kw}". timeline_data missing.`)
        }

        const pts: TrendPoint[] = Object.entries(timelineData).map(([date, value]) => ({
          date,
          value: Number(value),
          keyword: kw,
        }))
        // Sort chronologically
        pts.sort((a, b) => a.date.localeCompare(b.date))
        allTimePoints.push(...pts)

        console.log(`[trends] "${kw}": ${pts.length} data points extracted`)
      }

      s.status = { phase: 'analyzing', progress: 65 }

      const { analyzeTrends, buildTrendsResult } = await import('@/lib/claude-trends')
      const insights = await analyzeTrends(keywords, allTimePoints, context || '')
      const result = buildTrendsResult(keywords, locationStr, timePeriod || '12months', allTimePoints, insights)

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
