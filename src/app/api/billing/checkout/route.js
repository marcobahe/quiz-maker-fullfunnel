import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { PLANS } from '@/lib/plans';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/apiError';
import { checkRateLimit } from '@/lib/rateLimit';
import { checkoutSchema } from '@/lib/schemas/billing.schema';

export async function POST(request) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Stripe não configurado. Configure STRIPE_SECRET_KEY nas variáveis de ambiente.' },
        { status: 503 }
      );
    }

    // Rate limit: 10 checkouts per user per minute
    const rl = checkRateLimit(`billing:checkout:${session.user.id}`, { max: 10, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em instantes.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const stripe = getStripe();
    const rawBody = await request.json();
    const parsed = checkoutSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { plan, annual } = parsed.data;

    if (!PLANS[plan]) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    // Get price IDs from env (not stored in plans.js to avoid client-side env exposure)
    const PRICE_IDS = {
      pro: { monthly: process.env.STRIPE_PRO_PRICE_ID, annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID },
      business: { monthly: process.env.STRIPE_BUSINESS_PRICE_ID, annual: process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID },
      advanced: { monthly: process.env.STRIPE_ADVANCED_PRICE_ID, annual: process.env.STRIPE_ADVANCED_ANNUAL_PRICE_ID },
      enterprise: { monthly: process.env.STRIPE_ENTERPRISE_PRICE_ID, annual: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID },
    };

    const planPrices = PRICE_IDS[plan];
    const priceId = planPrices ? (annual ? planPrices.annual : planPrices.monthly) : null;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID não configurado para este plano. Configure no .env.' },
        { status: 503 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    // Create or reuse Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/settings/billing?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        plan,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    return handleApiError(error, { route: '/api/billing/checkout', method: 'POST', userId: session?.user?.id });
  }
}
