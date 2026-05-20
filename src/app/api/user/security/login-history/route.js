import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/apiError';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

/**
 * GET /api/user/security/login-history
 *
 * Returns the authenticated user's login attempt history (most recent first).
 *
 * Query params:
 *   limit  — number of records per page (1–100, default 20)
 *   cursor — createdAt ISO string for cursor-based pagination (exclusive upper bound)
 */
export async function GET(request) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Deny access while MFA verification is still pending
    if (session.user.mfaPending) {
      return NextResponse.json({ error: 'MFA verification required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const rawLimit = parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10);
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), MAX_LIMIT) : DEFAULT_LIMIT;
    const cursor = searchParams.get('cursor');

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const where = {
      OR: [
        { userId: session.user.id },
        { email: user.email },
      ],
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
    };

    const attempts = await prisma.loginAttempt.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // fetch one extra to determine if there is a next page
      select: {
        id:         true,
        success:    true,
        authMethod: true,
        failReason: true,
        ipAddress:  true,
        userAgent:  true,
        createdAt:  true,
      },
    });

    const hasNextPage = attempts.length > limit;
    const items = hasNextPage ? attempts.slice(0, limit) : attempts;
    const nextCursor = hasNextPage ? items[items.length - 1].createdAt.toISOString() : null;

    return NextResponse.json({ items, nextCursor, limit });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/user/security/login-history',
      method: 'GET',
      userId: session?.user?.id,
    });
  }
}
