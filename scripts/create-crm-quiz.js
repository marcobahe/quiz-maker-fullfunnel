/**
 * Script: create-crm-quiz.js
 * Cria o quiz "Diagnóstico CRM" para captar leads para o Full Funnel.
 * 
 * Uso: node scripts/create-crm-quiz.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // 1. Buscar usuário demo
  const user = await prisma.user.findUnique({
    where: { email: 'demo@quizmaker.com' },
  });
  if (!user) throw new Error('Usuário demo@quizmaker.com não encontrado!');
  console.log(`✅ Usuário: ${user.name} (${user.id})`);

  // 2. Buscar workspace
  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: user.id },
  });
  console.log(workspace
    ? `✅ Workspace: ${workspace.name} (${workspace.id})`
    : '⚠️ Sem workspace, quiz será criado sem workspaceId');

  // 3. Verificar se já existe
  const existing = await prisma.quiz.findFirst({
    where: { slug: { startsWith: 'diagnostico-crm' }, userId: user.id },
  });
  if (existing) {
    console.log(`⚠️  Quiz "diagnostico-crm" já existe (ID: ${existing.id}). Deletando para recriar...`);
    await prisma.analyticsEvent.deleteMany({ where: { quizId: existing.id } });
    await prisma.lead.deleteMany({ where: { quizId: existing.id } });
    await prisma.integration.deleteMany({ where: { quizId: existing.id } });
    await prisma.quiz.delete({ where: { id: existing.id } });
    console.log('🗑️  Quiz anterior removido.');
  }

  // ── Timestamps para IDs únicos ──────────────────────────────
  const ts = Date.now();

  // ── Perguntas ────────────────────────────────────────────────
  const questions = [
    {
      question: 'Como você gerencia seus contatos e leads hoje?',
      options: [
        { text: 'Na memória ou anotações soltas', score: 1 },
        { text: 'Planilha (Excel/Google Sheets)', score: 2 },
        { text: 'Tenho um CRM, mas não uso direito', score: 3 },
        { text: 'Uso um CRM ativo e organizado', score: 5 },
      ],
    },
    {
      question: 'Quando um lead manda mensagem no WhatsApp, em quanto tempo ele recebe resposta?',
      options: [
        { text: 'Quando eu vejo... às vezes demora horas', score: 1 },
        { text: 'Tento responder rápido, mas não é automático', score: 2 },
        { text: 'Tenho respostas rápidas prontas', score: 3 },
        { text: 'Resposta automática + humano em seguida', score: 5 },
      ],
    },
    {
      question: 'E no Instagram/Facebook, seus leads de lá vão pra onde?',
      options: [
        { text: 'Ficam na DM mesmo... às vezes esqueço', score: 1 },
        { text: 'Peço o WhatsApp e continuo por lá', score: 2 },
        { text: 'Tenho um link na bio que direciona', score: 3 },
        { text: 'Caem direto no meu funil de vendas', score: 5 },
      ],
    },
    {
      question: 'Você sabe exatamente de onde vieram seus últimos 10 clientes?',
      options: [
        { text: 'Não faço ideia', score: 1 },
        { text: 'Tenho uma noção, mas não registro', score: 2 },
        { text: 'Sei de alguns canais', score: 3 },
        { text: 'Tenho tracking completo de origem', score: 5 },
      ],
    },
    {
      question: 'Seus follow-ups com leads que não compraram são...',
      options: [
        { text: 'Inexistentes — se não comprou, perdeu', score: 1 },
        { text: 'Manuais — quando lembro, mando mensagem', score: 2 },
        { text: 'Tenho uma sequência, mas faço na mão', score: 3 },
        { text: 'Automatizados com mensagens programadas', score: 5 },
      ],
    },
    {
      question: 'Quantos leads você acha que perdeu no último mês por demora ou falta de follow-up?',
      options: [
        { text: 'Nem sei contar... vários', score: 1 },
        { text: 'Uns 5 a 10', score: 2 },
        { text: 'Poucos, talvez 2 ou 3', score: 3 },
        { text: 'Praticamente nenhum', score: 5 },
      ],
    },
    {
      question: 'Se um cliente some há 3 meses, o que acontece?',
      options: [
        { text: 'Nada. Nem percebo que sumiu', score: 1 },
        { text: 'Se eu lembrar, mando uma mensagem', score: 2 },
        { text: 'Tenho uma lista de inativos que reviso', score: 3 },
        { text: 'Disparo automático de reativação', score: 5 },
      ],
    },
  ];

  // ── Montar Nodes ────────────────────────────────────────────

  const nodes = [];
  const edges = [];

  // Start node
  nodes.push({
    id: 'start',
    type: 'start',
    position: { x: 400, y: 50 },
    data: { label: 'Início' },
  });

  // Question nodes
  const questionNodeIds = [];
  questions.forEach((q, i) => {
    const nodeId = `composite-q${i + 1}-${ts}`;
    const elementId = `el-q${i + 1}-${ts}`;
    questionNodeIds.push({ nodeId, elementId });

    nodes.push({
      id: nodeId,
      type: 'composite',
      position: { x: 400, y: 350 + i * 300 },
      data: {
        label: `Pergunta ${i + 1}`,
        elements: [
          {
            id: elementId,
            type: 'question-single',
            question: q.question,
            options: q.options,
          },
        ],
      },
    });
  });

  // Lead form node
  const leadNodeId = `composite-lead-${ts}`;
  const leadElementId = `el-lead-${ts}`;
  nodes.push({
    id: leadNodeId,
    type: 'composite',
    position: { x: 400, y: 350 + questions.length * 300 },
    data: {
      label: 'Formulário',
      elements: [
        {
          id: `el-lead-text-${ts}`,
          type: 'text',
          content: 'Falta pouco! Preencha seus dados para ver seu diagnóstico personalizado.',
        },
        {
          id: leadElementId,
          type: 'lead-form',
          title: 'Quase lá! Veja seu diagnóstico',
          fields: ['name', 'email', 'phone'],
        },
      ],
    },
  });

  // Result node
  const resultNodeId = `result-${ts}`;
  nodes.push({
    id: resultNodeId,
    type: 'result',
    position: { x: 400, y: 350 + (questions.length + 1) * 300 },
    data: { title: 'Seu Diagnóstico' },
  });

  // ── Montar Edges ────────────────────────────────────────────

  const edgeStyle = { stroke: '#7c3aed', strokeWidth: 2 };

  // Start → Q1
  edges.push({
    id: `edge-start-to-q1-${ts}`,
    source: 'start',
    target: questionNodeIds[0].nodeId,
    type: 'custom-bezier',
    animated: true,
    style: edgeStyle,
  });

  // Q1 → Q2, Q2 → Q3, ..., Q6 → Q7 (via general handle)
  for (let i = 0; i < questionNodeIds.length - 1; i++) {
    edges.push({
      id: `edge-q${i + 1}-to-q${i + 2}-${ts}`,
      source: questionNodeIds[i].nodeId,
      sourceHandle: `${questionNodeIds[i].elementId}-general`,
      target: questionNodeIds[i + 1].nodeId,
      type: 'custom-bezier',
      animated: true,
      style: edgeStyle,
    });
  }

  // Q7 → Lead Form
  const lastQ = questionNodeIds[questionNodeIds.length - 1];
  edges.push({
    id: `edge-q7-to-lead-${ts}`,
    source: lastQ.nodeId,
    sourceHandle: `${lastQ.elementId}-general`,
    target: leadNodeId,
    type: 'custom-bezier',
    animated: true,
    style: edgeStyle,
  });

  // Lead Form → Result
  edges.push({
    id: `edge-lead-to-result-${ts}`,
    source: leadNodeId,
    target: resultNodeId,
    type: 'custom-bezier',
    animated: true,
    style: edgeStyle,
  });

  const canvasData = { nodes, edges };

  // ── Score Ranges ────────────────────────────────────────────

  const scoreRanges = [
    {
      id: 'range-alerta',
      min: 7,
      max: 14,
      title: '🚨 Alerta Vermelho — Seu Negócio Está Sangrando Leads',
      description: 'Você está perdendo dinheiro TODOS OS DIAS. Sem um sistema integrado, cada lead que chega pelo WhatsApp, Instagram ou indicação tem altíssima chance de cair no esquecimento. A boa notícia? Resolver isso é mais simples do que parece.\n\nO Full Funnel integra WhatsApp, Instagram, email e automações em um só lugar — pra você nunca mais perder um lead.',
      ctaText: 'Quero Conhecer o Full Funnel →',
      ctaUrl: 'https://fullfunnel.com.br',
    },
    {
      id: 'range-risco',
      min: 15,
      max: 24,
      title: '⚠️ Zona de Risco — Você Faz o Básico, Mas Perde Muito',
      description: 'Você até se esforça, mas está operando no modo manual. Cada hora gasta respondendo mensagem na mão, fazendo follow-up de cabeça e tentando lembrar de leads é hora que poderia virar venda.\n\nCom o Full Funnel, você automatiza o que é repetitivo e foca no que importa: fechar negócios.',
      ctaText: 'Quero Conhecer o Full Funnel →',
      ctaUrl: 'https://fullfunnel.com.br',
    },
    {
      id: 'range-quase',
      min: 25,
      max: 35,
      title: '💪 Quase Lá — Falta Integrar Pra Escalar',
      description: 'Parabéns, você já tem processos! Mas se seus canais ainda não conversam entre si (WhatsApp aqui, Instagram ali, email acolá), você está limitando seu crescimento.\n\nO Full Funnel conecta tudo num único painel — com automações, funis e analytics — pra você escalar sem contratar mais gente.',
      ctaText: 'Quero Conhecer o Full Funnel →',
      ctaUrl: 'https://fullfunnel.com.br',
    },
  ];

  // ── Settings ────────────────────────────────────────────────

  const settings = {
    theme: {
      primaryColor: '#7c3aed',
      secondaryColor: '#5b21b6',
      accentColor: '#7c3aed',
      bgColor: '#0f0a1a',
      backgroundColor: '#0f0a1a',
      textColor: '#ffffff',
      fontFamily: 'Inter',
      backgroundType: 'gradient',
      backgroundGradient: 'from-purple-900 via-purple-800 to-indigo-900',
      gradientFrom: '#1a0533',
      gradientTo: '#0f0a1a',
      buttonStyle: 'rounded',
    },
    branding: {
      logoUrl: '',
      faviconUrl: '',
      showBranding: false,
    },
    aiResultConfig: {
      enabled: false,
      provider: 'openai',
      model: 'gpt-4o-mini',
      prompt: '',
      maxTokens: 500,
      combineWithStatic: true,
    },
  };

  // ── Criar quiz ──────────────────────────────────────────────

  const quiz = await prisma.quiz.create({
    data: {
      userId: user.id,
      workspaceId: workspace?.id || null,
      name: 'Seu Negócio Está Perdendo Clientes? Descubra em 2 Minutos',
      slug: 'diagnostico-crm',
      description: 'Responda 7 perguntas rápidas e descubra quanto seu negócio pode estar perdendo por falta de um sistema integrado de vendas.',
      status: 'published',
      canvasData: JSON.stringify(canvasData),
      scoreRanges: JSON.stringify(scoreRanges),
      settings: JSON.stringify(settings),
    },
  });

  console.log('\n🎉 Quiz criado com sucesso!');
  console.log(`   ID:    ${quiz.id}`);
  console.log(`   Slug:  ${quiz.slug}`);
  console.log(`   Nome:  ${quiz.name}`);
  console.log(`   Status: ${quiz.status}`);
  console.log(`   Nodes: ${nodes.length} (start + ${questions.length} perguntas + lead-form + result)`);
  console.log(`   Edges: ${edges.length}`);
  console.log(`   Score Ranges: ${scoreRanges.length}`);
  console.log(`\n   🔗 Player: /q/diagnostico-crm`);
  console.log(`   🔧 Builder: /builder/${quiz.id}`);
}

main()
  .catch((err) => {
    console.error('❌ Erro:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
