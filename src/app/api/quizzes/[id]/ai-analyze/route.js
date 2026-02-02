import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Simple in-memory rate limiter: max 10 requests per minute per quiz
const rateLimitMap = new Map();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 1000;

function checkRateLimit(quizId) {
  const now = Date.now();
  const entry = rateLimitMap.get(quizId);

  if (!entry) {
    rateLimitMap.set(quizId, { count: 1, windowStart: now });
    return true;
  }

  if (now - entry.windowStart > RATE_WINDOW_MS) {
    // Reset window
    rateLimitMap.set(quizId, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

// Periodically clean stale entries (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now - entry.windowStart > RATE_WINDOW_MS * 2) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export async function POST(request, { params }) {
  try {
    const { id } = await params;

    // Check API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Análise por IA não está configurada. A chave da API OpenAI não foi encontrada.' },
        { status: 503 }
      );
    }

    // Rate limit check
    if (!checkRateLimit(id)) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em alguns instantes.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { answers, score, maxScore, leadName, leadEmail, resultTitle } = body;

    // Fetch quiz to get aiResultConfig
    const quiz = await prisma.quiz.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: {
        id: true,
        settings: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    // Parse settings to get aiResultConfig
    let settings;
    try {
      settings = typeof quiz.settings === 'string'
        ? JSON.parse(quiz.settings || '{}')
        : quiz.settings || {};
    } catch (_e) {
      settings = {};
    }

    const aiConfig = settings.aiResultConfig;
    if (!aiConfig || !aiConfig.enabled) {
      return NextResponse.json(
        { error: 'Análise por IA não está habilitada para este quiz.' },
        { status: 400 }
      );
    }

    // Format answers as readable text
    let answersFormatted = '';
    if (answers && typeof answers === 'object') {
      const answerEntries = Array.isArray(answers) ? answers : Object.values(answers);
      answersFormatted = answerEntries
        .map((a) => {
          const question = a.question || 'N/A';
          // Rating answers store ratingValue and ratingMax
          if (a.ratingValue !== undefined && a.ratingMax !== undefined) {
            return `Pergunta: ${question} | Nota: ${a.ratingValue}/${a.ratingMax} | Pontos: ${a.score ?? 0}`;
          }
          return `Pergunta: ${question} | Resposta: ${a.answer || 'N/A'} | Pontos: ${a.score ?? 0}`;
        })
        .join('\n');
    }

    // Build prompt with variable substitution
    let prompt = aiConfig.prompt || 'Analise as respostas deste quiz. O respondente {{nome}} obteve {{score}} pontos de {{maxScore}}. Respostas: {{respostas}}. Gere uma análise personalizada.';

    prompt = prompt
      .replace(/\{\{nome\}\}/g, leadName || 'Anônimo')
      .replace(/\{\{email\}\}/g, leadEmail || 'não informado')
      .replace(/\{\{score\}\}/g, String(score ?? 0))
      .replace(/\{\{maxScore\}\}/g, String(maxScore ?? 0))
      .replace(/\{\{respostas\}\}/g, answersFormatted || 'Nenhuma resposta registrada')
      .replace(/\{\{resultado\}\}/g, resultTitle || 'Não definido');

    const model = aiConfig.model || 'gpt-4o-mini';
    const maxTokens = Math.min(2000, Math.max(100, aiConfig.maxTokens || 500));

    // Call OpenAI API
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em análise de resultados de quizzes. Responda em português brasileiro de forma profissional e personalizada. Use formatação simples com parágrafos. Pode usar **negrito** para destacar pontos importantes.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: maxTokens,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!openaiRes.ok) {
        const errorData = await openaiRes.json().catch(() => ({}));
        console.error('OpenAI API error:', openaiRes.status, errorData);
        return NextResponse.json(
          { error: 'Erro ao gerar análise. Tente novamente.' },
          { status: 502 }
        );
      }

      const data = await openaiRes.json();
      const analysis = data.choices?.[0]?.message?.content || 'Não foi possível gerar a análise.';

      return NextResponse.json({ analysis });
    } catch (fetchError) {
      clearTimeout(timeout);
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'A análise demorou mais que o esperado. Tente novamente.' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error in AI analyze:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar análise.' },
      { status: 500 }
    );
  }
}
