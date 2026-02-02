import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

function escapeCsvField(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function extractQuestionLabels(canvasData) {
  if (!canvasData) return [];
  try {
    const data = typeof canvasData === 'string' ? JSON.parse(canvasData) : canvasData;
    const questions = [];
    if (data.nodes) {
      for (const node of data.nodes) {
        if (node.type === 'composite' && node.data?.elements) {
          for (const el of node.data.elements) {
            if (el.type.startsWith('question-')) {
              questions.push({
                id: el.id,
                question: el.question || 'Pergunta',
              });
            }
          }
        }
        // Legacy node types
        if (node.type === 'single-choice' || node.type === 'multiple-choice') {
          questions.push({
            id: node.id,
            question: node.data?.question || 'Pergunta',
          });
        }
      }
    }
    return questions;
  } catch {
    return [];
  }
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: quizId } = await params;

    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, userId: session.user.id },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    const where = { quizId };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Extract question labels from quiz canvas
    const questions = extractQuestionLabels(quiz.canvasData);

    // Build CSV headers
    const baseHeaders = ['Nome', 'Email', 'Telefone', 'Pontuação', 'Resultado', 'Data'];
    const questionHeaders = questions.map((q) => q.question);
    const allHeaders = [...baseHeaders, ...questionHeaders];

    // UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF';
    const rows = [allHeaders.map(escapeCsvField).join(',')];

    for (const lead of leads) {
      let answers = [];
      try {
        answers = lead.answers ? JSON.parse(lead.answers) : [];
      } catch {
        answers = [];
      }

      const baseRow = [
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        lead.score ?? 0,
        lead.resultCategory || '',
        new Date(lead.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      ];

      // Map answers to question columns
      const answerCols = questions.map((q) => {
        // Try to find answer by question id
        const answer = answers.find(
          (a) => a.questionId === q.id || a.elementId === q.id
        );
        if (answer) {
          // answer could be string, array of strings, or have a 'value' field
          const val = answer.answer || answer.value || answer.selectedOption || '';
          return Array.isArray(val) ? val.join('; ') : String(val);
        }
        return '';
      });

      rows.push([...baseRow, ...answerCols].map(escapeCsvField).join(','));
    }

    const csv = BOM + rows.join('\r\n');

    // Sanitize quiz name for filename
    const safeName = quiz.name
      .replace(/[^a-zA-Z0-9À-ÿ\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `leads-${safeName}-${dateStr}.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting leads:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
