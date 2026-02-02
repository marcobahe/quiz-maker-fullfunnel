import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUsageStats } from '@/lib/planLimits';
import { getPlan } from '@/lib/plans';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        plan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        planExpiresAt: true,
      },
    });

    const usage = await getUsageStats(session.user.id);
    const planDetails = getPlan(user.plan || 'free');

    return NextResponse.json({
      plan: user.plan || 'free',
      planName: planDetails.name,
      hasSubscription: !!user.stripeSubscriptionId,
      planExpiresAt: user.planExpiresAt,
      usage,
      limits: planDetails.limits,
    });
  } catch (error) {
    console.error('Billing status error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
