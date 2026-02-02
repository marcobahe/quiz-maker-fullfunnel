import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

async function checkAccess(workspaceId, userId, minRole = 'viewer') {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!member) return null;
  
  const roleHierarchy = { owner: 4, admin: 3, editor: 2, viewer: 1 };
  if ((roleHierarchy[member.role] || 0) < (roleHierarchy[minRole] || 0)) return null;
  
  return member;
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = params;
    const access = await checkAccess(id, session.user.id);
    if (!access) {
      return NextResponse.json({ error: 'Sem acesso' }, { status: 403 });
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
