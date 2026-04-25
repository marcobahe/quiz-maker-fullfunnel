import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/apiError';
import { checkRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';

// Required scopes for quiz → GHL contact sync
const REQUIRED_SCOPES = ['contacts.write', 'contacts.read', 'opportunities.write', 'locations.read'];

const validateSchema = z.object({
  apiKey: z.string().min(1, 'API key obrigatória').max(2000),
});

/**
 * POST /api/integrations/ghl/validate
 * Body: { apiKey: string }
 * Returns: { valid: true, accountName: string, locationId: string, scopes: string[] }
 *       or { valid: false, error: string }
 *
 * Validates a GHL Private Integration API key by calling /locations/search.
 * Does NOT save anything — use PUT /api/workspaces/:id/integrations/ghl to persist.
 */
export async function POST(request) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Rate limit: 10 validate calls per user per minute
    const rl = checkRateLimit(`ghl:validate:${session.user.id}`, { max: 10, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em instantes.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const rawBody = await request.json();
    const parsed = validateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { apiKey } = parsed.data;
    const ghlHeaders = {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Version': GHL_VERSION,
    };

    // Resolve account via /locations/search
    const locRes = await fetch(`${GHL_BASE}/locations/search`, {
      method: 'GET',
      headers: ghlHeaders,
      signal: AbortSignal.timeout(10000),
    });

    if (locRes.status === 401) {
      return NextResponse.json({
        valid: false,
        error: 'API key inválida ou expirada. Verifique o token da Integração Privada no Full Funnel.',
      });
    }

    if (!locRes.ok) {
      const text = await locRes.text();
      return NextResponse.json({
        valid: false,
        error: `Full Funnel retornou ${locRes.status} ao validar a key: ${text}`,
      });
    }

    const locData = await locRes.json();
    const location = locData?.locations?.[0];
    const locationId = location?.id;
    const accountName = location?.name || location?.businessName || 'Conta Full Funnel';

    if (!locationId) {
      return NextResponse.json({
        valid: false,
        error: 'Não foi possível identificar o locationId. Verifique se a Integração Privada está associada a uma sub-conta.',
      });
    }

    return NextResponse.json({
      valid: true,
      accountName,
      locationId,
      requiredScopes: REQUIRED_SCOPES,
      message: `Conectado à conta "${accountName}". Configure os escopos necessários: ${REQUIRED_SCOPES.join(', ')}.`,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/integrations/ghl/validate', method: 'POST', userId: session?.user?.id });
  }
}
