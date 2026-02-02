import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/quizzes/[id]/integrations — list integrations for a quiz
export async function GET(request, { params }) {
  try {
    const { id: quizId } = await params;

    const integrations = await prisma.integration.findMany({
      where: { quizId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(integrations);
  } catch (error) {
    console.error('Error listing integrations:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST /api/quizzes/[id]/integrations — create a new integration
export async function POST(request, { params }) {
  try {
    const { id: quizId } = await params;
    const body = await request.json();

    // Verify quiz exists
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

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
    console.error('Error creating integration:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
