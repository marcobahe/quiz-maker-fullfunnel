import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { publishDomainMapping } from '@/lib/cloudflare-kv';

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
    console.error('Error fetching domains:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST /api/domains — add a new domain
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { domain, quizId } = body;

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Domínio é obrigatório' }, { status: 400 });
    }

    // Normalize domain: lowercase, trim, remove protocol/path
    const cleanDomain = domain
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .replace(/^www\./, '');

    // Basic domain validation
    const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
    if (!domainRegex.test(cleanDomain)) {
      return NextResponse.json({ error: 'Formato de domínio inválido' }, { status: 400 });
    }

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
    console.error('Error creating domain:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
