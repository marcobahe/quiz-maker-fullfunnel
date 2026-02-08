import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireOwner } from '@/lib/admin';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const error = requireOwner(session);
    if (error) return error;

    const { id } = params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (user.role === 'owner') {
      return NextResponse.json({ error: 'Usuário já é owner' }, { status: 400 });
    }

    if (user.role === 'admin') {
      return NextResponse.json({ error: 'Usuário já é admin' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role: 'admin' },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Make admin error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
