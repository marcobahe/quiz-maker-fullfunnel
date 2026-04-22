import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { testWebhook, testGHL } from '@/lib/webhookDispatcher';
import { handleApiError } from '@/lib/apiError';

// POST /api/quizzes/[id]/integrations/[integrationId]/test — test an integration
export async function POST(request, { params }) {
  try {
    const { id: quizId, integrationId } = await params;

    const integration = await prisma.integration.findFirst({
      where: { id: integrationId, quizId },
    });

    if (!integration) {
      return NextResponse.json({ error: 'Integração não encontrada' }, { status: 404 });
    }

    let result;

    if (integration.type === 'webhook') {
      result = await testWebhook(integration);
    } else if (integration.type === 'gohighlevel') {
      result = await testGHL(integration);
    } else {
      return NextResponse.json({ error: 'Tipo de integração não suportado' }, { status: 400 });
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return handleApiError(error, { route: '/api/quizzes/[id]/integrations/[integrationId]/test', method: 'POST', userId: null });
  }
}
