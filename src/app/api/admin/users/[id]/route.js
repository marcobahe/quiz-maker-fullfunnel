import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireAdmin, requireOwner } from '@/lib/admin';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/apiError';
import { checkRateLimit } from '@/lib/rateLimit';
import { updateUserSchema } from '@/lib/schemas/admin.schema';

// GET - User details
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const error = requireAdmin(session);
    if (error) return error;

    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        plan: true,
        suspended: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        planExpiresAt: true,
        onboardingDone: true,
        createdAt: true,
        updatedAt: true,
        quizzes: {
          where: { isVariant: false },
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            createdAt: true,
            _count: { select: { leads: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        memberships: {
          select: {
            id: true,
            role: true,
            workspace: {
              select: {
                id: true,
                name: true,
                slug: true,
                _count: { select: { members: true, quizzes: true } },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Get total leads
    const totalLeads = await prisma.lead.count({
      where: { quiz: { userId: id } },
    });

    return NextResponse.json({ ...user, totalLeads });
  } catch (error) {
    return handleApiError(error, { route: '/api/admin/users/[id]', method: 'GET', userId: null });
  }
}

// PATCH - Update user
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const error = requireAdmin(session);
    if (error) return error;

    // Rate limit: 30 admin user updates per admin per minute
    const rl = checkRateLimit(`admin:user:update:${session.user.id}`, { max: 30, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em instantes.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const { id } = params;
    const rawBody = await request.json();
    const parsed = updateUserSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const body = parsed.data;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Build update data - only allow specific fields
    const updateData = {};

    if (body.plan) {
      updateData.plan = body.plan;
    }

    if (body.role) {
      // Only owner can change roles to admin/owner
      if (body.role !== 'user') {
        const ownerError = requireOwner(session);
        if (ownerError) return ownerError;
      }
      updateData.role = body.role;
    }

    if (typeof body.suspended === 'boolean') {
      // Can't suspend owner
      if (user.role === 'owner') {
        return NextResponse.json({ error: 'Não é possível suspender o owner' }, { status: 400 });
      }
      updateData.suspended = body.suspended;
    }

    if (body.name !== undefined) {
      updateData.name = body.name;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        suspended: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, { route: '/api/admin/users/[id]', method: 'PATCH', userId: null });
  }
}

// DELETE - Remove user
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const error = requireAdmin(session);
    if (error) return error;

    const { id } = params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (user.role === 'owner') {
      return NextResponse.json({ error: 'Não é possível deletar o owner' }, { status: 400 });
    }

    // Can't delete yourself
    if (id === session.user.id || id === session.user.originalUserId) {
      return NextResponse.json({ error: 'Não é possível deletar a própria conta' }, { status: 400 });
    }

    // Delete in order: leads, analytics, integrations, quizzes, workspace members, workspaces, custom domains, user
    await prisma.$transaction(async (tx) => {
      // Delete leads from user's quizzes
      await tx.lead.deleteMany({
        where: { quiz: { userId: id } },
      });

      // Delete analytics from user's quizzes
      await tx.analyticsEvent.deleteMany({
        where: { quiz: { userId: id } },
      });

      // Delete integrations from user's quizzes
      await tx.integration.deleteMany({
        where: { quiz: { userId: id } },
      });

      // Delete custom domains
      await tx.customDomain.deleteMany({
        where: { userId: id },
      });

      // Delete quizzes
      await tx.quiz.deleteMany({
        where: { userId: id },
      });

      // Delete workspace memberships
      await tx.workspaceMember.deleteMany({
        where: { userId: id },
      });

      // Delete owned workspaces (and their remaining members)
      const ownedWorkspaces = await tx.workspace.findMany({
        where: { ownerId: id },
        select: { id: true },
      });

      for (const ws of ownedWorkspaces) {
        await tx.workspaceMember.deleteMany({ where: { workspaceId: ws.id } });
      }

      await tx.workspace.deleteMany({
        where: { ownerId: id },
      });

      // Delete user
      await tx.user.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, { route: '/api/admin/users/[id]', method: 'DELETE', userId: null });
  }
}
