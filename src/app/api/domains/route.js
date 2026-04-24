import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { publishDomainMapping } from '@/lib/cloudflare-kv';
import { handleApiError } from '@/lib/apiError';
import { checkRateLimit } from '@/lib/rateLimit';
import { createDomainSchema } from '@/lib/schemas/domains.schema';

// GET /api/domains — list user's domains
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const domains = await prisma.customDomain.findMany({
      where: { userId: session.user.id },
      include: {
        quiz: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(domains);
  } catch (error) {
    return handleApiError(error, { route: '/api/domains', method: 'GET', userId: session?.user?.id });
  }
}

// POST /api/domains — add a new domain
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Rate limit: 10 domain creations per user per minute
    const rl = checkRateLimit(`domains:create:${session.user.id}`, { max: 10, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em instantes.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const rawBody = await request.json();
    const parsed = createDomainSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { domain, quizId } = parsed.data;

    // Normalize domain: lowercase, trim, remove protocol/path
    const cleanDomain = domain
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .replace(/^www\./, '');

    // Check if domain already exists
    const existing = await prisma.customDomain.findUnique({
      where: { domain: cleanDomain },
    });
    if (existing) {
      return NextResponse.json({ error: 'Este domínio já está cadastrado' }, { status: 409 });
    }

    // If quizId provided, verify ownership
    if (quizId) {
      const quiz = await prisma.quiz.findFirst({
        where: { id: quizId, userId: session.user.id },
      });
      if (!quiz) {
        return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
      }
    }

    const customDomain = await prisma.customDomain.create({
      data: {
        domain: cleanDomain,
        quizId: quizId || null,
        userId: session.user.id,
      },
      include: {
        quiz: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(customDomain, { status: 201 });
  } catch (error) {
    return handleApiError(error, { route: '/api/domains', method: 'POST', userId: session?.user?.id });
  }
}
