/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Quiz player pages — cache on Cloudflare edge
        source: '/q/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=3600',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, max-age=86400',
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
