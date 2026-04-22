import { Hono } from 'hono'
import { cache } from 'hono/cache'

export interface Env {
  DOMAIN_MAP: KVNamespace
  QUIZ_HTML: KVNamespace
  VERCEL_ORIGIN: string
  PRIMARY_HOST: string
}

// KV value shape — aligning with Backend-Dev (pending confirmation)
// Expected: either plain HTML string OR JSON { html: string, meta?: { title?: string, updatedAt?: string } }
type KvValue = string | { html: string; meta?: Record<string, string> }

function extractHtml(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as KvValue
    if (typeof parsed === 'object' && parsed !== null && 'html' in parsed) {
      return parsed.html
    }
  } catch {
    // not JSON — treat as raw HTML
  }
  return raw
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
    const mappedSlug = await env.DOMAIN_MAP.get(host)
    if (!mappedSlug) {
      // Domain not mapped — fall through to Vercel
      return proxyToVercel(c.req.raw, env.VERCEL_ORIGIN)
    }
    slug = mappedSlug
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

  const html = extractHtml(rawValue)

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
