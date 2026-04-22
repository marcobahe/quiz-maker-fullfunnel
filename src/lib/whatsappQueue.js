import prisma from '@/lib/prisma';
import { sendWhatsappFailureAlert, isEmailConfigured } from '@/lib/emailNotifier';

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 1000;

/**
 * Threshold (env: WHATSAPP_ALERT_THRESHOLD, default 5) of DLQ entries in a rolling
 * window (WHATSAPP_ALERT_WINDOW_MINUTES, default 60) that triggers an email alert.
 * Alert fires every time the count is a multiple of the threshold to avoid duplicates.
 */
const ALERT_THRESHOLD = parseInt(process.env.WHATSAPP_ALERT_THRESHOLD || '5', 10);
const ALERT_WINDOW_MINUTES = parseInt(process.env.WHATSAPP_ALERT_WINDOW_MINUTES || '60', 10);

/**
 * Enqueue a WhatsApp message for delivery via Evolution API.
 * Creates a persistent log record and handles retry + DLQ marking.
 * Fire-and-forget safe — caller should NOT await.
 *
 * @param {object} params
 * @param {string|null}  params.leadId        - Lead ID (soft ref, nullable)
 * @param {string|null}  params.quizId        - Quiz ID (soft ref, nullable)
 * @param {string|null}  params.integrationId - Integration ID (soft ref, nullable)
 * @param {string}       params.phone         - E.164 phone number
 * @param {string}       params.message       - Rendered message text
 * @param {string}       params.apiUrl        - Evolution API base URL
 * @param {string}       params.apiKey        - Evolution API key
 * @param {string}       params.instance      - Evolution instance name
 * @param {string}       params.integrationName - Human-readable label for logs
 */
export async function enqueueWhatsappMessage({
  leadId = null,
  quizId = null,
  integrationId = null,
  phone,
  message,
  apiUrl,
  apiKey,
  instance,
  integrationName = 'Evolution',
}) {
  // Create persistent log entry so the send attempt survives across retries
  let logRecord;
  try {
    logRecord = await prisma.whatsappMessageLog.create({
      data: {
        leadId,
        quizId,
        integrationId,
        phone,
        message,
        status: 'pending',
        attemptCount: 0,
      },
    });
  } catch (dbErr) {
    console.error('[WhatsappQueue] Failed to create log record:', dbErr.message);
    // Still attempt the send even if we can't log
    logRecord = null;
  }

  const url = `${apiUrl.replace(/\/$/, '')}/message/sendText/${encodeURIComponent(instance)}`;

  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) {
      await new Promise((r) => setTimeout(r, BASE_DELAY_MS * Math.pow(2, attempt - 2)));
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey,
        },
        body: JSON.stringify({ number: phone, text: message, delay: 1200 }),
        signal: AbortSignal.timeout(15000),
      });

      if (res.status >= 500) {
        lastError = new Error(`HTTP ${res.status}`);
        console.warn(
          `[WhatsappQueue] ${integrationName} attempt ${attempt}/${MAX_ATTEMPTS} failed (${res.status}), retrying…`
        );
        if (logRecord) {
          await prisma.whatsappMessageLog
            .update({ where: { id: logRecord.id }, data: { attemptCount: attempt, status: 'failed', error: `HTTP ${res.status}` } })
            .catch(() => {});
        }
        continue;
      }

      // Success
      const body = await res.json().catch(() => ({}));
      console.log(`[WhatsappQueue] ${integrationName} → ${res.status}`, body?.key?.id || '');
      if (logRecord) {
        await prisma.whatsappMessageLog
          .update({
            where: { id: logRecord.id },
            data: { status: 'success', attemptCount: attempt, sentAt: new Date(), error: null },
          })
          .catch(() => {});
      }
      return;
    } catch (err) {
      lastError = err;
      console.warn(`[WhatsappQueue] ${integrationName} attempt ${attempt}/${MAX_ATTEMPTS} error: ${err.message}`);
      if (logRecord) {
        await prisma.whatsappMessageLog
          .update({ where: { id: logRecord.id }, data: { attemptCount: attempt, status: 'failed', error: err.message } })
          .catch(() => {});
      }
    }
  }

  // All attempts exhausted → dead letter queue
  console.error(`[WhatsappQueue] ${integrationName} DLQ after ${MAX_ATTEMPTS} attempts — phone: ${phone} — ${lastError?.message}`);
  if (logRecord) {
    await prisma.whatsappMessageLog
      .update({
        where: { id: logRecord.id },
        data: {
          status: 'dlq',
          attemptCount: MAX_ATTEMPTS,
          error: lastError?.message || 'Unknown error',
        },
      })
      .catch(() => {});
  }

  // Check alert threshold (non-blocking)
  checkAndAlertFailureThreshold().catch(() => {});
}

/**
 * Count DLQ entries in the rolling alert window.
 * Sends an email alert every time the count reaches a multiple of ALERT_THRESHOLD.
 */
async function checkAndAlertFailureThreshold() {
  if (!isEmailConfigured()) return;

  const since = new Date(Date.now() - ALERT_WINDOW_MINUTES * 60 * 1000);
  const count = await prisma.whatsappMessageLog.count({
    where: { status: 'dlq', createdAt: { gte: since } },
  });

  // Alert on every multiple of threshold to avoid continuous spam
  if (count > 0 && count % ALERT_THRESHOLD === 0) {
    await sendWhatsappFailureAlert({ count, windowMinutes: ALERT_WINDOW_MINUTES, threshold: ALERT_THRESHOLD });
  }
}
