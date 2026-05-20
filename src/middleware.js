import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { domainCache, CACHE_TTL } from '@/lib/domain-cache';

// ── Conditional Security Headers ───────────────────────────
// X-Frame-Options and CSP frame-ancestors are applied here (not in
// next.config.mjs) so that /q/:slug* (quiz player pages) can be embedded
// in third-party iframes while the rest of the app is clickjack-protected.
const BASE_CSP_PARTS = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https:",
  "font-src 'self' https://fonts.gstatic.com",
  // uploadthing.com + *.ingest.uploadthing.com: UploadThing v7 direct browser uploads
  "connect-src 'self' https://uploadthing.com https://*.ingest.uploadthing.com",
];

const STATIC_SECURITY_HEADERS = [
  ['X-Content-Type-Options', 'nosniff'],
  ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains'],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()'],
];

function applySecurityHeaders(response, targetPathname) {
  STATIC_SECURITY_HEADERS.forEach(([k, v]) => response.headers.set(k, v));

  if (targetPathname.startsWith('/q/')) {
    response.headers.set('Content-Security-Policy', BASE_CSP_PARTS.join('; '));
  } else {
    response.headers.set(
      'Content-Security-Policy',
      [...BASE_CSP_PARTS, "frame-ancestors 'none'"].join('; ')
    );
    response.headers.set('X-Frame-Options', 'DENY');
  }
  return response;
}

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
  'quizmebaby.app',
  'www.quizmebaby.app',
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
  '/dashboard',
  '/builder',
  '/diagnostic',
  '/integration',
  '/analytics',
  '/templates',
  '/settings',
  '/quiz',
  '/admin',
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
        return applySecurityHeaders(
          new NextResponse('Domínio não configurado', { status: 404 }),
          pathname
        );
      }
      const url = request.nextUrl.clone();
      url.pathname = `/q/${cached.slug}`;
      return applySecurityHeaders(NextResponse.rewrite(url), url.pathname);
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
          return applySecurityHeaders(NextResponse.rewrite(url), url.pathname);
        }
      }

      // Cache negative result — domain not found or inactive
      domainCache.set(hostname, { slug: null, active: false, timestamp: Date.now() });
      return applySecurityHeaders(
        new NextResponse('Domínio não configurado', { status: 404 }),
        pathname
      );
    } catch (err) {
      console.error('Custom domain resolution error:', err);
      // On error, don't cache — let it retry
      return applySecurityHeaders(
        new NextResponse('Erro interno', { status: 500 }),
        pathname
      );
    }
  }

  // ── Auth Protection (normal app routes) ────────────────────
  if (isAuthPath(pathname)) {
    const token = await getToken({ req: request });
    if (!token) {
      const loginUrl = new URL('/login', request.nextUrl.origin);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl), pathname);
    }
  }

  return applySecurityHeaders(NextResponse.next(), pathname);
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
