/**
 * In-memory rate limiter — per Edge instance.
 * Suitable for Vercel Serverless/Edge where Redis is not available.
 * For shared-state rate limiting, replace with @upstash/ratelimit + Vercel KV.
 */

const store = new Map(); // key → { count, resetAt }

/**
 * @param {string} key  - e.g. `lead:${quizId}:${ip}`
 * @param {{ max: number, windowMs: number }} opts
 * @returns {{ allowed: boolean, remaining: number, retryAfter: number }}
 */
export function checkRateLimit(key, { max = 5, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, retryAfter: 0 };
  }

  if (entry.count >= max) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  entry.count += 1;
  return { allowed: true, remaining: max - entry.count, retryAfter: 0 };
}
