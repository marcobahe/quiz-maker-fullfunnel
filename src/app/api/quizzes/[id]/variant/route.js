import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Math.random().toString(36).substring(2, 8);
}

// POST: Create a variant (duplicate) of a quiz for A/B testing
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    // Find the original quiz
    const original = await prisma.quiz.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!original) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    // Don't allow creating variant of a variant
    if (original.isVariant) {
      return NextResponse.json(
        { error: 'Não é possível criar variante de uma variante. Use o quiz original.' },
        { status: 400 }
      );
    }

    // Check if variant already exists
    const existingVariant = await prisma.quiz.findFirst({
      where: { parentId: id, isVariant: true },
    });

    if (existingVariant) {
      return NextResponse.json(
        { error: 'Este quiz já possui uma variante B', variant: existingVariant },
        { status: 409 }
      );
    }

    const variantName = `${original.name} (Variante B)`;
    const variantSlug = generateSlug(variantName);

    const variant = await prisma.quiz.create({
      data: {
        userId: session.user.id,
        name: variantName,
        slug: variantSlug,
        description: original.description,
        status: original.status,
        canvasData: original.canvasData,
        settings: original.settings,
        scoreRanges: original.scoreRanges,
        parentId: id,
        isVariant: true,
        splitPercent: 50,
      },
    });

    // Set split percent on original if not set
    await prisma.quiz.update({
      where: { id },
      data: { splitPercent: 50 },
    });

    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    console.error('Error creating variant:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
