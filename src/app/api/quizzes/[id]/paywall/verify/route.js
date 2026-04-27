import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { checkRateLimit } from '@/lib/rateLimit';
import { handleApiError } from '@/lib/apiError';

const paramsSchema = z.object({
  id: z.string().min(1).max(255),
});

const querySchema = z.object({
  session_id: z.string().min(1, 'session_id e obrigatorio'),
});

/**
 * GET /api/quizzes/[id]/paywall/verify?session_id=cs_test_...
 * Verifies whether a Stripe Checkout session for a quiz paywall was paid.
 * No authentication required — called by public quiz visitors.
 */
export async function GET(request, { params }) {
  let quizId;
  try {
    const parsedParams = paramsSchema.safeParse(await params);
    if (!parsedParams.success) {
      return NextResponse.json(
        { error: 'Parametro invalido', details: parsedParams.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    quizId = parsedParams.data.id;

    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Stripe nao configurado.' },
        { status: 503 }
      );
    }

    // Rate limit: 20 verify requests per quiz per IP per minute
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const rl = await checkRateLimit(`paywall:verify:${quizId}:${ip}`, {
      max: 20,
      windowMs: 60_000,
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em instantes.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const { searchParams } = new URL(request.url);
    const parsedQuery = querySchema.safeParse({
      session_id: searchParams.get('session_id'),
    });
    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: 'Dados invalidos', details: parsedQuery.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { session_id: sessionId } = parsedQuery.data;

    // Verify quiz exists and paywall is enabled
    const quiz = await prisma.quiz.findFirst({
      where: {
        OR: [{ id: quizId }, { slug: quizId }],
        status: 'published',
      },
      select: {
        id: true,
        slug: true,
        name: true,
        paywallEnabled: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz nao encontrado' }, { status: 404 });
    }

    if (!quiz.paywallEnabled) {
      return NextResponse.json(
        { error: 'Paywall nao esta ativo para este quiz.' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    // Security: ensure the session belongs to this quiz
    if (session.metadata?.quizId !== quiz.id && session.metadata?.quizId !== quiz.slug) {
      return NextResponse.json(
        { error: 'Sessao invalida para este quiz.' },
        { status: 400 }
      );
    }

    const paid = session.status === 'complete' && session.payment_status === 'paid';

    return NextResponse.json({
      paid,
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_details?.email || null,
        created_at: session.created,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/quizzes/[id]/paywall/verify',
      method: 'GET',
      userId: null,
    });
  }
}
