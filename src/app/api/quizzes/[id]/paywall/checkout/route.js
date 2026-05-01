import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { getQuizPlayerUrl } from '@/lib/urls';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/getClientIp';
import { handleApiError } from '@/lib/apiError';

const paramsSchema = z.object({
  id: z.string().min(1).max(255),
});

/**
 * POST /api/quizzes/[id]/paywall/checkout
 * Creates a Stripe Checkout session for a quiz paywall purchase.
 * No authentication required — called by public quiz visitors.
 */
export async function POST(request, { params }) {
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

    // Rate limit: 5 checkout attempts per quiz per IP per minute
    const ip = getClientIp(request);
    const rl = await checkRateLimit(`paywall:checkout:${quizId}:${ip}`, {
      max: 5,
      windowMs: 60_000,
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em instantes.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

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
        paywallStripePriceId: true,
        paywallType: true,
        paywallTitle: true,
        paywallDescription: true,
        userId: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz nao encontrado' }, { status: 404 });
    }

    if (!quiz.paywallEnabled) {
      return NextResponse.json({ error: 'Paywall nao esta ativo para este quiz.' }, { status: 400 });
    }

    if (!quiz.paywallStripePriceId) {
      return NextResponse.json(
        { error: 'Preco do paywall nao configurado.' },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    const successUrl = getQuizPlayerUrl(quiz.slug || quiz.id, {
      paywall_success: 'true',
      session_id: '{CHECKOUT_SESSION_ID}',
    });
    const cancelUrl = getQuizPlayerUrl(quiz.slug || quiz.id, {
      paywall_canceled: 'true',
    });

    // Quiz paywall uses one-time payment mode (content access, not SaaS subscription)
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: quiz.paywallStripePriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        quizId: quiz.id,
        quizUserId: quiz.userId,
        type: 'quiz_paywall',
      },
      billing_address_collection: 'auto',
      customer_creation: 'always',
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/quizzes/[id]/paywall/checkout',
      method: 'POST',
      userId: null,
    });
  }
}
