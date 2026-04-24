import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/apiError';

const resolveSchema = z.object({
  domain: z
    .string()
    .min(1, 'Domain required')
    .max(253, 'Domain too long')
    .regex(
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/,
      'Invalid domain format'
    ),
});

// GET /api/domains/resolve?domain=xxx — resolve a custom domain to quiz slug
// Called by middleware — secured via internal secret header
export async function GET(request) {
  // Verify this is an internal call from middleware
  const secret = request.headers.get('x-middleware-secret');
  if (secret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const rawDomain = searchParams.get('domain')?.toLowerCase()?.trim() ?? '';

  const parsed = resolveSchema.safeParse({ domain: rawDomain });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid domain', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { domain } = parsed.data;

  try {
    const customDomain = await prisma.customDomain.findUnique({
      where: { domain },
      include: {
        quiz: { select: { slug: true, status: true } },
      },
    });

    if (!customDomain || !customDomain.verified || !customDomain.active || !customDomain.quiz) {
      return NextResponse.json({ slug: null, active: false });
    }

    // Only serve published quizzes
    if (customDomain.quiz.status !== 'published') {
      return NextResponse.json({ slug: null, active: false });
    }

    return NextResponse.json({ slug: customDomain.quiz.slug, active: true });
  } catch (error) {
    return handleApiError(error, { route: '/api/domains/resolve', method: 'GET', userId: null });
  }
}
