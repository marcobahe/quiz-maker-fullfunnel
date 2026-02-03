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
            { id: 'q1-text', type: 'text', content: 'Vamos descobrir como podemos te ajudar!' },
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
        position: { x: 150, y: 750 },
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
        position: { x: 150, y: 1350 },
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
        position: { x: 150, y: 1950 },
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
        position: { x: 200, y: 2350 },
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
            { id: 'ip-q1-text', type: 'text', content: 'Vamos descobrir seu perfil de investidor em 5 perguntas rápidas!' },
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
        position: { x: 150, y: 750 },
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
        position: { x: 150, y: 1350 },
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
        position: { x: 150, y: 1950 },
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
        position: { x: 150, y: 2550 },
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
        position: { x: 200, y: 2950 },
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
            { id: 'md-q1-text', type: 'text', content: 'Responda 5 perguntas e descubra o nível de maturidade digital do seu negócio!' },
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
        position: { x: 150, y: 750 },
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
        position: { x: 150, y: 1350 },
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
        position: { x: 150, y: 1950 },
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
        position: { x: 150, y: 2550 },
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
        position: { x: 200, y: 2950 },
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
            { id: 'kq-q1-text', type: 'text', content: 'Teste seus conhecimentos sobre Marketing Digital! 🚀' },
            {
              id: 'kq-q1-question',
              type: 'question-single',
              question: 'O que significa a sigla SEO?',
              options: [
                { text: 'Search Engine Optimization', score: 10 },
                { text: 'Social Engagement Online', score: 0 },
                { text: 'System for Electronic Operations', score: 0 },
              ],
            },
          ],
        },
      },
      {
        id: 'q2',
        type: 'composite',
        position: { x: 150, y: 750 },
        data: {
          label: 'Pergunta 2 de 5',
          elements: [
            {
              id: 'kq-q2-question',
              type: 'question-single',
              question: 'Qual métrica indica o custo para adquirir cada cliente?',
              options: [
                { text: 'LTV (Lifetime Value)', score: 0 },
                { text: 'CAC (Custo de Aquisição de Cliente)', score: 10 },
                { text: 'ROI (Retorno sobre Investimento)', score: 0 },
              ],
            },
          ],
        },
      },
      {
        id: 'q3',
        type: 'composite',
        position: { x: 150, y: 1350 },
        data: {
          label: 'Pergunta 3 de 5',
          elements: [
            {
              id: 'kq-q3-question',
              type: 'question-single',
              question: 'Qual ferramenta é usada para automação de email marketing?',
              options: [
                { text: 'Canva', score: 0 },
                { text: 'Google Analytics', score: 0 },
                { text: 'Mailchimp / ActiveCampaign', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'q4',
        type: 'composite',
        position: { x: 150, y: 1950 },
        data: {
          label: 'Pergunta 4 de 5',
          elements: [
            {
              id: 'kq-q4-question',
              type: 'question-single',
              question: 'O que é um "lead magnet"?',
              options: [
                { text: 'Um tipo de anúncio no Google', score: 0 },
                { text: 'Um conteúdo gratuito oferecido em troca de dados do lead', score: 10 },
                { text: 'Uma ferramenta de análise de concorrentes', score: 0 },
              ],
            },
          ],
        },
      },
      {
        id: 'q5',
        type: 'composite',
        position: { x: 150, y: 2550 },
        data: {
          label: 'Pergunta 5 de 5',
          elements: [
            {
              id: 'kq-q5-question',
              type: 'question-single',
              question: 'Qual é a taxa média de abertura de emails no Brasil?',
              options: [
                { text: 'Cerca de 5%', score: 0 },
                { text: 'Cerca de 20%', score: 10 },
                { text: 'Cerca de 50%', score: 0 },
              ],
            },
          ],
        },
      },
      {
        id: 'result',
        type: 'result',
        position: { x: 200, y: 2950 },
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
            { id: 'sq-q1-text', type: 'text', content: 'Descubra qual é o seu estilo! Responda com sinceridade 😊' },
            {
              id: 'sq-q1-question',
              type: 'question-single',
              question: 'Como é sua manhã ideal?',
              options: [
                { text: 'Acordo cedo, treino e planejo o dia', score: 10 },
                { text: 'Café tranquilo com um bom livro', score: 5 },
                { text: 'Durmo até tarde e improviso', score: 1 },
              ],
            },
          ],
        },
      },
      {
        id: 'q2',
        type: 'composite',
        position: { x: 150, y: 750 },
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
        position: { x: 150, y: 1350 },
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
        position: { x: 150, y: 1950 },
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
        position: { x: 200, y: 2350 },
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
            { id: 'nps-q1-text', type: 'text', content: 'Sua opinião é muito importante para nós! Leva menos de 1 minuto.' },
            {
              id: 'nps-q1-question',
              type: 'question-single',
              question: 'De 0 a 10, o quanto você recomendaria nosso produto/serviço?',
              options: [
                { text: '0 a 3 — Não recomendaria', score: 1 },
                { text: '4 a 6 — Talvez recomendaria', score: 5 },
                { text: '7 a 8 — Provavelmente recomendaria', score: 7 },
                { text: '9 a 10 — Com certeza recomendaria!', score: 10 },
              ],
            },
          ],
        },
      },
      {
        id: 'q2',
        type: 'composite',
        position: { x: 150, y: 750 },
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
        position: { x: 150, y: 1350 },
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
        position: { x: 150, y: 1950 },
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
        position: { x: 200, y: 2350 },
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
            { id: 'bant-q1-text', type: 'text', content: 'Vamos entender melhor suas necessidades para oferecer a melhor solução!' },
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
        position: { x: 150, y: 750 },
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
        position: { x: 150, y: 1350 },
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
        position: { x: 150, y: 1950 },
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
        position: { x: 150, y: 2550 },
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
        position: { x: 200, y: 2950 },
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
            { id: 'ob-q1-text', type: 'text', content: 'Bem-vindo! Vamos personalizar sua experiência. Leva menos de 1 minuto! 🎉' },
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
        position: { x: 150, y: 750 },
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
        position: { x: 150, y: 1350 },
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
        position: { x: 150, y: 1950 },
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
        position: { x: 200, y: 2350 },
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
];

export const categories = [
  'Todos',
  'Lead Generation',
  'Diagnóstico',
  'Educação',
  'Personalidade',
  'Feedback',
  'Vendas',
  'Produto',
];

export default templates;
