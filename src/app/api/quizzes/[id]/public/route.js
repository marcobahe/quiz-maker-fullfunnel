import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PLAYER_ORIGIN } from '@/lib/urls';

// Disable caching to always get fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
        parentId: true,
        isVariant: true,
        splitPercent: true,
        variants: {
          where: { status: 'published' },
          select: {
            id: true,
            slug: true,
            splitPercent: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    // Use the public player origin for embed URLs
    const embedSlug = quiz.slug || quiz.id;
    quiz.embedUrl = `${PLAYER_ORIGIN}/q/${embedSlug}?embed=true`;

    // A/B Testing: include variant info for client-side split
    if (!quiz.isVariant && quiz.variants && quiz.variants.length > 0) {
      quiz.abTest = {
        originalId: quiz.id,
        originalSlug: quiz.slug,
        originalSplit: quiz.splitPercent || 50,
        variants: quiz.variants.map(v => ({
          id: v.id,
          slug: v.slug,
          splitPercent: v.splitPercent || 50,
        })),
      };
    }

    // Clean up — don't leak raw variants array
    delete quiz.variants;

    // Sanitize settings: don't leak sensitive data to public API
    if (quiz.settings) {
      try {
        const settings = typeof quiz.settings === 'string'
          ? JSON.parse(quiz.settings)
          : quiz.settings;

        // AI config: only expose enabled + combineWithStatic (not the prompt)
        if (settings?.aiResultConfig) {
          settings.aiResultConfig = {
            enabled: settings.aiResultConfig.enabled || false,
            combineWithStatic: settings.aiResultConfig.combineWithStatic !== false,
          };
        }

        // Tracking: expose pixel IDs and events, but strip customHeadCode for security
        if (settings?.tracking) {
          settings.tracking = {
            facebookPixelId: settings.tracking.facebookPixelId || '',
            googleTagManagerId: settings.tracking.googleTagManagerId || '',
            googleAnalyticsId: settings.tracking.googleAnalyticsId || '',
            // customHeadCode intentionally omitted for security
            events: settings.tracking.events || {},
          };
        }

        quiz.settings = typeof quiz.settings === 'string'
          ? JSON.stringify(settings)
          : settings;
      } catch (_e) { /* ignore */ }
    }

    // Return with no-cache headers to ensure fresh data
    return NextResponse.json(quiz, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching public quiz:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
