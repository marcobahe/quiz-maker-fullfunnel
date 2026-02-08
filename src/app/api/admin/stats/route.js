import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const error = requireAdmin(session);
    if (error) return error;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Run all queries in parallel
    const [
      totalUsers,
      totalQuizzes,
      totalLeads,
      usersByPlan,
      newUsersLast7,
      newUsersLast30,
      publishedQuizzes,
      draftQuizzes,
      recentUsers,
      popularQuizzes,
      // Daily growth data for chart (last 30 days)
      dailyUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.quiz.count({ where: { isVariant: false } }),
      prisma.lead.count(),

      // Users by plan
      prisma.user.groupBy({
        by: ['plan'],
        _count: { id: true },
      }),

      // New users last 7 days
      prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),

      // New users last 30 days
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),

      // Published quizzes
      prisma.quiz.count({
        where: { status: 'published', isVariant: false },
      }),

      // Draft quizzes
      prisma.quiz.count({
        where: { status: 'draft', isVariant: false },
      }),

      // Recent users
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          plan: true,
          role: true,
          createdAt: true,
          _count: { select: { quizzes: true } },
        },
      }),

      // Popular quizzes (by lead count)
      prisma.quiz.findMany({
        take: 10,
        where: { isVariant: false },
        orderBy: { leads: { _count: 'desc' } },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          _count: { select: { leads: true } },
        },
      }),

      // Daily user registrations for the last 30 days
      prisma.$queryRaw`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "User"
        WHERE "createdAt" >= ${thirtyDaysAgo}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
    ]);

    // Format users by plan
    const planCounts = { free: 0, pro: 0, business: 0 };
    usersByPlan.forEach(({ plan, _count }) => {
      planCounts[plan] = _count.id;
    });

    return NextResponse.json({
      totalUsers,
      totalQuizzes,
      totalLeads,
      planCounts,
      newUsersLast7,
      newUsersLast30,
      publishedQuizzes,
      draftQuizzes,
      recentUsers,
      popularQuizzes,
      dailyGrowth: dailyUsers,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
