import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import * as cheerio from 'cheerio';
import { handleApiError } from '@/lib/apiError';
import { checkRateLimit } from '@/lib/rateLimit';
import { aiGenerateSchema } from '@/lib/schemas/aiGenerate.schema';

// ── URL Scraping ────────────────────────────────────────────────
async function scrapeUrl(url, maxChars = 5000) {
  try {
    // Validate URL
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; QuizMeBaby/1.0; +https://quizmebaby.app)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[scrapeUrl] Failed to fetch ${url}: ${res.status}`);
      return null;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove non-content elements
    $('script, style, nav, footer, header, aside, form, iframe, noscript, svg, [hidden]').remove();
    $('[role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]').remove();
    $('.nav, .navbar, .footer, .sidebar, .menu, .header, .cookie, .popup, .modal').remove();

    // Extract text from main content areas
    let textContent = '';

    // Try to find main content containers
    const mainSelectors = ['main', 'article', '[role="main"]', '.content', '.main-content', '#content', '#main'];
    for (const selector of mainSelectors) {
      const el = $(selector);
      if (el.length > 0) {
        textContent = el.text();
        break;
      }
    }

    // Fallback to body if no main content found
    if (!textContent) {
      textContent = $('body').text();
    }

    // Clean up whitespace
    textContent = textContent
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    // Get meta info
    const title = $('title').text().trim() || $('h1').first().text().trim() || '';
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const ogDescription = $('meta[property="og:description"]').attr('content') || '';

    // Build scraped content
    let result = '';
    if (title) result += `Título: ${title}\n`;
    if (ogTitle && ogTitle !== title) result += `Título OG: ${ogTitle}\n`;
    if (metaDescription) result += `Meta descrição: ${metaDescription}\n`;
    if (ogDescription && ogDescription !== metaDescription) result += `OG descrição: ${ogDescription}\n`;
    result += `\nConteúdo da página:\n${textContent}`;

    // Limit to maxChars
    if (result.length > maxChars) {
      result = result.slice(0, maxChars) + '...';
    }

    return result;
  } catch (err) {
    console.warn('[scrapeUrl] Error scraping URL:', err.message);
    return null;
  }
}

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
    if (q.type !== 'question-open' && q.type !== 'question-rating' && (!Array.isArray(q.options) || q.options.length === 0)) return false;
  }

  if (!Array.isArray(data.scoreRanges) || data.scoreRanges.length === 0) return false;

  return true;
}

const TYPE_MAP = {
  'Múltipla escolha': 'question-multiple',
  'Escolha única': 'question-single',
  'Escolha visual': 'question-icons',
  'Pergunta aberta': 'question-open',
  'Nota / Avaliação': 'question-rating',
};

export async function POST(request) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Support OpenRouter (preferred) or OpenAI directly
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const apiKey = openRouterKey || openaiKey;
    const useOpenRouter = !!openRouterKey;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave da API não configurada. Adicione OPENROUTER_API_KEY ou OPENAI_API_KEY nas variáveis de ambiente.' },
        { status: 500 }
      );
    }

    // Rate limit: 5 AI generations per user per minute
    const rl = checkRateLimit(`ai:generate:${session.user.id}`, { max: 5, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em instantes.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const rawBody = await request.json();
    const parsed = aiGenerateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const {
      tema,
      objetivo,
      publicoAlvo,
      siteUrl = '',
      numPerguntas = 5,
      tiposPerguntas = ['Escolha única'],
      temMetodologia = false,
      metodologia = '',
      categorias = '',
      tom = 'Casual',
      informacoesAdicionais = '',
    } = parsed.data;

    // Map question types to internal types
    const tiposInternos = tiposPerguntas.map(t => TYPE_MAP[t] || 'question-single');
    const tiposStr = tiposPerguntas.join(', ');

    // Scrape URL if provided
    let scrapedContent = null;
    if (siteUrl && siteUrl.trim()) {
      scrapedContent = await scrapeUrl(siteUrl.trim(), 5000);
    }

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

    // Add scraped content context if available
    if (scrapedContent) {
      userPrompt += `\n\n---
CONTEXTO ADICIONAL (extraído automaticamente da página do usuário):
---
${scrapedContent}
---

Use essas informações para entender melhor o negócio, tom de voz, produto/serviço, benefícios e público-alvo. Extraia:
- Nome do produto/serviço
- Principais benefícios mencionados
- Público-alvo implícito
- Tom de voz (formal, casual, técnico, etc.)
- Objeções comuns que a página tenta resolver
- CTA principal

Adapte as perguntas e opções do quiz para refletir a linguagem e proposta de valor da página.`;
    }

    userPrompt += `\n\nGere exatamente ${numPerguntas} perguntas.

Os tipos permitidos para o campo "type" de cada pergunta são: ${tiposInternos.join(', ')}.

Para perguntas do tipo "question-single" e "question-multiple": crie opções com "label" e "score" (número inteiro). Distribua as pontuações de forma que os scores totais cubram as faixas de resultado.

Para perguntas do tipo "question-icons": crie opções com "label", "icon" (emoji relevante), e "score".

Para perguntas do tipo "question-open": inclua "placeholder", "required": true, e "multiline": true. Não incluir "options".

Para perguntas do tipo "question-rating": inclua "ratingType" ("stars", "number" ou "slider"), "maxValue" (ex: 10), "minValue" (ex: 0), "scoreMultiplier" (ex: 1). Não incluir "options".

Crie faixas de resultado (scoreRanges) coerentes com a pontuação total possível.

IMPORTANTE sobre as descrições dos resultados (scoreRanges):
- Cada "description" deve ter 2-3 parágrafos ANALÍTICOS e PROFUNDOS (mínimo 150 palavras)
- NÃO reproduza as respostas que a pessoa deu
- ANALISE o perfil/situação da pessoa baseado na faixa de pontuação
- Explique O QUE isso significa na prática para ela
- Dê RECOMENDAÇÕES concretas e acionáveis
- Use tom empático e motivador
- Termine com um call-to-action sutil se fizer sentido
- Separe os parágrafos com \n\n

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
    },
    {
      "type": "question-rating",
      "question": "De 0 a 10, quanto você recomendaria?",
      "ratingType": "number",
      "minValue": 0,
      "maxValue": 10,
      "scoreMultiplier": 1
    }
  ],
  "scoreRanges": [
    { "min": 0, "max": 10, "title": "Resultado A", "description": "Parágrafo 1 com análise do perfil e o que a pontuação revela sobre a situação atual da pessoa.\n\nParágrafo 2 com implicações práticas, o que ela está perdendo ou ganhando, e por quê isso importa.\n\nParágrafo 3 com recomendações concretas e próximos passos acionáveis." },
    { "min": 11, "max": 20, "title": "Resultado B", "description": "Mesma estrutura: análise profunda em 2-3 parágrafos com recomendações." }
  ]
}`;

    const systemPrompt = `Você é um especialista em criação de quizzes de marketing e engajamento. Gere quizzes envolventes, com perguntas cativantes e opções inteligentes que mantenham o usuário engajado. Use linguagem ${tom.toLowerCase()} em português brasileiro. Responda APENAS com JSON válido no formato especificado, sem texto adicional, sem markdown, sem explicações.`;

    // Call AI API (OpenRouter or OpenAI)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s for OpenRouter

    const apiUrl = useOpenRouter 
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
    
    // Model selection: use OpenAI GPT-4o-mini via OpenRouter or direct
    const model = useOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini';

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };

    // OpenRouter specific headers
    if (useOpenRouter) {
      headers['HTTP-Referer'] = 'https://go.quizmebaby.app';
      headers['X-Title'] = 'QuizMeBaby';
    }

    let aiResponse;
    try {
      aiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
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
          { error: 'A geração demorou mais que 60 segundos. Tente novamente.' },
          { status: 504 }
        );
      }
      throw err;
    }
    clearTimeout(timeoutId);

    if (!aiResponse.ok) {
      const errData = await aiResponse.json().catch(() => ({}));
      console.error('AI API error:', errData);
      return NextResponse.json(
        { error: `Erro na API de IA: ${errData.error?.message || 'Erro desconhecido'}` },
        { status: 502 }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

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
      if (!['question-single', 'question-multiple', 'question-icons', 'question-open', 'question-rating'].includes(normalized.type)) {
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

      // For rating questions
      if (normalized.type === 'question-rating') {
        normalized.ratingType = normalized.ratingType || 'number';
        normalized.minValue = typeof normalized.minValue === 'number' ? normalized.minValue : 0;
        normalized.maxValue = typeof normalized.maxValue === 'number' ? normalized.maxValue : 10;
        normalized.scoreMultiplier = typeof normalized.scoreMultiplier === 'number' ? normalized.scoreMultiplier : 1;
        normalized.required = normalized.required !== false;
        delete normalized.options;
      }

      return normalized;
    });

    // Normalize scoreRanges
    quizData.scoreRanges = quizData.scoreRanges.map((range, idx) => {
      let min = typeof range.min === 'number' ? range.min : 0;
      let max = typeof range.max === 'number' ? range.max : 0;
      
      // Fix inverted min/max (AI sometimes generates them wrong)
      if (min > max) {
        [min, max] = [max, min];
      }
      
      return {
        id: `range-${idx + 1}`,
        min,
        max,
        title: range.title || `Resultado ${idx + 1}`,
        description: range.description || '',
      };
    });

    return NextResponse.json(quizData);
  } catch (error) {
    return handleApiError(error, { route: '/api/quizzes/ai-generate', method: 'POST', userId: session?.user?.id });
  }
}
