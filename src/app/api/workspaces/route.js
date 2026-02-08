import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ensurePersonalWorkspace, getUserWorkspaces } from '@/lib/workspace';
import { isAdmin } from '@/lib/admin';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Ensure personal workspace exists (on-demand for existing users)
    await ensurePersonalWorkspace(session.user.id);

    const workspaces = await getUserWorkspaces(session.user.id);

    // If SaaS admin is requesting a specific workspace they're not a member of,
    // include it in the results so the sidebar can display it
    const { searchParams } = new URL(request.url);
    const includeWsId = searchParams.get('include');

    if (includeWsId && isAdmin(session)) {
      const alreadyIncluded = workspaces.some(w => w.id === includeWsId);
      if (!alreadyIncluded) {
        const extraWs = await prisma.workspace.findUnique({
          where: { id: includeWsId },
          include: {
            owner: { select: { id: true, name: true, email: true } },
            _count: { select: { members: true, quizzes: true } },
          },
        });
        if (extraWs) {
          workspaces.push({
            ...extraWs,
            role: 'admin', // SaaS admin viewing
            _adminAccess: true, // Flag for UI
          });
        }
      }
    }

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;

    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        slug,
        ownerId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: 'owner',
          },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, quizzes: true } },
      },
    });

    return NextResponse.json({ ...workspace, role: 'owner' }, { status: 201 });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
