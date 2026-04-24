#!/usr/bin/env node
/**
 * Single-quiz cache invalidation script.
 *
 * Call this after a quiz is updated in the backend to purge stale edge cache.
 * Backend dispatcher should integrate this (or call the /_ops/invalidate endpoint directly).
 *
 * Usage:
 *   npx tsx scripts/invalidate-quiz.ts <slug> [--domain customdomain.com]
 *
 * Env:
 *   OPS_SECRET  - Bearer token for /_ops/invalidate endpoint (if configured)
 */

const OPS_SECRET = process.env.OPS_SECRET ?? ''
const BASE_URL = process.env.BASE_URL ?? 'https://play.quizmebaby.app'

function parseArgs(): { slug: string; domain?: string } {
  const args = process.argv.slice(2)
  const slug = args[0]
  if (!slug) {
    console.error('Usage: npx tsx scripts/invalidate-quiz.ts <slug> [--domain customdomain.com]')
    process.exit(1)
  }

  let domain: string | undefined
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--domain' && args[i + 1]) {
      domain = args[i + 1]
      i++
    }
  }
  return { slug, domain }
}

async function main() {
  const { slug, domain } = parseArgs()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (OPS_SECRET) {
    headers.Authorization = `Bearer ${OPS_SECRET}`
  }

  const res = await fetch(`${BASE_URL}/_ops/invalidate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ slug, domain }),
  })

  const data = (await res.json()) as { ok: boolean; slug: string; host: string; cache_deleted: boolean; error?: string }

  if (!res.ok || !data.ok) {
    console.error(`[invalidate] failed: ${res.status} ${data.error ?? ''}`)
    process.exit(1)
  }

  console.log(`[invalidate] ok slug=${data.slug} host=${data.host} cache_deleted=${data.cache_deleted}`)
}

main().catch((e) => {
  console.error('[invalidate] fatal:', e)
  process.exit(1)
})
