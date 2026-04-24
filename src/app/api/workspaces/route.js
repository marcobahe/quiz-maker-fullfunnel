import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ensurePersonalWorkspace, getUserWorkspaces } from '@/lib/workspace';
import { isAdmin } from '@/lib/admin';
import { handleApiError } from '@/lib/apiError';
import { checkRateLimit } from '@/lib/rateLimit';
import { createWorkspaceSchema } from '@/lib/schemas/workspaces.schema';

export async function GET(request) {
  let session;
  try {
    session = await getServerSession(authOptions);
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
    return handleApiError(error, { route: '/api/workspaces', method: 'GET', userId: session?.user?.id });
  }
}

export async function POST(request) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Rate limit: 10 workspace creations per user per minute
    const rl = checkRateLimit(`workspaces:create:${session.user.id}`, { max: 10, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em instantes.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const rawBody = await request.json();
    const parsed = createWorkspaceSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { name } = parsed.data;

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
    return handleApiError(error, { route: '/api/workspaces', method: 'POST', userId: session?.user?.id });
  }
}
