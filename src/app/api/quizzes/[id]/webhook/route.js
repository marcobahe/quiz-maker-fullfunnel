import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/apiError';

/**
 * POST /api/quizzes/[id]/webhook/test — test the quiz's native webhook URL
 * by sending a sample payload.
 */
export async function POST(request, { params }) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const quiz = await prisma.quiz.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    if (!quiz.webhookUrl) {
      return NextResponse.json({ error: 'Webhook URL não configurado' }, { status: 400 });
    }

    const start = Date.now();

    const testPayload = {
      event: 'test',
      quiz: { id: quiz.id, name: quiz.name || 'Quiz de Teste', slug: quiz.slug || 'quiz-teste' },
      lead: { name: 'Lead Teste', email: 'teste@exemplo.com', phone: '+5511999999999' },
      answers: [
        { questionId: 'q1', question: 'Pergunta 1', answer: 'Resposta A', points: 10 },
      ],
      score: 75,
      result: { title: 'Perfil Exemplo', range: '61-100' },
      timestamp: new Date().toISOString(),
    };

    const headers = { 'Content-Type': 'application/json' };
    if (quiz.webhookSecret) {
      headers['X-Webhook-Secret'] = quiz.webhookSecret;
    }

    const res = await fetch(quiz.webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(testPayload),
      signal: AbortSignal.timeout(15000),
    });

    const responseTimeMs = Date.now() - start;

    // Persist log
    try {
      await prisma.webhookLog.create({
        data: {
          quizId: id,
          attempt: 1,
          status: res.ok ? 'success' : 'failed',
          statusCode: res.status,
          responseTimeMs,
          lastError: res.ok ? null : `HTTP ${res.status} ${res.statusText}`,
        },
      });
    } catch (logErr) {
      console.error('[webhook/test] Failed to persist log:', logErr);
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `Webhook retornou HTTP ${res.status} ${res.statusText}`, status: res.status, responseTimeMs },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, status: res.status, responseTimeMs });
  } catch (error) {
    return handleApiError(error, { route: '/api/quizzes/[id]/webhook/test', method: 'POST', userId: session?.user?.id });
  }
}
