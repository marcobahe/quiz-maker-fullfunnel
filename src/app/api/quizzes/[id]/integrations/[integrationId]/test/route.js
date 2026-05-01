import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/getClientIp';
import { testWebhook, testGHL } from '@/lib/webhookDispatcher';
import { handleApiError } from '@/lib/apiError';

// POST /api/quizzes/[id]/integrations/[integrationId]/test — test an integration
export async function POST(request, { params }) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: quizId, integrationId } = await params;

    // Rate limit: 5 tests per IP per minute
    const ip =
      getClientIp(request);
    const rl = await checkRateLimit(`integration-test:${ip}`, { max: 5, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em instantes.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rl.retryAfter) },
        }
      );
    }

    // Verify ownership
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { userId: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    if (quiz.userId !== session.user.id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

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
