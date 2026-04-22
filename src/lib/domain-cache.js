/**
 * Shared in-memory domain cache.
 *
 * Middleware (Edge Runtime) and API routes (Node.js) run in separate runtimes
 * on Vercel — they do NOT share module state in production. The invalidation
 * functions below provide best-effort clearing for dev/single-instance deploys.
 * In production, TTL (2 min) is the primary safety net for stale entries.
 *
 * Cache entry shape: { slug: string | null, active: boolean, timestamp: number }
 *   - slug: resolved quiz slug, or null if domain has no active quiz
 *   - active: false means domain is deactivated — return 404 even if slug exists
 *   - timestamp: epoch ms when entry was cached
 */

export const domainCache = new Map();

/** Cache TTL in milliseconds. */
export const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

/**
 * Remove a single domain entry from the cache.
 * @param {string} domain - The hostname to invalidate (will be lowercased + trimmed).
 */
export function invalidateDomainCache(domain) {
  if (domain) {
    domainCache.delete(domain.toLowerCase().trim());
  }
}
