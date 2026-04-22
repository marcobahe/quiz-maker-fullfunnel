import { Hono } from 'hono'
import { cache } from 'hono/cache'

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

const app = new Hono<{ Bindings: Env }>()

// Cache middleware for GET requests
app.use(
  '/*',
  cache({
    cacheName: 'quiz-edge-renderer',
    cacheControl: 'public, max-age=60, s-maxage=300',
    wait: false,
  })
)

app.get('/:slug', async (c) => {
  const env = c.env
  const host = c.req.header('host') ?? ''
  const primaryHost = env.PRIMARY_HOST || 'play.quizmebaby.app'

  let slug: string

  if (host !== primaryHost) {
    // Custom domain path: look up slug from DOMAIN_MAP
    // Value is JSON: { slug, quizId, updatedAt }
    const rawEntry = await env.DOMAIN_MAP.get(host)
    if (!rawEntry) {
      // Domain not mapped — fall through to Vercel
      return proxyToVercel(c.req.raw, env.VERCEL_ORIGIN)
    }
    slug = parseDomainMapEntry(rawEntry)
  } else {
    // play.quizmebaby.app/[slug] — use path param
    slug = c.req.param('slug')
  }

  // Look up HTML from KV
  const rawValue = await env.QUIZ_HTML.get(slug)
  if (!rawValue) {
    // KV miss — proxy to Vercel middleware
    return proxyToVercel(c.req.raw, env.VERCEL_ORIGIN)
  }

  const html = rawValue

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=300',
      'X-Served-By': 'quiz-edge-renderer',
    },
  })
})

// Root path on primary host — also handle /[slug] variants without trailing param
app.get('/', async (c) => {
  return proxyToVercel(c.req.raw, c.env.VERCEL_ORIGIN)
})

// Catch-all for anything else
app.all('*', async (c) => {
  return proxyToVercel(c.req.raw, c.env.VERCEL_ORIGIN)
})

async function proxyToVercel(request: Request, vercelOrigin: string): Promise<Response> {
  const url = new URL(request.url)
  const targetUrl = `${vercelOrigin}${url.pathname}${url.search}`

  const upstreamReq = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'follow',
  })

  const response = await fetch(upstreamReq)
  return response
}

export default app
