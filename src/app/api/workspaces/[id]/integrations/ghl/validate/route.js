import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/apiError';
import { checkRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';

const REQUIRED_SCOPES = ['contacts.write', 'contacts.readonly', 'locations.readonly', 'opportunities.write'];

const validateSchema = z.object({
  token: z.string().min(1, 'Token obrigatório').max(2000),
});

/**
 * POST /api/workspaces/:id/integrations/ghl/validate
 * Body: { token: string }
 * Returns: { valid: true, accountName, locationId, scopes, message }
 *       or { valid: false, error: string }
 *
 * Workspace-scoped: caller must be a member (any role) of the workspace.
 * Does NOT save anything — use PUT /api/workspaces/:id/integrations/ghl to persist.
 */
export async function POST(request, { params }) {
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

    const { id: workspaceId } = await params;

    // Verify caller is a workspace member
    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership) {
      return NextResponse.json({ error: 'Workspace não encontrado ou sem permissão.' }, { status: 404 });
    }

    const rawBody = await request.json();
    const parsed = validateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { token } = parsed.data;
    const ghlHeaders = {
      'Authorization': `Bearer ${token.trim()}`,
      'Version': GHL_VERSION,
    };

    const locRes = await fetch(`${GHL_BASE}/locations/search`, {
      method: 'GET',
      headers: ghlHeaders,
      signal: AbortSignal.timeout(10000),
    });

    if (locRes.status === 401) {
      return NextResponse.json({
        valid: false,
        error: 'Token inválido ou expirado. Verifique o token da Integração Privada no Full Funnel.',
      });
    }

    if (!locRes.ok) {
      const text = await locRes.text();
      return NextResponse.json({
        valid: false,
        error: `Full Funnel retornou ${locRes.status} ao validar o token: ${text}`,
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
      scopes: REQUIRED_SCOPES,
      message: `Conectado à conta "${accountName}". Configure os escopos necessários no Full Funnel.`,
    });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/workspaces/[id]/integrations/ghl/validate',
      method: 'POST',
      userId: session?.user?.id,
    });
  }
}
