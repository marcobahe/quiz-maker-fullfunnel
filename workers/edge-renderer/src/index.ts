import { Hono } from 'hono'

export interface Env {
  DOMAIN_MAP: KVNamespace
  QUIZ_HTML: KVNamespace
  VERCEL_ORIGIN: string
  PRIMARY_HOST: string
}

// QUIZ_HTML KV: key=slug, value=raw HTML string (confirmed with Backend-Dev)
// DOMAIN_MAP KV: key=hostname, value=JSON { slug, quizId, updatedAt } (confirmed with Backend-Dev)
interface DomainMapEntry {
  slug: string
  quizId?: string
  updatedAt?: string
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

app.get('/:slug', async (c) => {
  const env = c.env
  const host = c.req.header('host') ?? ''
  const primaryHost = env.PRIMARY_HOST || 'play.quizmebaby.app'

  let slug: string

  if (host !== primaryHost) {
    // Custom domain path: look up slug from DOMAIN_MAP
    const rawEntry = await env.DOMAIN_MAP.get(host)
    if (!rawEntry) {
      console.log(`[edge] domain_miss host=${host} → proxy_vercel`)
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
    console.log(`[edge] cache_hit host=${host} slug=${slug}`)
    return cached
  }

  console.log(`[edge] cache_miss host=${host} slug=${slug}`)

  // Look up HTML from KV
  const rawValue = await env.QUIZ_HTML.get(slug)
  if (!rawValue) {
    console.log(`[edge] kv_miss slug=${slug} → proxy_vercel`)
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
