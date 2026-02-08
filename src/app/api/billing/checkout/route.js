import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { PLANS } from '@/lib/plans';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Stripe não configurado. Configure STRIPE_SECRET_KEY nas variáveis de ambiente.' },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    const { plan, annual } = await request.json();

    if (!plan || !PLANS[plan]) {
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
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Erro ao criar sessão de checkout' }, { status: 500 });
  }
}
