import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { TikTokRunState, TikTokVideo } from '@/types/tiktok'
import { startApifyRun, pollApifyRun } from '@/lib/apify'

const runs = new Map<string, TikTokRunState>()

export function getTikTokRunsStore() {
  return runs
}

function detectQueryType(query: string): 'hashtag' | 'profile' | 'keyword' {
  if (query.startsWith('#')) return 'hashtag'
  if (query.startsWith('@')) return 'profile'
  return 'keyword'
}

export async function POST(req: NextRequest) {
  const { query, country, context } = await req.json()
  if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 })

  const runId = uuidv4()
  const queryType = detectQueryType(query.trim())
  const proxyCountry = (country || 'SG').toUpperCase()

  const state: TikTokRunState = {
    apifyRunId: null,
    query,
    queryType,
    status: { phase: 'scraping', progress: 5 },
  }
  runs.set(runId, state)

  ;(async () => {
    const s = runs.get(runId)!
    try {
      // Build clockworks/tiktok-scraper input based on query type
      const cleanQuery = query.trim().replace(/^[#@]/, '')
      let actorInput: Record<string, unknown>

      if (queryType === 'profile') {
        actorInput = {
          profiles: [cleanQuery],
          resultsPerPage: 30,
          proxyCountryCode: proxyCountry,
        }
      } else {
        // hashtag or keyword — use as hashtag search
        actorInput = {
          hashtags: [cleanQuery],
          resultsPerPage: 30,
          proxyCountryCode: proxyCountry,
        }
      }

      console.log('[tiktok] actor input:', JSON.stringify(actorInput))
      const apifyRunId = await startApifyRun('clockworks~tiktok-scraper', actorInput)
      s.apifyRunId = apifyRunId
      s.status = { phase: 'scraping', progress: 15 }

      const items = await pollApifyRun(apifyRunId, 180000)
      s.status = { phase: 'analyzing', progress: 60 }

      console.log(`[tiktok] received ${items.length} items`)
      if (items.length > 0) {
        const first = items[0] as Record<string, unknown>
        console.log('[tiktok] first item keys:', Object.keys(first))
        console.log('[tiktok] first item:', JSON.stringify(first).substring(0, 800))
      }

      if (items.length === 0) throw new Error('No TikTok videos returned. Try a different hashtag or username.')

      const videos: TikTokVideo[] = (items as Record<string, unknown>[]).map(item => {
        const authorMeta = item.authorMeta as Record<string, unknown> | undefined
        const musicMeta = item.musicMeta as Record<string, unknown> | undefined
        const videoMeta = item.videoMeta as Record<string, unknown> | undefined
        const hashtagArr = (item.hashtags as { name?: string; title?: string }[] | undefined) || []

        return {
          id: String(item.id ?? item.videoId ?? ''),
          url: String(item.webVideoUrl ?? item.videoUrl ?? item.url ?? ''),
          caption: String(item.text ?? item.description ?? item.caption ?? ''),
          author: String(authorMeta?.nickName ?? authorMeta?.name ?? item.authorName ?? 'Unknown'),
          authorUsername: String(authorMeta?.name ?? item.authorUsername ?? ''),
          authorFollowers: Number(authorMeta?.fans ?? authorMeta?.followers ?? 0),
          duration: Number(videoMeta?.duration ?? item.duration ?? 0),
          plays: Number(item.playCount ?? item.views ?? item.plays ?? 0),
          likes: Number(item.diggCount ?? item.likes ?? item.likeCount ?? 0),
          comments: Number(item.commentCount ?? item.comments ?? 0),
          shares: Number(item.shareCount ?? item.shares ?? 0),
          hashtags: hashtagArr.map(h => String(h.name ?? h.title ?? '')).filter(Boolean),
          music: String(musicMeta?.musicName ?? musicMeta?.title ?? item.music ?? ''),
          createdAt: String(item.createTimeISO ?? item.createTime ?? item.createdAt ?? '').substring(0, 10),
          thumbnail: String((item.covers as Record<string, unknown>)?.['default'] ?? item.thumbnail ?? item.imageUrl ?? '') || undefined,
          hasGeoSignal: false,
        }
      })

      const beforeFilters = videos.length
      const filtered = videos.filter(v => {
        // 1. Zero-engagement drop
        if (v.plays === 0 && v.likes === 0) return false

        // 2. English-language check (allow short/empty captions through)
        if (v.caption && v.caption.trim().length > 15) {
          const ascii = v.caption.replace(/[^a-zA-Z]/g, '').length
          const total = v.caption.replace(/\s/g, '').length
          if (total > 15 && ascii / total < 0.25) return false
        }

        // 3. Relevance filter for keyword queries only.
        //    Hashtag queries: Apify already filtered by hashtag — skip this check.
        //    Profile queries: all videos from that creator are relevant.
        if (queryType === 'keyword') {
          const kw = cleanQuery.toLowerCase()
          const captionLower = v.caption.toLowerCase()
          const inCaption = captionLower.includes(kw)
          const inHashtags = v.hashtags.some(h => h.toLowerCase().includes(kw))
          if (!inCaption && !inHashtags) return false
        }

        // 4. Geography filter: use full country names and explicit hashtags only —
        //    bare 2-letter codes (us, au, my) match too many common English words
        //    and cause false positives.
        const geoSignals: Record<string, string[]> = {
          SG: ['singapore', '#sg', '#singapore', 'singapura'],
          AU: ['australia', '#australia', '#sydney', '#melbourne', '#brisbane', '#perth'],
          US: ['united states', 'america', '#usa', '#unitedstates', '#nyc', '#losangeles', '#newyork'],
          GB: ['britain', 'england', '#uk', '#london', '#british', 'united kingdom'],
          MY: ['malaysia', '#malaysia', '#kl', '#kualalumpur', 'kuala lumpur'],
        }
        const countryTerms = geoSignals[proxyCountry]
        if (countryTerms) {
          const allText = (v.caption + ' ' + v.hashtags.join(' ')).toLowerCase()
          const otherMarkets = Object.entries(geoSignals)
            .filter(([code]) => code !== proxyCountry)
            .flatMap(([, terms]) => terms)
          const hasOtherMarket = otherMarkets.some(t => allText.includes(t))
          const hasThisMarket = countryTerms.some(t => allText.includes(t))
          if (hasThisMarket) v.hasGeoSignal = true
          if (hasOtherMarket && !hasThisMarket) return false
        }

        return true
      })

      console.log(`[tiktok] filter summary: ${beforeFilters} mapped → ${filtered.length} after filters`)

      if (filtered.length === 0) throw new Error('No valid video data extracted. The actor may have returned an unexpected format.')

      const { analyzeTikTokVideos, buildTikTokResult } = await import('@/lib/claude-tiktok')
      const insights = await analyzeTikTokVideos(query, queryType, filtered, context || '')
      const result = buildTikTokResult(query, queryType, filtered, insights)

      s.status = { phase: 'complete', progress: 100 }
      s.result = result
    } catch (err) {
      console.error('[tiktok] error:', err)
      const s2 = runs.get(runId)
      if (s2) s2.status = { phase: 'error', progress: 0, error: String(err) }
    }
  })()

  return NextResponse.json({ runId })
}
