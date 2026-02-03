import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkLimit } from '@/lib/planLimits';

function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Math.random().toString(36).substring(2, 8);
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const includeAnalytics = searchParams.get('includeAnalytics') === 'true';

    const where = {
      isVariant: false,
    };

    if (workspaceId) {
      // Check user has access to workspace
      const member = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
      });
      if (!member) {
        return NextResponse.json({ error: 'Sem acesso ao workspace' }, { status: 403 });
      }
      where.workspaceId = workspaceId;
    } else {
      where.userId = session.user.id;
    }

    const include = {
      _count: {
        select: { leads: true },
      },
      variants: {
        select: { id: true, name: true, status: true },
      },
    };

    // Include analytics data if requested
    if (includeAnalytics) {
      include.sessions = {
        select: { 
          id: true, 
          startedAt: true, 
          completedAt: true, 
          currentScore: true,
          isCompleted: true
        }
      };
      include.leads = {
        select: { id: true, createdAt: true }
      };
    }

    const quizzes = await prisma.quiz.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include,
    });

    // Calculate analytics if requested
    if (includeAnalytics) {
      const quizzesWithAnalytics = quizzes.map(quiz => {
        const totalStarts = quiz.sessions?.length || 0;
        const totalCompletes = quiz.sessions?.filter(s => s.isCompleted).length || 0;
        const totalLeads = quiz.leads?.length || 0;
        const completionRate = totalStarts > 0 ? Math.round((totalCompletes / totalStarts) * 100) : 0;
        const conversionRate = totalStarts > 0 ? Math.round((totalLeads / totalStarts) * 100) : 0;
        
        const scores = quiz.sessions?.filter(s => s.isCompleted && s.currentScore > 0).map(s => s.currentScore) || [];
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

        // Remove raw session and lead data to reduce payload size
        const { sessions, leads, ...quizData } = quiz;
        
        return {
          ...quizData,
          totalStarts,
          totalCompletes,
          totalLeads,
          completionRate,
          conversionRate,
          avgScore,
        };
      });
      return NextResponse.json(quizzesWithAnalytics);
    }

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Check plan limits
    const limitCheck = await checkLimit(session.user.id, 'quizzes');
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: `Limite de quizzes atingido (${limitCheck.current}/${limitCheck.limit}). Faça upgrade para criar mais.`,
          limitReached: true,
          current: limitCheck.current,
          limit: limitCheck.limit,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, canvasData, scoreRanges, settings, workspaceId } = body;
    const quizName = name || 'Meu Novo Quiz';
    
    const slug = generateSlug(quizName);
    
    // Use template canvasData if provided, otherwise default blank canvas
    const finalCanvasData = canvasData
      ? JSON.stringify(canvasData)
      : JSON.stringify({
          nodes: [
            {
              id: 'start',
              type: 'start',
              position: { x: 250, y: 50 },
              data: { label: 'Início' },
            },
          ],
          edges: [],
        });

    // If workspaceId provided, verify access
    let assignedWorkspaceId = workspaceId || null;
    if (assignedWorkspaceId) {
      const member = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId: assignedWorkspaceId, userId: session.user.id } },
      });
      if (!member || member.role === 'viewer') {
        return NextResponse.json({ error: 'Sem permissão neste workspace' }, { status: 403 });
      }
    }

    const quiz = await prisma.quiz.create({
      data: {
        userId: session.user.id,
        workspaceId: assignedWorkspaceId,
        name: quizName,
        slug,
        description: description || null,
        canvasData: finalCanvasData,
        scoreRanges: scoreRanges ? JSON.stringify(scoreRanges) : '[]',
        settings: settings ? JSON.stringify(settings) : '{}',
      },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
