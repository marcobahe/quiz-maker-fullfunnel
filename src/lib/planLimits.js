import prisma from './prisma';
import { getPlan } from './plans';

/**
 * Check if a user can perform an action given their plan limits.
 * @param {string} userId
 * @param {'quizzes' | 'leadsPerMonth'} resource
 * @returns {{ allowed: boolean, current: number, limit: number, plan: string }}
 */
export async function checkLimit(userId, resource) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  const planKey = user?.plan || 'free';
  const plan = getPlan(planKey);
  const limit = plan.limits[resource];

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, current: 0, limit: -1, plan: planKey };
  }

  let current = 0;

  if (resource === 'quizzes') {
    current = await prisma.quiz.count({
      where: { userId, isVariant: false },
    });
  } else if (resource === 'leadsPerMonth') {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    current = await prisma.lead.count({
      where: {
        quiz: { userId },
        createdAt: { gte: firstDayOfMonth },
      },
    });
  }

  return {
    allowed: current < limit,
    current,
    limit,
    plan: planKey,
  };
}

/**
 * Get all usage stats for a user
 */
export async function getUsageStats(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  const planKey = user?.plan || 'free';
  const plan = getPlan(planKey);

  const quizCount = await prisma.quiz.count({
    where: { userId, isVariant: false },
  });

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const leadsThisMonth = await prisma.lead.count({
    where: {
      quiz: { userId },
      createdAt: { gte: firstDayOfMonth },
    },
  });

  return {
    plan: planKey,
    quizzes: {
      current: quizCount,
      limit: plan.limits.quizzes,
      percentage: plan.limits.quizzes === -1 ? 0 : Math.round((quizCount / plan.limits.quizzes) * 100),
    },
    leadsPerMonth: {
      current: leadsThisMonth,
      limit: plan.limits.leadsPerMonth,
      percentage: plan.limits.leadsPerMonth === -1 ? 0 : Math.round((leadsThisMonth / plan.limits.leadsPerMonth) * 100),
    },
  };
}
