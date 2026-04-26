// Plan definitions for QuizMeBaby Full Funnel
// Used across the app for feature gating and pricing display
// 4-tier structure: Free → Pro → Business → Agency
// Source of truth: docs/product/positioning-quizmebaby.md v0.4 (approved TheBoss + Opus 23/04/2026)

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
    aiCreate: 1,        // 1 criação por IA (experimentar)
    aiResult: false,    // sem resultado por IA
    aiAnalysis: 0,      // sem AI Analysis
    storage: 100,       // 100 MB
    support: 'community',
    features: [
      '1 quiz ativo',
      '100 leads/mês',
      '1 usuário',
      'Gamificação básica',
      'Com marca QuizMeBaby',
      'Webhook',
      'Analytics básico',
      '1 criação por IA',
    ],
    limits: {
      quizzes: 1,
      leadsPerMonth: 100,
      customDomains: 0,
      whiteLabel: false,
      whiteLabelFull: false,
      integrations: true,   // webhook básico
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
    aiCreate: true,       // ilimitado
    aiResult: true,       // resultado por IA
    aiAnalysis: 500,      // 500 análises/mês
    storage: 1024,        // 1 GB
    support: 'email',
    features: [
      '5 quizzes ativos',
      '10.000 leads/mês',
      '3 usuários',
      'IA ilimitada (criar quiz + resultado)',
      'AI Analysis: 500/mês',
      'A/B Testing',
      'Gamificação completa',
      'Sem marca QuizMeBaby',
      '3 domínios customizados',
      'Todas integrações (Webhook, GHL, etc)',
      'Analytics avançado',
      'Suporte: Email',
    ],
    limits: {
      quizzes: 5,
      leadsPerMonth: 10000,
      customDomains: 3,
      whiteLabel: true,
      whiteLabelFull: false,
      integrations: true,
      abTesting: true,
      apiAccess: false,
      advancedExport: false,
      features: [
        'basic', 'templates', 'analytics', 'webhook', 'embed', 'branding',
        'gamification-full', 'ai-create', 'ai-result', 'ai-analysis',
        'integrations-all', 'ab-testing', 'custom-domain',
      ],
    },
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 247,
    priceAnnual: parseFloat((247 * 10 / 12).toFixed(2)),  // ~205.83
    priceLabel: 'R$ 247',
    priceAnnualLabel: 'R$ 2.470/ano',
    period: '/mês',
    description: 'Para agências e empresas em crescimento',
    maxUsers: 10,
    aiCreate: true,
    aiResult: true,
    aiAnalysis: 5000,     // 5.000 análises/mês
    storage: 10240,       // 10 GB
    support: 'priority',
    features: [
      '25 quizzes ativos',
      '50.000 leads/mês',
      '10 usuários + roles',
      'Tudo do Pro +',
      'AI Analysis: 5.000/mês',
      '25 domínios customizados',
      'White-label parcial',
      'Teams com roles granulares',
      'Suporte prioritário',
    ],
    limits: {
      quizzes: 25,
      leadsPerMonth: 50000,
      customDomains: 25,
      whiteLabel: true,
      whiteLabelFull: false,
      integrations: true,
      abTesting: true,
      apiAccess: false,
      advancedExport: false,
      features: [
        'basic', 'templates', 'analytics', 'webhook', 'embed', 'branding',
        'gamification-full', 'ai-create', 'ai-result', 'ai-analysis',
        'integrations-all', 'ab-testing', 'custom-domain', 'teams-roles',
      ],
    },
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    price: 497,
    priceAnnual: parseFloat((497 * 10 / 12).toFixed(2)),  // ~414.17
    priceLabel: 'R$ 497',
    priceAnnualLabel: 'R$ 4.970/ano',
    period: '/mês',
    description: 'Para agências que revendem em escala',
    badge: 'Para Agências',
    maxUsers: -1,         // ilimitado
    aiCreate: true,
    aiResult: true,
    aiAnalysis: 25000,    // 25.000 análises/mês + overage R$0,015
    aiAnalysisOverage: 0.015,  // R$0,015 por análise extra
    storage: 102400,      // 100 GB
    support: 'dedicated',
    features: [
      'Quizzes ilimitados',
      'Leads ilimitados (fair use)',
      'Usuários ilimitados + roles',
      'Tudo do Business +',
      'AI Analysis: 25.000/mês + overage',
      'Domínios customizados ilimitados',
      'White-label completo',
      'API completa',
      'Suporte dedicado + onboarding',
    ],
    limits: {
      quizzes: -1,
      leadsPerMonth: -1,    // ilimitado (fair use: throttle acima de 500k/mês)
      customDomains: -1,
      whiteLabel: true,
      whiteLabelFull: true,
      integrations: true,
      abTesting: true,
      apiAccess: true,
      advancedExport: true,
      features: [
        'basic', 'templates', 'analytics', 'webhook', 'embed', 'branding',
        'gamification-full', 'ai-create', 'ai-result', 'ai-analysis',
        'integrations-all', 'ab-testing', 'custom-domain', 'teams-roles',
        'api', 'advanced-export', 'dedicated-support', 'onboarding',
        'webhooks-advanced', 'white-label-full',
      ],
    },
  },
};

export const PLAN_ORDER = ['free', 'pro', 'business', 'agency'];

export const ALL_FEATURES = [
  'basic', 'templates', 'analytics', 'webhook', 'embed', 'branding',
  'gamification-basic', 'gamification-full',
  'ai-create', 'ai-result', 'ai-analysis', 'integrations-all',
  'ab-testing', 'custom-domain', 'teams-roles',
  'api', 'advanced-export',
  'dedicated-support', 'onboarding', 'webhooks-advanced', 'white-label-full',
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
  'ai-analysis': 'AI Analysis de Leads',
  'integrations-all': 'Todas as Integrações',
  'ab-testing': 'Testes A/B',
  'custom-domain': 'Domínio Personalizado',
  'teams-roles': 'Teams com Roles Granulares',
  api: 'Acesso à API',
  'advanced-export': 'Export Avançado',
  'dedicated-support': 'Suporte Dedicado',
  onboarding: 'Onboarding Personalizado',
  'webhooks-advanced': 'Webhooks Avançados',
  'white-label-full': 'White-label Completo',
};

/**
 * Get plan by key. Handles backward compat for old tier names.
 */
export function getPlan(planKey) {
  // Backward compat: 'enterprise' and 'advanced' mapped to 'agency'
  if (planKey === 'enterprise' || planKey === 'advanced') return PLANS.agency;
  return PLANS[planKey] || PLANS.free;
}

/**
 * Get plan display info (legacy alias)
 */
export function getPlanInfo(planId) {
  return getPlan(planId);
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
  const plan = getPlan(userPlan || 'free');
  return plan.limits[feature] === true || plan.limits[feature] === -1;
}

/**
 * Check if user can use white-label features (remove QuizMeBaby branding)
 */
export function canUseWhiteLabel(userPlan) {
  return planHasFeature(userPlan || 'free', 'whiteLabel');
}

/**
 * Check if user can use full white-label (no QuizMeBaby branding at all)
 */
export function canUseWhiteLabelFull(userPlan) {
  return planHasFeature(userPlan || 'free', 'whiteLabelFull');
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
 * Get AI Analysis quota for a plan (0 = no access)
 */
export function getAIAnalysisQuota(userPlan) {
  const plan = getPlan(userPlan || 'free');
  return plan.aiAnalysis || 0;
}

/**
 * Get max users for a plan (-1 = unlimited)
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
  // Normalize legacy keys
  const normalize = (k) => (k === 'enterprise' || k === 'advanced') ? 'agency' : k;
  const indexA = PLAN_ORDER.indexOf(normalize(planA));
  const indexB = PLAN_ORDER.indexOf(normalize(planB));
  return indexA > indexB;
}
