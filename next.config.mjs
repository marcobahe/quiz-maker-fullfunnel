/** @type {import('next').NextConfig} */

// Security headers applied to all routes.
//
// CSRF posture: SameSite=Lax (NextAuth default) is sufficient here because:
//   1. All state-changing actions are POST/PUT/DELETE — browsers only attach
//      Lax cookies on top-level same-site navigations, blocking cross-origin
//      form submissions automatically.
//   2. The app has no cross-origin embeds that legitimately need to POST
//      authenticated requests.
//   Explicit CSRF tokens would add defence-in-depth but are not required
//   while every mutating endpoint requires an authenticated session cookie
//   with SameSite=Lax and no CORS wildcard.
const securityHeaders = [
  {
    // Content-Security-Policy — restricts resource origins.
    // 'unsafe-inline' is required for Next.js inline <script> chunks;
    // remove it once the app migrates to nonce-based CSP.
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
  {
    // Prevent the page from being embedded in a frame (anti-clickjacking).
    // Redundant with frame-ancestors in CSP but kept for legacy browsers.
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    // Prevent MIME-type sniffing — forces browser to honour Content-Type.
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // HSTS — forces HTTPS for 1 year across all subdomains.
    // Only effective once served over HTTPS (Vercel always serves HTTPS).
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    // Don't expose full referrer to cross-origin destinations.
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Disable browser features not used by this app.
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Security headers on all routes.
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Quiz player pages — NO CDN cache. The Cloudflare Worker at
        // play.quizmebaby.app handles its own edge caching via KV.
        // Vercel/CDN must not cache 404s or stale HTML here.
        source: '/q/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
        ],
      },
      {
        // Static assets — aggressive cache
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
