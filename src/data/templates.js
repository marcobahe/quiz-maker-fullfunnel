// ── Quiz Templates Library ──────────────────────────────────────
// Each template is a complete quiz with realistic content.
// Nodes use the 'composite' type with elements, plus 'start' and 'result' nodes.

const edgeDefaults = {
  type: 'custom-bezier',
  animated: true,
  style: { stroke: '#7c3aed', strokeWidth: 2 },
};

function edge(id, source, target, sourceHandle = null) {
  return { id, source, target, sourceHandle, ...edgeDefaults };
}

const defaultSettings = {
  theme: {
    primaryColor: '#7c3aed',
    secondaryColor: '#5b21b6',
    backgroundColor: '#1e1b4b',
    backgroundType: 'gradient',
    backgroundGradient: 'from-purple-900 via-purple-800 to-indigo-900',
    textColor: '#ffffff',
    buttonStyle: 'rounded',
    fontFamily: 'Inter',
  },
  branding: {
    logoUrl: '',
    showBranding: true,
  },
};

// ═══════════════════════════════════════════════════════════════════
// 1. Captação de Leads (Lead Generation)
// ═══════════════════════════════════════════════════════════════════
const leadGenBasic = {
  id: 'lead-gen-basic',
  name: 'Captação de Leads',
  description: 'Quiz simples com 3 perguntas para captar e qualificar leads rapidamente.',
  category: 'Lead Generation',
  icon: '🎯',
  thumbnail: null,
  canvasData: {
    nodes: [
      {
        id: 'start',
        type: 'start',
        position: { x: 250, y: 0 },
        data: { label: 'Início' },
      },
      {
        id: 'q1',
        type: 'composite',
        position: { x: 150, y: 150 },
        data: {
          label: 'Interesse',
          elements: [
            { id: 'q1-text', type: 'text', content: 'Vamos descobrir como podemos te ajudar!', style: { fontSize: 18, fontWeight: '600', textColor: '#ffffff', alignment: 'center' } },
            {
              id: 'q1-question',
              type: 'question-single',
              question: 'Qual é o seu principal objetivo agora?',
              options: [
                { text: 'Aumentar minhas vendas', score: 10 },
                { text: 'Gerar mais leads', score: 8 },
                { text: 'Melhorar meu marketing', score: 6 },
                { text: 'Apenas conhecendo', score: 2 },
              ],
            },
          ],
        },
      },
      {
        id: 'q2',
        type: 'composite',
        position: { x: 150, y: 550 },
        data: {
          label: 'Porte',
          elements: [
            {
              id: 'q2-question',
              type: 'question-single',
              question: 'Qual o tamanho da sua empresa?',
              options: [
                { text: 'Sou autônomo / freelancer', score: 3 },
                { text: '2 a 10 funcionários', score: 6 },
                { text: '11 a 50 funcionários', score: 8 },
                { text: 'Mais de 50 funcionários', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'q3',
        type: 'composite',
        position: { x: 150, y: 950 },
        data: {
          label: 'Orçamento',
          elements: [
            {
              id: 'q3-question',
              type: 'question-single',
              question: 'Qual seu orçamento mensal para marketing?',
              options: [
                { text: 'Até R$ 1.000', score: 2 },
                { text: 'R$ 1.000 a R$ 5.000', score: 5 },
                { text: 'R$ 5.000 a R$ 20.000', score: 8 },
                { text: 'Acima de R$ 20.000', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'lead',
        type: 'composite',
        position: { x: 150, y: 1350 },
        data: {
          label: 'Formulário',
          elements: [
            { id: 'lead-text', type: 'text', content: 'Quase lá! Preencha seus dados para ver o resultado personalizado.' },
            { id: 'lead-form', type: 'lead-form', title: 'Seus dados', fields: ['name', 'email', 'phone'] },
          ],
        },
      },
      {
        id: 'result',
        type: 'result',
        position: { x: 200, y: 1750 },
        data: { title: 'Seu Plano Recomendado' },
      },
    ],
    edges: [
      edge('e-start-q1', 'start', 'q1'),
      edge('e-q1-q2', 'q1', 'q2'),
      edge('e-q2-q3', 'q2', 'q3'),
      edge('e-q3-lead', 'q3', 'lead'),
      edge('e-lead-result', 'lead', 'result'),
    ],
  },
  scoreRanges: [
    { id: 'sr-1', label: 'Lead Frio', min: 0, max: 10, description: 'Ainda em fase de exploração. Recomendamos nossos conteúdos gratuitos.' },
    { id: 'sr-2', label: 'Lead Morno', min: 11, max: 20, description: 'Bom potencial! Vamos agendar uma conversa para entender melhor suas necessidades.' },
    { id: 'sr-3', label: 'Lead Quente', min: 21, max: 30, description: 'Perfil ideal! Um consultor vai entrar em contato em até 24h.' },
  ],
  settings: { ...defaultSettings },
};

// ═══════════════════════════════════════════════════════════════════
// 2. Perfil de Investidor (Diagnóstico)
// ═══════════════════════════════════════════════════════════════════
const investorProfile = {
  id: 'investor-profile',
  name: 'Perfil de Investidor',
  description: 'Descubra se você é conservador, moderado ou arrojado com 5 perguntas sobre investimentos.',
  category: 'Diagnóstico',
  icon: '📊',
  thumbnail: null,
  canvasData: {
    nodes: [
      {
        id: 'start',
        type: 'start',
        position: { x: 250, y: 0 },
        data: { label: 'Início' },
      },
      {
        id: 'q1',
        type: 'composite',
        position: { x: 150, y: 150 },
        data: {
          label: 'Experiência',
          elements: [
            { id: 'ip-q1-text', type: 'text', content: 'Vamos descobrir seu perfil de investidor em 5 perguntas rápidas!', style: { fontSize: 18, fontWeight: '600', textColor: '#ffffff', alignment: 'center' } },
            {
              id: 'ip-q1-question',
              type: 'question-single',
              question: 'Há quanto tempo você investe?',
              options: [
                { text: 'Nunca investi', score: 1 },
                { text: 'Menos de 1 ano', score: 3 },
                { text: 'De 1 a 5 anos', score: 6 },
                { text: 'Mais de 5 anos', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'q2',
        type: 'composite',
        position: { x: 150, y: 550 },
        data: {
          label: 'Tolerância a Risco',
          elements: [
            {
              id: 'ip-q2-question',
              type: 'question-single',
              question: 'Se seus investimentos caíssem 20% em um mês, o que faria?',
              options: [
                { text: 'Venderia tudo imediatamente', score: 1 },
                { text: 'Venderia parte para reduzir risco', score: 4 },
                { text: 'Manteria e aguardaria recuperação', score: 7 },
                { text: 'Compraria mais aproveitando a queda', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'q3',
        type: 'composite',
        position: { x: 150, y: 950 },
        data: {
          label: 'Horizonte',
          elements: [
            {
              id: 'ip-q3-question',
              type: 'question-single',
              question: 'Qual seu horizonte de investimento?',
              options: [
                { text: 'Menos de 1 ano', score: 2 },
                { text: 'De 1 a 3 anos', score: 5 },
                { text: 'De 3 a 10 anos', score: 8 },
                { text: 'Mais de 10 anos', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'q4',
        type: 'composite',
        position: { x: 150, y: 1350 },
        data: {
          label: 'Conhecimento',
          elements: [
            {
              id: 'ip-q4-question',
              type: 'question-single',
              question: 'Qual tipo de investimento você conhece melhor?',
              options: [
                { text: 'Poupança e CDB', score: 2 },
                { text: 'Renda fixa (Tesouro, LCI, LCA)', score: 5 },
                { text: 'Fundos de investimento', score: 7 },
                { text: 'Ações e criptomoedas', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'q5',
        type: 'composite',
        position: { x: 150, y: 1750 },
        data: {
          label: 'Objetivo',
          elements: [
            {
              id: 'ip-q5-question',
              type: 'question-single',
              question: 'Qual é seu principal objetivo ao investir?',
              options: [
                { text: 'Proteger meu dinheiro da inflação', score: 2 },
                { text: 'Ter uma reserva de emergência', score: 4 },
                { text: 'Crescer meu patrimônio de forma estável', score: 7 },
                { text: 'Maximizar ganhos mesmo com volatilidade', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'result',
        type: 'result',
        position: { x: 200, y: 2150 },
        data: { title: 'Seu Perfil de Investidor' },
      },
    ],
    edges: [
      edge('e-start-q1', 'start', 'q1'),
      edge('e-q1-q2', 'q1', 'q2'),
      edge('e-q2-q3', 'q2', 'q3'),
      edge('e-q3-q4', 'q3', 'q4'),
      edge('e-q4-q5', 'q4', 'q5'),
      edge('e-q5-result', 'q5', 'result'),
    ],
  },
  scoreRanges: [
    { id: 'sr-1', label: 'Conservador', min: 0, max: 16, description: 'Você prioriza segurança e estabilidade. Recomendamos Renda Fixa, Tesouro Direto e CDBs de bancos sólidos.' },
    { id: 'sr-2', label: 'Moderado', min: 17, max: 35, description: 'Você equilibra segurança com crescimento. Uma carteira diversificada com renda fixa e variável é ideal para você.' },
    { id: 'sr-3', label: 'Arrojado', min: 36, max: 50, description: 'Você busca rentabilidade máxima e tolera oscilações. Ações, fundos multimercado e criptomoedas fazem seu estilo.' },
  ],
  settings: { ...defaultSettings },
};

// ═══════════════════════════════════════════════════════════════════
// 3. Diagnóstico de Marketing (Diagnóstico)
// ═══════════════════════════════════════════════════════════════════
const marketingDiag = {
  id: 'marketing-diagnostic',
  name: 'Diagnóstico de Marketing',
  description: 'Avalie a maturidade digital da sua empresa com 5 perguntas estratégicas.',
  category: 'Diagnóstico',
  icon: '📈',
  thumbnail: null,
  canvasData: {
    nodes: [
      {
        id: 'start',
        type: 'start',
        position: { x: 250, y: 0 },
        data: { label: 'Início' },
      },
      {
        id: 'q1',
        type: 'composite',
        position: { x: 150, y: 150 },
        data: {
          label: 'Presença Digital',
          elements: [
            { id: 'md-q1-text', type: 'text', content: 'Responda 5 perguntas e descubra o nível de maturidade digital do seu negócio!', style: { fontSize: 18, fontWeight: '600', textColor: '#ffffff', alignment: 'center' } },
            {
              id: 'md-q1-question',
              type: 'question-single',
              question: 'Sua empresa tem um site profissional e otimizado?',
              options: [
                { text: 'Não tenho site', score: 1 },
                { text: 'Tenho, mas está desatualizado', score: 3 },
                { text: 'Sim, mas sem SEO otimizado', score: 6 },
                { text: 'Sim, com SEO, blog e analytics', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'q2',
        type: 'composite',
        position: { x: 150, y: 550 },
        data: {
          label: 'Redes Sociais',
          elements: [
            {
              id: 'md-q2-question',
              type: 'question-single',
              question: 'Como está sua presença nas redes sociais?',
              options: [
                { text: 'Não tenho perfis ativos', score: 1 },
                { text: 'Posto de vez em quando, sem estratégia', score: 3 },
                { text: 'Posto regularmente mas sem métricas', score: 6 },
                { text: 'Tenho calendário editorial e monitoro métricas', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'q3',
        type: 'composite',
        position: { x: 150, y: 950 },
        data: {
          label: 'Tráfego Pago',
          elements: [
            {
              id: 'md-q3-question',
              type: 'question-single',
              question: 'Você investe em tráfego pago (Google Ads, Meta Ads)?',
              options: [
                { text: 'Nunca investi', score: 1 },
                { text: 'Já testei mas parei', score: 4 },
                { text: 'Invisto, mas sem profissional dedicado', score: 7 },
                { text: 'Invisto com equipe/agência e otimizo constantemente', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'q4',
        type: 'composite',
        position: { x: 150, y: 1350 },
        data: {
          label: 'Email Marketing',
          elements: [
            {
              id: 'md-q4-question',
              type: 'question-single',
              question: 'Você usa email marketing ou automação?',
              options: [
                { text: 'Não uso nenhum', score: 1 },
                { text: 'Mando emails esporádicos', score: 3 },
                { text: 'Tenho uma lista e mando newsletters', score: 6 },
                { text: 'Tenho funis automatizados com segmentação', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'q5',
        type: 'composite',
        position: { x: 150, y: 1750 },
        data: {
          label: 'Métricas',
          elements: [
            {
              id: 'md-q5-question',
              type: 'question-single',
              question: 'Como você acompanha os resultados do marketing?',
              options: [
                { text: 'Não acompanho nenhuma métrica', score: 1 },
                { text: 'Olho curtidas e seguidores', score: 3 },
                { text: 'Acompanho leads e conversões básicas', score: 7 },
                { text: 'Tenho dashboard com CAC, LTV, ROI e funil completo', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'result',
        type: 'result',
        position: { x: 200, y: 2150 },
        data: { title: 'Seu Nível de Maturidade Digital' },
      },
    ],
    edges: [
      edge('e-start-q1', 'start', 'q1'),
      edge('e-q1-q2', 'q1', 'q2'),
      edge('e-q2-q3', 'q2', 'q3'),
      edge('e-q3-q4', 'q3', 'q4'),
      edge('e-q4-q5', 'q4', 'q5'),
      edge('e-q5-result', 'q5', 'result'),
    ],
  },
  scoreRanges: [
    { id: 'sr-1', label: 'Iniciante', min: 0, max: 16, description: 'Seu marketing digital está nos primeiros passos. Hora de construir uma base sólida com site, redes sociais e uma estratégia clara.' },
    { id: 'sr-2', label: 'Intermediário', min: 17, max: 35, description: 'Você já tem presença digital, mas há muito espaço para otimizar. Foque em automação, métricas e tráfego pago.' },
    { id: 'sr-3', label: 'Avançado', min: 36, max: 50, description: 'Parabéns! Seu marketing digital é robusto. Continue otimizando com testes A/B, personalização e expansão de canais.' },
  ],
  settings: { ...defaultSettings },
};

// ═══════════════════════════════════════════════════════════════════
// 4. Quiz de Conhecimento (Educação)
// ═══════════════════════════════════════════════════════════════════
const knowledgeQuiz = {
  id: 'knowledge-quiz',
  name: 'Quiz de Conhecimento',
  description: 'Teste o conhecimento do seu público com perguntas de certo e errado e pontuação.',
  category: 'Educação',
  icon: '🧠',
  thumbnail: null,
  canvasData: {
    nodes: [
      {
        id: 'start',
        type: 'start',
        position: { x: 250, y: 0 },
        data: { label: 'Início' },
      },
      {
        id: 'q1',
        type: 'composite',
        position: { x: 150, y: 150 },
        data: {
          label: 'Pergunta 1 de 5',
          elements: [
            { id: 'kq-q1-text', type: 'text', content: 'Teste seus conhecimentos sobre Marketing Digital! 🚀', style: { fontSize: 18, fontWeight: '600', textColor: '#ffffff', alignment: 'center' } },
            {
              id: 'kq-q1-question',
              type: 'question-single',
              question: 'O que significa a sigla SEO?',
              options: [
                { text: '✅ Search Engine Optimization', score: 10, emoji: '✅' },
                { text: '❌ Social Engagement Online', score: 0, emoji: '❌' },
                { text: '❌ System for Electronic Operations', score: 0, emoji: '❌' },
              ],
            },
          ],
        },
      },
      {
        id: 'q2',
        type: 'composite',
        position: { x: 150, y: 550 },
        data: {
          label: 'Pergunta 2 de 5',
          elements: [
            {
              id: 'kq-q2-question',
              type: 'question-single',
              question: 'Qual métrica indica o custo para adquirir cada cliente?',
              options: [
                { text: '❌ LTV (Lifetime Value)', score: 0, emoji: '❌' },
                { text: '✅ CAC (Custo de Aquisição de Cliente)', score: 10, emoji: '✅' },
                { text: '❌ ROI (Retorno sobre Investimento)', score: 0, emoji: '❌' },
              ],
            },
          ],
        },
      },
      {
        id: 'q3',
        type: 'composite',
        position: { x: 150, y: 950 },
        data: {
          label: 'Pergunta 3 de 5',
          elements: [
            {
              id: 'kq-q3-question',
              type: 'question-single',
              question: 'Qual ferramenta é usada para automação de email marketing?',
              options: [
                { text: '❌ Canva', score: 0, emoji: '❌' },
                { text: '❌ Google Analytics', score: 0, emoji: '❌' },
                { text: '✅ Mailchimp / ActiveCampaign', score: 10, emoji: '✅' },
              ],
            },
          ],
        },
      },
      {
        id: 'q4',
        type: 'composite',
        position: { x: 150, y: 1350 },
        data: {
          label: 'Pergunta 4 de 5',
          elements: [
            {
              id: 'kq-q4-question',
              type: 'question-single',
              question: 'O que é um "lead magnet"?',
              options: [
                { text: '❌ Um tipo de anúncio no Google', score: 0, emoji: '❌' },
                { text: '✅ Um conteúdo gratuito oferecido em troca de dados do lead', score: 10, emoji: '✅' },
                { text: '❌ Uma ferramenta de análise de concorrentes', score: 0, emoji: '❌' },
              ],
            },
          ],
        },
      },
      {
        id: 'q5',
        type: 'composite',
        position: { x: 150, y: 1750 },
        data: {
          label: 'Pergunta 5 de 5',
          elements: [
            {
              id: 'kq-q5-question',
              type: 'question-single',
              question: 'Qual é a taxa média de abertura de emails no Brasil?',
              options: [
                { text: '❌ Cerca de 5%', score: 0, emoji: '❌' },
                { text: '✅ Cerca de 20%', score: 10, emoji: '✅' },
                { text: '❌ Cerca de 50%', score: 0, emoji: '❌' },
              ],
            },
          ],
        },
      },
      {
        id: 'result',
        type: 'result',
        position: { x: 200, y: 2150 },
        data: { title: 'Sua Pontuação' },
      },
    ],
    edges: [
      edge('e-start-q1', 'start', 'q1'),
      edge('e-q1-q2', 'q1', 'q2'),
      edge('e-q2-q3', 'q2', 'q3'),
      edge('e-q3-q4', 'q3', 'q4'),
      edge('e-q4-q5', 'q4', 'q5'),
      edge('e-q5-result', 'q5', 'result'),
    ],
  },
  scoreRanges: [
    { id: 'sr-1', label: 'Iniciante', min: 0, max: 20, description: 'Você está começando no marketing digital. Recomendamos estudar os fundamentos — temos conteúdos que podem ajudar!' },
    { id: 'sr-2', label: 'Intermediário', min: 21, max: 39, description: 'Bom conhecimento! Você já domina o básico. Hora de aprofundar em estratégias avançadas.' },
    { id: 'sr-3', label: 'Expert', min: 40, max: 50, description: 'Impressionante! Você domina marketing digital. Que tal aplicar esse conhecimento com nossas ferramentas?' },
  ],
  settings: { ...defaultSettings },
};

// ═══════════════════════════════════════════════════════════════════
// 5. Qual seu Estilo? (Personalidade)
// ═══════════════════════════════════════════════════════════════════
const styleQuiz = {
  id: 'style-quiz',
  name: 'Qual seu Estilo?',
  description: 'Quiz de personalidade com 4 perguntas que revela um dos 3 perfis de estilo do público.',
  category: 'Personalidade',
  icon: '✨',
  thumbnail: null,
  canvasData: {
    nodes: [
      {
        id: 'start',
        type: 'start',
        position: { x: 250, y: 0 },
        data: { label: 'Início' },
      },
      {
        id: 'q1',
        type: 'composite',
        position: { x: 150, y: 150 },
        data: {
          label: 'Rotina',
          elements: [
            { id: 'sq-q1-text', type: 'text', content: 'Descubra qual é o seu estilo! Responda com sinceridade 😊', style: { fontSize: 18, fontWeight: '600', textColor: '#ffffff', alignment: 'center' } },
            {
              id: 'sq-q1-question',
              type: 'question-single',
              question: 'Como é sua manhã ideal?',
              options: [
                { text: '🏋️ Acordo cedo, treino e planejo o dia', score: 10, emoji: '🏋️' },
                { text: '☕ Café tranquilo com um bom livro', score: 5, emoji: '☕' },
                { text: '😴 Durmo até tarde e improviso', score: 1, emoji: '😴' },
              ],
            },
          ],
        },
      },
      {
        id: 'q2',
        type: 'composite',
        position: { x: 150, y: 550 },
        data: {
          label: 'Trabalho',
          elements: [
            {
              id: 'sq-q2-question',
              type: 'question-single',
              question: 'Qual ambiente de trabalho te representa mais?',
              options: [
                { text: 'Escritório organizado com metas claras', score: 10 },
                { text: 'Café ou coworking com boa energia', score: 5 },
                { text: 'Home office de pijama, sem regras', score: 1 },
              ],
            },
          ],
        },
      },
      {
        id: 'q3',
        type: 'composite',
        position: { x: 150, y: 950 },
        data: {
          label: 'Lazer',
          elements: [
            {
              id: 'sq-q3-question',
              type: 'question-single',
              question: 'Como você prefere passar o fim de semana?',
              options: [
                { text: 'Evento de networking ou workshop', score: 10 },
                { text: 'Passeio cultural ou jantar com amigos', score: 5 },
                { text: 'Netflix e descanso total', score: 1 },
              ],
            },
          ],
        },
      },
      {
        id: 'q4',
        type: 'composite',
        position: { x: 150, y: 1350 },
        data: {
          label: 'Decisões',
          elements: [
            {
              id: 'sq-q4-question',
              type: 'question-single',
              question: 'Quando vai comprar algo novo, o que pesa mais?',
              options: [
                { text: 'Funcionalidade e custo-benefício', score: 10 },
                { text: 'Design e experiência', score: 5 },
                { text: 'Se está na promoção, levo!', score: 1 },
              ],
            },
          ],
        },
      },
      {
        id: 'result',
        type: 'result',
        position: { x: 200, y: 1750 },
        data: { title: 'Seu Estilo Revelado!' },
      },
    ],
    edges: [
      edge('e-start-q1', 'start', 'q1'),
      edge('e-q1-q2', 'q1', 'q2'),
      edge('e-q2-q3', 'q2', 'q3'),
      edge('e-q3-q4', 'q3', 'q4'),
      edge('e-q4-result', 'q4', 'result'),
    ],
  },
  scoreRanges: [
    { id: 'sr-1', label: 'Relaxado & Criativo', min: 0, max: 12, description: 'Você é descontraído e valoriza liberdade. Segue seu próprio ritmo e não se preocupa com convenções. Produtos práticos e sem frescura são a sua cara!' },
    { id: 'sr-2', label: 'Equilibrado & Social', min: 13, max: 27, description: 'Você mistura produtividade com prazer. Gosta de qualidade mas sem exagero. Experiências e bom design te atraem.' },
    { id: 'sr-3', label: 'Ambicioso & Organizado', min: 28, max: 40, description: 'Você é focado, produtivo e estratégico. Busca sempre o melhor e planeja cada passo. Ferramentas premium e eficientes combinam com você.' },
  ],
  settings: { ...defaultSettings },
};

// ═══════════════════════════════════════════════════════════════════
// 6. NPS / Satisfação (Feedback)
// ═══════════════════════════════════════════════════════════════════
const npsQuiz = {
  id: 'nps-satisfaction',
  name: 'NPS / Satisfação',
  description: 'Pesquisa de satisfação com 3 perguntas e formulário de contato para feedback detalhado.',
  category: 'Feedback',
  icon: '⭐',
  thumbnail: null,
  canvasData: {
    nodes: [
      {
        id: 'start',
        type: 'start',
        position: { x: 250, y: 0 },
        data: { label: 'Início' },
      },
      {
        id: 'q1',
        type: 'composite',
        position: { x: 150, y: 150 },
        data: {
          label: 'Recomendação',
          elements: [
            { id: 'nps-q1-text', type: 'text', content: 'Sua opinião é muito importante para nós! Leva menos de 1 minuto.', style: { fontSize: 18, fontWeight: '600', textColor: '#ffffff', alignment: 'center' } },
            {
              id: 'nps-q1-question',
              type: 'question-single',
              question: 'De 0 a 10, o quanto você recomendaria nosso produto/serviço?',
              options: [
                { text: '😞 0 a 3 — Não recomendaria', score: 1, emoji: '😞' },
                { text: '😐 4 a 6 — Talvez recomendaria', score: 5, emoji: '😐' },
                { text: '😊 7 a 8 — Provavelmente recomendaria', score: 7, emoji: '😊' },
                { text: '⭐ 9 a 10 — Com certeza recomendaria!', score: 10, emoji: '⭐' },
              ],
            },
          ],
        },
      },
      {
        id: 'q2',
        type: 'composite',
        position: { x: 150, y: 550 },
        data: {
          label: 'Experiência',
          elements: [
            {
              id: 'nps-q2-question',
              type: 'question-single',
              question: 'Como você avalia sua experiência geral conosco?',
              options: [
                { text: 'Péssima — tive muitos problemas', score: 1 },
                { text: 'Regular — atendeu parcialmente', score: 4 },
                { text: 'Boa — fiquei satisfeito', score: 7 },
                { text: 'Excelente — superou expectativas', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'q3',
        type: 'composite',
        position: { x: 150, y: 950 },
        data: {
          label: 'Melhoria',
          elements: [
            {
              id: 'nps-q3-question',
              type: 'question-single',
              question: 'O que podemos melhorar?',
              options: [
                { text: 'Atendimento ao cliente', score: 3 },
                { text: 'Qualidade do produto/serviço', score: 3 },
                { text: 'Preço e condições de pagamento', score: 3 },
                { text: 'Está tudo ótimo, não mudaria nada!', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'lead',
        type: 'composite',
        position: { x: 150, y: 1350 },
        data: {
          label: 'Contato',
          elements: [
            { id: 'nps-lead-text', type: 'text', content: 'Quer que entremos em contato? Deixe seus dados:' },
            { id: 'nps-lead-form', type: 'lead-form', title: 'Seus dados (opcional)', fields: ['name', 'email', 'phone'] },
          ],
        },
      },
      {
        id: 'result',
        type: 'result',
        position: { x: 200, y: 1750 },
        data: { title: 'Obrigado pelo seu Feedback!' },
      },
    ],
    edges: [
      edge('e-start-q1', 'start', 'q1'),
      edge('e-q1-q2', 'q1', 'q2'),
      edge('e-q2-q3', 'q2', 'q3'),
      edge('e-q3-lead', 'q3', 'lead'),
      edge('e-lead-result', 'lead', 'result'),
    ],
  },
  scoreRanges: [
    { id: 'sr-1', label: 'Detrator', min: 0, max: 10, description: 'Sentimos muito pela sua experiência. Vamos entrar em contato para resolver qualquer pendência.' },
    { id: 'sr-2', label: 'Neutro', min: 11, max: 20, description: 'Obrigado pelo feedback! Vamos trabalhar para tornar sua experiência ainda melhor.' },
    { id: 'sr-3', label: 'Promotor', min: 21, max: 30, description: 'Que ótimo saber que você está satisfeito! Obrigado por ser um cliente incrível. 🎉' },
  ],
  settings: { ...defaultSettings },
};

// ═══════════════════════════════════════════════════════════════════
// 7. Qualificação de Leads — BANT (Vendas)
// ═══════════════════════════════════════════════════════════════════
const bantQualification = {
  id: 'bant-qualification',
  name: 'Qualificação de Leads',
  description: 'Qualifique leads com a metodologia BANT: Budget, Authority, Need e Timeline.',
  category: 'Vendas',
  icon: '💰',
  thumbnail: null,
  canvasData: {
    nodes: [
      {
        id: 'start',
        type: 'start',
        position: { x: 250, y: 0 },
        data: { label: 'Início' },
      },
      {
        id: 'q1',
        type: 'composite',
        position: { x: 150, y: 150 },
        data: {
          label: 'Budget (Orçamento)',
          elements: [
            { id: 'bant-q1-text', type: 'text', content: 'Vamos entender melhor suas necessidades para oferecer a melhor solução!', style: { fontSize: 18, fontWeight: '600', textColor: '#ffffff', alignment: 'center' } },
            {
              id: 'bant-q1-question',
              type: 'question-single',
              question: 'Qual orçamento você tem disponível para esta solução?',
              options: [
                { text: 'Ainda não tenho orçamento definido', score: 2 },
                { text: 'Até R$ 5.000/mês', score: 5 },
                { text: 'R$ 5.000 a R$ 20.000/mês', score: 8 },
                { text: 'Acima de R$ 20.000/mês', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'q2',
        type: 'composite',
        position: { x: 150, y: 550 },
        data: {
          label: 'Authority (Autoridade)',
          elements: [
            {
              id: 'bant-q2-question',
              type: 'question-single',
              question: 'Qual é seu papel na decisão de compra?',
              options: [
                { text: 'Estou apenas pesquisando', score: 2 },
                { text: 'Influencio a decisão mas não decido', score: 5 },
                { text: 'Sou um dos decisores', score: 8 },
                { text: 'Sou o decisor final', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'q3',
        type: 'composite',
        position: { x: 150, y: 950 },
        data: {
          label: 'Need (Necessidade)',
          elements: [
            {
              id: 'bant-q3-question',
              type: 'question-single',
              question: 'Qual o principal desafio que você precisa resolver?',
              options: [
                { text: 'Curiosidade, sem problema urgente', score: 2 },
                { text: 'Tenho uma dor mas não é prioridade agora', score: 4 },
                { text: 'Preciso resolver nos próximos meses', score: 7 },
                { text: 'É urgente, preciso de solução imediata', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'q4',
        type: 'composite',
        position: { x: 150, y: 1350 },
        data: {
          label: 'Timeline (Prazo)',
          elements: [
            {
              id: 'bant-q4-question',
              type: 'question-single',
              question: 'Quando você pretende implementar uma solução?',
              options: [
                { text: 'Sem prazo definido', score: 2 },
                { text: 'Nos próximos 6 meses', score: 5 },
                { text: 'Nos próximos 3 meses', score: 8 },
                { text: 'Este mês / imediato', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'lead',
        type: 'composite',
        position: { x: 150, y: 1750 },
        data: {
          label: 'Dados do Lead',
          elements: [
            { id: 'bant-lead-text', type: 'text', content: 'Preencha seus dados e receba nossa proposta personalizada:' },
            { id: 'bant-lead-form', type: 'lead-form', title: 'Seus dados', fields: ['name', 'email', 'phone'] },
          ],
        },
      },
      {
        id: 'result',
        type: 'result',
        position: { x: 200, y: 2150 },
        data: { title: 'Resultado da Qualificação' },
      },
    ],
    edges: [
      edge('e-start-q1', 'start', 'q1'),
      edge('e-q1-q2', 'q1', 'q2'),
      edge('e-q2-q3', 'q2', 'q3'),
      edge('e-q3-q4', 'q3', 'q4'),
      edge('e-q4-lead', 'q4', 'lead'),
      edge('e-lead-result', 'lead', 'result'),
    ],
  },
  scoreRanges: [
    { id: 'sr-1', label: 'Lead Frio', min: 0, max: 14, description: 'Obrigado pelo interesse! Vamos manter contato por email com conteúdos relevantes para quando estiver pronto.' },
    { id: 'sr-2', label: 'Lead Morno', min: 15, max: 28, description: 'Bom potencial! Preparamos uma proposta sob medida para você. Confira seu email.' },
    { id: 'sr-3', label: 'Lead Quente', min: 29, max: 40, description: 'Match perfeito! Um especialista entrará em contato nas próximas 2 horas para apresentar a melhor solução.' },
  ],
  settings: { ...defaultSettings },
};

// ═══════════════════════════════════════════════════════════════════
// 8. Onboarding (Produto)
// ═══════════════════════════════════════════════════════════════════
const onboardingQuiz = {
  id: 'onboarding',
  name: 'Onboarding',
  description: 'Conheça seu novo usuário com 4 perguntas e personalize a experiência inicial.',
  category: 'Produto',
  icon: '🚀',
  thumbnail: null,
  canvasData: {
    nodes: [
      {
        id: 'start',
        type: 'start',
        position: { x: 250, y: 0 },
        data: { label: 'Início' },
      },
      {
        id: 'q1',
        type: 'composite',
        position: { x: 150, y: 150 },
        data: {
          label: 'Boas-vindas',
          elements: [
            { id: 'ob-q1-text', type: 'text', content: 'Bem-vindo! Vamos personalizar sua experiência. Leva menos de 1 minuto! 🎉', style: { fontSize: 18, fontWeight: '600', textColor: '#ffffff', alignment: 'center' } },
            {
              id: 'ob-q1-question',
              type: 'question-single',
              question: 'Qual é seu principal objetivo com nossa plataforma?',
              options: [
                { text: 'Gerar leads para meu negócio', score: 10 },
                { text: 'Engajar minha audiência', score: 7 },
                { text: 'Fazer pesquisas e coletar dados', score: 5 },
                { text: 'Estou testando por curiosidade', score: 2 },
              ],
            },
          ],
        },
      },
      {
        id: 'q2',
        type: 'composite',
        position: { x: 150, y: 550 },
        data: {
          label: 'Experiência',
          elements: [
            {
              id: 'ob-q2-question',
              type: 'question-single',
              question: 'Você já criou quizzes ou pesquisas antes?',
              options: [
                { text: 'Nunca, sou totalmente iniciante', score: 2 },
                { text: 'Já usei formulários simples (Google Forms)', score: 5 },
                { text: 'Já usei ferramentas específicas de quiz', score: 8 },
                { text: 'Sou expert, uso quizzes profissionalmente', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'q3',
        type: 'composite',
        position: { x: 150, y: 950 },
        data: {
          label: 'Tamanho',
          elements: [
            {
              id: 'ob-q3-question',
              type: 'question-single',
              question: 'Qual o tamanho da sua audiência?',
              options: [
                { text: 'Estou começando (menos de 1.000)', score: 3 },
                { text: '1.000 a 10.000 pessoas', score: 5 },
                { text: '10.000 a 100.000 pessoas', score: 8 },
                { text: 'Mais de 100.000 pessoas', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'q4',
        type: 'composite',
        position: { x: 150, y: 1350 },
        data: {
          label: 'Integrações',
          elements: [
            {
              id: 'ob-q4-question',
              type: 'question-single',
              question: 'Quais ferramentas você já usa no seu negócio?',
              options: [
                { text: 'Nenhuma ferramenta específica', score: 2 },
                { text: 'Email marketing (Mailchimp, etc.)', score: 5 },
                { text: 'CRM (HubSpot, Salesforce, etc.)', score: 8 },
                { text: 'Stack completa (CRM + Email + Analytics)', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'result',
        type: 'result',
        position: { x: 200, y: 1750 },
        data: { title: 'Sua Experiência Personalizada' },
      },
    ],
    edges: [
      edge('e-start-q1', 'start', 'q1'),
      edge('e-q1-q2', 'q1', 'q2'),
      edge('e-q2-q3', 'q2', 'q3'),
      edge('e-q3-q4', 'q3', 'q4'),
      edge('e-q4-result', 'q4', 'result'),
    ],
  },
  scoreRanges: [
    { id: 'sr-1', label: 'Plano Starter', min: 0, max: 14, description: 'Recomendamos começar com nosso tutorial guiado e templates prontos. Você terá um quiz publicado em menos de 5 minutos!' },
    { id: 'sr-2', label: 'Plano Growth', min: 15, max: 28, description: 'Você já tem base para crescer! Ative as integrações e use nossos templates avançados para escalar seus resultados.' },
    { id: 'sr-3', label: 'Plano Pro', min: 29, max: 40, description: 'Você é um power user! Desbloqueamos recursos avançados: webhooks, API, white-label e analytics pro.' },
  ],
  settings: { ...defaultSettings },
};

// ═══════════════════════════════════════════════════════════════════
// 9. Calculadora de ROI (Vendas)
// ═══════════════════════════════════════════════════════════════════
const roiCalculator = {
  id: 'roi-calculator',
  name: 'Calculadora de ROI',
  description: 'Calcule o ROI do seu investimento em marketing com 3 perguntas estratégicas.',
  category: 'Vendas',
  icon: '📊',
  thumbnail: null,
  canvasData: {
    nodes: [
      {
        id: 'start',
        type: 'start',
        position: { x: 250, y: 0 },
        data: { label: 'Início' },
      },
      {
        id: 'q1',
        type: 'composite',
        position: { x: 150, y: 150 },
        data: {
          label: 'Investimento Atual',
          elements: [
            { id: 'roi-q1-text', type: 'text', content: 'Calcule o ROI potencial do seu investimento em marketing! 💰', style: { fontSize: 18, fontWeight: '600', textColor: '#ffffff', alignment: 'center' } },
            {
              id: 'roi-q1-question',
              type: 'question-single',
              question: 'Quanto você investe mensalmente em marketing?',
              options: [
                { text: 'Até R$ 2.000/mês', score: 2 },
                { text: 'R$ 2.000 a R$ 10.000/mês', score: 5 },
                { text: 'R$ 10.000 a R$ 50.000/mês', score: 8 },
                { text: 'Acima de R$ 50.000/mês', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'q2',
        type: 'composite',
        position: { x: 150, y: 550 },
        data: {
          label: 'Leads Mensais',
          elements: [
            {
              id: 'roi-q2-question',
              type: 'question-single',
              question: 'Quantos leads qualificados você gera por mês?',
              options: [
                { text: 'Menos de 50 leads', score: 2 },
                { text: '50 a 200 leads', score: 5 },
                { text: '200 a 1.000 leads', score: 8 },
                { text: 'Mais de 1.000 leads', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'q3',
        type: 'composite',
        position: { x: 150, y: 950 },
        data: {
          label: 'Taxa de Conversão',
          elements: [
            {
              id: 'roi-q3-question',
              type: 'question-single',
              question: 'Qual sua taxa de conversão de leads para vendas?',
              options: [
                { text: 'Menos de 2%', score: 2 },
                { text: '2% a 5%', score: 5 },
                { text: '5% a 15%', score: 8 },
                { text: 'Acima de 15%', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'cta-button',
        type: 'composite',
        position: { x: 150, y: 1350 },
        data: {
          label: 'Resultado',
          elements: [
            { id: 'roi-cta-text', type: 'text', content: 'Baseado nas suas respostas, calculamos seu potencial de ROI! Clique no botão abaixo para ver a análise completa:' },
            { 
              id: 'roi-cta-button', 
              type: 'button', 
              text: 'Ver Minha Análise de ROI',
              action: 'url',
              url: '#resultado'
            },
          ],
        },
      },
      {
        id: 'result',
        type: 'result',
        position: { x: 200, y: 1750 },
        data: { title: 'Seu Potencial de ROI' },
      },
    ],
    edges: [
      edge('e-start-q1', 'start', 'q1'),
      edge('e-q1-q2', 'q1', 'q2'),
      edge('e-q2-q3', 'q2', 'q3'),
      edge('e-q3-cta', 'q3', 'cta-button'),
      edge('e-cta-result', 'cta-button', 'result'),
    ],
  },
  scoreRanges: [
    { id: 'sr-1', label: 'ROI Inicial', min: 0, max: 12, description: 'Você está no início da jornada. Com otimizações estratégicas, podemos aumentar seu ROI em até 200%!' },
    { id: 'sr-2', label: 'ROI Moderado', min: 13, max: 24, description: 'Bom desempenho! Com automações e funis otimizados, há potencial para dobrar seus resultados.' },
    { id: 'sr-3', label: 'ROI Avançado', min: 25, max: 30, description: 'Excelente performance! Você pode escalar ainda mais com IA, personalização e canais premium.' },
  ],
  settings: { ...defaultSettings },
};

// ═══════════════════════════════════════════════════════════════════
// ── NICHO: INFOPRODUTO ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
const infoprodutoDiag = {
  id: 'infoproduto-diagnostico',
  name: 'Diagnóstico do Infoprodutor',
  description: 'Descubra o estágio do seu negócio digital e receba um plano de ação personalizado para escalar.',
  category: 'Infoproduto',
  icon: '🎓',
  thumbnail: null,
  canvasData: {
    nodes: [
      { id: 'start', type: 'start', position: { x: 250, y: 0 }, data: { label: 'Início' } },
      {
        id: 'ip-q1', type: 'composite', position: { x: 150, y: 150 },
        data: {
          label: 'Seu Negócio',
          elements: [
            { id: 'ip-q1-text', type: 'text', content: 'Descubra em qual estágio seu negócio digital está e o que fazer pra crescer! 🚀', style: { fontSize: 18, fontWeight: '600', textColor: '#ffffff', alignment: 'center' } },
            { id: 'ip-q1-q', type: 'question-single', question: 'Qual é o seu modelo de negócio principal?', options: [
              { text: 'Ainda não vendo nada, estou criando conteúdo', score: 2 },
              { text: 'Vendo serviços/mentoria individual', score: 5 },
              { text: 'Tenho um ou mais cursos online', score: 8 },
              { text: 'Tenho cursos + comunidade + funil estruturado', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'ip-q2', type: 'composite', position: { x: 150, y: 550 },
        data: {
          label: 'Faturamento',
          elements: [
            { id: 'ip-q2-q', type: 'question-single', question: 'Qual sua faixa de faturamento mensal atual?', options: [
              { text: 'Ainda não faturei', score: 1 },
              { text: 'Até R$ 5.000/mês', score: 4 },
              { text: 'R$ 5.000 a R$ 30.000/mês', score: 7 },
              { text: 'Acima de R$ 30.000/mês', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'ip-q3', type: 'composite', position: { x: 150, y: 950 },
        data: {
          label: 'Audiência',
          elements: [
            { id: 'ip-q3-q', type: 'question-single', question: 'Qual o tamanho da sua audiência somando todas as plataformas?', options: [
              { text: 'Menos de 1.000 seguidores/contatos', score: 2 },
              { text: '1.000 a 10.000', score: 5 },
              { text: '10.000 a 100.000', score: 8 },
              { text: 'Mais de 100.000', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'ip-q4', type: 'composite', position: { x: 150, y: 1350 },
        data: {
          label: 'Funil',
          elements: [
            { id: 'ip-q4-q', type: 'question-single', question: 'Como você capta leads hoje?', options: [
              { text: 'Boca a boca / orgânico só', score: 2 },
              { text: 'Tenho página de captura mas sem automação', score: 5 },
              { text: 'Funil com e-mail marketing ativo', score: 8 },
              { text: 'Funil completo com tráfego pago + e-mail + quiz', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'ip-lead', type: 'composite', position: { x: 150, y: 1750 },
        data: {
          label: 'Seus Dados',
          elements: [
            { id: 'ip-lead-text', type: 'text', content: 'Quase lá! Preencha seus dados para receber seu diagnóstico personalizado:' },
            { id: 'ip-lead-form', type: 'lead-form', title: 'Seus dados', fields: ['name', 'email', 'phone'] },
          ],
        },
      },
      { id: 'result', type: 'result', position: { x: 200, y: 2150 }, data: { title: 'Seu Diagnóstico Digital' } },
    ],
    edges: [
      edge('e-start-ip-q1', 'start', 'ip-q1'),
      edge('e-ip-q1-q2', 'ip-q1', 'ip-q2'),
      edge('e-ip-q2-q3', 'ip-q2', 'ip-q3'),
      edge('e-ip-q3-q4', 'ip-q3', 'ip-q4'),
      edge('e-ip-q4-lead', 'ip-q4', 'ip-lead'),
      edge('e-ip-lead-result', 'ip-lead', 'result'),
    ],
  },
  scoreRanges: [
    { id: 'sr-1', label: 'Iniciante Digital', min: 0, max: 14, description: 'Você está construindo as bases. Foque em validar uma oferta, criar sua lista e publicar seu primeiro produto digital.' },
    { id: 'sr-2', label: 'Em Crescimento', min: 15, max: 28, description: 'Você já tem resultados! Hora de estruturar seu funil, investir em tráfego pago e lançar produtos de ticket maior.' },
    { id: 'sr-3', label: 'Negócio Escalável', min: 29, max: 40, description: 'Seu negócio digital é sólido! Agora é escalar com comunidade, produtos de recorrência e expansão de audiência.' },
  ],
  settings: { ...defaultSettings },
};

// ═══════════════════════════════════════════════════════════════════
// ── NICHO: E-COMMERCE ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
const ecommerceRecomendacao = {
  id: 'ecommerce-recomendacao',
  name: 'Qual Produto é Ideal pra Você?',
  description: 'Recomende o produto certo para cada cliente com 4 perguntas sobre estilo e necessidades.',
  category: 'E-commerce',
  icon: '🛍️',
  thumbnail: null,
  canvasData: {
    nodes: [
      { id: 'start', type: 'start', position: { x: 250, y: 0 }, data: { label: 'Início' } },
      {
        id: 'ec-q1', type: 'composite', position: { x: 150, y: 150 },
        data: {
          label: 'Perfil',
          elements: [
            { id: 'ec-q1-text', type: 'text', content: 'Vamos encontrar o produto perfeito pra você em 4 perguntas! ✨', style: { fontSize: 18, fontWeight: '600', textColor: '#ffffff', alignment: 'center' } },
            { id: 'ec-q1-q', type: 'question-single', question: 'Como você descreveria seu estilo de vida?', options: [
              { text: '🏃 Ativo e esportivo', score: 10 },
              { text: '💼 Profissional e executivo', score: 7 },
              { text: '🎨 Criativo e despojado', score: 5 },
              { text: '🏠 Caseiro e confortável', score: 3 },
            ]},
          ],
        },
      },
      {
        id: 'ec-q2', type: 'composite', position: { x: 150, y: 550 },
        data: {
          label: 'Prioridade',
          elements: [
            { id: 'ec-q2-q', type: 'question-single', question: 'O que é mais importante pra você em uma compra?', options: [
              { text: 'Qualidade e durabilidade', score: 10 },
              { text: 'Design e estética', score: 7 },
              { text: 'Custo-benefício', score: 5 },
              { text: 'Praticidade e funcionalidade', score: 3 },
            ]},
          ],
        },
      },
      {
        id: 'ec-q3', type: 'composite', position: { x: 150, y: 950 },
        data: {
          label: 'Orçamento',
          elements: [
            { id: 'ec-q3-q', type: 'question-single', question: 'Qual seu orçamento para esta compra?', options: [
              { text: 'Até R$ 100', score: 2 },
              { text: 'R$ 100 a R$ 300', score: 5 },
              { text: 'R$ 300 a R$ 700', score: 8 },
              { text: 'Acima de R$ 700', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'ec-q4', type: 'composite', position: { x: 150, y: 1350 },
        data: {
          label: 'Uso',
          elements: [
            { id: 'ec-q4-q', type: 'question-single', question: 'Para qual ocasião você está comprando?', options: [
              { text: 'Uso diário / rotina', score: 5 },
              { text: 'Trabalho e reuniões', score: 8 },
              { text: 'Presente para alguém especial', score: 7 },
              { text: 'Ocasião especial ou evento', score: 10 },
            ]},
          ],
        },
      },
      { id: 'result', type: 'result', position: { x: 200, y: 1750 }, data: { title: 'Sua Recomendação Personalizada' } },
    ],
    edges: [
      edge('e-start-ec-q1', 'start', 'ec-q1'),
      edge('e-ec-q1-q2', 'ec-q1', 'ec-q2'),
      edge('e-ec-q2-q3', 'ec-q2', 'ec-q3'),
      edge('e-ec-q3-q4', 'ec-q3', 'ec-q4'),
      edge('e-ec-q4-result', 'ec-q4', 'result'),
    ],
  },
  scoreRanges: [
    { id: 'sr-1', label: 'Linha Essencial', min: 0, max: 16, description: 'Você valoriza o básico bem feito. Nossa linha Essencial tem tudo que você precisa com ótimo custo-benefício. Veja as opções!' },
    { id: 'sr-2', label: 'Linha Premium', min: 17, max: 28, description: 'Você busca qualidade e bom design. Nossa linha Premium vai te surpreender. Confira as peças selecionadas para o seu perfil!' },
    { id: 'sr-3', label: 'Linha Exclusiva', min: 29, max: 40, description: 'Você não abre mão do melhor! Nossa linha Exclusiva foi feita pra quem, como você, valoriza o que há de mais especial. Conheça!' },
  ],
  settings: { ...defaultSettings },
};

// ═══════════════════════════════════════════════════════════════════
// ── NICHO: AGÊNCIA ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
const agenciaDiag = {
  id: 'agencia-diagnostico',
  name: 'Diagnóstico: Sua Empresa Precisa de Agência?',
  description: 'Quiz de qualificação para captar empresas prontas para contratar serviços de marketing.',
  category: 'Agência',
  icon: '🏢',
  thumbnail: null,
  canvasData: {
    nodes: [
      { id: 'start', type: 'start', position: { x: 250, y: 0 }, data: { label: 'Início' } },
      {
        id: 'ag-q1', type: 'composite', position: { x: 150, y: 150 },
        data: {
          label: 'Situação Atual',
          elements: [
            { id: 'ag-q1-text', type: 'text', content: 'Descubra se sua empresa está pronta para escalar com uma agência de marketing! 📈', style: { fontSize: 18, fontWeight: '600', textColor: '#ffffff', alignment: 'center' } },
            { id: 'ag-q1-q', type: 'question-single', question: 'Como está o marketing digital da sua empresa hoje?', options: [
              { text: 'Não temos nenhuma estratégia digital', score: 3 },
              { text: 'Fazemos por conta mas sem resultados consistentes', score: 6 },
              { text: 'Temos resultados mas queremos escalar', score: 9 },
              { text: 'Já temos agência mas queremos mudar', score: 8 },
            ]},
          ],
        },
      },
      {
        id: 'ag-q2', type: 'composite', position: { x: 150, y: 550 },
        data: {
          label: 'Investimento',
          elements: [
            { id: 'ag-q2-q', type: 'question-single', question: 'Qual orçamento mensal sua empresa tem para marketing?', options: [
              { text: 'Menos de R$ 3.000/mês', score: 3 },
              { text: 'R$ 3.000 a R$ 10.000/mês', score: 6 },
              { text: 'R$ 10.000 a R$ 30.000/mês', score: 9 },
              { text: 'Acima de R$ 30.000/mês', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'ag-q3', type: 'composite', position: { x: 150, y: 950 },
        data: {
          label: 'Urgência',
          elements: [
            { id: 'ag-q3-q', type: 'question-single', question: 'Qual é a principal dor que você quer resolver?', options: [
              { text: 'Aumentar o número de clientes novos', score: 9 },
              { text: 'Melhorar a presença nas redes sociais', score: 6 },
              { text: 'Reduzir o custo por lead (CPL)', score: 8 },
              { text: 'Profissionalizar a comunicação da marca', score: 7 },
            ]},
          ],
        },
      },
      {
        id: 'ag-q4', type: 'composite', position: { x: 150, y: 1350 },
        data: {
          label: 'Prazo',
          elements: [
            { id: 'ag-q4-q', type: 'question-single', question: 'Em quanto tempo você quer ver resultados?', options: [
              { text: 'Sem pressa, quero fazer com calma', score: 3 },
              { text: 'Em até 6 meses', score: 6 },
              { text: 'Em até 3 meses', score: 9 },
              { text: 'O mais rápido possível, é urgente', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'ag-lead', type: 'composite', position: { x: 150, y: 1750 },
        data: {
          label: 'Dados da Empresa',
          elements: [
            { id: 'ag-lead-text', type: 'text', content: 'Excelente! Preencha os dados abaixo para receber uma proposta personalizada:' },
            { id: 'ag-lead-form', type: 'lead-form', title: 'Dados da empresa', fields: ['name', 'email', 'phone'] },
          ],
        },
      },
      { id: 'result', type: 'result', position: { x: 200, y: 2150 }, data: { title: 'Análise da Sua Empresa' } },
    ],
    edges: [
      edge('e-start-ag-q1', 'start', 'ag-q1'),
      edge('e-ag-q1-q2', 'ag-q1', 'ag-q2'),
      edge('e-ag-q2-q3', 'ag-q2', 'ag-q3'),
      edge('e-ag-q3-q4', 'ag-q3', 'ag-q4'),
      edge('e-ag-q4-lead', 'ag-q4', 'ag-lead'),
      edge('e-ag-lead-result', 'ag-lead', 'result'),
    ],
  },
  scoreRanges: [
    { id: 'sr-1', label: 'Momento de Estruturar', min: 0, max: 16, description: 'Antes de contratar uma agência, é importante ter as bases do negócio definidas. Enviamos um guia gratuito para você dar os primeiros passos.' },
    { id: 'sr-2', label: 'Pronto para Crescer', min: 17, max: 28, description: 'Sua empresa tem estrutura para trabalhar com uma agência! Vamos agendar uma conversa para entender seus objetivos e montar uma estratégia sob medida.' },
    { id: 'sr-3', label: 'Match Ideal', min: 29, max: 40, description: 'Sua empresa é o perfil que buscamos! Nosso time vai entrar em contato em até 2 horas com uma proposta exclusiva para escalar seus resultados.' },
  ],
  settings: { ...defaultSettings },
};

// ═══════════════════════════════════════════════════════════════════
// ── NICHO: SAÚDE & BEM-ESTAR ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
const saudePerfil = {
  id: 'saude-perfil',
  name: 'Qual é o Seu Perfil de Saúde?',
  description: 'Descubra seu estilo de vida e receba recomendações personalizadas de saúde e bem-estar.',
  category: 'Saúde & Bem-Estar',
  icon: '💪',
  thumbnail: null,
  canvasData: {
    nodes: [
      { id: 'start', type: 'start', position: { x: 250, y: 0 }, data: { label: 'Início' } },
      {
        id: 'sb-q1', type: 'composite', position: { x: 150, y: 150 },
        data: {
          label: 'Rotina',
          elements: [
            { id: 'sb-q1-text', type: 'text', content: 'Descubra seu perfil de saúde e bem-estar com 5 perguntas rápidas! 🌿', style: { fontSize: 18, fontWeight: '600', textColor: '#ffffff', alignment: 'center' } },
            { id: 'sb-q1-q', type: 'question-single', question: 'Quantas vezes por semana você se exercita?', options: [
              { text: 'Não me exercito', score: 1 },
              { text: '1 a 2 vezes', score: 4 },
              { text: '3 a 4 vezes', score: 7 },
              { text: '5 vezes ou mais', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'sb-q2', type: 'composite', position: { x: 150, y: 550 },
        data: {
          label: 'Alimentação',
          elements: [
            { id: 'sb-q2-q', type: 'question-single', question: 'Como você descreveria sua alimentação?', options: [
              { text: 'Como qualquer coisa, sem preocupação', score: 1 },
              { text: 'Tento me alimentar bem mas não sempre', score: 4 },
              { text: 'Sigo uma dieta equilibrada na maioria dos dias', score: 7 },
              { text: 'Alimentação limpa e planejada', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'sb-q3', type: 'composite', position: { x: 150, y: 950 },
        data: {
          label: 'Sono',
          elements: [
            { id: 'sb-q3-q', type: 'question-single', question: 'Como está a qualidade do seu sono?', options: [
              { text: 'Durmo mal, acordo cansado(a)', score: 1 },
              { text: 'Durmo irregular, às vezes bem às vezes mal', score: 4 },
              { text: 'Durmo bem na maioria das noites', score: 7 },
              { text: 'Sono excelente, acordo renovado(a)', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'sb-q4', type: 'composite', position: { x: 150, y: 1350 },
        data: {
          label: 'Estresse',
          elements: [
            { id: 'sb-q4-q', type: 'question-single', question: 'Como você lida com o estresse do dia a dia?', options: [
              { text: 'Estou constantemente estressado(a)', score: 1 },
              { text: 'Tenho momentos difíceis mas consigo lidar', score: 5 },
              { text: 'Pratico meditação ou técnicas de relaxamento', score: 8 },
              { text: 'Gerencio bem o estresse com rotinas saudáveis', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'sb-q5', type: 'composite', position: { x: 150, y: 1750 },
        data: {
          label: 'Objetivo',
          elements: [
            { id: 'sb-q5-q', type: 'question-single', question: 'Qual é o seu principal objetivo de saúde agora?', options: [
              { text: 'Emagrecer e melhorar o corpo', score: 7 },
              { text: 'Ter mais energia e disposição', score: 8 },
              { text: 'Reduzir estresse e melhorar o sono', score: 6 },
              { text: 'Manter a saúde em dia preventivamente', score: 10 },
            ]},
          ],
        },
      },
      { id: 'result', type: 'result', position: { x: 200, y: 2150 }, data: { title: 'Seu Perfil de Saúde' } },
    ],
    edges: [
      edge('e-start-sb-q1', 'start', 'sb-q1'),
      edge('e-sb-q1-q2', 'sb-q1', 'sb-q2'),
      edge('e-sb-q2-q3', 'sb-q2', 'sb-q3'),
      edge('e-sb-q3-q4', 'sb-q3', 'sb-q4'),
      edge('e-sb-q4-q5', 'sb-q4', 'sb-q5'),
      edge('e-sb-q5-result', 'sb-q5', 'result'),
    ],
  },
  scoreRanges: [
    { id: 'sr-1', label: 'Iniciando a Jornada', min: 0, max: 17, description: 'Você ainda está começando a cuidar da saúde. Pequenas mudanças fazem grande diferença — nossa equipe pode te ajudar a dar o primeiro passo!' },
    { id: 'sr-2', label: 'No Caminho Certo', min: 18, max: 35, description: 'Você já tem bons hábitos mas há espaço para evoluir! Com o suporte certo, você vai atingir seus objetivos muito mais rápido.' },
    { id: 'sr-3', label: 'Estilo de Vida Saudável', min: 36, max: 50, description: 'Parabéns! Você já vive de forma saudável. Nossos produtos premium vão potencializar ainda mais seus resultados.' },
  ],
  settings: { ...defaultSettings },
};

// ═══════════════════════════════════════════════════════════════════
// ── NICHO: EDUCAÇÃO ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
const educacaoCurso = {
  id: 'educacao-curso-ideal',
  name: 'Qual Curso é Ideal pra Você?',
  description: 'Recomende o curso ou trilha de aprendizado certa com base nos objetivos do aluno.',
  category: 'Educação',
  icon: '📚',
  thumbnail: null,
  canvasData: {
    nodes: [
      { id: 'start', type: 'start', position: { x: 250, y: 0 }, data: { label: 'Início' } },
      {
        id: 'ed-q1', type: 'composite', position: { x: 150, y: 150 },
        data: {
          label: 'Objetivo',
          elements: [
            { id: 'ed-q1-text', type: 'text', content: 'Vamos encontrar o curso perfeito para os seus objetivos! Responda 4 perguntas rápidas 🎯', style: { fontSize: 18, fontWeight: '600', textColor: '#ffffff', alignment: 'center' } },
            { id: 'ed-q1-q', type: 'question-single', question: 'Qual é o seu principal objetivo ao estudar?', options: [
              { text: 'Conseguir meu primeiro emprego na área', score: 3 },
              { text: 'Mudar de carreira', score: 6 },
              { text: 'Me aprofundar em algo que já sei', score: 8 },
              { text: 'Empreender ou ter mais autonomia profissional', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'ed-q2', type: 'composite', position: { x: 150, y: 550 },
        data: {
          label: 'Nível',
          elements: [
            { id: 'ed-q2-q', type: 'question-single', question: 'Qual é o seu nível de conhecimento no tema?', options: [
              { text: 'Zero — estou começando do zero', score: 2 },
              { text: 'Básico — conheço o essencial', score: 5 },
              { text: 'Intermediário — já tenho alguma experiência', score: 8 },
              { text: 'Avançado — quero especialização', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'ed-q3', type: 'composite', position: { x: 150, y: 950 },
        data: {
          label: 'Disponibilidade',
          elements: [
            { id: 'ed-q3-q', type: 'question-single', question: 'Quanto tempo por semana você tem para estudar?', options: [
              { text: 'Menos de 2 horas', score: 2 },
              { text: '2 a 5 horas', score: 5 },
              { text: '5 a 10 horas', score: 8 },
              { text: 'Mais de 10 horas', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'ed-q4', type: 'composite', position: { x: 150, y: 1350 },
        data: {
          label: 'Formato',
          elements: [
            { id: 'ed-q4-q', type: 'question-single', question: 'Qual formato de aprendizado você prefere?', options: [
              { text: 'Videoaulas no meu ritmo', score: 7 },
              { text: 'Aulas ao vivo com professor', score: 9 },
              { text: 'Projetos práticos e mão na massa', score: 10 },
              { text: 'Leitura e materiais escritos', score: 5 },
            ]},
          ],
        },
      },
      {
        id: 'ed-lead', type: 'composite', position: { x: 150, y: 1750 },
        data: {
          label: 'Seus Dados',
          elements: [
            { id: 'ed-lead-text', type: 'text', content: 'Ótimo! Preencha seus dados e enviaremos o material do curso recomendado:' },
            { id: 'ed-lead-form', type: 'lead-form', title: 'Seus dados', fields: ['name', 'email', 'phone'] },
          ],
        },
      },
      { id: 'result', type: 'result', position: { x: 200, y: 2150 }, data: { title: 'Seu Curso Recomendado' } },
    ],
    edges: [
      edge('e-start-ed-q1', 'start', 'ed-q1'),
      edge('e-ed-q1-q2', 'ed-q1', 'ed-q2'),
      edge('e-ed-q2-q3', 'ed-q2', 'ed-q3'),
      edge('e-ed-q3-q4', 'ed-q3', 'ed-q4'),
      edge('e-ed-q4-lead', 'ed-q4', 'ed-lead'),
      edge('e-ed-lead-result', 'ed-lead', 'result'),
    ],
  },
  scoreRanges: [
    { id: 'sr-1', label: 'Trilha Fundamentos', min: 0, max: 14, description: 'Indicamos nossa Trilha de Fundamentos — passo a passo para você começar do zero com confiança e construir uma base sólida.' },
    { id: 'sr-2', label: 'Curso Intermediário', min: 15, max: 28, description: 'Você já tem uma base! Nosso Curso Intermediário vai acelerar seu aprendizado com projetos práticos e mentoria.' },
    { id: 'sr-3', label: 'Imersão Avançada', min: 29, max: 40, description: 'Você está pronto para o próximo nível! Nossa Imersão Avançada é ideal para quem quer especialização e resultado profissional real.' },
  ],
  settings: { ...defaultSettings },
};

// ═══════════════════════════════════════════════════════════════════
// ── NICHO: SaaS ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
const saasQualificacao = {
  id: 'saas-qualificacao',
  name: 'Qual Plano é Perfeito pra Você?',
  description: 'Qualifique leads e recomende o plano certo com base no perfil e necessidades do cliente.',
  category: 'SaaS',
  icon: '⚡',
  thumbnail: null,
  canvasData: {
    nodes: [
      { id: 'start', type: 'start', position: { x: 250, y: 0 }, data: { label: 'Início' } },
      {
        id: 'ss-q1', type: 'composite', position: { x: 150, y: 150 },
        data: {
          label: 'Perfil',
          elements: [
            { id: 'ss-q1-text', type: 'text', content: 'Encontre o plano ideal para o seu negócio em menos de 2 minutos! 🚀', style: { fontSize: 18, fontWeight: '600', textColor: '#ffffff', alignment: 'center' } },
            { id: 'ss-q1-q', type: 'question-single', question: 'Como você descreveria seu negócio?', options: [
              { text: 'Freelancer ou solopreneur', score: 3 },
              { text: 'Startup em fase inicial', score: 6 },
              { text: 'PME com equipe consolidada', score: 8 },
              { text: 'Empresa de médio/grande porte', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'ss-q2', type: 'composite', position: { x: 150, y: 550 },
        data: {
          label: 'Volume',
          elements: [
            { id: 'ss-q2-q', type: 'question-single', question: 'Qual o volume de leads/contatos que você gerencia?', options: [
              { text: 'Menos de 500 contatos', score: 3 },
              { text: '500 a 5.000 contatos', score: 6 },
              { text: '5.000 a 50.000 contatos', score: 8 },
              { text: 'Mais de 50.000 contatos', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'ss-q3', type: 'composite', position: { x: 150, y: 950 },
        data: {
          label: 'Recursos',
          elements: [
            { id: 'ss-q3-q', type: 'question-single', question: 'Quais recursos são indispensáveis para você?', options: [
              { text: 'Funcionalidades básicas com bom suporte', score: 3 },
              { text: 'Automações e integrações essenciais', score: 6 },
              { text: 'Analytics avançado e A/B testing', score: 9 },
              { text: 'API, white-label e customização total', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'ss-q4', type: 'composite', position: { x: 150, y: 1350 },
        data: {
          label: 'Investimento',
          elements: [
            { id: 'ss-q4-q', type: 'question-single', question: 'Qual seu orçamento mensal para ferramentas?', options: [
              { text: 'Até R$ 200/mês', score: 2 },
              { text: 'R$ 200 a R$ 800/mês', score: 5 },
              { text: 'R$ 800 a R$ 3.000/mês', score: 8 },
              { text: 'Acima de R$ 3.000/mês', score: 10 },
            ]},
          ],
        },
      },
      { id: 'result', type: 'result', position: { x: 200, y: 1750 }, data: { title: 'Seu Plano Recomendado' } },
    ],
    edges: [
      edge('e-start-ss-q1', 'start', 'ss-q1'),
      edge('e-ss-q1-q2', 'ss-q1', 'ss-q2'),
      edge('e-ss-q2-q3', 'ss-q2', 'ss-q3'),
      edge('e-ss-q3-q4', 'ss-q3', 'ss-q4'),
      edge('e-ss-q4-result', 'ss-q4', 'result'),
    ],
  },
  scoreRanges: [
    { id: 'sr-1', label: 'Plano Starter', min: 0, max: 15, description: 'O Plano Starter é perfeito para você! Comece sem compromisso, com todas as funcionalidades essenciais por um preço acessível.' },
    { id: 'sr-2', label: 'Plano Growth', min: 16, max: 28, description: 'O Plano Growth é o ideal! Você terá automações, integrações e suporte prioritário para escalar sem limites.' },
    { id: 'sr-3', label: 'Plano Enterprise', min: 29, max: 40, description: 'Você precisa do nosso Plano Enterprise! API completa, white-label, SLA garantido e gerente de conta dedicado.' },
  ],
  settings: { ...defaultSettings },
};

// ═══════════════════════════════════════════════════════════════════
// ── NICHO: BELEZA ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
const belezaTipoPele = {
  id: 'beleza-tipo-pele',
  name: 'Descubra Seu Tipo de Pele',
  description: 'Identifique o tipo de pele do cliente e recomende os produtos certos de skincare.',
  category: 'Beleza',
  icon: '✨',
  thumbnail: null,
  canvasData: {
    nodes: [
      { id: 'start', type: 'start', position: { x: 250, y: 0 }, data: { label: 'Início' } },
      {
        id: 'bz-q1', type: 'composite', position: { x: 150, y: 150 },
        data: {
          label: 'Aparência',
          elements: [
            { id: 'bz-q1-text', type: 'text', content: 'Descubra seu tipo de pele e os produtos perfeitos para sua rotina de skincare! 🌸', style: { fontSize: 18, fontWeight: '600', textColor: '#ffffff', alignment: 'center' } },
            { id: 'bz-q1-q', type: 'question-single', question: 'Como sua pele fica ao acordar pela manhã?', options: [
              { text: '✨ Brilhante em toda a face', score: 1 },
              { text: '🌟 Brilhante na zona T (testa/nariz/queixo)', score: 5 },
              { text: '😌 Normal, sem brilho excessivo', score: 8 },
              { text: '🏜️ Ressecada, com sensação de tensão', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'bz-q2', type: 'composite', position: { x: 150, y: 550 },
        data: {
          label: 'Poros',
          elements: [
            { id: 'bz-q2-q', type: 'question-single', question: 'Como são os poros da sua pele?', options: [
              { text: 'Grandes e visíveis, especialmente no nariz', score: 1 },
              { text: 'Visíveis na zona T, pequenos no resto', score: 5 },
              { text: 'Pequenos e pouco visíveis', score: 9 },
              { text: 'Imperceptíveis', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'bz-q3', type: 'composite', position: { x: 150, y: 950 },
        data: {
          label: 'Sensibilidade',
          elements: [
            { id: 'bz-q3-q', type: 'question-single', question: 'Sua pele reage a produtos novos?', options: [
              { text: 'Sim, fico vermelha(o) ou com ardência facilmente', score: 1 },
              { text: 'Às vezes, dependendo do produto', score: 5 },
              { text: 'Raramente, tenho pele resistente', score: 9 },
              { text: 'Nunca, aceita qualquer produto bem', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'bz-q4', type: 'composite', position: { x: 150, y: 1350 },
        data: {
          label: 'Hidratação',
          elements: [
            { id: 'bz-q4-q', type: 'question-single', question: 'Você usa hidratante diariamente?', options: [
              { text: 'Não uso, minha pele já é oleosa demais', score: 1 },
              { text: 'Às vezes, quando lembro', score: 4 },
              { text: 'Sim, mas só à noite', score: 7 },
              { text: 'Sim, manhã e noite sem falta', score: 10 },
            ]},
          ],
        },
      },
      { id: 'result', type: 'result', position: { x: 200, y: 1750 }, data: { title: 'Seu Tipo de Pele' } },
    ],
    edges: [
      edge('e-start-bz-q1', 'start', 'bz-q1'),
      edge('e-bz-q1-q2', 'bz-q1', 'bz-q2'),
      edge('e-bz-q2-q3', 'bz-q2', 'bz-q3'),
      edge('e-bz-q3-q4', 'bz-q3', 'bz-q4'),
      edge('e-bz-q4-result', 'bz-q4', 'result'),
    ],
  },
  scoreRanges: [
    { id: 'sr-1', label: 'Pele Oleosa / Mista', min: 0, max: 14, description: 'Sua pele tende ao oleoso. Recomendamos produtos oil-free, gel-creme leve e sérum com ácido salicílico para controlar o brilho sem ressecar.' },
    { id: 'sr-2', label: 'Pele Mista / Normal', min: 15, max: 28, description: 'Você tem pele mista ou normal — a mais comum! Produtos balanceados, hidratantes não-comedogênicos e protetor solar leve são seus aliados.' },
    { id: 'sr-3', label: 'Pele Seca / Sensível', min: 29, max: 40, description: 'Sua pele precisa de hidratação intensa e ingredientes calmantes. Investir em um bom hidratante e evitar álcool nos produtos vai transformar sua rotina!' },
  ],
  settings: { ...defaultSettings },
};

// ═══════════════════════════════════════════════════════════════════
// ── NICHO: IMOBILIÁRIO ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
const imobiliaroPerfil = {
  id: 'imobiliario-perfil',
  name: 'Qual Imóvel Combina com Você?',
  description: 'Qualifique compradores e identifique o imóvel ideal com base em perfil e necessidades.',
  category: 'Imobiliário',
  icon: '🏠',
  thumbnail: null,
  canvasData: {
    nodes: [
      { id: 'start', type: 'start', position: { x: 250, y: 0 }, data: { label: 'Início' } },
      {
        id: 'im-q1', type: 'composite', position: { x: 150, y: 150 },
        data: {
          label: 'Objetivo',
          elements: [
            { id: 'im-q1-text', type: 'text', content: 'Vamos encontrar o imóvel perfeito pra você! Responda 4 perguntas e receba indicações personalizadas 🏡', style: { fontSize: 18, fontWeight: '600', textColor: '#ffffff', alignment: 'center' } },
            { id: 'im-q1-q', type: 'question-single', question: 'Qual é o seu objetivo com a compra?', options: [
              { text: 'Moradia própria — meu primeiro imóvel', score: 5 },
              { text: 'Troca — quero algo maior ou melhor localizado', score: 7 },
              { text: 'Investimento para renda (aluguel)', score: 9 },
              { text: 'Investimento para valorização e revenda', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'im-q2', type: 'composite', position: { x: 150, y: 550 },
        data: {
          label: 'Perfil Familiar',
          elements: [
            { id: 'im-q2-q', type: 'question-single', question: 'Qual é o seu perfil familiar?', options: [
              { text: 'Solteiro(a) ou casal sem filhos', score: 4 },
              { text: 'Casal com filhos pequenos', score: 8 },
              { text: 'Família grande (3+ filhos ou dependentes)', score: 7 },
              { text: 'Investidor — não vai morar no imóvel', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'im-q3', type: 'composite', position: { x: 150, y: 950 },
        data: {
          label: 'Orçamento',
          elements: [
            { id: 'im-q3-q', type: 'question-single', question: 'Qual é o seu orçamento para o imóvel?', options: [
              { text: 'Até R$ 300.000', score: 3 },
              { text: 'R$ 300.000 a R$ 700.000', score: 6 },
              { text: 'R$ 700.000 a R$ 2.000.000', score: 9 },
              { text: 'Acima de R$ 2.000.000', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'im-q4', type: 'composite', position: { x: 150, y: 1350 },
        data: {
          label: 'Localização',
          elements: [
            { id: 'im-q4-q', type: 'question-single', question: 'O que é mais importante na localização?', options: [
              { text: 'Perto do trabalho / centro', score: 7 },
              { text: 'Bairro tranquilo com área verde', score: 8 },
              { text: 'Boa infraestrutura (escolas, comércio)', score: 9 },
              { text: 'Potencial de valorização alto', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'im-lead', type: 'composite', position: { x: 150, y: 1750 },
        data: {
          label: 'Seus Dados',
          elements: [
            { id: 'im-lead-text', type: 'text', content: 'Perfeito! Preencha seus dados para receber as melhores opções selecionadas por nossos especialistas:' },
            { id: 'im-lead-form', type: 'lead-form', title: 'Seus dados', fields: ['name', 'email', 'phone'] },
          ],
        },
      },
      { id: 'result', type: 'result', position: { x: 200, y: 2150 }, data: { title: 'Seu Perfil Imobiliário' } },
    ],
    edges: [
      edge('e-start-im-q1', 'start', 'im-q1'),
      edge('e-im-q1-q2', 'im-q1', 'im-q2'),
      edge('e-im-q2-q3', 'im-q2', 'im-q3'),
      edge('e-im-q3-q4', 'im-q3', 'im-q4'),
      edge('e-im-q4-lead', 'im-q4', 'im-lead'),
      edge('e-im-lead-result', 'im-lead', 'result'),
    ],
  },
  scoreRanges: [
    { id: 'sr-1', label: 'Apartamento Compacto', min: 0, max: 17, description: 'Você se encaixa em apartamentos compactos em ótimas localizações. Práticos, fáceis de alugar e de manter — a escolha inteligente para início de jornada imobiliária.' },
    { id: 'sr-2', label: 'Apartamento ou Casa de Médio Padrão', min: 18, max: 30, description: 'Seu perfil aponta para imóveis de médio padrão com boa metragem e infraestrutura. Nossos especialistas têm opções incríveis para você!' },
    { id: 'sr-3', label: 'Imóvel Premium / Investimento Estratégico', min: 31, max: 40, description: 'Você está pronto para imóveis de alto padrão ou portfólio de investimento. Nosso time de consultores especializados vai entrar em contato para apresentar oportunidades exclusivas.' },
  ],
  settings: { ...defaultSettings },
};

// ═══════════════════════════════════════════════════════════════════
// ── PRÉ-LAUNCH: CLÍNICA ESTÉTICA (ICO-231) ───────────────────────
// ═══════════════════════════════════════════════════════════════════
const clinicaEstetica = {
  id: 'clinica-estetica',
  name: 'Clínica Estética — Qual tratamento ideal para você?',
  description: 'Quiz diagnóstico para clínicas e esteticistas: identifica a principal preocupação do cliente e qualifica para agendamento de consulta.',
  category: 'Beleza',
  icon: '💆',
  thumbnail: null,
  canvasData: {
    nodes: [
      { id: 'start', type: 'start', position: { x: 250, y: 0 }, data: { label: 'Início' } },
      {
        id: 'q1', type: 'composite', position: { x: 150, y: 150 },
        data: {
          label: 'Preocupação',
          elements: [
            { id: 'ce-q1-text', type: 'text', content: 'Descubra qual tratamento é ideal para a sua pele! ✨', style: { fontSize: 18, fontWeight: '600', textColor: '#ffffff', alignment: 'center' } },
            { id: 'ce-q1-question', type: 'question-single', question: 'Qual é sua principal preocupação com a pele?', options: [
              { text: '⏳ Rugas e flacidez', score: 8 },
              { text: '🌓 Manchas e melasma', score: 7 },
              { text: '🔬 Acne e poros dilatados', score: 6 },
              { text: '💧 Ressecamento e falta de viço', score: 5 },
            ]},
          ],
        },
      },
      {
        id: 'q2', type: 'composite', position: { x: 150, y: 550 },
        data: {
          label: 'Frequência',
          elements: [
            { id: 'ce-q2-question', type: 'question-single', question: 'Com que frequência você realiza tratamentos estéticos?', options: [
              { text: 'Nunca realizei', score: 2 },
              { text: 'Raramente (1-2x por ano)', score: 4 },
              { text: 'Mensalmente', score: 7 },
              { text: 'Quinzenalmente ou mais', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'q3', type: 'composite', position: { x: 150, y: 950 },
        data: {
          label: 'Faixa Etária',
          elements: [
            { id: 'ce-q3-question', type: 'question-single', question: 'Qual é sua faixa etária?', options: [
              { text: '18 a 30 anos', score: 3 },
              { text: '31 a 45 anos', score: 6 },
              { text: '46 a 60 anos', score: 8 },
              { text: 'Acima de 60 anos', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'q4', type: 'composite', position: { x: 150, y: 1350 },
        data: {
          label: 'Objetivo',
          elements: [
            { id: 'ce-q4-question', type: 'question-single', question: 'Qual resultado você mais deseja alcançar?', options: [
              { text: 'Rejuvenescimento e suavizar rugas', score: 9 },
              { text: 'Uniformizar e clarear manchas', score: 7 },
              { text: 'Tensionar e firmar a pele', score: 8 },
              { text: 'Hidratação intensa e viço', score: 5 },
            ]},
          ],
        },
      },
      {
        id: 'q5', type: 'composite', position: { x: 150, y: 1750 },
        data: {
          label: 'Sensibilidade',
          elements: [
            { id: 'ce-q5-question', type: 'question-single', question: 'Você tem alguma sensibilidade ou restrição conhecida?', options: [
              { text: 'Não tenho nenhuma restrição', score: 10 },
              { text: 'Tenho pele sensível leve', score: 7 },
              { text: 'Já tive reação a produtos', score: 4 },
              { text: 'Prefiro tratamentos naturais', score: 5 },
            ]},
          ],
        },
      },
      {
        id: 'lead', type: 'composite', position: { x: 150, y: 2150 },
        data: {
          label: 'Formulário',
          elements: [
            { id: 'ce-lead-text', type: 'text', content: 'Seu protocolo personalizado está pronto! ✨ Informe seus dados para receber a análise completa e agendar sua consulta gratuita.' },
            { id: 'ce-lead-form', type: 'lead-form', title: 'Seus dados', fields: ['name', 'email', 'phone'] },
          ],
        },
      },
      { id: 'result', type: 'result', position: { x: 200, y: 2550 }, data: { title: 'Seu Protocolo Ideal' } },
    ],
    edges: [
      edge('e-start-q1', 'start', 'q1'),
      edge('e-q1-q2', 'q1', 'q2'),
      edge('e-q2-q3', 'q2', 'q3'),
      edge('e-q3-q4', 'q3', 'q4'),
      edge('e-q4-q5', 'q4', 'q5'),
      edge('e-q5-lead', 'q5', 'lead'),
      edge('e-lead-result', 'lead', 'result'),
    ],
  },
  scoreRanges: [
    { id: 'sr-1', label: 'Protocolo Base', min: 0, max: 22, description: 'Seu ponto de partida ideal é um protocolo de cuidados essenciais. Recomendamos hidratação profunda + limpeza de pele profissional. Agende sua consulta para montar seu plano!' },
    { id: 'sr-2', label: 'Protocolo Intermediário', min: 23, max: 38, description: 'Você está pronta para tratamentos mais eficazes! Peeling químico, microagulhamento e bioestimuladores são excelentes para seu perfil. Vamos personalizar juntas?' },
    { id: 'sr-3', label: 'Protocolo Premium', min: 39, max: 50, description: 'Seu perfil exige o melhor! Toxina botulínica, preenchedores e laser são os tratamentos certos para você. Agende uma consulta e descubra o protocolo VIP.' },
  ],
  settings: {
    theme: {
      primaryColor: '#d4a0c0',
      secondaryColor: '#a05080',
      backgroundColor: '#1a0a14',
      backgroundType: 'gradient',
      backgroundGradient: 'from-rose-950 via-pink-900 to-purple-950',
      textColor: '#ffffff',
      buttonStyle: 'rounded',
      fontFamily: 'Inter',
    },
    branding: { logoUrl: '', showBranding: true },
  },
};

// ═══════════════════════════════════════════════════════════════════
// ── PRÉ-LAUNCH: COACH / MENTORIA (ICO-231) ───────────────────────
// ═══════════════════════════════════════════════════════════════════
const coachMentoria = {
  id: 'coach-mentoria',
  name: 'Coach / Mentoria — Qual é seu bloqueio?',
  description: 'Quiz de diagnóstico para coaches e mentores: identifica o principal bloqueio do lead e qualifica para programa de mentoria.',
  category: 'Educação',
  icon: '🎯',
  thumbnail: null,
  canvasData: {
    nodes: [
      { id: 'start', type: 'start', position: { x: 250, y: 0 }, data: { label: 'Início' } },
      {
        id: 'q1', type: 'composite', position: { x: 150, y: 150 },
        data: {
          label: 'Área de Transformação',
          elements: [
            { id: 'cm-q1-text', type: 'text', content: 'Qual é o seu maior bloqueio para alcançar seus objetivos? 🎯 Responda 4 perguntas e descubra o caminho certo para você.', style: { fontSize: 18, fontWeight: '600', textColor: '#ffffff', alignment: 'center' } },
            { id: 'cm-q1-question', type: 'question-single', question: 'Qual área da sua vida você quer transformar agora?', options: [
              { text: '💼 Carreira e renda', score: 9 },
              { text: '❤️ Relacionamentos', score: 7 },
              { text: '💪 Saúde e energia', score: 6 },
              { text: '🧠 Propósito e mindset', score: 8 },
            ]},
          ],
        },
      },
      {
        id: 'q2', type: 'composite', position: { x: 150, y: 550 },
        data: {
          label: 'Principal Bloqueio',
          elements: [
            { id: 'cm-q2-question', type: 'question-single', question: 'O que mais te impede de evoluir hoje?', options: [
              { text: 'Falta de clareza / direção', score: 5 },
              { text: 'Falta de tempo', score: 6 },
              { text: 'Falta de recursos financeiros', score: 3 },
              { text: 'Falta de disciplina e consistência', score: 7 },
            ]},
          ],
        },
      },
      {
        id: 'q3', type: 'composite', position: { x: 150, y: 950 },
        data: {
          label: 'Experiência com Mentoria',
          elements: [
            { id: 'cm-q3-question', type: 'question-single', question: 'Você já investiu em mentoria ou curso de desenvolvimento pessoal?', options: [
              { text: 'Nunca investi em nada', score: 3 },
              { text: 'Já investi, sem resultado expressivo', score: 5 },
              { text: 'Tive alguns resultados pontuais', score: 8 },
              { text: 'Tive resultados significativos e quero mais', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'q4', type: 'composite', position: { x: 150, y: 1350 },
        data: {
          label: 'Disponibilidade',
          elements: [
            { id: 'cm-q4-question', type: 'question-single', question: 'Qual é sua disponibilidade semanal para evolução?', options: [
              { text: 'Menos de 2 horas por semana', score: 3 },
              { text: '2 a 5 horas por semana', score: 6 },
              { text: '5 a 10 horas por semana', score: 8 },
              { text: 'Mais de 10 horas — estou comprometido(a)', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'lead', type: 'composite', position: { x: 150, y: 1750 },
        data: {
          label: 'Formulário',
          elements: [
            { id: 'cm-lead-text', type: 'text', content: '🎯 Seu diagnóstico está pronto! Identificamos o caminho ideal para você. Deixe seus dados e receba o plano personalizado de evolução.' },
            { id: 'cm-lead-form', type: 'lead-form', title: 'Seus dados', fields: ['name', 'email', 'phone'] },
          ],
        },
      },
      { id: 'result', type: 'result', position: { x: 200, y: 2150 }, data: { title: 'Seu Perfil de Evolução' } },
    ],
    edges: [
      edge('e-start-q1', 'start', 'q1'),
      edge('e-q1-q2', 'q1', 'q2'),
      edge('e-q2-q3', 'q2', 'q3'),
      edge('e-q3-q4', 'q3', 'q4'),
      edge('e-q4-lead', 'q4', 'lead'),
      edge('e-lead-result', 'lead', 'result'),
    ],
  },
  scoreRanges: [
    { id: 'sr-1', label: 'Iniciante', min: 0, max: 16, description: 'Você está dando os primeiros passos! O mais importante agora é criar clareza e dar o primeiro passo. Nosso programa básico foi feito pra você.' },
    { id: 'sr-2', label: 'Em Desenvolvimento', min: 17, max: 28, description: 'Você já tem consciência mas precisa de método. A mentoria em grupo vai te dar a estrutura e a comunidade pra você ir mais longe, mais rápido.' },
    { id: 'sr-3', label: 'Pronto para Acelerar', min: 29, max: 40, description: 'Você está pronto(a) para o próximo nível! A mentoria individual é o caminho certo pra você escalar resultados com estratégia e accountability.' },
  ],
  settings: {
    theme: {
      primaryColor: '#f59e0b',
      secondaryColor: '#d97706',
      backgroundColor: '#1c1004',
      backgroundType: 'gradient',
      backgroundGradient: 'from-amber-950 via-orange-900 to-yellow-900',
      textColor: '#ffffff',
      buttonStyle: 'rounded',
      fontFamily: 'Inter',
    },
    branding: { logoUrl: '', showBranding: true },
  },
};

// ═══════════════════════════════════════════════════════════════════
// ── PRÉ-LAUNCH: FITNESS / EMAGRECIMENTO (ICO-231) ────────────────
// ═══════════════════════════════════════════════════════════════════
const fitnessEmagrecimento = {
  id: 'fitness-emagrecimento',
  name: 'Fitness — Qual é o seu protocolo ideal?',
  description: 'Quiz de diagnóstico para personal trainers e nutricionistas: identifica objetivos, nível de condicionamento e restrições para qualificar leads com alta intenção.',
  category: 'Saúde & Bem-Estar',
  icon: '🏋️',
  thumbnail: null,
  canvasData: {
    nodes: [
      { id: 'start', type: 'start', position: { x: 250, y: 0 }, data: { label: 'Início' } },
      {
        id: 'q1', type: 'composite', position: { x: 150, y: 150 },
        data: {
          label: 'Objetivo',
          elements: [
            { id: 'fe-q1-text', type: 'text', content: 'Monte o seu plano de transformação corporal ideal! 🔥 5 perguntas para descobrir o protocolo personalizado pra você.', style: { fontSize: 18, fontWeight: '600', textColor: '#ffffff', alignment: 'center' } },
            { id: 'fe-q1-question', type: 'question-single', question: 'Qual é seu objetivo principal?', options: [
              { text: '🔥 Emagrecer e perder gordura', score: 9 },
              { text: '💪 Ganhar massa muscular', score: 8 },
              { text: '✂️ Definir e tonificar o corpo', score: 7 },
              { text: '❤️ Melhorar saúde e disposição geral', score: 6 },
            ]},
          ],
        },
      },
      {
        id: 'q2', type: 'composite', position: { x: 150, y: 550 },
        data: {
          label: 'Meta de Peso',
          elements: [
            { id: 'fe-q2-question', type: 'question-single', question: 'Quanto você quer perder ou ganhar de peso?', options: [
              { text: '1 a 5 kg', score: 4 },
              { text: '5 a 15 kg', score: 7 },
              { text: '15 a 30 kg', score: 9 },
              { text: 'Mais de 30 kg', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'q3', type: 'composite', position: { x: 150, y: 950 },
        data: {
          label: 'Nível de Atividade',
          elements: [
            { id: 'fe-q3-question', type: 'question-single', question: 'Qual é seu nível de atividade física atual?', options: [
              { text: 'Sedentário — zero atividade física', score: 2 },
              { text: 'Leve — treino 1 a 2x por semana', score: 5 },
              { text: 'Moderado — treino 3 a 4x por semana', score: 8 },
              { text: 'Intenso — treino 5x ou mais por semana', score: 10 },
            ]},
          ],
        },
      },
      {
        id: 'q4', type: 'composite', position: { x: 150, y: 1350 },
        data: {
          label: 'Dificuldade Alimentar',
          elements: [
            { id: 'fe-q4-question', type: 'question-single', question: 'Qual a sua maior dificuldade com alimentação?', options: [
              { text: 'Comer fora de casa todo dia', score: 6 },
              { text: 'Controlar a ansiedade e os beliscos', score: 7 },
              { text: 'Falta de tempo para cozinhar', score: 6 },
              { text: 'Não sei como montar um cardápio', score: 8 },
            ]},
          ],
        },
      },
      {
        id: 'q5', type: 'composite', position: { x: 150, y: 1750 },
        data: {
          label: 'Restrição Alimentar',
          elements: [
            { id: 'fe-q5-question', type: 'question-single', question: 'Você tem alguma restrição alimentar?', options: [
              { text: 'Não tenho nenhuma restrição', score: 10 },
              { text: 'Intolerância a lactose ou glúten', score: 7 },
              { text: 'Sou vegetariano(a) ou vegano(a)', score: 6 },
              { text: 'Tenho condição médica (diabetes, hipertensão, etc.)', score: 5 },
            ]},
          ],
        },
      },
      {
        id: 'lead', type: 'composite', position: { x: 150, y: 2150 },
        data: {
          label: 'Formulário',
          elements: [
            { id: 'fe-lead-text', type: 'text', content: '🔥 Seu protocolo personalizado está pronto! Preencha seus dados e receba o plano completo no seu WhatsApp agora mesmo.' },
            { id: 'fe-lead-form', type: 'lead-form', title: 'Seus dados', fields: ['name', 'email', 'phone'] },
          ],
        },
      },
      { id: 'result', type: 'result', position: { x: 200, y: 2550 }, data: { title: 'Seu Protocolo de Transformação' } },
    ],
    edges: [
      edge('e-start-q1', 'start', 'q1'),
      edge('e-q1-q2', 'q1', 'q2'),
      edge('e-q2-q3', 'q2', 'q3'),
      edge('e-q3-q4', 'q3', 'q4'),
      edge('e-q4-q5', 'q4', 'q5'),
      edge('e-q5-lead', 'q5', 'lead'),
      edge('e-lead-result', 'lead', 'result'),
    ],
  },
  scoreRanges: [
    { id: 'sr-1', label: 'Protocolo Start', min: 0, max: 24, description: 'Seu ponto de partida é um protocolo gentil e progressivo. Vamos começar com exercícios funcionais 3x/semana e alimentação equilibrada. Sem radicalismo, com resultado!' },
    { id: 'sr-2', label: 'Protocolo Acelerado', min: 25, max: 38, description: 'Você já tem uma base boa! É hora de intensificar com HIIT, musculação e um cardápio otimizado para o seu objetivo. Vamos acelerar sua transformação!' },
    { id: 'sr-3', label: 'Protocolo Intensivo', min: 39, max: 50, description: 'Você está comprometido(a) de verdade! Vamos montar um protocolo intensivo com treinos split, periodização e acompanhamento nutricional para resultados máximos.' },
  ],
  settings: {
    theme: {
      primaryColor: '#22c55e',
      secondaryColor: '#16a34a',
      backgroundColor: '#040f08',
      backgroundType: 'gradient',
      backgroundGradient: 'from-green-950 via-emerald-900 to-teal-900',
      textColor: '#ffffff',
      buttonStyle: 'rounded',
      fontFamily: 'Inter',
    },
    branding: { logoUrl: '', showBranding: true },
  },
};

// ── Export all templates ─────────────────────────────────────────

export const templates = [
  leadGenBasic,
  investorProfile,
  marketingDiag,
  knowledgeQuiz,
  styleQuiz,
  npsQuiz,
  bantQualification,
  onboardingQuiz,
  roiCalculator,
  // ── Nicho-specific templates ─────────────────────────────────
  infoprodutoDiag,
  ecommerceRecomendacao,
  agenciaDiag,
  saudePerfil,
  educacaoCurso,
  saasQualificacao,
  belezaTipoPele,
  imobiliaroPerfil,
  // ── Pré-launch templates (ICO-231) ─────────────────────────
  clinicaEstetica,
  coachMentoria,
  fitnessEmagrecimento,
];

export const categories = [
  'Todos',
  // Use-case generics
  'Lead Generation',
  'Diagnóstico',
  'Educação',
  'Personalidade',
  'Feedback',
  'Vendas',
  'Produto',
  // Niche verticals
  'Infoproduto',
  'E-commerce',
  'Agência',
  'Saúde & Bem-Estar',
  'SaaS',
  'Beleza',
  'Imobiliário',
];

export default templates;