import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkWorkspaceAccess } from '@/lib/admin';
import { handleApiError } from '@/lib/apiError';
import { checkRateLimit } from '@/lib/rateLimit';
import { inviteSchema } from '@/lib/schemas/workspaces.schema';

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

    // Rate limit: 10 invites per user per minute
    const rl = checkRateLimit(`workspaces:invite:${session.user.id}`, { max: 10, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em instantes.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const rawBody = await request.json();
    const parsed = inviteSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, role } = parsed.data;

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
    return handleApiError(error, { route: '/api/workspaces/[id]/invite', method: 'POST', userId: session?.user?.id });
  }
}
