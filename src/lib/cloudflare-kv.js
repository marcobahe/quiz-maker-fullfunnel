/**
 * Cloudflare KV integration for quiz edge delivery.
 * When a quiz is published, its HTML is pre-cached in Cloudflare KV.
 * The Cloudflare Worker at play.quizmebaby.app serves it from the edge.
 */

const CF_API_TOKEN = process.env.CF_API_TOKEN;
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID || '160ea79933a744b19af54d9d16521ea8';
const CF_KV_NAMESPACE = process.env.CF_KV_NAMESPACE || '07070b407cf94db4a1419e7a1a87c447';
const CF_DOMAIN_MAP_NAMESPACE = process.env.CF_DOMAIN_MAP_NAMESPACE || 'd74ab364d6264846a749b6da9a579c1a';
const ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'https://go.quizmebaby.app';

/**
 * Publish quiz HTML to Cloudflare KV edge cache.
 * Fetches the rendered HTML from Vercel and stores in KV.
 */
export async function publishToEdge(slug) {
  if (!CF_API_TOKEN) {
    console.warn('[CF-KV] No CF_API_TOKEN set, skipping edge publish');
    return false;
  }

  try {
    // Fetch rendered HTML from Vercel
    const res = await fetch(`${ORIGIN}/q/${slug}`, {
      headers: { 'User-Agent': 'QuizMeBaby-EdgePublisher/1.0' },
    });

    if (!res.ok) {
      console.error(`[CF-KV] Failed to fetch quiz HTML: ${res.status}`);
      return false;
    }

    const html = await res.text();

    // Push to KV
    const kvUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE}/values/${slug}`;
    const kvRes = await fetch(kvUrl, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${CF_API_TOKEN}` },
      body: html,
    });

    const data = await kvRes.json();
    if (data.success) {
      console.log(`[CF-KV] Published quiz "${slug}" to edge (${html.length} bytes)`);
    } else {
      console.error(`[CF-KV] Failed to publish: ${JSON.stringify(data.errors)}`);
    }
    return data.success;
  } catch (err) {
    console.error(`[CF-KV] Error publishing to edge: ${err.message}`);
    return false;
  }
}

/**
 * Remove quiz from edge cache when unpublished/deleted.
 */
export async function unpublishFromEdge(slug) {
  if (!CF_API_TOKEN) return false;

  try {
    const kvUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE}/values/${slug}`;
    const res = await fetch(kvUrl, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${CF_API_TOKEN}` },
    });
    const data = await res.json();
    if (data.success) {
      console.log(`[CF-KV] Unpublished quiz "${slug}" from edge`);
    }
    return data.success;
  } catch (err) {
    console.error(`[CF-KV] Error unpublishing: ${err.message}`);
    return false;
  }
}

/**
 * Invalidate and re-cache quiz on edge (after edit + republish).
 */
export async function refreshEdgeCache(slug) {
  await unpublishFromEdge(slug);
  // Small delay to ensure KV propagation
  await new Promise(r => setTimeout(r, 500));
  return publishToEdge(slug);
}

// ── Domain Mapping (DOMAIN_MAP KV) ──────────────────────────

/**
 * Publish a custom domain → quiz slug mapping to the DOMAIN_MAP KV.
 * The Worker uses this to serve quizzes on custom domains.
 * Key: hostname, Value: JSON { slug, quizId, updatedAt }
 */
export async function publishDomainMapping(domain, slug, quizId = null) {
  if (!CF_API_TOKEN) {
    console.warn('[CF-KV] No CF_API_TOKEN set, skipping domain mapping publish');
    return false;
  }

  try {
    const kvUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_DOMAIN_MAP_NAMESPACE}/values/${domain}`;
    const value = JSON.stringify({
      slug,
      quizId,
      updatedAt: new Date().toISOString(),
    });

    const res = await fetch(kvUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: value,
    });

    const data = await res.json();
    if (data.success) {
      console.log(`[CF-KV] Published domain mapping: ${domain} → ${slug}`);
    } else {
      console.error(`[CF-KV] Failed to publish domain mapping: ${JSON.stringify(data.errors)}`);
    }
    return data.success;
  } catch (err) {
    console.error(`[CF-KV] Error publishing domain mapping: ${err.message}`);
    return false;
  }
}

/**
 * Remove a custom domain mapping from the DOMAIN_MAP KV.
 */
export async function removeDomainMapping(domain) {
  if (!CF_API_TOKEN) return false;

  try {
    const kvUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_DOMAIN_MAP_NAMESPACE}/values/${domain}`;
    const res = await fetch(kvUrl, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${CF_API_TOKEN}` },
    });
    const data = await res.json();
    if (data.success) {
      console.log(`[CF-KV] Removed domain mapping: ${domain}`);
    }
    return data.success;
  } catch (err) {
    console.error(`[CF-KV] Error removing domain mapping: ${err.message}`);
    return false;
  }
}
