import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET: Get A/B test info for a quiz (original + variants + comparative analytics)
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const quiz = await prisma.quiz.findFirst({
      where: { id, userId: session.user.id },
      include: {
        variants: true,
        parent: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    // Determine the original quiz (could be viewing from variant)
    const originalId = quiz.isVariant ? quiz.parentId : quiz.id;
    const original = quiz.isVariant ? quiz.parent : quiz;
    const variants = quiz.isVariant ? [] : quiz.variants;

    // Get analytics for original and variants
    const allQuizIds = [originalId, ...variants.map(v => v.id)];

    const analyticsData = {};
    for (const qid of allQuizIds) {
      const events = await prisma.analyticsEvent.findMany({
        where: { quizId: qid },
      });

      const starts = events.filter(e => e.event === 'quiz_start' || e.event === 'quiz_started').length;
      const completes = events.filter(e => e.event === 'quiz_complete').length;
      const leads = await prisma.lead.count({ where: { quizId: qid } });

      analyticsData[qid] = {
        starts,
        completes,
        completionRate: starts > 0 ? Math.round((completes / starts) * 1000) / 10 : 0,
        leads,
        conversionRate: starts > 0 ? Math.round((leads / starts) * 1000) / 10 : 0,
      };
    }

    return NextResponse.json({
      original: {
        id: original.id,
        name: original.name,
        slug: original.slug,
        splitPercent: original.splitPercent || 50,
        status: original.status,
        ...analyticsData[original.id],
      },
      variants: variants.map(v => ({
        id: v.id,
        name: v.name,
        slug: v.slug,
        splitPercent: v.splitPercent || 50,
        status: v.status,
        isVariant: true,
        ...analyticsData[v.id],
      })),
      hasActiveTest: variants.some(v => v.status === 'published'),
    });
  } catch (error) {
    console.error('Error fetching A/B test:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT: Update A/B test settings (split percent, declare winner)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const quiz = await prisma.quiz.findFirst({
      where: { id, userId: session.user.id },
      include: { variants: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    // Update split percent
    if (body.splitPercent !== undefined) {
      const split = Math.min(100, Math.max(0, parseInt(body.splitPercent)));
      await prisma.quiz.update({
        where: { id },
        data: { splitPercent: split },
      });

      // Update variant with remaining percent
      for (const variant of quiz.variants) {
        await prisma.quiz.update({
          where: { id: variant.id },
          data: { splitPercent: 100 - split },
        });
      }

      return NextResponse.json({ success: true, splitPercent: split });
    }

    // Declare winner
    if (body.winnerId) {
      const winnerId = body.winnerId;

      if (winnerId === id) {
        // Original wins — archive variants
        for (const variant of quiz.variants) {
          await prisma.quiz.update({
            where: { id: variant.id },
            data: { status: 'draft', splitPercent: 0 },
          });
        }
        await prisma.quiz.update({
          where: { id },
          data: { splitPercent: 100 },
        });
      } else {
        // Variant wins — redirect 100% to variant, keep original as published
        await prisma.quiz.update({
          where: { id },
          data: { splitPercent: 0 },
        });
        const winnerVariant = quiz.variants.find(v => v.id === winnerId);
        if (winnerVariant) {
          await prisma.quiz.update({
            where: { id: winnerVariant.id },
            data: { splitPercent: 100 },
          });
        }
      }

      return NextResponse.json({ success: true, winnerId });
    }

    return NextResponse.json({ error: 'Nenhuma ação especificada' }, { status: 400 });
  } catch (error) {
    console.error('Error updating A/B test:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
