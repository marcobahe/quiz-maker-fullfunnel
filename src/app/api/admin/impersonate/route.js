import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const error = requireAdmin(session);
    if (error) return error;

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

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
    console.error('Impersonate error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
