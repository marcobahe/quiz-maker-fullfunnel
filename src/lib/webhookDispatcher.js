import prisma from '@/lib/prisma';
import { sendHotLeadNotification, isHotLead } from '@/lib/emailNotifier';

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
        name: lead.name || null,
        email: lead.email || null,
        phone: lead.phone || null,
      },
      answers: answers || [],
      score: score || 0,
      result: result
        ? { title: result.title || result.label || resultCategory, range: `${result.min}-${result.max}` }
        : { title: resultCategory || null, range: null },
      timestamp: new Date().toISOString(),
    };

    const promises = integrations.map((integration) => {
      if (integration.type === 'webhook') {
        return sendWebhook(integration, payload);
      } else if (integration.type === 'gohighlevel') {
        return sendToGHL(integration, payload);
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

async function sendToGHL(integration, payload) {
  try {
    const config = JSON.parse(integration.config);
    // Backward compat: use privateToken, fallback to apiKey from old configs
    const token = config.privateToken || config.apiKey;
    const { pipelineId, stageId, tags, customFieldMappings } = config;

    if (!token) {
      console.error('[FullFunnel] Missing privateToken (or apiKey fallback)');
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

    const contactRes = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: ghlHeaders,
      body: JSON.stringify(contactBody),
      signal: AbortSignal.timeout(15000),
    });

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

      const oppRes = await fetch('https://services.leadconnectorhq.com/opportunities/', {
        method: 'POST',
        headers: ghlHeaders,
        body: JSON.stringify(oppBody),
        signal: AbortSignal.timeout(15000),
      });

      console.log(`[FullFunnel] Opportunity created: ${oppRes.status}`);
    }
  } catch (err) {
    console.error(`[FullFunnel] ${integration.name} failed:`, err.message);
  }
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
