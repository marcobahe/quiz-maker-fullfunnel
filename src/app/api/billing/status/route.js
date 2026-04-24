import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUsageStats } from '@/lib/planLimits';
import { getPlan } from '@/lib/plans';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

export async function GET() {
  let session;
  try {
    session = await getServerSession(authOptions);
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
    return handleApiError(error, { route: '/api/billing/status', method: 'GET', userId: session?.user?.id });
  }
}
