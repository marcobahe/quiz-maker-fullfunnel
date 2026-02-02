import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const { id: quizId } = await params;
    const body = await request.json();

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    const userAgent = request.headers.get('user-agent') || '';

    const event = await prisma.analyticsEvent.create({
      data: {
        quizId,
        event: body.event,
        questionId: body.questionId || null,
        data: body.data ? JSON.stringify(body.data) : '{}',
        ip,
        userAgent,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error saving analytics:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
