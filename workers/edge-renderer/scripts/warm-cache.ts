#!/usr/bin/env node
/**
 * Cache warming script for quiz-edge-renderer.
 *
 * Enumerates all published quizzes from KV and warms the edge cache.
 * Run after deploy or backend bulk publish to ensure <50ms response times.
 *
 * Usage:
 *   npx tsx scripts/warm-cache.ts [--base-url https://play.quizmebaby.app] [--batch 50]
 *
 * Env:
 *   CF_API_TOKEN  - Cloudflare API token (KV:Read permission)
 *   OPS_SECRET    - Bearer token for /_ops/warm endpoint (if configured)
 */

const CF_API_TOKEN = process.env.CF_API_TOKEN ?? ''
const OPS_SECRET = process.env.OPS_SECRET ?? ''

const ACCOUNT_ID = '160ea79933a744b19af54d9d16521ea8'
const KV_QUIZ_HTML_ID = '07070b407cf94db4a1419e7a1a87c447'
const KV_DOMAIN_MAP_ID = 'd74ab364d6264846a749b6da9a579c1a'
const PRIMARY_HOST = 'play.quizmebaby.app'

interface ParsedArgs {
  baseUrl: string
  batchSize: number
}

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2)
  let baseUrl = 'https://play.quizmebaby.app'
  let batchSize = 50

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--base-url' && args[i + 1]) {
      baseUrl = args[i + 1]
      i++
    }
    if (args[i] === '--batch' && args[i + 1]) {
      batchSize = parseInt(args[i + 1], 10)
      i++
    }
  }
  return { baseUrl, batchSize }
}

async function kvListKeys(namespaceId: string): Promise<string[]> {
  const keys: string[] = []
  let cursor: string | undefined

  do {
    const params = new URLSearchParams({ limit: '1000' })
    if (cursor) params.set('cursor', cursor)

    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${namespaceId}/keys?${params}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
    })

    if (!res.ok) {
      throw new Error(`KV list failed: ${res.status} ${await res.text()}`)
    }

    const data = (await res.json()) as {
      success: boolean
      result: Array<{ name: string }>
      result_info?: { cursor?: string }
    }

    if (!data.success) {
      throw new Error(`KV list API error`)
    }

    keys.push(...data.result.map((k) => k.name))
    cursor = data.result_info?.cursor
  } while (cursor)

  return keys
}

async function kvGetValue(namespaceId: string, key: string): Promise<string | null> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`KV get failed: ${res.status}`)
  return res.text()
}

interface DomainMapEntry {
  slug: string
  quizId?: string
  updatedAt?: string
}

async function main() {
  const { baseUrl, batchSize } = parseArgs()

  if (!CF_API_TOKEN) {
    console.error('Error: CF_API_TOKEN env var required')
    process.exit(1)
  }

  console.log(`[warm] baseUrl=${baseUrl} batch=${batchSize}`)

  // 1. Enumerate QUIZ_HTML keys (slugs)
  console.log('[warm] listing QUIZ_HTML keys...')
  const slugs = await kvListKeys(KV_QUIZ_HTML_ID)
  console.log(`[warm] found ${slugs.length} quiz slugs`)

  // 2. Enumerate DOMAIN_MAP keys (domains) + resolve slugs
  console.log('[warm] listing DOMAIN_MAP keys...')
  const domains = await kvListKeys(KV_DOMAIN_MAP_ID)
  console.log(`[warm] found ${domains.length} custom domains`)

  // 3. Build URLs to warm
  const urls: string[] = []

  // Primary host URLs
  for (const slug of slugs) {
    urls.push(`${baseUrl}/${slug}`)
  }

  // Custom domain URLs
  for (const domain of domains) {
    const raw = await kvGetValue(KV_DOMAIN_MAP_ID, domain)
    if (!raw) continue
    let slug: string
    try {
      const parsed = JSON.parse(raw) as DomainMapEntry
      slug = parsed.slug
    } catch {
      slug = raw
    }
    urls.push(`https://${domain}/${slug}`)
  }

  console.log(`[warm] total urls to warm: ${urls.length}`)

  // 4. Call /_ops/warm in batches
  let totalWarmed = 0
  let totalCached = 0

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(urls.length / batchSize)

    console.log(`[warm] batch ${batchNum}/${totalBatches} (${batch.length} urls)`)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (OPS_SECRET) {
      headers.Authorization = `Bearer ${OPS_SECRET}`
    }

    const res = await fetch(`${baseUrl}/_ops/warm`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ urls: batch }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`[warm] batch ${batchNum} failed: ${res.status} ${text}`)
      continue
    }

    const data = (await res.json()) as {
      ok: boolean
      warmed: number
      already_cached: number
      results: Array<{ url: string; ok: boolean; cached: boolean; error?: string }>
    }

    totalWarmed += data.warmed
    totalCached += data.already_cached

    const failures = data.results.filter((r) => !r.ok)
    if (failures.length) {
      console.warn(`[warm] batch ${batchNum} failures: ${failures.length}`)
      for (const f of failures) {
        console.warn(`  - ${f.url}: ${f.error}`)
      }
    }
  }

  console.log(`[warm] done. total=${urls.length} warmed=${totalWarmed} already_cached=${totalCached}`)
}

main().catch((e) => {
  console.error('[warm] fatal:', e)
  process.exit(1)
})
