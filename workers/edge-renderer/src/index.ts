import { Hono, Context } from 'hono'

export interface Env {
  DOMAIN_MAP: KVNamespace
  QUIZ_HTML: KVNamespace
  VERCEL_ORIGIN: string
  PRIMARY_HOST: string
  OPS_SECRET?: string
}

// QUIZ_HTML KV: key=slug, value=raw HTML string (confirmed with Backend-Dev)
// DOMAIN_MAP KV: key=hostname, value=JSON { slug, quizId, updatedAt } (confirmed with Backend-Dev)
interface DomainMapEntry {
  slug: string
  quizId?: string
  updatedAt?: string
}

interface StructuredLog {
  ts: string
  level: 'info' | 'warn' | 'error'
  event: string
  host: string
  slug?: string
  cache_status?: 'hit' | 'miss' | 'kv_miss'
  latency_ms: number
  status?: number
  message?: string
  error?: string
}

function log(entry: Omit<StructuredLog, 'ts'>) {
  const full: StructuredLog = {
    ts: new Date().toISOString(),
    ...entry,
  }
  // Use console.log so Cloudflare tail captures it; structured JSON for external aggregation
  console.log(JSON.stringify(full))
}

function parseDomainMapEntry(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as DomainMapEntry
    return parsed.slug
  } catch {
    // fallback: legacy plain-slug value
    return raw
  }
}

// TTL=60s: matches KV eventual-consistency propagation window (~60s).
// Invalidation strategy: accept up to 60s staleness on republish.
// Rationale: simpler than versioned keys or explicit purge for MVP; revisit post-launch
// if publish latency complaints arise.
const CACHE_TTL = 60

const app = new Hono<{ Bindings: Env }>()

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/healthz', (c) => {
  return c.json({ ok: true, service: 'quiz-edge-renderer', ts: new Date().toISOString() })
})

// ── Structured logging + timing wrapper for all routes ───────────────────────
app.use('*', async (c, next) => {
  const start = Date.now()
  const path = c.req.path

  // Skip timing for ops endpoints — they have their own logging
  if (path.startsWith('/_ops/')) {
    await next()
    return
  }

  await next()

  const latency = Date.now() - start
  const status = c.res.status
  const host = c.req.header('host') ?? ''
  const slug = c.req.param('slug')

  // Only log quiz-serving paths (not assets, API, etc.)
  if (slug && status < 500) {
    log({
      level: status >= 400 ? 'warn' : 'info',
      event: 'edge_request',
      host,
      slug,
      latency_ms: latency,
      status,
    })
  }
})

// ── Ops: KV invalidation hook ────────────────────────────────────────────────
// MUST be declared BEFORE /:slug so Hono matches it first.
// Backend dispatcher calls this after updating a quiz to purge stale edge cache.
app.post('/_ops/invalidate', async (c) => {
  if (!checkOpsAuth(c)) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401)
  }

  const body = await c.req.json<{ slug: string; domain?: string }>()
  const slug = body.slug
  const domain = body.domain
  const host = domain || c.env.PRIMARY_HOST

  if (!slug) {
    return c.json({ ok: false, error: 'Missing slug' }, 400)
  }

  const edgeCache = caches.default
  const cacheKey = new Request(`https://${host}/${slug}`, { method: 'GET' })
  const deleted = await edgeCache.delete(cacheKey)

  log({
    level: 'info',
    event: 'cache_invalidate',
    host,
    slug,
    latency_ms: 0,
    message: `cache_deleted=${deleted}`,
  })

  return c.json({ ok: true, slug, host, cache_deleted: deleted })
})

// ── Ops: Cache warming ───────────────────────────────────────────────────────
// MUST be declared BEFORE /:slug so Hono matches it first.
// Accepts a list of URLs to warm. Caller (warm-cache script or backend)
// is responsible for enumerating quizzes.
app.post('/_ops/warm', async (c) => {
  if (!checkOpsAuth(c)) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401)
  }

  const body = await c.req.json<{ urls: string[] }>()
  const urls = body.urls || []

  if (!urls.length) {
    return c.json({ ok: false, error: 'Missing urls' }, 400)
  }

  const edgeCache = caches.default
  const results: Array<{ url: string; ok: boolean; cached: boolean; error?: string }> = []

  for (const url of urls) {
    try {
      const req = new Request(url, { method: 'GET' })
      const cacheKey = req

      // Skip if already cached
      const cached = await edgeCache.match(cacheKey)
      if (cached) {
        results.push({ url, ok: true, cached: true })
        continue
      }

      // Fetch through the worker itself to trigger normal flow
      const resp = await app.fetch(req, c.env, c.executionCtx)
      if (resp.ok) {
        await edgeCache.put(cacheKey, resp.clone())
        results.push({ url, ok: true, cached: false })
      } else {
        results.push({ url, ok: false, cached: false, error: `HTTP ${resp.status}` })
      }
    } catch (e) {
      results.push({ url, ok: false, cached: false, error: String(e) })
    }
  }

  const okCount = results.filter((r) => r.ok).length
  const cachedCount = results.filter((r) => r.cached).length

  log({
    level: 'info',
    event: 'cache_warm',
    host: c.env.PRIMARY_HOST,
    latency_ms: 0,
    message: `total=${urls.length} ok=${okCount} already_cached=${cachedCount}`,
  })

  return c.json({
    ok: true,
    total: urls.length,
    warmed: okCount,
    already_cached: cachedCount,
    results,
  })
})

// ── Quiz renderer (primary route) ────────────────────────────────────────────
app.get('/:slug', async (c) => {
  const env = c.env
  const host = c.req.header('host') ?? ''
  const primaryHost = env.PRIMARY_HOST || 'play.quizmebaby.app'
  const start = Date.now()

  let slug: string

  if (host !== primaryHost) {
    // Custom domain path: look up slug from DOMAIN_MAP
    const rawEntry = await env.DOMAIN_MAP.get(host)
    if (!rawEntry) {
      const latency = Date.now() - start
      log({ level: 'info', event: 'domain_miss', host, latency_ms: latency })
      return proxyToVercel(c.req.raw, env.VERCEL_ORIGIN)
    }
    slug = parseDomainMapEntry(rawEntry)
  } else {
    // play.quizmebaby.app/[slug] — use path param
    slug = c.req.param('slug')
  }

  // Cache key includes host to prevent cross-tenant HTML serving.
  // Using caches.default manually instead of hono/cache middleware because
  // hono/cache's keyGenerator doesn't expose host reliably across all CF PoPs.
  const edgeCache = caches.default
  const cacheKey = new Request(`https://${host}/${slug}`, { method: 'GET' })

  const cached = await edgeCache.match(cacheKey)
  if (cached) {
    const latency = Date.now() - start
    log({
      level: 'info',
      event: 'edge_request',
      host,
      slug,
      cache_status: 'hit',
      latency_ms: latency,
      status: 200,
    })
    return cached
  }

  // Look up HTML from KV
  const rawValue = await env.QUIZ_HTML.get(slug)
  if (!rawValue) {
    const latency = Date.now() - start
    log({
      level: 'info',
      event: 'edge_request',
      host,
      slug,
      cache_status: 'kv_miss',
      latency_ms: latency,
      status: 200,
    })
    return proxyToVercel(c.req.raw, env.VERCEL_ORIGIN)
  }

  const response = new Response(rawValue, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}`,
      'X-Served-By': 'quiz-edge-renderer',
    },
  })

  // Populate edge cache after response is built — non-blocking
  c.executionCtx.waitUntil(edgeCache.put(cacheKey, response.clone()))

  const latency = Date.now() - start
  log({
    level: 'info',
    event: 'edge_request',
    host,
    slug,
    cache_status: 'miss',
    latency_ms: latency,
    status: 200,
  })

  return response
})

// Root path on primary host — proxy to Vercel app
app.get('/', async (c) => {
  return proxyToVercel(c.req.raw, c.env.VERCEL_ORIGIN)
})

// Catch-all for anything else (assets, API routes, etc.)
app.all('*', async (c) => {
  return proxyToVercel(c.req.raw, c.env.VERCEL_ORIGIN)
})

// ── Helpers ──────────────────────────────────────────────────────────────────
function checkOpsAuth(c: Context<{ Bindings: Env }>): boolean {
  const secret = c.env.OPS_SECRET
  if (!secret) return true // Dev fallback when secret not configured
  const auth = c.req.header('Authorization') ?? ''
  return auth === `Bearer ${secret}`
}

async function proxyToVercel(request: Request, vercelOrigin: string): Promise<Response> {
  const url = new URL(request.url)
  const targetUrl = `${vercelOrigin}${url.pathname}${url.search}`

  // CF Workers runtime rewrites Host to match the target URL on fetch().
  // Set X-Forwarded-Host so the Vercel middleware can recover the original host
  // for custom domain resolution via /api/domains/resolve (KV miss fallback).
  // play.quizmebaby.app is in PRODUCTION_DOMAINS (fix f63d702) — always works.
  const originalHost = new URL(request.url).hostname
  const headers = new Headers(request.headers)
  headers.set('X-Forwarded-Host', originalHost)

  const upstreamReq = new Request(targetUrl, {
    method: request.method,
    headers,
    body: request.body,
    redirect: 'follow',
  })

  return fetch(upstreamReq)
}

export default app
