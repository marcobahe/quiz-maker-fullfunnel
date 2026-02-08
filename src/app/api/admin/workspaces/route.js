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

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { owner: { name: { contains: search, mode: 'insensitive' } } },
        { owner: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const workspaces = await prisma.workspace.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, quizzes: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Map to a flat structure compatible with the sidebar
    const result = workspaces.map((ws) => ({
      id: ws.id,
      name: ws.name,
      slug: ws.slug,
      ownerId: ws.ownerId,
      owner: ws.owner,
      _count: ws._count,
      createdAt: ws.createdAt,
      updatedAt: ws.updatedAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Admin workspaces list error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
