import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { dispatchIntegrations } from '@/lib/webhookDispatcher';
import { dispatchQuizWebhook } from '@/lib/quizWebhookDispatcher';
import { checkLimit } from '@/lib/planLimits';
import { checkRateLimit } from '@/lib/rateLimit';
import { handleApiError } from '@/lib/apiError';
import { createLeadSchema } from '@/lib/schemas/lead.schema';

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
    return handleApiError(error, { route: '/api/quizzes/[id]/leads', method: 'GET', userId: session?.user?.id });
  }
}

export async function POST(request, { params }) {
  try {
    const { id: quizId } = await params;

    // Rate limit: 5 lead submissions per IP per quiz per minute
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const rl = checkRateLimit(`lead:${quizId}:${ip}`, { max: 5, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em instantes.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rl.retryAfter) },
        }
      );
    }

    const rawBody = await request.json();
    const parsed = createLeadSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const body = parsed.data;

    // Verify quiz exists (include webhook fields for dispatcher)
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

    // Geolocation via Vercel headers (free, no API key needed)
    const country = request.headers.get('x-vercel-ip-country') || null;
    const region = request.headers.get('x-vercel-ip-country-region') || null;
    const city = request.headers.get('x-vercel-ip-city') ? decodeURIComponent(request.headers.get('x-vercel-ip-city')) : null;

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
        country,
        region,
        city,
        attribution: body.attribution || null,
      },
    });

    // Fire-and-forget: dispatch integrations and outbound webhook asynchronously
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
    dispatchQuizWebhook({
      quiz,
      lead,
      answers,
      score: body.score || 0,
      resultCategory: body.resultCategory || null,
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    return handleApiError(error, { route: '/api/quizzes/[id]/leads', method: 'POST', userId: null });
  }
}
