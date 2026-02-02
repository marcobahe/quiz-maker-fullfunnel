import prisma from '@/lib/prisma';

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
    const { apiKey, locationId, pipelineId, stageId, tags, customFieldMappings } = config;

    if (!apiKey || !locationId) {
      console.error('[FullFunnel] Missing apiKey or locationId');
      return;
    }

    // 1. Create/update contact
    const contactBody = {
      firstName: payload.lead.name?.split(' ')[0] || '',
      lastName: payload.lead.name?.split(' ').slice(1).join(' ') || '',
      email: payload.lead.email || undefined,
      phone: payload.lead.phone || undefined,
      locationId,
      tags: tags || ['quiz-lead'],
      source: `Quiz: ${payload.quiz.name}`,
    };

    // Build custom fields from mappings + answers
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
          contactBody.customFields.push({ id: cleanFieldId, value });
        }
      }
    }

    const contactRes = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28',
      },
      body: JSON.stringify(contactBody),
      signal: AbortSignal.timeout(15000),
    });

    const contactData = await contactRes.json();
    console.log(`[FullFunnel] Contact created/updated: ${contactRes.status}`, contactData?.contact?.id || '');

    // 2. Create opportunity if pipeline configured
    if (pipelineId && contactData?.contact?.id) {
      const oppBody = {
        pipelineId,
        locationId,
        name: `Quiz Lead: ${payload.lead.name || payload.lead.email || 'Unknown'}`,
        stageId: stageId || undefined,
        contactId: contactData.contact.id,
        status: 'open',
        source: `Quiz: ${payload.quiz.name}`,
      };

      const oppRes = await fetch('https://services.leadconnectorhq.com/opportunities/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28',
        },
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
  const { apiKey, locationId } = config;

  if (!apiKey) throw new Error('API Key não configurada');
  if (!locationId) throw new Error('Location ID não configurado');

  // Test by fetching location info
  const res = await fetch(`https://services.leadconnectorhq.com/locations/${locationId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Version': '2021-07-28',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Full Funnel API retornou ${res.status}: ${body}`);
  }

  const data = await res.json();
  return { status: res.status, locationName: data?.location?.name || 'OK' };
}
