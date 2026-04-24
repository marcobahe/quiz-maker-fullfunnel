/**
 * Distributed rate limiter using @upstash/ratelimit + Vercel KV.
 * Shared across all Vercel Edge/Serverless instances.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

// Cache Ratelimit instances by config key to avoid re-creating on every request
const limiterCache = new Map();

function getLimiter(max, windowMs) {
  const key = `${max}:${windowMs}`;
  if (!limiterCache.has(key)) {
    const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
    const limiter = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(max, `${windowSeconds} s`),
      analytics: true,
      prefix: 'ratelimit',
    });
    limiterCache.set(key, limiter);
  }
  return limiterCache.get(key);
}

/**
 * @param {string} key  - e.g. `lead:${quizId}:${ip}`
 * @param {{ max: number, windowMs: number }} opts
 * @returns {{ allowed: boolean, remaining: number, retryAfter: number }}
 */
export async function checkRateLimit(key, { max = 5, windowMs = 60_000 } = {}) {
  const limiter = getLimiter(max, windowMs);
  const { success, limit, remaining, reset } = await limiter.limit(key);

  return {
    allowed: success,
    remaining: Math.max(0, remaining),
    retryAfter: success ? 0 : Math.ceil((reset - Date.now()) / 1000),
  };
}
