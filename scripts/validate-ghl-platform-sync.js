#!/usr/bin/env node
/**
 * Validate GHL Platform Sync (Stripe billing events)
 *
 * Tests that GHL_PRIVATE_TOKEN and GHL_LOCATION_ID are valid
 * by calling the GHL contacts/upsert endpoint with a test contact.
 *
 * Usage:
 *   node scripts/validate-ghl-platform-sync.js
 *
 * Requires env vars:
 *   GHL_PRIVATE_TOKEN — Private Integration Token (PIT)
 *   GHL_LOCATION_ID   — GHL location ID
 *
 * Exit codes:
 *   0 — token valid, upsert succeeded
 *   1 — missing env vars or API error
 */

const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

async function main() {
  const token = process.env.GHL_PRIVATE_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!token || !locationId) {
    console.error('❌ Missing env vars: GHL_PRIVATE_TOKEN and/or GHL_LOCATION_ID');
    process.exit(1);
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Version: GHL_API_VERSION,
  };

  const testEmail = `validate-${Date.now()}@quizmebaby.test`;
  const body = {
    email: testEmail,
    locationId,
    name: 'Platform Sync Validator',
    source: 'QuizMeBaby-Validation',
    tags: ['platform-sync-test'],
  };

  console.log('Testing GHL contact upsert...');
  console.log('  URL:', `${GHL_BASE_URL}/contacts/upsert`);
  console.log('  Location:', locationId);
  console.log('  Test email:', testEmail);

  try {
    const res = await fetch(`${GHL_BASE_URL}/contacts/upsert`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ GHL API error (${res.status}):`, errorText);
      process.exit(1);
    }

    const data = await res.json();
    const contact = data.contact || data;
    const contactId = contact?.id;

    if (!contactId) {
      console.error('❌ Upsert succeeded but no contact ID returned:', JSON.stringify(data));
      process.exit(1);
    }

    console.log('✅ GHL token valid — contact upserted');
    console.log('  Contact ID:', contactId);
    console.log('  Contact email:', contact.email || testEmail);

    // Cleanup: delete the test contact
    const delRes = await fetch(`${GHL_BASE_URL}/contacts/${contactId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, Version: GHL_API_VERSION },
    });

    if (delRes.ok) {
      console.log('✅ Test contact cleaned up');
    } else {
      console.log('⚠️  Test contact cleanup failed (non-critical):', delRes.status);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Request failed:', err.message);
    process.exit(1);
  }
}

main();
