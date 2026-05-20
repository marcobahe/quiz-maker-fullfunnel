/**
 * Audit Logging Utility
 *
 * Central helper for writing AuditLog and LoginAttempt records.
 * Retention policy:
 *   AuditLog:     2 years  (managed by a purge cron / DB job)
 *   LoginAttempt: 90 days  (managed by scripts/cleanup-login-attempts.mjs)
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
import nodemailer from 'nodemailer';

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

// ─── LoginAttempt logging ─────────────────────────────────────────────────────

const FAILED_LOGIN_ALERT_THRESHOLD = 10; // failures per hour before alerting user

/**
 * Extract IP from a NextAuth req object (Node IncomingMessage) or Next.js Request.
 * NextAuth v4 passes the raw Node req to authorize(); handles both shapes.
 */
function extractIpFromReq(req) {
  if (!req) return null;
  // Next.js Web API Request (app router)
  if (typeof req.headers?.get === 'function') {
    const fwd = req.headers.get('x-forwarded-for');
    if (fwd) return fwd.split(',')[0].trim();
    return req.headers.get('x-real-ip') ?? null;
  }
  // Node IncomingMessage (NextAuth authorize callback)
  const headers = req.headers ?? {};
  const fwd = headers['x-forwarded-for'];
  if (fwd) return (typeof fwd === 'string' ? fwd : fwd[0]).split(',')[0].trim();
  return headers['x-real-ip'] ?? null;
}

function extractUaFromReq(req) {
  if (!req) return null;
  if (typeof req.headers?.get === 'function') return req.headers.get('user-agent') ?? null;
  return req.headers?.['user-agent'] ?? null;
}

async function sendLoginSecurityAlert({ userEmail, failCount, ipAddress }) {
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailPass) {
    console.warn('[LoginAlert] GMAIL_APP_PASSWORD not set — alert suppressed for', userEmail);
    return;
  }
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: 'fully11012001@gmail.com', pass: gmailPass },
    });
    await transporter.sendMail({
      from: '"QuizMeBaby Security" <fully11012001@gmail.com>',
      to: userEmail,
      subject: `[Alerta de Segurança] ${failCount} tentativas de login falhas na sua conta`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:#dc2626;color:white;padding:20px;border-radius:8px;text-align:center;margin-bottom:24px;">
            <h1 style="margin:0;font-size:22px;">Alerta de Segurança</h1>
          </div>
          <p>Detectamos <strong>${failCount} tentativas de login malsucedidas</strong> na sua conta
             (<em>${userEmail}</em>) na última hora.</p>
          ${ipAddress ? `<p>IP de origem: <code>${ipAddress}</code></p>` : ''}
          <p>Se você não reconhece essas tentativas, recomendamos:</p>
          <ul>
            <li>Trocar sua senha imediatamente</li>
            <li>Habilitar autenticação em dois fatores (MFA)</li>
            <li>Verificar se há acessos não autorizados no histórico de login</li>
          </ul>
          <p style="color:#6c757d;font-size:13px;margin-top:32px;">
            Enviado automaticamente pelo QuizMeBaby · Não responda este email.
          </p>
        </div>
      `,
    });
    console.log('[LoginAlert] Security alert sent to', userEmail);
  } catch (err) {
    console.error('[LoginAlert] Failed to send security alert:', err.message);
  }
}

/**
 * Record a login attempt in LoginAttempt table and trigger alerts on
 * suspicious patterns (≥10 failures per hour for the same email).
 *
 * Also writes to AuditLog via auditLogin for the existing audit trail.
 *
 * @param {Request | import('http').IncomingMessage | null} req
 * @param {{
 *   userId?:     string | null,
 *   email?:      string | null,
 *   success:     boolean,
 *   authMethod?: 'credentials' | 'google',
 *   failReason?: string,
 * }} entry
 */
export async function logLoginAttempt(req, { userId, email, success, authMethod = 'credentials', failReason }) {
  const ipAddress = extractIpFromReq(req);
  const userAgent = extractUaFromReq(req);

  // 1. Write LoginAttempt record (never throws)
  try {
    await prisma.loginAttempt.create({
      data: {
        userId:     userId  ?? null,
        email:      email   ?? null,
        ipAddress,
        userAgent,
        success,
        authMethod,
        failReason: failReason ?? null,
      },
    });
  } catch (err) {
    console.error('[logLoginAttempt] Failed to write LoginAttempt:', err?.message ?? err);
  }

  // 2. Write AuditLog via existing helper
  await auditLogin(req, { userId: userId ?? null, success, reason: failReason });

  // 3. Check suspicious pattern: ≥10 failures in last hour for this email
  if (!success && email) {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const failCount = await prisma.loginAttempt.count({
        where: {
          email,
          success:   false,
          createdAt: { gte: oneHourAgo },
        },
      });

      // Alert exactly at threshold (and every 10 after) to avoid alert storms
      if (failCount >= FAILED_LOGIN_ALERT_THRESHOLD && failCount % FAILED_LOGIN_ALERT_THRESHOLD === 0) {
        // Look up user email for alert recipient (email IS the key here)
        await sendLoginSecurityAlert({ userEmail: email, failCount, ipAddress });
      }
    } catch (err) {
      console.error('[logLoginAttempt] Failed to check suspicious pattern:', err?.message ?? err);
    }
  }
}

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
