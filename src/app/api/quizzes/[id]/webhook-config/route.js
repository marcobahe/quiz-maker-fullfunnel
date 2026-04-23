import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/apiError';
import { z } from 'zod';

const webhookConfigSchema = z.object({
  webhookUrl: z
    .string()
    .url('webhookUrl must be a valid URL')
    .max(2048)
    .nullable()
    .optional(),
  webhookSecret: z.string().max(256).nullable().optional(),
});

/**
 * GET /api/quizzes/[id]/webhook-config
 * Returns current webhookUrl and whether a secret is configured.
 */
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: quizId } = await params;

    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, userId: session.user.id },
      select: { id: true, webhookUrl: true, webhookSecret: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      webhookUrl: quiz.webhookUrl,
      hasSecret: !!quiz.webhookSecret,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/quizzes/[id]/webhook-config', method: 'GET', userId: null });
  }
}

/**
 * POST /api/quizzes/[id]/webhook-config
 * Set or update webhookUrl and optionally webhookSecret.
 * Send webhookUrl: null to disable.
 */
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: quizId } = await params;

    const rawBody = await request.json();
    const parsed = webhookConfigSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, userId: session.user.id },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    const updateData = {};
    if ('webhookUrl' in parsed.data) updateData.webhookUrl = parsed.data.webhookUrl ?? null;
    if ('webhookSecret' in parsed.data) updateData.webhookSecret = parsed.data.webhookSecret ?? null;

    const updated = await prisma.quiz.update({
      where: { id: quizId },
      data: updateData,
      select: { id: true, webhookUrl: true, webhookSecret: true },
    });

    return NextResponse.json({
      webhookUrl: updated.webhookUrl,
      hasSecret: !!updated.webhookSecret,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/quizzes/[id]/webhook-config', method: 'POST', userId: null });
  }
}
