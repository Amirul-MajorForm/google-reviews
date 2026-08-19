const APIFY_TOKEN = process.env.APIFY_TOKEN

export async function startApifyRun(actorId: string, input: Record<string, unknown>): Promise<string> {
  const res = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${APIFY_TOKEN}`,
    },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(`Apify start failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.data.id
}

export async function getApifyRun(runId: string) {
  const res = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
    headers: { Authorization: `Bearer ${APIFY_TOKEN}` },
  })
  if (!res.ok) throw new Error(`Apify get run failed: ${res.status}`)
  const data = await res.json()
  return data.data
}

export async function getApifyDataset(datasetId: string, limit = 500): Promise<unknown[]> {
  const res = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?limit=${limit}`, {
    headers: { Authorization: `Bearer ${APIFY_TOKEN}` },
  })
  if (!res.ok) throw new Error(`Apify dataset failed: ${res.status}`)
  return res.json()
}

async function abortApifyRun(runId: string): Promise<void> {
  await fetch(`https://api.apify.com/v2/actor-runs/${runId}/abort`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${APIFY_TOKEN}` },
  })
}

export async function pollApifyRun(runId: string, timeoutMs: number): Promise<unknown[]> {
  const start = Date.now()
  let lastDatasetId: string | null = null

  while (Date.now() - start < timeoutMs) {
    const run = await getApifyRun(runId)
    lastDatasetId = run.defaultDatasetId

    if (run.status === 'SUCCEEDED') return getApifyDataset(run.defaultDatasetId)
    if (run.status === 'FAILED' || run.status === 'ABORTED') {
      // On abort we triggered, fetch partial data instead of throwing
      if (lastDatasetId) {
        const items = await getApifyDataset(lastDatasetId)
        if (items.length > 0) return items
      }
      throw new Error(`Run ${runId} ${run.status}`)
    }
    await new Promise(r => setTimeout(r, 5000))
  }

  // Timeout reached — abort the run and return whatever data was collected
  console.log(`[apify] timeout reached after ${timeoutMs}ms, aborting run and fetching partial data`)
  await abortApifyRun(runId)
  await new Promise(r => setTimeout(r, 3000)) // brief wait for abort to register
  if (lastDatasetId) {
    const items = await getApifyDataset(lastDatasetId)
    console.log(`[apify] partial dataset has ${items.length} items`)
    return items
  }
  throw new Error('Apify run timed out and no dataset available')
}
