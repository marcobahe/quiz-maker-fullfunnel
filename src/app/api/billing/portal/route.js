import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import prisma from '@/lib/prisma';

export async function POST() {
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
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura encontrada.' },
        { status: 400 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/settings/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json({ error: 'Erro ao criar sessão do portal' }, { status: 500 });
  }
}
