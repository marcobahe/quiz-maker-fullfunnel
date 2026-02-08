/**
 * GHL (GoHighLevel / Full Funnel) Contact Sync
 * 
 * Syncs Stripe billing events to GHL contacts via the Private Integration API.
 * Resilient: all operations are wrapped in try/catch so GHL failures
 * never break the Stripe webhook flow.
 */

const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

function getHeaders() {
  const token = process.env.GHL_PRIVATE_TOKEN;
  if (!token) {
    throw new Error('GHL_PRIVATE_TOKEN not configured');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Version': GHL_API_VERSION,
  };
}

function getLocationId() {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId) {
    throw new Error('GHL_LOCATION_ID not configured');
  }
  return locationId;
}

/**
 * Upsert a contact in GHL (create or update by email).
 * Returns the contact object (with id) or null on failure.
 */
async function upsertContact({ email, name, tags, customFields }) {
  const locationId = getLocationId();

  const body = {
    email,
    locationId,
    source: 'QuizMeBaby',
  };

  if (name) body.name = name;
  if (tags && tags.length > 0) body.tags = tags;

  // Convert customFields object to GHL format
  if (customFields && Object.keys(customFields).length > 0) {
    body.customFields = Object.entries(customFields).map(([key, value]) => ({
      key,
      field_value: value,
    }));
  }

  const res = await fetch(`${GHL_BASE_URL}/contacts/upsert`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GHL upsert failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.contact || data;
}

/**
 * Update a contact by ID (used for removing tags).
 */
async function updateContact(contactId, updateData) {
  const res = await fetch(`${GHL_BASE_URL}/contacts/${contactId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updateData),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GHL update failed (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * Remove specific tags from a contact.
 * GHL doesn't have a "remove tag" endpoint directly,
 * so we fetch current tags, filter out unwanted ones, and PUT back.
 */
async function removeTagsFromContact(contactId, tagsToRemove) {
  // First get current contact to see existing tags
  const res = await fetch(`${GHL_BASE_URL}/contacts/${contactId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GHL get contact failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const contact = data.contact || data;
  const currentTags = contact.tags || [];

  // Filter out tags to remove (exact match and pattern match for plano-*)
  const newTags = currentTags.filter(tag => {
    for (const removeTag of tagsToRemove) {
      if (removeTag.endsWith('*')) {
        const prefix = removeTag.slice(0, -1);
        if (tag.startsWith(prefix)) return false;
      } else if (tag === removeTag) {
        return false;
      }
    }
    return true;
  });

  await updateContact(contactId, { tags: newTags });
  return newTags;
}

/**
 * Main sync function — called from webhook handlers.
 * 
 * @param {Object} params
 * @param {string} params.email - Contact email (required)
 * @param {string} [params.name] - Contact name
 * @param {string[]} [params.tags] - Tags to add (merged with existing via upsert)
 * @param {string[]} [params.removeTags] - Tags to remove (supports wildcard like 'plano-*')
 * @param {Object} [params.customFields] - Custom fields to set (key-value pairs)
 */
export async function syncContactToGHL({ email, name, tags, removeTags, customFields }) {
  if (!process.env.GHL_PRIVATE_TOKEN || !process.env.GHL_LOCATION_ID) {
    console.log('[GHL Sync] Skipping — GHL not configured (missing GHL_PRIVATE_TOKEN or GHL_LOCATION_ID)');
    return null;
  }

  try {
    // Step 1: Upsert contact (create or update)
    const contact = await upsertContact({ email, name, tags, customFields });
    const contactId = contact?.id;

    if (!contactId) {
      console.error('[GHL Sync] Upsert returned no contact ID', contact);
      return null;
    }

    // Step 2: Remove tags if needed (requires separate call)
    if (removeTags && removeTags.length > 0) {
      await removeTagsFromContact(contactId, removeTags);
    }

    console.log(`[GHL Sync] Successfully synced contact ${email} (ID: ${contactId})`);
    return contact;
  } catch (error) {
    // GHL sync is non-critical — log error but don't throw
    console.error(`[GHL Sync] Error syncing ${email}:`, error.message);
    return null;
  }
}

/**
 * Helper to determine plan name from Stripe price ID.
 */
export function getPlanFromPriceId(priceId) {
  if (
    priceId === process.env.STRIPE_PRO_PRICE_ID ||
    priceId === process.env.STRIPE_PRO_ANNUAL_PRICE_ID
  ) {
    return 'pro';
  }
  if (
    priceId === process.env.STRIPE_BUSINESS_PRICE_ID ||
    priceId === process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID
  ) {
    return 'business';
  }
  if (
    priceId === process.env.STRIPE_ADVANCED_PRICE_ID ||
    priceId === process.env.STRIPE_ADVANCED_ANNUAL_PRICE_ID
  ) {
    return 'advanced';
  }
  if (
    priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID ||
    priceId === process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID
  ) {
    return 'enterprise';
  }
  return 'free';
}
