import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkWorkspaceAccess } from '@/lib/admin';

// Update member role
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id, memberId } = params;
    const access = await checkWorkspaceAccess(id, session.user.id, 'admin', session);
    if (!access) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const { role } = await request.json();
    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Role inválido' }, { status: 400 });
    }

    // Can't change owner's role
    const target = await prisma.workspaceMember.findUnique({ where: { id: memberId } });
    if (!target || target.workspaceId !== id) {
      return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 });
    }
    if (target.role === 'owner') {
      return NextResponse.json({ error: 'Não é possível alterar o role do dono' }, { status: 400 });
    }

    const updated = await prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// Remove member
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id, memberId } = params;
    const access = await checkWorkspaceAccess(id, session.user.id, 'admin', session);
    if (!access) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const target = await prisma.workspaceMember.findUnique({ where: { id: memberId } });
    if (!target || target.workspaceId !== id) {
      return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 });
    }
    if (target.role === 'owner') {
      return NextResponse.json({ error: 'Não é possível remover o dono' }, { status: 400 });
    }

    await prisma.workspaceMember.delete({ where: { id: memberId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
