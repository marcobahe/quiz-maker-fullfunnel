import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/apiError';
import { checkRateLimit } from '@/lib/rateLimit';
import { impersonateSchema } from '@/lib/schemas/admin.schema';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const error = requireAdmin(session);
    if (error) return error;

    // Rate limit: 20 impersonate attempts per admin per minute
    const rl = checkRateLimit(`admin:impersonate:${session.user.id}`, { max: 20, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em instantes.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const rawBody = await request.json();
    const parsed = impersonateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { userId } = parsed.data;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Can't impersonate yourself
    const realUserId = session.user.originalUserId || session.user.id;
    if (targetUser.id === realUserId) {
      return NextResponse.json({ error: 'Não pode impersonar a si mesmo' }, { status: 400 });
    }

    // Return the data needed to update the session client-side
    return NextResponse.json({
      success: true,
      impersonatingAs: targetUser.id,
      impersonatingName: targetUser.name || targetUser.email,
      originalUserId: realUserId,
      originalRole: session.user.role,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/admin/impersonate', method: 'POST', userId: null });
  }
}
