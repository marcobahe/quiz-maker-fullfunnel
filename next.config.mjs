/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // emoji-mart and related packages use ESM-only bundled output that webpack
  // can't resolve without explicit transpilation (Next.js 15 + webpack 5).
  transpilePackages: ['emoji-mart', '@emoji-mart/data', '@emoji-mart/react'],
  async headers() {
    return [
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
