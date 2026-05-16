/**
 * Audit Logging Utility
 *
 * Central helper for writing AuditLog records.
 * Retention policy: 2 years (managed by a purge cron / DB job).
 *
 * Usage:
 *   import { audit } from '@/lib/auditLog';
 *
 *   await audit(request, {
 *     userId: session.user.id,
 *     action: 'profile.email_changed',
 *     resource: 'user',
 *     resourceId: session.user.id,
 *     oldValue: { email: oldEmail },
 *     newValue: { email: newEmail },
 *   });
 */

import prisma from '@/lib/prisma';

// Fields that must NEVER appear in oldValue/newValue even as placeholders.
const REDACTED_FIELDS = new Set(['password', 'token', 'secret', 'apiKey', 'webhookSecret']);

/**
 * Strip sensitive keys from an object before serialising.
 * Replaces matched keys with "[REDACTED]".
 *
 * @param {Record<string, unknown> | null | undefined} obj
 * @returns {Record<string, unknown> | null}
 */
function sanitise(obj) {
  if (obj == null) return null;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = REDACTED_FIELDS.has(k) ? '[REDACTED]' : v;
  }
  return out;
}

/**
 * Extract IP address from a Next.js request.
 *
 * @param {Request} req
 * @returns {string | null}
 */
function extractIp(req) {
  if (!req) return null;
  const forwarded = req.headers?.get?.('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers?.get?.('x-real-ip') ?? null;
}

/**
 * Write one audit log entry.
 * Never throws — errors are swallowed so a logging failure never breaks the
 * business operation. Errors are surfaced to the console only.
 *
 * @param {Request | null} req  - Next.js Request (or null for server-side calls)
 * @param {{
 *   userId?:     string | null,
 *   action:      string,
 *   resource:    string,
 *   resourceId?: string | null,
 *   oldValue?:   Record<string, unknown> | null,
 *   newValue?:   Record<string, unknown> | null,
 *   metadata?:   Record<string, unknown>,
 * }} entry
 */
export async function audit(req, entry) {
  try {
    const { userId, action, resource, resourceId, oldValue, newValue, metadata } = entry;

    await prisma.auditLog.create({
      data: {
        userId:     userId ?? null,
        action,
        resource,
        resourceId: resourceId ?? null,
        oldValue:   oldValue   ? JSON.stringify(sanitise(oldValue))  : null,
        newValue:   newValue   ? JSON.stringify(sanitise(newValue))  : null,
        ipAddress:  extractIp(req),
        userAgent:  req?.headers?.get?.('user-agent') ?? null,
        metadata:   JSON.stringify(metadata ?? {}),
      },
    });
  } catch (err) {
    // Audit failures must never interrupt the main request.
    console.error('[audit] Failed to write audit log:', err?.message ?? err);
  }
}

/**
 * Convenience wrappers for common action categories.
 * All delegate to `audit()` with the correct resource/action naming convention.
 */

export const auditProfile = (req, userId, { field, oldVal, newVal }) =>
  audit(req, {
    userId,
    action:     `profile.${field}_changed`,
    resource:   'user',
    resourceId: userId,
    oldValue:   { [field]: oldVal },
    newValue:   { [field]: newVal },
  });

export const auditApiKey = (req, userId, { op, keyId }) =>
  audit(req, {
    userId,
    action:     `api_key.${op}`,        // op: 'created' | 'rotated' | 'deleted'
    resource:   'api_key',
    resourceId: keyId,
  });

export const auditLogin = (req, { userId, success, reason }) =>
  audit(req, {
    userId,
    action:   success ? 'auth.login_success' : 'auth.login_failed',
    resource: 'auth',
    metadata: reason ? { reason } : {},
  });

export const auditDataAccess = (req, userId, { dataType, resourceId }) =>
  audit(req, {
    userId,
    action:     `data.${dataType}_accessed`,  // e.g. 'data.leads_exported'
    resource:   dataType,
    resourceId,
  });

export const auditAdminAction = (req, adminId, { op, targetUserId, oldVal, newVal }) =>
  audit(req, {
    userId:     adminId,
    action:     `admin.${op}`,               // e.g. 'admin.user_suspended'
    resource:   'user',
    resourceId: targetUserId,
    oldValue:   oldVal ?? null,
    newValue:   newVal ?? null,
  });

export const auditDeletion = (req, userId, { resource, resourceId, snapshot }) =>
  audit(req, {
    userId,
    action:     `${resource}.deleted`,
    resource,
    resourceId,
    oldValue:   snapshot ?? null,
  });
