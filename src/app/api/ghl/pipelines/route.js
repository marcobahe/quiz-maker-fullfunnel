import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/apiError';

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';

/**
 * POST /api/ghl/pipelines
 * Body: { token: string }
 * Returns: { pipelines: Array<{ id, name, stages: Array<{ id, name }> }> }
 *
 * Proxies to GHL to list pipelines for the sub-account associated with the private token.
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return NextResponse.json({ error: 'Token obrigatório' }, { status: 400 });
    }

    const ghlHeaders = {
      'Authorization': `Bearer ${token.trim()}`,
      'Version': GHL_VERSION,
    };

    // Step 1: resolve locationId from the private token
    const locRes = await fetch(`${GHL_BASE}/locations/search`, {
      method: 'GET',
      headers: ghlHeaders,
      signal: AbortSignal.timeout(10000),
    });

    if (locRes.status === 401) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado. Verifique o token da Integração Privada.' },
        { status: 401 }
      );
    }

    if (!locRes.ok) {
      const text = await locRes.text();
      return NextResponse.json(
        { error: `Full Funnel retornou ${locRes.status} ao buscar location: ${text}` },
        { status: 502 }
      );
    }

    const locData = await locRes.json();
    const locationId = locData?.locations?.[0]?.id;

    if (!locationId) {
      return NextResponse.json(
        { error: 'Não foi possível identificar o locationId da conta Full Funnel.' },
        { status: 502 }
      );
    }

    // Step 2: fetch pipelines for this location
    const pipeRes = await fetch(
      `${GHL_BASE}/opportunities/pipelines?locationId=${encodeURIComponent(locationId)}`,
      {
        method: 'GET',
        headers: ghlHeaders,
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!pipeRes.ok) {
      const text = await pipeRes.text();
      return NextResponse.json(
        { error: `Full Funnel retornou ${pipeRes.status} ao buscar pipelines: ${text}` },
        { status: 502 }
      );
    }

    const pipeData = await pipeRes.json();
    const pipelines = (pipeData?.pipelines ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      stages: (p.stages ?? [])
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((s) => ({ id: s.id, name: s.name })),
    }));

    return NextResponse.json({ pipelines, locationId });
  } catch (error) {
    return handleApiError(error, { route: '/api/ghl/pipelines', method: 'POST', userId: null });
  }
}
