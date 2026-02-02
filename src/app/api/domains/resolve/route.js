import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/domains/resolve?domain=xxx — resolve a custom domain to quiz slug
// Called by middleware — secured via internal secret header
export async function GET(request) {
  // Verify this is an internal call from middleware
  const secret = request.headers.get('x-middleware-secret');
  if (secret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain')?.toLowerCase()?.trim();

  if (!domain) {
    return NextResponse.json({ error: 'Domain required' }, { status: 400 });
  }

  try {
    const customDomain = await prisma.customDomain.findUnique({
      where: { domain },
      include: {
        quiz: { select: { slug: true, status: true } },
      },
    });

    if (!customDomain || !customDomain.verified || !customDomain.quiz) {
      return NextResponse.json({ slug: null });
    }

    // Only serve published quizzes
    if (customDomain.quiz.status !== 'published') {
      return NextResponse.json({ slug: null });
    }

    return NextResponse.json({ slug: customDomain.quiz.slug });
  } catch (error) {
    console.error('Domain resolve error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
