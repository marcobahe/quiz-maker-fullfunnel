import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const error = requireAdmin(session);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const plan = searchParams.get('plan') || '';
    const role = searchParams.get('role') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (plan && ['free', 'pro', 'business'].includes(plan)) {
      where.plan = plan;
    }

    if (role && ['owner', 'admin', 'user'].includes(role)) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          plan: true,
          suspended: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              quizzes: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Get lead counts for each user's quizzes
    const usersWithLeads = await Promise.all(
      users.map(async (user) => {
        const leadCount = await prisma.lead.count({
          where: {
            quiz: { userId: user.id },
          },
        });
        return {
          ...user,
          quizCount: user._count.quizzes,
          leadCount,
          _count: undefined,
        };
      })
    );

    return NextResponse.json({
      users: usersWithLeads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin users list error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
