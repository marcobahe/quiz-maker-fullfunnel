import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id: slug } = await params;

    // Try to find by slug first, then by id
    let quiz = await prisma.quiz.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug },
        ],
        status: 'published',
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        canvasData: true,
        settings: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error fetching public quiz:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
