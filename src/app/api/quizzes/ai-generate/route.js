import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

function extractJSON(text) {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch (_) {
    // noop
  }

  // Try extracting from markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (_) {
      // noop
    }
  }

  // Try finding JSON object in text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (_) {
      // noop
    }
  }

  return null;
}

function validateQuizData(data) {
  if (!data || typeof data !== 'object') return false;
  if (!data.title || typeof data.title !== 'string') return false;
  if (!Array.isArray(data.questions) || data.questions.length === 0) return false;

  for (const q of data.questions) {
    if (!q.type || !q.question) return false;
    if (q.type !== 'question-open' && (!Array.isArray(q.options) || q.options.length === 0)) return false;
  }

  if (!Array.isArray(data.scoreRanges) || data.scoreRanges.length === 0) return false;

  return true;
}

const TYPE_MAP = {
  'Múltipla escolha': 'question-multiple',
  'Escolha única': 'question-single',
  'Escolha visual': 'question-icons',
  'Pergunta aberta': 'question-open',
};

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave da API OpenAI não configurada. Adicione OPENAI_API_KEY nas variáveis de ambiente.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      tema,
      objetivo,
      publicoAlvo,
      numPerguntas = 5,
      tiposPerguntas = ['Escolha única'],
      temMetodologia = false,
      metodologia = '',
      categorias = '',
      tom = 'Casual',
      informacoesAdicionais = '',
    } = body;

    if (!tema || !tema.trim()) {
      return NextResponse.json({ error: 'O tema do quiz é obrigatório.' }, { status: 400 });
    }

    // Map question types to internal types
    const tiposInternos = tiposPerguntas.map(t => TYPE_MAP[t] || 'question-single');
    const tiposStr = tiposPerguntas.join(', ');

    // Build user prompt
    let userPrompt = `Crie um quiz com as seguintes especificações:

**Tema:** ${tema}
${objetivo ? `**Objetivo:** ${objetivo}` : ''}
${publicoAlvo ? `**Público-alvo:** ${publicoAlvo}` : ''}
**Número de perguntas:** ${numPerguntas}
**Tipos de perguntas permitidos:** ${tiposStr}
**Tom da linguagem:** ${tom}`;

    if (temMetodologia && metodologia) {
      userPrompt += `\n\n**Metodologia própria:** ${metodologia}`;
    }

    if (categorias) {
      userPrompt += `\n**Categorias de resultado:** ${categorias}`;
    }

    if (informacoesAdicionais) {
      userPrompt += `\n\n**Informações adicionais:** ${informacoesAdicionais}`;
    }

    userPrompt += `\n\nGere exatamente ${numPerguntas} perguntas.

Os tipos permitidos para o campo "type" de cada pergunta são: ${tiposInternos.join(', ')}.

Para perguntas do tipo "question-single" e "question-multiple": crie opções com "label" e "score" (número inteiro). Distribua as pontuações de forma que os scores totais cubram as faixas de resultado.

Para perguntas do tipo "question-icons": crie opções com "label", "icon" (emoji relevante), e "score".

Para perguntas do tipo "question-open": inclua "placeholder", "required": true, e "multiline": true. Não incluir "options".

Crie faixas de resultado (scoreRanges) coerentes com a pontuação total possível.

Responda APENAS com JSON válido no seguinte formato exato:
{
  "title": "Título do quiz",
  "description": "Descrição curta e atrativa do quiz",
  "questions": [
    {
      "type": "question-single",
      "question": "Texto da pergunta",
      "options": [
        { "label": "Opção A", "score": 1 },
        { "label": "Opção B", "score": 2 },
        { "label": "Opção C", "score": 3 }
      ]
    },
    {
      "type": "question-icons",
      "question": "Texto da pergunta visual",
      "options": [
        { "label": "Opção", "icon": "🎯", "score": 1 },
        { "label": "Opção", "icon": "💡", "score": 2 }
      ]
    },
    {
      "type": "question-open",
      "question": "Texto da pergunta aberta",
      "placeholder": "Digite sua resposta...",
      "required": true,
      "multiline": true
    }
  ],
  "scoreRanges": [
    { "min": 0, "max": 10, "title": "Resultado A", "description": "Descrição do resultado A" },
    { "min": 11, "max": 20, "title": "Resultado B", "description": "Descrição do resultado B" }
  ]
}`;

    const systemPrompt = `Você é um especialista em criação de quizzes de marketing e engajamento. Gere quizzes envolventes, com perguntas cativantes e opções inteligentes que mantenham o usuário engajado. Use linguagem ${tom.toLowerCase()} em português brasileiro. Responda APENAS com JSON válido no formato especificado, sem texto adicional, sem markdown, sem explicações.`;

    // Call OpenAI API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let openaiResponse;
    try {
      openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.8,
          max_tokens: 4000,
        }),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        return NextResponse.json(
          { error: 'A geração demorou mais que 30 segundos. Tente novamente.' },
          { status: 504 }
        );
      }
      throw err;
    }
    clearTimeout(timeoutId);

    if (!openaiResponse.ok) {
      const errData = await openaiResponse.json().catch(() => ({}));
      console.error('OpenAI API error:', errData);
      return NextResponse.json(
        { error: `Erro na API da OpenAI: ${errData.error?.message || 'Erro desconhecido'}` },
        { status: 502 }
      );
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'Resposta vazia da IA.' }, { status: 502 });
    }

    const quizData = extractJSON(content);

    if (!quizData) {
      console.error('Failed to parse AI response:', content);
      return NextResponse.json(
        { error: 'Não foi possível interpretar a resposta da IA. Tente novamente.' },
        { status: 502 }
      );
    }

    if (!validateQuizData(quizData)) {
      console.error('Invalid quiz data structure:', quizData);
      return NextResponse.json(
        { error: 'A IA gerou dados em formato inválido. Tente novamente.' },
        { status: 502 }
      );
    }

    // Normalize question types and ensure proper structure
    quizData.questions = quizData.questions.map((q) => {
      const normalized = { ...q };

      // Ensure type is valid
      if (!['question-single', 'question-multiple', 'question-icons', 'question-open'].includes(normalized.type)) {
        normalized.type = 'question-single';
      }

      // For icon questions, ensure icon field exists
      if (normalized.type === 'question-icons' && Array.isArray(normalized.options)) {
        normalized.options = normalized.options.map(opt => ({
          label: opt.label,
          icon: opt.icon || '⭐',
          score: opt.score || 0,
        }));
      }

      // For single/multiple, ensure label and score
      if ((normalized.type === 'question-single' || normalized.type === 'question-multiple') && Array.isArray(normalized.options)) {
        normalized.options = normalized.options.map(opt => ({
          label: opt.label,
          score: typeof opt.score === 'number' ? opt.score : 0,
        }));
      }

      // For open questions
      if (normalized.type === 'question-open') {
        normalized.placeholder = normalized.placeholder || 'Digite sua resposta...';
        normalized.required = normalized.required !== false;
        normalized.multiline = normalized.multiline !== false;
        delete normalized.options;
      }

      return normalized;
    });

    // Normalize scoreRanges
    quizData.scoreRanges = quizData.scoreRanges.map((range, idx) => ({
      id: `range-${idx + 1}`,
      min: typeof range.min === 'number' ? range.min : 0,
      max: typeof range.max === 'number' ? range.max : 0,
      title: range.title || `Resultado ${idx + 1}`,
      description: range.description || '',
    }));

    return NextResponse.json(quizData);
  } catch (error) {
    console.error('Error in AI quiz generation:', error);
    return NextResponse.json({ error: 'Erro interno ao gerar quiz.' }, { status: 500 });
  }
}
