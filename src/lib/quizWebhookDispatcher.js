import crypto from 'crypto';
import prisma from '@/lib/prisma';

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 1000;
const TIMEOUT_MS = 10_000;

/**
 * Fire-and-forget dispatcher for the generic outbound quiz webhook.
 * Call after lead creation — do NOT await.
 *
 * @param {object} params
 * @param {object} params.quiz       - Prisma quiz record (must include webhookUrl, webhookSecret, slug)
 * @param {object} params.lead       - Prisma lead record
 * @param {Array}  params.answers    - Parsed answers array
 * @param {number} params.score
 * @param {string|null} params.resultCategory
 */
export function dispatchQuizWebhook({ quiz, lead, answers, score, resultCategory }) {
  if (!quiz.webhookUrl) return;

  _dispatch({ quiz, lead, answers, score, resultCategory }).catch((err) => {
    console.error('[quizWebhook] Top-level error:', err);
  });
}

async function _dispatch({ quiz, lead, answers, score, resultCategory }) {
  const payload = buildPayload({ quiz, lead, answers, score, resultCategory });
  const body = JSON.stringify(payload);

  const headers = { 'Content-Type': 'application/json' };
  if (quiz.webhookSecret) {
    headers['X-QuizMeBaby-Signature'] = `sha256=${hmacHex(body, quiz.webhookSecret)}`;
  }

  let lastError = null;
  let lastStatus = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) {
      await new Promise((r) => setTimeout(r, BASE_DELAY_MS * Math.pow(2, attempt - 2)));
    }

    const t0 = Date.now();
    try {
      const res = await fetch(quiz.webhookUrl, {
        method: 'POST',
        headers,
        body,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      const responseTimeMs = Date.now() - t0;
      lastStatus = res.status;

      if (res.status >= 500) {
        lastError = `HTTP ${res.status}`;
        console.warn(`[quizWebhook] quiz=${quiz.id} attempt=${attempt}/${MAX_ATTEMPTS} status=${res.status} — retrying`);
        await persistLog({ quizId: quiz.id, leadId: lead.id, attempt, status: 'failed', statusCode: res.status, responseTimeMs, lastError });
        continue;
      }

      // 2xx / 3xx / 4xx — do not retry (4xx are caller errors)
      console.log(`[quizWebhook] quiz=${quiz.id} → ${res.status} (${responseTimeMs}ms)`);
      await persistLog({ quizId: quiz.id, leadId: lead.id, attempt, status: 'success', statusCode: res.status, responseTimeMs, lastError: null });
      return;
    } catch (err) {
      lastError = err.message;
      const responseTimeMs = Date.now() - t0;
      console.warn(`[quizWebhook] quiz=${quiz.id} attempt=${attempt}/${MAX_ATTEMPTS} error: ${err.message}`);
      await persistLog({ quizId: quiz.id, leadId: lead.id, attempt, status: 'failed', statusCode: null, responseTimeMs, lastError: err.message });
    }
  }

  // All attempts exhausted → DLQ
  console.error(`[quizWebhook] quiz=${quiz.id} DLQ after ${MAX_ATTEMPTS} attempts — ${lastError}`);
  await persistLog({ quizId: quiz.id, leadId: lead.id, attempt: MAX_ATTEMPTS, status: 'dlq', statusCode: lastStatus, responseTimeMs: null, lastError });
}

function buildPayload({ quiz, lead, answers, score, resultCategory }) {
  const attr = lead.attribution && typeof lead.attribution === 'object' ? lead.attribution : {};

  return {
    event: 'quiz.completed',
    quiz_id: quiz.id,
    quiz_slug: quiz.slug,
    lead: {
      email: lead.email || null,
      phone: lead.phone || null,
      name: lead.name || null,
    },
    answers: (Array.isArray(answers) ? answers : []).map((a) => ({
      question_id: a.questionId || a.question_id || null,
      question_text: a.question || a.questionText || a.question_text || null,
      answer_text: a.answer || a.answerText || a.answer_text || null,
      answer_value: a.value !== undefined ? a.value : (a.points !== undefined ? a.points : null),
    })),
    score: score || 0,
    completed_at: lead.createdAt ? lead.createdAt.toISOString() : new Date().toISOString(),
    utm: {
      source: attr.utmSource || attr.utm_source || null,
      medium: attr.utmMedium || attr.utm_medium || null,
      campaign: attr.campaign || attr.utm_campaign || null,
    },
  };
}

function hmacHex(body, secret) {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

async function persistLog({ quizId, leadId, attempt, status, statusCode, responseTimeMs, lastError }) {
  try {
    await prisma.webhookLog.create({
      data: { quizId, leadId, attempt, status, statusCode, responseTimeMs, lastError },
    });
  } catch (err) {
    console.error('[quizWebhook] Failed to persist log:', err.message);
  }
}
