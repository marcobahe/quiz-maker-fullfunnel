import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/apiError';

// PUT /api/quizzes/[id]/integrations/[integrationId] — update
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: quizId, integrationId } = await params;

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

    const existing = await prisma.integration.findFirst({
      where: { id: integrationId, quizId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Integração não encontrada' }, { status: 404 });
    }

    const data = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.config !== undefined) data.config = typeof body.config === 'string' ? body.config : JSON.stringify(body.config);
    if (body.active !== undefined) data.active = body.active;
    if (body.type !== undefined) data.type = body.type;

    const updated = await prisma.integration.update({
      where: { id: integrationId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, { route: '/api/quizzes/[id]/integrations/[integrationId]', method: 'PUT', userId: session?.user?.id });
  }
}

// DELETE /api/quizzes/[id]/integrations/[integrationId] — delete
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: quizId, integrationId } = await params;

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

    const existing = await prisma.integration.findFirst({
      where: { id: integrationId, quizId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Integração não encontrada' }, { status: 404 });
    }

    await prisma.integration.delete({ where: { id: integrationId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, { route: '/api/quizzes/[id]/integrations/[integrationId]', method: 'DELETE', userId: session?.user?.id });
  }
}
