import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/apiError';

export async function GET() {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingDone: true },
    });

    return NextResponse.json({ onboardingDone: user?.onboardingDone || false });
  } catch (error) {
    return handleApiError(error, { route: '/api/user/onboarding', method: 'GET', userId: session?.user?.id });
  }
}

export async function POST() {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingDone: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, { route: '/api/user/onboarding', method: 'POST', userId: session?.user?.id });
  }
}
