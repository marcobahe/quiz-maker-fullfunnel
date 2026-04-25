import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { encrypt, isEncryptionAvailable } from '@/lib/fieldEncryption';
import { handleApiError } from '@/lib/apiError';
import { checkRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

const saveSchema = z.object({
  apiKey: z.string().min(1, 'API key obrigatória').max(2000),
});

/**
 * Resolve the workspace and verify the caller is owner or admin.
 * Returns workspace or null if not found/unauthorized.
 */
async function resolveWorkspace(workspaceId, userId) {
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
    include: { workspace: true },
  });
  if (!membership) return null;
  if (!['owner', 'admin'].includes(membership.role)) return null;
  return membership.workspace;
}

/**
 * PUT /api/workspaces/:id/integrations/ghl
 * Body: { apiKey: string }
 * Saves the API key encrypted. Sets ghlSyncStatus = "active".
 */
export async function PUT(request, { params }) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Rate limit: 20 saves per user per minute
    const rl = checkRateLimit(`ghl:save:${session.user.id}`, { max: 20, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em instantes.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    if (!isEncryptionAvailable()) {
      return NextResponse.json(
        { error: 'Integração GHL indisponível no momento. Contate o suporte.' },
        { status: 503 }
      );
    }

    const { id: workspaceId } = await params;
    const workspace = await resolveWorkspace(workspaceId, session.user.id);
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace não encontrado ou sem permissão.' }, { status: 404 });
    }

    const rawBody = await request.json();
    const parsed = saveSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const encryptedKey = encrypt(parsed.data.apiKey.trim());

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ghlApiKey: encryptedKey,
        ghlSyncStatus: 'active',
      },
    });

    return NextResponse.json({ success: true, ghlSyncStatus: 'active' });
  } catch (error) {
    return handleApiError(error, { route: '/api/workspaces/[id]/integrations/ghl', method: 'PUT', userId: session?.user?.id });
  }
}

/**
 * DELETE /api/workspaces/:id/integrations/ghl
 * Removes the GHL API key. Sets ghlSyncStatus = "not_configured".
 */
export async function DELETE(request, { params }) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: workspaceId } = await params;
    const workspace = await resolveWorkspace(workspaceId, session.user.id);
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace não encontrado ou sem permissão.' }, { status: 404 });
    }

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ghlApiKey: null,
        ghlSyncStatus: 'not_configured',
      },
    });

    return NextResponse.json({ success: true, ghlSyncStatus: 'not_configured' });
  } catch (error) {
    return handleApiError(error, { route: '/api/workspaces/[id]/integrations/ghl', method: 'DELETE', userId: session?.user?.id });
  }
}

/**
 * GET /api/workspaces/:id/integrations/ghl
 * Returns current GHL integration status (never exposes the raw key).
 */
export async function GET(request, { params }) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: workspaceId } = await params;
    const workspace = await resolveWorkspace(workspaceId, session.user.id);
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace não encontrado ou sem permissão.' }, { status: 404 });
    }

    return NextResponse.json({
      configured: workspace.ghlApiKey !== null,
      ghlSyncStatus: workspace.ghlSyncStatus,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/workspaces/[id]/integrations/ghl', method: 'GET', userId: session?.user?.id });
  }
}
