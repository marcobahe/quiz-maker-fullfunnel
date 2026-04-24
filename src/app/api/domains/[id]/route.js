import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { publishDomainMapping, removeDomainMapping } from '@/lib/cloudflare-kv';
import { handleApiError } from '@/lib/apiError';
import { invalidateDomainCache } from '@/lib/domain-cache';

// PUT /api/domains/[id] — update domain (e.g., associate quiz)
export async function PUT(request, { params }) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const existing = await prisma.customDomain.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Domínio não encontrado' }, { status: 404 });
    }

    const updateData = {};

    if (body.quizId !== undefined) {
      if (body.quizId) {
        // Verify quiz ownership
        const quiz = await prisma.quiz.findFirst({
          where: { id: body.quizId, userId: session.user.id },
        });
        if (!quiz) {
          return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
        }
        updateData.quizId = body.quizId;
      } else {
        updateData.quizId = null;
      }
    }

    const updated = await prisma.customDomain.update({
      where: { id },
      data: updateData,
      include: {
        quiz: { select: { id: true, name: true, slug: true, status: true } },
      },
    });

    // Invalidate middleware cache for this domain (best-effort: same process only)
    invalidateDomainCache(updated.domain);

    // If domain is verified and now has a published quiz → publish mapping
    if (updated.verified && updated.quiz?.slug && updated.quiz?.status === 'published') {
      publishDomainMapping(updated.domain, updated.quiz.slug, updated.quiz.id).catch(() => {});
    }
    // If quiz was removed from domain → remove mapping
    if (updated.verified && !updated.quizId) {
      removeDomainMapping(updated.domain).catch(() => {});
    }

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, { route: '/api/domains/[id]', method: 'PUT', userId: session?.user?.id });
  }
}

// PATCH /api/domains/[id] — toggle active status
export async function PATCH(request, { params }) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();

    if (typeof body.active !== 'boolean') {
      return NextResponse.json({ error: 'Campo "active" obrigatório (boolean)' }, { status: 400 });
    }

    const existing = await prisma.customDomain.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Domínio não encontrado' }, { status: 404 });
    }

    const updated = await prisma.customDomain.update({
      where: { id },
      data: { active: body.active },
    });

    // Invalidate middleware cache — domain status changed
    invalidateDomainCache(updated.domain);

    // Sync edge KV mapping based on new active state
    if (!body.active && existing.verified) {
      removeDomainMapping(existing.domain).catch(() => {});
    }

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, { route: '/api/domains/[id]', method: 'PATCH', userId: session?.user?.id });
  }
}

// DELETE /api/domains/[id] — remove domain
export async function DELETE(request, { params }) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.customDomain.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Domínio não encontrado' }, { status: 404 });
    }

    // Invalidate middleware cache — domain is being deleted
    invalidateDomainCache(existing.domain);

    // Remove domain mapping from edge KV before deleting
    if (existing.verified) {
      removeDomainMapping(existing.domain).catch(() => {});
    }

    await prisma.customDomain.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, { route: '/api/domains/[id]', method: 'DELETE', userId: session?.user?.id });
  }
}
