import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/apiError';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/getClientIp';

// GDPR Article 20 — Data Portability
// Rate limit: 1 export per 30 days per user
const EXPORT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const dynamic = 'force-dynamic';

function escapeCsvField(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function buildLeadsCsv(quizzes) {
  const BOM = '\uFEFF';
  const headers = ['Quiz', 'Nome', 'Email', 'Telefone', 'Pontuação', 'Resultado', 'País', 'Estado', 'Cidade', 'Data'];
  const rows = [headers.map(escapeCsvField).join(',')];

  for (const quiz of quizzes) {
    for (const lead of quiz.leads) {
      rows.push([
        quiz.name,
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        lead.score ?? 0,
        lead.resultCategory || '',
        lead.country || '',
        lead.region || '',
        lead.city || '',
        new Date(lead.createdAt).toISOString(),
      ].map(escapeCsvField).join(','));
    }
  }

  return BOM + rows.join('\r\n');
}

export async function GET(request) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Rate limit: 1 export per 30 days per user
    const rl = await checkRateLimit(`gdpr_export:${userId}`, { max: 1, windowMs: EXPORT_WINDOW_MS });
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: 'Você já solicitou um export nos últimos 30 dias. Tente novamente mais tarde.',
          retryAfterSeconds: rl.retryAfter,
        },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const url = new URL(request.url);
    const format = url.searchParams.get('format'); // 'json' (default) | 'csv'

    // Fetch all user data
    const [user, quizzes, workspaces, mediaAssets] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          plan: true,
          role: true,
          onboardingDone: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.quiz.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          status: true,
          settings: true,
          scoreRanges: true,
          emailNotifications: true,
          shuffleQuestions: true,
          createdAt: true,
          updatedAt: true,
          leads: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              answers: true,
              score: true,
              resultCategory: true,
              country: true,
              region: true,
              city: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.workspace.findMany({
        where: { ownerId: userId },
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.mediaAsset.findMany({
        where: { userId },
        select: {
          id: true,
          fileName: true,
          fileType: true,
          fileSize: true,
          url: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Log access to audit trail (fire-and-forget — do not block response)
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || null;

    prisma.auditLog.create({
      data: {
        userId,
        action: 'gdpr_data_export',
        ip,
        userAgent,
        meta: { format: format || 'json' },
      },
    }).catch((err) => {
      console.error('[data-export] Failed to write audit log', { userId, error: err?.message });
    });

    // CSV format — returns only quiz leads
    if (format === 'csv') {
      const csv = buildLeadsCsv(quizzes);
      const dateStr = new Date().toISOString().slice(0, 10);
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="quiz-responses-${dateStr}.csv"`,
        },
      });
    }

    // JSON format — full portable export
    const exportData = {
      exportedAt: new Date().toISOString(),
      gdprArticle: 'Article 20 - Right to data portability',
      profile: user,
      workspaces,
      quizzes: quizzes.map((q) => ({
        ...q,
        settings: (() => { try { return JSON.parse(q.settings); } catch { return {}; } })(),
        scoreRanges: (() => { try { return JSON.parse(q.scoreRanges); } catch { return []; } })(),
        leads: q.leads.map((l) => ({
          ...l,
          answers: (() => { try { return l.answers ? JSON.parse(l.answers) : []; } catch { return []; } })(),
        })),
      })),
      mediaAssets,
    };

    const dateStr = new Date().toISOString().slice(0, 10);
    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="my-data-export-${dateStr}.json"`,
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/user/data-export', method: 'GET', userId: session?.user?.id });
  }
}
