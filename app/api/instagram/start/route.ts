import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { InstagramRunState, InstagramPost } from '@/types/instagram'
import { startApifyRun, pollApifyRun } from '@/lib/apify'

const runs = new Map<string, InstagramRunState>()

export function getInstagramRunsStore() {
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
  const cleanQuery = query.trim().replace(/^[#@]/, '')

  const state: InstagramRunState = {
    apifyRunId: null,
    query,
    queryType,
    status: { phase: 'scraping', progress: 5 },
  }
  runs.set(runId, state)

  ;(async () => {
    const s = runs.get(runId)!
    try {
      let actorInput: Record<string, unknown>

      if (queryType === 'profile') {
        actorInput = {
          usernames: [cleanQuery],
          resultsLimit: 50,
        }
      } else {
        actorInput = {
          hashtags: [cleanQuery],
          resultsLimit: 50,
        }
      }

      console.log('[instagram] actor input:', JSON.stringify(actorInput))
      const apifyRunId = await startApifyRun('apify~instagram-search-scraper', actorInput)
      s.apifyRunId = apifyRunId
      s.status = { phase: 'scraping', progress: 15 }

      const items = await pollApifyRun(apifyRunId, 300000)
      s.status = { phase: 'analyzing', progress: 60 }

      console.log(`[instagram] received ${items.length} items`)
      if (items.length > 0) {
        const first = items[0] as Record<string, unknown>
        console.log('[instagram] first item keys:', Object.keys(first))
        console.log('[instagram] first item:', JSON.stringify(first).substring(0, 800))
      }

      if (items.length === 0) throw new Error('No Instagram posts returned. Try a different hashtag or username.')

      const posts: InstagramPost[] = (items as Record<string, unknown>[]).map(item => {
        const owner = item.owner as Record<string, unknown> | undefined
        const hashtagArr = (item.hashtags as string[] | { name?: string }[] | undefined) || []

        const rawHashtags = hashtagArr.map(h =>
          typeof h === 'string' ? h : String((h as { name?: string }).name ?? '')
        ).filter(Boolean)

        const shortCode = String(item.shortCode ?? item.shortcode ?? item.id ?? '')
        const url = String(item.url ?? item.postUrl ?? (shortCode ? `https://www.instagram.com/p/${shortCode}/` : ''))

        return {
          id: String(item.id ?? item.pk ?? shortCode),
          url,
          shortCode,
          caption: String(item.caption ?? item.text ?? item.description ?? ''),
          type: String(item.type ?? item.mediaType ?? 'image').toLowerCase().includes('video')
            ? 'video'
            : String(item.type ?? '').toLowerCase().includes('sidecar') || String(item.type ?? '').toLowerCase().includes('album')
            ? 'sidecar'
            : 'image',
          ownerUsername: String(owner?.username ?? item.ownerUsername ?? item.username ?? 'unknown'),
          ownerFullName: String(owner?.fullName ?? owner?.full_name ?? item.ownerFullName ?? ''),
          ownerFollowers: Number(owner?.followersCount ?? owner?.followers_count ?? item.ownerFollowers ?? 0),
          likes: Number(item.likesCount ?? item.likes_count ?? item.edge_media_preview_like?.count ?? 0),
          comments: Number(item.commentsCount ?? item.comments_count ?? item.edge_media_to_comment?.count ?? 0),
          views: Number(item.videoViewCount ?? item.video_view_count ?? item.videoPlayCount ?? 0),
          hashtags: rawHashtags,
          locationName: item.locationName
            ? String(item.locationName)
            : item.location
            ? String((item.location as Record<string, unknown>)?.name ?? '')
            : undefined,
          createdAt: String(item.timestamp ?? item.taken_at_timestamp ?? item.createdAt ?? '').substring(0, 10),
          thumbnail: String(item.displayUrl ?? item.thumbnail ?? item.imageUrl ?? '') || undefined,
          hasGeoSignal: false,
        }
      }).filter(p => {
        if (p.likes === 0 && p.comments === 0) return false

        // Non-Latin script detection
        if (p.caption && p.caption.trim().length > 5) {
          const nonLatin = /[฀-๿က-႟؀-ۿ一-鿿぀-ヿ가-힯ऀ-ॿ]/
          if (nonLatin.test(p.caption)) return false
          const ascii = p.caption.replace(/[^a-zA-Z]/g, '').length
          const total = p.caption.replace(/\s/g, '').length
          if (total > 15 && ascii / total < 0.25) return false
        }

        // Relevance filter for keyword queries only
        if (queryType === 'keyword') {
          const kw = cleanQuery.toLowerCase()
          const inCaption = p.caption.toLowerCase().includes(kw)
          const inHashtags = p.hashtags.some(h => h.toLowerCase().includes(kw))
          if (!inCaption && !inHashtags) return false
        }

        // Geo filter using full country names/explicit hashtags only
        const geoSignals: Record<string, string[]> = {
          SG: ['singapore', '#sg', '#singapore', 'singapura'],
          AU: ['australia', '#australia', '#sydney', '#melbourne', '#brisbane', '#perth'],
          US: ['united states', 'america', '#usa', '#unitedstates', '#nyc', '#losangeles', '#newyork'],
          GB: ['britain', 'england', '#uk', '#london', '#british', 'united kingdom'],
          MY: ['malaysia', '#malaysia', '#kl', '#kualalumpur', 'kuala lumpur'],
        }
        const countryTerms = geoSignals[proxyCountry]
        if (countryTerms) {
          const allText = (p.caption + ' ' + p.hashtags.join(' ') + ' ' + (p.locationName ?? '')).toLowerCase()
          const otherMarkets = Object.entries(geoSignals)
            .filter(([code]) => code !== proxyCountry)
            .flatMap(([, terms]) => terms)
          const hasOtherMarket = otherMarkets.some(t => allText.includes(t))
          const hasThisMarket = countryTerms.some(t => allText.includes(t))
          if (hasThisMarket) p.hasGeoSignal = true
          if (hasOtherMarket && !hasThisMarket) return false
        }

        return true
      })

      console.log(`[instagram] filter summary: ${items.length} received → ${posts.length} after filters`)
      if (posts.length === 0) throw new Error('No valid posts extracted. The actor may have returned an unexpected format.')

      const { analyzeInstagramPosts, buildInstagramResult } = await import('@/lib/claude-instagram')
      const insights = await analyzeInstagramPosts(query, queryType, posts, context || '')
      const result = buildInstagramResult(query, queryType, posts, insights)

      s.status = { phase: 'complete', progress: 100 }
      s.result = result
    } catch (err) {
      console.error('[instagram] error:', err)
      const s2 = runs.get(runId)
      if (s2) s2.status = { phase: 'error', progress: 0, error: String(err) }
    }
  })()

  return NextResponse.json({ runId })
}
