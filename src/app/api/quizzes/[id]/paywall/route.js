import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/apiError';
import { checkRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

const paywallConfigSchema = z.object({
  paywallEnabled: z.boolean().optional(),
  paywallPrice: z.number().int().nonnegative().optional().nullable(),
  paywallType: z.enum(['one_time', 'subscription']).optional().nullable(),
  paywallStripePriceId: z.string().optional().nullable(),
  paywallTitle: z.string().max(255).optional().nullable(),
  paywallDescription: z.string().max(2000).optional().nullable(),
});

/**
 * GET /api/quizzes/[id]/paywall
 * Returns current paywall configuration for a quiz.
 */
export async function GET(request, { params }) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: quizId } = await params;

    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, userId: session.user.id },
      select: {
        id: true,
        paywallEnabled: true,
        paywallPrice: true,
        paywallType: true,
        paywallStripePriceId: true,
        paywallTitle: true,
        paywallDescription: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    return handleApiError(error, { route: '/api/quizzes/[id]/paywall', method: 'GET', userId: session?.user?.id });
  }
}

/**
 * PUT /api/quizzes/[id]/paywall
 * Set or update paywall configuration.
 */
export async function PUT(request, { params }) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: quizId } = await params;

    // Rate limit: 20 paywall config updates per user per minute
    const rl = await checkRateLimit(`paywall:update:${session.user.id}`, { max: 20, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em instantes.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const rawBody = await request.json();
    const parsed = paywallConfigSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, userId: session.user.id },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    const updateData = {};
    if ('paywallEnabled' in parsed.data) updateData.paywallEnabled = parsed.data.paywallEnabled;
    if ('paywallPrice' in parsed.data) updateData.paywallPrice = parsed.data.paywallPrice ?? null;
    if ('paywallType' in parsed.data) updateData.paywallType = parsed.data.paywallType ?? null;
    if ('paywallStripePriceId' in parsed.data) updateData.paywallStripePriceId = parsed.data.paywallStripePriceId ?? null;
    if ('paywallTitle' in parsed.data) updateData.paywallTitle = parsed.data.paywallTitle ?? null;
    if ('paywallDescription' in parsed.data) updateData.paywallDescription = parsed.data.paywallDescription ?? null;

    const updated = await prisma.quiz.update({
      where: { id: quizId },
      data: updateData,
      select: {
        id: true,
        paywallEnabled: true,
        paywallPrice: true,
        paywallType: true,
        paywallStripePriceId: true,
        paywallTitle: true,
        paywallDescription: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, { route: '/api/quizzes/[id]/paywall', method: 'PUT', userId: session?.user?.id });
  }
}

/**
 * DELETE /api/quizzes/[id]/paywall
 * Disables and clears paywall configuration.
 */
export async function DELETE(request, { params }) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: quizId } = await params;

    // Rate limit: 20 paywall config deletes per user per minute
    const rl = await checkRateLimit(`paywall:delete:${session.user.id}`, { max: 20, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em instantes.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, userId: session.user.id },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    const updated = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        paywallEnabled: false,
        paywallPrice: null,
        paywallType: null,
        paywallStripePriceId: null,
        paywallTitle: null,
        paywallDescription: null,
      },
      select: {
        id: true,
        paywallEnabled: true,
        paywallPrice: true,
        paywallType: true,
        paywallStripePriceId: true,
        paywallTitle: true,
        paywallDescription: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, { route: '/api/quizzes/[id]/paywall', method: 'DELETE', userId: session?.user?.id });
  }
}
