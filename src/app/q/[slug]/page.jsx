import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import QuizPlayerClient from './QuizPlayerClient';

// Server-side quiz fetch — eliminates client-side waterfall (fetch JS → execute → fetch API)
// Quiz data is now available on first paint via SSR
async function getQuizData(slug, isPreview = false) {
  const whereClause = {
    OR: [
      { slug },
      { id: slug },
    ],
  };

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
      shuffleQuestions: true,
      questionTimer: true,
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

  if (!quiz) return null;

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

  // Sanitize settings: don't leak sensitive data
  if (quiz.settings) {
    try {
      const settings = typeof quiz.settings === 'string'
        ? JSON.parse(quiz.settings)
        : quiz.settings;

      if (settings?.aiResultConfig) {
        settings.aiResultConfig = {
          enabled: settings.aiResultConfig.enabled || false,
          combineWithStatic: settings.aiResultConfig.combineWithStatic !== false,
        };
      }

      if (settings?.tracking) {
        settings.tracking = {
          facebookPixelId: settings.tracking.facebookPixelId || '',
          googleTagManagerId: settings.tracking.googleTagManagerId || '',
          googleAnalyticsId: settings.tracking.googleAnalyticsId || '',
          events: settings.tracking.events || {},
        };
      }

      quiz.settings = settings;
    } catch (_e) { /* ignore */ }
  }

  // Ensure canvasData is parsed
  if (typeof quiz.canvasData === 'string') {
    try {
      quiz.canvasData = JSON.parse(quiz.canvasData);
    } catch (_e) {
      quiz.canvasData = null;
    }
  }

  // Ensure scoreRanges is parsed
  if (typeof quiz.scoreRanges === 'string') {
    try {
      quiz.scoreRanges = JSON.parse(quiz.scoreRanges);
    } catch (_e) {
      quiz.scoreRanges = null;
    }
  }

  // Ensure settings is parsed
  if (typeof quiz.settings === 'string') {
    try {
      quiz.settings = JSON.parse(quiz.settings);
    } catch (_e) {
      quiz.settings = null;
    }
  }

  return quiz;
}

export default async function QuizPlayerPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const isPreview = sp?.preview === 'true';

  const quiz = await getQuizData(slug, isPreview);

  if (!quiz) {
    notFound();
  }

  // Pass serialized quiz data to the client component
  // This eliminates the client-side fetch waterfall entirely
  return <QuizPlayerClient quizData={quiz} />;
}
