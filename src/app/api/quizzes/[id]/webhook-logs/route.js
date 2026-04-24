import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/apiError';

// GET /api/quizzes/[id]/webhook-logs — list last 10 webhook dispatches for a quiz
export async function GET(request, { params }) {
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

    const logs = await prisma.webhookLog.findMany({
      where: { quizId: id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json(logs);
  } catch (error) {
    return handleApiError(error, { route: '/api/quizzes/[id]/webhook-logs', method: 'GET', userId: session?.user?.id });
  }
}
