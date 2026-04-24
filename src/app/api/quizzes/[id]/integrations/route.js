import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/apiError';

// GET /api/quizzes/[id]/integrations — list integrations for a quiz
export async function GET(request, { params }) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: quizId } = await params;

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

    const integrations = await prisma.integration.findMany({
      where: { quizId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(integrations);
  } catch (error) {
    return handleApiError(error, { route: '/api/quizzes/[id]/integrations', method: 'GET', userId: session?.user?.id });
  }
}

// POST /api/quizzes/[id]/integrations — create a new integration
export async function POST(request, { params }) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: quizId } = await params;

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

    const body = await request.json();
    const { type, name, config, active } = body;

    if (!type || !config) {
      return NextResponse.json({ error: 'Campos type e config são obrigatórios' }, { status: 400 });
    }

    const integration = await prisma.integration.create({
      data: {
        quizId,
        type,
        name: name || '',
        config: typeof config === 'string' ? config : JSON.stringify(config),
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json(integration, { status: 201 });
  } catch (error) {
    return handleApiError(error, { route: '/api/quizzes/[id]/integrations', method: 'POST', userId: session?.user?.id });
  }
}
