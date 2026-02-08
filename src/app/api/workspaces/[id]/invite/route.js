import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkWorkspaceAccess } from '@/lib/admin';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = params;
    const access = await checkWorkspaceAccess(id, session.user.id, 'admin', session);
    if (!access) {
      return NextResponse.json({ error: 'Sem permissão para convidar' }, { status: 403 });
    }

    const { email, role } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }
    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Role inválido' }, { status: 400 });
    }

    // Find user by email
    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado. O usuário precisa ter uma conta no QuizMeBaby.' },
        { status: 404 }
      );
    }

    // Check if already a member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: id, userId: targetUser.id } },
    });
    if (existingMember) {
      return NextResponse.json({ error: 'Usuário já é membro deste workspace' }, { status: 409 });
    }

    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId: id,
        userId: targetUser.id,
        role,
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error inviting member:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
