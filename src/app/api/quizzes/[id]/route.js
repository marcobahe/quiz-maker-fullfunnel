import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Math.random().toString(36).substring(2, 8);
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const quiz = await prisma.quiz.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { leads: true },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const existing = await prisma.quiz.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.canvasData !== undefined) updateData.canvasData = body.canvasData;
    if (body.settings !== undefined) updateData.settings = typeof body.settings === 'string' ? body.settings : JSON.stringify(body.settings);
    if (body.scoreRanges !== undefined) updateData.scoreRanges = typeof body.scoreRanges === 'string' ? body.scoreRanges : JSON.stringify(body.scoreRanges);
    
    if (body.status === 'published' && existing.status !== 'published') {
      updateData.status = 'published';
      // Generate a new slug if publishing for the first time
      if (body.name) {
        updateData.slug = generateSlug(body.name);
      }
    } else if (body.status !== undefined) {
      updateData.status = body.status;
    }

    const quiz = await prisma.quiz.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.quiz.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    // Delete related data first
    await prisma.analyticsEvent.deleteMany({ where: { quizId: id } });
    await prisma.lead.deleteMany({ where: { quizId: id } });
    await prisma.integration.deleteMany({ where: { quizId: id } });
    await prisma.quiz.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
