import prisma from '@/lib/prisma';
import { sendHotLeadNotification, isHotLead } from '@/lib/emailNotifier';
import { enqueueWhatsappMessage } from '@/lib/whatsappQueue';
import { decrypt, isEncryptionAvailable } from '@/lib/fieldEncryption';

/**
 * Dispatch webhooks and Full Funnel integrations for a new lead.
 * Fire-and-forget: does NOT block the caller.
 */
export function dispatchIntegrations({ quiz, lead, answers, score, resultCategory, scoreRanges }) {
  // Run asynchronously — caller should NOT await this
  _dispatch({ quiz, lead, answers, score, resultCategory, scoreRanges }).catch((err) => {
    console.error('[webhookDispatcher] Top-level error:', err);
  });
}

async function _dispatch({ quiz, lead, answers, score, resultCategory, scoreRanges }) {
  try {
    const integrations = await prisma.integration.findMany({
      where: { quizId: quiz.id, active: true },
    });

    if (!integrations.length) return;

    // Determine result from score ranges
    let result = null;
    if (scoreRanges && scoreRanges.length > 0) {
      const ranges = typeof scoreRanges === 'string' ? JSON.parse(scoreRanges) : scoreRanges;
      result = ranges.find((r) => {
        const min = parseInt(r.min, 10) || 0;
        const max = parseInt(r.max, 10) || 100;
        return score >= min && score <= max;
      });
    }

    const payload = {
      event: 'lead.created',
      quiz: {
        id: quiz.id,
        name: quiz.name,
        slug: quiz.slug,
      },
      lead: {
        id: lead.id || null,
        name: lead.name || null,
        email: lead.email || null,
        phone: lead.phone || null,
      },
      answers: answers || [],
      score: score || 0,
      result: result
        ? { title: result.title || result.label || resultCategory, range: `${result.min}-${result.max}` }
        : { title: resultCategory || null, range: null },
      attribution: lead.attribution || {},
      timestamp: new Date().toISOString(),
    };

    const promises = integrations.map((integration) => {
      if (integration.type === 'webhook') {
        return sendWebhook(integration, payload);
      } else if (integration.type === 'gohighlevel') {
        return sendToGHL(integration, payload, quiz.workspaceId);
      } else if (integration.type === 'evolution') {
        return sendToEvolution(integration, payload);
      }
      return Promise.resolve();
    });

    await Promise.allSettled(promises);

    // ── Email Notifications ──────────────────────────────────
    try {
      if (quiz.emailNotifications && quiz.notificationMode === 'instant-hot') {
        const leadIsHot = isHotLead(score, scoreRanges);
        
        if (leadIsHot) {
          // Buscar dados completos do quiz com usuário
          const fullQuiz = await prisma.quiz.findUnique({
            where: { id: quiz.id },
            include: { user: true },
          });

          if (fullQuiz) {
            const emailResult = await sendHotLeadNotification({
              quizData: fullQuiz,
              leadData: { ...lead, score, resultCategory, createdAt: new Date() },
            });
            
            console.log(`[emailNotification] Hot lead notification: ${emailResult.success ? 'sent' : 'failed'}`, emailResult);
          }
        }
      }
    } catch (emailErr) {
      console.error('[webhookDispatcher] Email notification error:', emailErr);
    }
  } catch (err) {
    console.error('[webhookDispatcher] Error dispatching:', err);
  }
}

// ── Webhook ──────────────────────────────────────────────────

async function sendWebhook(integration, payload) {
  try {
    const config = JSON.parse(integration.config);
    const url = config.url;
    if (!url) return;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    console.log(`[webhook] ${integration.name} → ${res.status}`);
  } catch (err) {
    console.error(`[webhook] ${integration.name} failed:`, err.message);
  }
}

// ── Full Funnel (GHL API) ────────────────────────────────────

/**
 * Resolve the GHL API token for a quiz:
 * 1. Per-integration config token (existing behaviour — backward compat)
 * 2. Workspace-level encrypted key (new self-service model)
 * 3. Platform env var GHL_PRIVATE_TOKEN (legacy Stripe sync flow)
 */
async function resolveGhlToken(config, quizWorkspaceId) {
  // Priority 1: explicit per-integration token
  if (config.privateToken || config.apiKey) {
    return config.privateToken || config.apiKey;
  }

  // Priority 2: workspace-level key (self-service)
  if (quizWorkspaceId && isEncryptionAvailable()) {
    try {
      const workspace = await prisma.workspace.findUnique({
        where: { id: quizWorkspaceId },
        select: { ghlApiKey: true, ghlSyncStatus: true },
      });
      if (workspace?.ghlApiKey && workspace.ghlSyncStatus === 'active') {
        return decrypt(workspace.ghlApiKey);
      }
      if (workspace && workspace.ghlSyncStatus !== 'active') {
        console.log(`[FullFunnel] Workspace ${quizWorkspaceId} GHL key present but status=${workspace.ghlSyncStatus} — flagging pending_setup`);
        await prisma.workspace.update({
          where: { id: quizWorkspaceId },
          data: { ghlSyncStatus: 'pending_setup' },
        }).catch(() => {});
      }
    } catch (err) {
      console.error('[FullFunnel] Error resolving workspace GHL key:', err.message);
    }
  }

  return null;
}

async function sendToGHL(integration, payload, quizWorkspaceId) {
  try {
    const config = JSON.parse(integration.config);
    const { pipelineId, stageId, tags, customFieldMappings } = config;

    const token = await resolveGhlToken(config, quizWorkspaceId);

    if (!token) {
      console.log(`[FullFunnel] ${integration.name} — no API key available (workspace=${quizWorkspaceId ?? 'none'}); skipping`);
      return;
    }

    const ghlHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Version': '2021-07-28',
    };

    // 1. Create/update contact (v2 API — no locationId needed with private token)
    const contactBody = {
      firstName: payload.lead.name?.split(' ')[0] || '',
      lastName: payload.lead.name?.split(' ').slice(1).join(' ') || '',
      email: payload.lead.email || undefined,
      phone: payload.lead.phone || undefined,
      tags: tags || ['quiz-lead'],
      source: `Quiz: ${payload.quiz.name}`,
    };

    // Add attribution data to GHL (native fields)
    if (payload.attribution) {
      contactBody.attributionSource = {
        url: payload.attribution.url,
        utmSource: payload.attribution.utmSource,
        utmMedium: payload.attribution.utmMedium,
        utmContent: payload.attribution.utmContent,
        campaign: payload.attribution.campaign,
        fbclid: payload.attribution.fbclid,
        gclid: payload.attribution.gclid,
        referrer: payload.attribution.referrer,
      };
    }

    // Build custom fields from mappings + answers (v2 uses field_value instead of value)
    if (customFieldMappings && typeof customFieldMappings === 'object') {
      contactBody.customFields = [];

      // Build a lookup of answers by their key (nodeId or nodeId__elementId)
      const answersMap = {};
      if (Array.isArray(payload.answers)) {
        for (const ans of payload.answers) {
          // Answers can come keyed by questionId, elementId, or composite keys
          if (ans.questionId) answersMap[ans.questionId] = ans.answer || ans.value || '';
          if (ans.elementId) answersMap[ans.elementId] = ans.answer || ans.value || '';
          // Support composite key format: nodeId__elementId
          if (ans.nodeId && ans.elementId) answersMap[`${ans.nodeId}__${ans.elementId}`] = ans.answer || ans.value || '';
        }
      } else if (payload.answers && typeof payload.answers === 'object') {
        // answers is an object keyed by nodeId or nodeId__elementId
        for (const [key, val] of Object.entries(payload.answers)) {
          answersMap[key] = typeof val === 'object' ? (val.answer || val.value || JSON.stringify(val)) : String(val);
        }
      }

      for (const [mappingKey, fieldId] of Object.entries(customFieldMappings)) {
        // Strip "contact." prefix if present — GHL API expects just the field ID
        const cleanFieldId = fieldId.replace(/^contact\./, '');
        let value = '';

        if (mappingKey === '_score') {
          value = String(payload.score ?? 0);
        } else if (mappingKey === '_result') {
          value = payload.result?.title || '';
        } else {
          // Look up the answer by the mapping key
          value = answersMap[mappingKey] || '';
        }

        if (value) {
          contactBody.customFields.push({ id: cleanFieldId, field_value: value });
        }
      }
    }

    const contactRes = await fetchWithRetry(
      'https://services.leadconnectorhq.com/contacts/',
      {
        method: 'POST',
        headers: ghlHeaders,
        body: JSON.stringify(contactBody),
        signal: AbortSignal.timeout(15000),
      }
    );

    const contactData = await contactRes.json();
    console.log(`[FullFunnel] Contact created/updated: ${contactRes.status}`, contactData?.contact?.id || '');

    // 2. Create opportunity if pipeline configured (v2 — no locationId needed)
    if (pipelineId && contactData?.contact?.id) {
      const oppBody = {
        pipelineId,
        name: `Quiz Lead: ${payload.lead.name || payload.lead.email || 'Unknown'}`,
        stageId: stageId || undefined,
        contactId: contactData.contact.id,
        status: 'open',
        source: `Quiz: ${payload.quiz.name}`,
      };

      const oppRes = await fetchWithRetry(
        'https://services.leadconnectorhq.com/opportunities/',
        {
          method: 'POST',
          headers: ghlHeaders,
          body: JSON.stringify(oppBody),
          signal: AbortSignal.timeout(15000),
        }
      );

      console.log(`[FullFunnel] Opportunity created: ${oppRes.status}`);
    }
  } catch (err) {
    console.error(`[FullFunnel] ${integration.name} failed:`, err.message);
  }
}

// ── Retry helper ─────────────────────────────────────────────

/**
 * Retry a fetch call up to `maxAttempts` times on network errors or 5xx responses.
 * Waits `baseDelayMs * 2^attempt` ms between tries (exponential backoff).
 * Does NOT retry on 4xx — those are client errors (bad token, wrong IDs).
 */
async function fetchWithRetry(url, options, { maxAttempts = 3, baseDelayMs = 1000 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, baseDelayMs * Math.pow(2, attempt - 1)));
    }
    try {
      const res = await fetch(url, options);
      // Retry on server errors; bail immediately on client errors
      if (res.status >= 500) {
        lastErr = new Error(`HTTP ${res.status}`);
        console.warn(`[FullFunnel] Attempt ${attempt + 1}/${maxAttempts} failed (${res.status}), retrying…`);
        continue;
      }
      return res;
    } catch (err) {
      // Network / timeout errors — retry
      lastErr = err;
      console.warn(`[FullFunnel] Attempt ${attempt + 1}/${maxAttempts} network error: ${err.message}`);
    }
  }
  throw lastErr;
}

// ── Test functions (used by test endpoint) ───────────────────

export async function testWebhook(integration) {
  const config = JSON.parse(integration.config);
  const url = config.url;
  if (!url) throw new Error('URL não configurada');

  const testPayload = {
    event: 'test',
    quiz: { id: 'test-id', name: 'Quiz de Teste', slug: 'quiz-teste' },
    lead: { name: 'Lead Teste', email: 'teste@exemplo.com', phone: '+5511999999999' },
    answers: [
      { questionId: 'q1', question: 'Pergunta 1', answer: 'Resposta A', points: 10 },
    ],
    score: 75,
    result: { title: 'Perfil Exemplo', range: '61-100' },
    timestamp: new Date().toISOString(),
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testPayload),
    signal: AbortSignal.timeout(10000),
  });

  return { status: res.status, statusText: res.statusText };
}

// ── Evolution API (WhatsApp) ──────────────────────────────────

/** Regex for E.164 phone format: +[country code][number], 8–15 digits total */
const E164_RE = /^\+[1-9]\d{7,14}$/;

/**
 * Replace template variables in a message string.
 * Supported: {{name}}, {{result}}, {{score}}
 */
function renderTemplate(template, { name, result, score }) {
  return template
    .replace(/\{\{name\}\}/g, name || '')
    .replace(/\{\{result\}\}/g, result || '')
    .replace(/\{\{score\}\}/g, score != null ? String(score) : '');
}

/**
 * Send a WhatsApp text message via Evolution API on quiz completion.
 *
 * Expected integration config JSON:
 * {
 *   "apiUrl":          "https://your-evolution-api.com",
 *   "apiKey":          "<api-key>",
 *   "instance":        "<instance-name>",
 *   "messageTemplate": "Olá {{name}}, seu resultado foi {{result}} (score: {{score}}). ..."
 * }
 */
async function sendToEvolution(integration, payload) {
  const config = JSON.parse(integration.config);
  const { apiUrl, apiKey, instance, messageTemplate } = config;

  if (!apiUrl || !apiKey || !instance) {
    console.error('[Evolution] Missing required config fields (apiUrl, apiKey, instance)');
    return;
  }

  const phone = payload.lead.phone;
  if (!phone) {
    console.warn('[Evolution] Lead has no phone — skipping WhatsApp message');
    return;
  }

  if (!E164_RE.test(phone)) {
    console.warn(`[Evolution] Phone "${phone}" is not in E.164 format — skipping`);
    return;
  }

  const template = messageTemplate || 'Olá {{name}}, seu resultado no quiz foi: {{result}}.';
  const message = renderTemplate(template, {
    name: payload.lead.name,
    result: payload.result?.title || '',
    score: payload.score,
  });

  // Delegate to queue module — handles retry, DB logging, DLQ, and alerts
  await enqueueWhatsappMessage({
    leadId: payload.lead?.id || null,
    quizId: payload.quiz?.id || null,
    integrationId: integration.id || null,
    phone,
    message,
    apiUrl,
    apiKey,
    instance,
    integrationName: integration.name,
  });
}

export async function testEvolution(integration) {
  const config = JSON.parse(integration.config);
  const { apiUrl, apiKey, instance } = config;

  if (!apiUrl || !apiKey || !instance) {
    throw new Error('Campos apiUrl, apiKey e instance são obrigatórios');
  }

  // Probe the instance status endpoint to verify credentials
  const url = `${apiUrl.replace(/\/$/, '')}/instance/fetchInstances`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'apikey': apiKey },
    signal: AbortSignal.timeout(10000),
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error('apiKey inválida ou sem permissão.');
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Evolution API retornou ${res.status}: ${text}`);
  }

  const data = await res.json();
  const found = Array.isArray(data) ? data.find((i) => i.instance?.instanceName === instance) : null;
  const state = found?.instance?.state || 'unknown';
  return { status: res.status, instance, state };
}

export async function testGHL(integration) {
  const config = JSON.parse(integration.config);
  // Backward compat: use privateToken, fallback to apiKey
  const token = config.privateToken || config.apiKey;

  if (!token) throw new Error('Token da Integração Privada não configurado');

  // Test by searching locations (v2 private integration — token is scoped to sub-account)
  const res = await fetch('https://services.leadconnectorhq.com/locations/search', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Version': '2021-07-28',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (res.status === 401) {
    throw new Error('Token inválido ou expirado. Verifique o token da Integração Privada.');
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Full Funnel API retornou ${res.status}: ${body}`);
  }

  const data = await res.json();
  // The locations/search endpoint returns an array of locations
  const locationName = data?.locations?.[0]?.name || data?.location?.name || 'OK';
  return { status: res.status, locationName };
}
