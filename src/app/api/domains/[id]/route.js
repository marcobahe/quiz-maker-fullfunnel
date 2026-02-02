import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT /api/domains/[id] — update domain (e.g., associate quiz)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const existing = await prisma.customDomain.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Domínio não encontrado' }, { status: 404 });
    }

    const updateData = {};

    if (body.quizId !== undefined) {
      if (body.quizId) {
        // Verify quiz ownership
        const quiz = await prisma.quiz.findFirst({
          where: { id: body.quizId, userId: session.user.id },
        });
        if (!quiz) {
          return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
        }
        updateData.quizId = body.quizId;
      } else {
        updateData.quizId = null;
      }
    }

    const updated = await prisma.customDomain.update({
      where: { id },
      data: updateData,
      include: {
        quiz: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating domain:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE /api/domains/[id] — remove domain
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.customDomain.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Domínio não encontrado' }, { status: 404 });
    }

    await prisma.customDomain.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting domain:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
