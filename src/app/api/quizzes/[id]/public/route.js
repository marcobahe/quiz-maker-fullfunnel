import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id: slug } = await params;
    const { searchParams } = new URL(request.url);
    const isPreview = searchParams.get('preview') === 'true';

    // Try to find by slug first, then by id
    const whereClause = {
      OR: [
        { slug },
        { id: slug },
      ],
    };

    // Only require published status if not in preview mode
    if (!isPreview) {
      whereClause.status = 'published';
    }

    let quiz = await prisma.quiz.findFirst({
      where: whereClause,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        canvasData: true,
        settings: true,
        scoreRanges: true,
        status: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    // Derive origin from request for embed URLs
    const origin = new URL(request.url).origin;
    const embedSlug = quiz.slug || quiz.id;
    quiz.embedUrl = `${origin}/q/${embedSlug}?embed=true`;

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error fetching public quiz:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
