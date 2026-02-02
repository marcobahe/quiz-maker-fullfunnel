import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { dispatchIntegrations } from '@/lib/webhookDispatcher';

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

    // Fire-and-forget: dispatch webhooks and integrations asynchronously
    const answers = body.answers || [];
    const scoreRanges = quiz.scoreRanges;
    dispatchIntegrations({
      quiz,
      lead,
      answers,
      score: body.score || 0,
      resultCategory: body.resultCategory || null,
      scoreRanges,
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Error saving lead:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
