import { NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import prisma from '@/lib/prisma';

export async function POST(request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe não configurado' }, { status: 503 });
  }

  const stripe = getStripe();
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      // In development without webhook secret, parse directly
      event = JSON.parse(body);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (userId && plan) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan,
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          // Determine plan from price ID
          let plan = 'free';
          const priceId = subscription.items?.data?.[0]?.price?.id;

          if (priceId === process.env.STRIPE_PRO_PRICE_ID || priceId === process.env.STRIPE_PRO_ANNUAL_PRICE_ID) {
            plan = 'pro';
          } else if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID || priceId === process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID) {
            plan = 'business';
          }

          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan,
              stripeSubscriptionId: subscription.id,
              planExpiresAt: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000)
                : null,
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: 'free',
              stripeSubscriptionId: null,
              planExpiresAt: null,
            },
          });
        }
        break;
      }

      default:
        // Unhandled event type
        break;
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
