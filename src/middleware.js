import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { domainCache, CACHE_TTL } from '@/lib/domain-cache';

// In-memory cache for domain → slug mapping (per edge instance)
// NOTE: Custom domains are primarily served by the Cloudflare Worker (play.quizmebaby.app)
// via DOMAIN_MAP KV. This middleware serves as a fallback for domains that reach Vercel
// directly (e.g., if client's DNS doesn't go through Cloudflare proxy).
// Cache entry shape: { slug, active, timestamp } — TTL is 2 minutes.

// Known app hostnames — requests from these are handled normally
const APP_HOSTNAMES = new Set([
  'localhost',
  'localhost:3000',
  '127.0.0.1',
  '127.0.0.1:3000',
]);

// Add your production domain(s) here
const PRODUCTION_DOMAINS = [
  'quizmaker.fullfunnel.com.br',
  'quiz-maker-fullfunnel.vercel.app',
  'go.quizmebaby.app',
  // Cloudflare Worker edge renderer — proxies KV misses to Vercel with this Host header
  'play.quizmebaby.app',
];
PRODUCTION_DOMAINS.forEach((d) => APP_HOSTNAMES.add(d));

// Auth-protected paths (same as before)
const AUTH_PATHS = [
  '/',
  '/builder',
  '/diagnostic',
  '/integration',
  '/analytics',
  '/templates',
  '/settings',
  '/quiz',
];

function isAuthPath(pathname) {
  return AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
}

// Paths that should never be intercepted by custom domain logic
function isSystemPath(pathname) {
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/q/') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  );
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // ── Custom Domain Routing ──────────────────────────────────
  // If hostname is not a known app hostname, treat as custom domain
  const isCustomDomain = !APP_HOSTNAMES.has(hostname) && 
    !hostname.startsWith('localhost') &&
    !hostname.startsWith('127.0.0.1');

  if (isCustomDomain && !isSystemPath(pathname)) {
    // Check cache first
    const cached = domainCache.get(hostname);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      // Deactivated domains are cached with active: false — always 404
      if (!cached.active || !cached.slug) {
        return new NextResponse('Domínio não configurado', { status: 404 });
      }
      const url = request.nextUrl.clone();
      url.pathname = `/q/${cached.slug}`;
      return NextResponse.rewrite(url);
    }

    // Resolve domain via internal API
    try {
      const resolveUrl = new URL('/api/domains/resolve', request.nextUrl.origin);
      resolveUrl.searchParams.set('domain', hostname);

      const res = await fetch(resolveUrl.toString(), {
        headers: { 'x-middleware-secret': process.env.NEXTAUTH_SECRET || '' },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.slug && data.active !== false) {
          domainCache.set(hostname, { slug: data.slug, active: true, timestamp: Date.now() });
          const url = request.nextUrl.clone();
          url.pathname = `/q/${data.slug}`;
          return NextResponse.rewrite(url);
        }
      }

      // Cache negative result — domain not found or inactive
      domainCache.set(hostname, { slug: null, active: false, timestamp: Date.now() });
      return new NextResponse('Domínio não configurado', { status: 404 });
    } catch (err) {
      console.error('Custom domain resolution error:', err);
      // On error, don't cache — let it retry
      return new NextResponse('Erro interno', { status: 500 });
    }
  }

  // ── Auth Protection (normal app routes) ────────────────────
  if (isAuthPath(pathname)) {
    const token = await getToken({ req: request });
    if (!token) {
      const loginUrl = new URL('/login', request.nextUrl.origin);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
