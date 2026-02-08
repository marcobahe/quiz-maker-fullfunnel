import { NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { syncContactToGHL, getPlanFromPriceId } from '@/lib/ghl-sync';

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
      // ─── NEW SUBSCRIPTION ────────────────────────────────────────
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

        // GHL Sync: new subscriber
        const customerEmail = session.customer_details?.email || session.customer_email;
        const customerName = session.customer_details?.name;

        if (customerEmail && plan && plan !== 'free') {
          await syncContactToGHL({
            email: customerEmail,
            name: customerName,
            tags: [
              'quizmebaby-cliente',
              `plano-${plan}`,
              'assinante-ativo',
            ],
            customFields: {
              qmb_plano: plan,
              qmb_status: 'ativo',
              qmb_data_inicio: new Date().toISOString(),
              qmb_stripe_customer_id: session.customer || '',
            },
          });
        }
        break;
      }

      // ─── SUBSCRIPTION UPDATED (upgrade/downgrade/renewal) ────────
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          // Determine plan from price ID
          const priceId = subscription.items?.data?.[0]?.price?.id;
          const plan = getPlanFromPriceId(priceId);

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

          // GHL Sync: update plan tags
          if (user.email) {
            await syncContactToGHL({
              email: user.email,
              name: user.name,
              tags: [
                'quizmebaby-cliente',
                `plano-${plan}`,
                'assinante-ativo',
              ],
              removeTags: [
                'plano-*', // Remove old plan tag (will be replaced by new one above)
              ],
              customFields: {
                qmb_plano: plan,
                qmb_status: 'ativo',
              },
            });
          }
        }
        break;
      }

      // ─── SUBSCRIPTION CANCELLED ──────────────────────────────────
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

          // GHL Sync: mark as cancelled
          if (user.email) {
            await syncContactToGHL({
              email: user.email,
              name: user.name,
              tags: [
                'cancelado',
                'ex-assinante',
              ],
              removeTags: [
                'assinante-ativo',
                'plano-*',
              ],
              customFields: {
                qmb_plano: 'free',
                qmb_status: 'cancelado',
                qmb_data_cancelamento: new Date().toISOString(),
              },
            });
          }
        }
        break;
      }

      // ─── PAYMENT FAILED ──────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user?.email) {
          await syncContactToGHL({
            email: user.email,
            name: user.name,
            tags: [
              'pagamento-falhou',
            ],
            removeTags: [
              'assinante-ativo',
            ],
            customFields: {
              qmb_status: 'pagamento-falhou',
            },
          });
        }
        break;
      }

      // ─── PAYMENT SUCCEEDED ───────────────────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user?.email) {
          // Determine current plan from subscription
          let plan = user.plan || 'pro';

          await syncContactToGHL({
            email: user.email,
            name: user.name,
            tags: [
              'assinante-ativo',
            ],
            removeTags: [
              'pagamento-falhou',
            ],
            customFields: {
              qmb_status: 'ativo',
              qmb_plano: plan,
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
