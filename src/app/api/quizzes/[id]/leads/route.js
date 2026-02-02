import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const { id: quizId } = await params;
    const body = await request.json();

    // Verify quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    const lead = await prisma.lead.create({
      data: {
        quizId,
        name: body.name || null,
        email: body.email || null,
        phone: body.phone || null,
        answers: body.answers ? JSON.stringify(body.answers) : null,
        score: body.score || 0,
        resultCategory: body.resultCategory || null,
        metadata: body.metadata ? JSON.stringify(body.metadata) : '{}',
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Error saving lead:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
