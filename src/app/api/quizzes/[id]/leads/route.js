import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { dispatchIntegrations } from '@/lib/webhookDispatcher';
import { checkLimit } from '@/lib/planLimits';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: quizId } = await params;

    // Verify ownership
    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, userId: session.user.id },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10')));
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    const where = { quizId };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

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

    // Check lead limits for the quiz owner
    const limitCheck = await checkLimit(quiz.userId, 'leadsPerMonth');
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: 'Limite de leads mensal atingido para este quiz.', limitReached: true },
        { status: 403 }
      );
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
