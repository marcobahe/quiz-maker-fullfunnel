// Plan definitions for QuizMeBaby Full Funnel
// Used across the app for feature gating and pricing display
// 5-tier structure: Free → Pro → Business → Advanced → Enterprise

export const PLANS = {
  free: {
    id: 'free',
    name: 'Grátis',
    price: 0,
    priceAnnual: 0,
    priceLabel: 'R$ 0',
    priceAnnualLabel: 'R$ 0/ano',
    period: '/mês',
    description: 'Para experimentar e conhecer a plataforma',
    maxUsers: 1,
    aiCreate: 1,      // 1 criação por IA (experimentar)
    aiResult: false,   // sem resultado por IA
    support: 'docs',   // apenas documentação
    features: [
      '1 quiz ativo',
      '200 leads/mês',
      '1 usuário',
      'Gamificação básica',
      'Com marca QuizMeBaby',
      'Webhook',
      'Analytics básico',
      '1 criação por IA',
    ],
    limits: {
      quizzes: 1,
      leadsPerMonth: 200,
      customDomains: 0,
      whiteLabel: false,
      integrations: true,  // webhook básico
      abTesting: false,
      apiAccess: false,
      advancedExport: false,
      features: ['basic', 'webhook', 'gamification-basic'],
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 97,
    priceAnnual: parseFloat((97 * 10 / 12).toFixed(2)),  // ~80.83
    priceLabel: 'R$ 97',
    priceAnnualLabel: 'R$ 970/ano',
    period: '/mês',
    description: 'Para profissionais e pequenas empresas',
    popular: true,
    maxUsers: 3,
    aiCreate: true,    // ilimitado
    aiResult: true,    // resultado por IA
    support: 'docs+bot+chat',
    features: [
      '5 quizzes ativos',
      '10.000 leads/mês',
      '3 usuários',
      'IA ilimitada (criar quiz + resultado)',
      'Gamificação completa',
      'Sem marca QuizMeBaby',
      'Todas integrações (Webhook, Full Funnel, etc)',
      'Analytics avançado',
      'Suporte: Docs + Bot IA + Chat',
    ],
    limits: {
      quizzes: 5,
      leadsPerMonth: 10000,
      customDomains: 0,
      whiteLabel: true,
      integrations: true,
      abTesting: false,
      apiAccess: false,
      advancedExport: false,
      features: [
        'basic', 'templates', 'analytics', 'webhook', 'embed', 'branding',
        'gamification-full', 'ai-create', 'ai-result', 'integrations-all',
      ],
    },
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 197,
    priceAnnual: parseFloat((197 * 10 / 12).toFixed(2)),  // ~164.17
    priceLabel: 'R$ 197',
    priceAnnualLabel: 'R$ 1.970/ano',
    period: '/mês',
    description: 'Para empresas em crescimento',
    maxUsers: 5,
    aiCreate: true,
    aiResult: true,
    support: 'docs+bot+chat-priority',
    features: [
      '15 quizzes ativos',
      '25.000 leads/mês',
      '5 usuários',
      'Tudo do Pro +',
      'Custom domain (CNAME)',
      'A/B Testing',
      'Suporte prioritário',
    ],
    limits: {
      quizzes: 15,
      leadsPerMonth: 25000,
      customDomains: 1,
      whiteLabel: true,
      integrations: true,
      abTesting: true,
      apiAccess: false,
      advancedExport: false,
      features: [
        'basic', 'templates', 'analytics', 'webhook', 'embed', 'branding',
        'gamification-full', 'ai-create', 'ai-result', 'integrations-all',
        'custom-domain', 'ab-testing',
      ],
    },
  },
  advanced: {
    id: 'advanced',
    name: 'Advanced',
    price: 297,
    priceAnnual: parseFloat((297 * 10 / 12).toFixed(2)),  // ~247.50
    priceLabel: 'R$ 297',
    priceAnnualLabel: 'R$ 2.970/ano',
    period: '/mês',
    description: 'Para operações avançadas e times maiores',
    maxUsers: 10,
    aiCreate: true,
    aiResult: true,
    support: 'docs+bot+chat-priority',
    features: [
      'Quizzes ilimitados',
      '50.000 leads/mês',
      '10 usuários',
      'Tudo do Business +',
      'API completa',
      'Export avançado',
      'Suporte prioritário',
    ],
    limits: {
      quizzes: -1,
      leadsPerMonth: 50000,
      customDomains: -1,
      whiteLabel: true,
      integrations: true,
      abTesting: true,
      apiAccess: true,
      advancedExport: true,
      features: [
        'basic', 'templates', 'analytics', 'webhook', 'embed', 'branding',
        'gamification-full', 'ai-create', 'ai-result', 'integrations-all',
        'custom-domain', 'ab-testing', 'api', 'advanced-export',
      ],
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 497,
    priceAnnual: parseFloat((497 * 10 / 12).toFixed(2)),  // ~414.17
    priceLabel: 'R$ 497',
    priceAnnualLabel: 'R$ 4.970/ano',
    period: '/mês',
    description: 'Para agências e grandes operações',
    badge: 'Para Agências',
    maxUsers: 25,
    aiCreate: true,
    aiResult: true,
    support: 'dedicated',
    features: [
      'Quizzes ilimitados',
      '200.000 leads/mês',
      '25 usuários',
      'Tudo do Advanced +',
      'Suporte dedicado humano',
      'Onboarding personalizado',
      'Webhooks avançados',
    ],
    limits: {
      quizzes: -1,
      leadsPerMonth: 200000,
      customDomains: -1,
      whiteLabel: true,
      integrations: true,
      abTesting: true,
      apiAccess: true,
      advancedExport: true,
      features: [
        'basic', 'templates', 'analytics', 'webhook', 'embed', 'branding',
        'gamification-full', 'ai-create', 'ai-result', 'integrations-all',
        'custom-domain', 'ab-testing', 'api', 'advanced-export',
        'dedicated-support', 'onboarding', 'webhooks-advanced',
      ],
    },
  },
};

export const PLAN_ORDER = ['free', 'pro', 'business', 'advanced', 'enterprise'];

export const ALL_FEATURES = [
  'basic', 'templates', 'analytics', 'webhook', 'embed', 'branding',
  'gamification-basic', 'gamification-full',
  'ai-create', 'ai-result', 'integrations-all',
  'custom-domain', 'ab-testing', 'api', 'advanced-export',
  'dedicated-support', 'onboarding', 'webhooks-advanced',
];

export const FEATURE_LABELS = {
  basic: 'Funcionalidades Básicas',
  templates: 'Templates Prontos',
  analytics: 'Analytics Avançado',
  webhook: 'Webhooks & Integrações',
  embed: 'Embed em Sites',
  branding: 'Personalização de Marca',
  'gamification-basic': 'Gamificação Básica',
  'gamification-full': 'Gamificação Completa',
  'ai-create': 'Criação por IA',
  'ai-result': 'Resultado por IA',
  'integrations-all': 'Todas as Integrações',
  'custom-domain': 'Domínio Personalizado',
  'ab-testing': 'Testes A/B',
  api: 'Acesso à API',
  'advanced-export': 'Export Avançado',
  'dedicated-support': 'Suporte Dedicado',
  onboarding: 'Onboarding Personalizado',
  'webhooks-advanced': 'Webhooks Avançados',
};

/**
 * Get plan by key. Handles backward compat for old 'enterprise' alias.
 */
export function getPlan(planKey) {
  // Backward compat: old 'enterprise' key mapped to new enterprise plan
  // (previously was alias for 'business')
  return PLANS[planKey] || PLANS.free;
}

/**
 * Get plan display info (legacy alias)
 */
export function getPlanInfo(planId) {
  return PLANS[planId] || PLANS.free;
}

/**
 * Check if a plan has a specific feature string
 */
export function hasFeature(planKey, feature) {
  const plan = getPlan(planKey);
  return plan.limits.features?.includes(feature) || false;
}

/**
 * Check if a user's plan has a specific limit feature
 */
export function planHasFeature(userPlan, feature) {
  const plan = PLANS[userPlan] || PLANS.free;
  return plan.limits[feature] === true || plan.limits[feature] === -1;
}

/**
 * Check if user can use white-label features (remove QuizMeBaby branding)
 */
export function canUseWhiteLabel(userPlan) {
  return planHasFeature(userPlan || 'free', 'whiteLabel');
}

/**
 * Check if user can use A/B testing
 */
export function canUseABTesting(userPlan) {
  return planHasFeature(userPlan || 'free', 'abTesting');
}

/**
 * Check if user can use custom domains
 */
export function canUseCustomDomain(userPlan) {
  const plan = getPlan(userPlan || 'free');
  return plan.limits.customDomains !== 0;
}

/**
 * Check if user can use API access
 */
export function canUseAPI(userPlan) {
  return planHasFeature(userPlan || 'free', 'apiAccess');
}

/**
 * Check if user can create quiz with AI
 */
export function canUseAICreate(userPlan) {
  const plan = getPlan(userPlan || 'free');
  return plan.aiCreate === true || (typeof plan.aiCreate === 'number' && plan.aiCreate > 0);
}

/**
 * Check if user can use AI results
 */
export function canUseAIResult(userPlan) {
  const plan = getPlan(userPlan || 'free');
  return plan.aiResult === true;
}

/**
 * Get max users for a plan
 */
export function getMaxUsers(userPlan) {
  const plan = getPlan(userPlan || 'free');
  return plan.maxUsers || 1;
}

/**
 * Format a limit value for display
 */
export function formatLimit(value) {
  if (value === -1) return 'Ilimitado';
  return value.toLocaleString('pt-BR');
}

/**
 * Check if plan A is higher tier than plan B
 */
export function isPlanHigherThan(planA, planB) {
  const indexA = PLAN_ORDER.indexOf(planA);
  const indexB = PLAN_ORDER.indexOf(planB);
  return indexA > indexB;
}
