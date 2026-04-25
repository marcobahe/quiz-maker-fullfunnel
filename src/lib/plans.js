// Plan definitions for QuizMeBaby Full Funnel
// Used across the app for feature gating and pricing display
// 4-tier structure: Free → Pro → Business → Agency (v0.4 positioning)

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
    aiResult: false,
    aiAnalysisQuota: 0,
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
      '100MB storage',
    ],
    limits: {
      quizzes: 1,
      leadsPerMonth: 100,
      customDomains: 0,
      whiteLabel: false,
      whiteLabelPartial: false,
      integrations: true,
      abTesting: false,
      ghlNative: false,
      apiAccess: false,
      advancedExport: false,
      teams: false,
      storageMB: 100,
      aiAnalysisQuota: 0,
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
    maxUsers: 1,
    aiCreate: true,
    aiResult: true,
    aiAnalysisQuota: 500,
    support: 'email',
    features: [
      '5 quizzes ativos',
      '10.000 leads/mês',
      '1 usuário',
      'IA ilimitada (criar quiz + resultado)',
      'AI Analysis 500/mês',
      'A/B testing',
      'GHL nativo',
      'Gamificação completa',
      'Sem marca QuizMeBaby',
      'Todas integrações (Webhook, GHL, etc)',
      '3 custom domains',
      'Analytics avançado',
      '1GB storage',
      'Suporte: Email',
    ],
    limits: {
      quizzes: 5,
      leadsPerMonth: 10000,
      customDomains: 3,
      whiteLabel: false,
      whiteLabelPartial: false,
      integrations: true,
      abTesting: true,
      ghlNative: true,
      apiAccess: false,
      advancedExport: false,
      teams: false,
      storageMB: 1024,
      aiAnalysisQuota: 500,
      features: [
        'basic', 'templates', 'analytics', 'webhook', 'embed', 'branding',
        'gamification-full', 'ai-create', 'ai-result', 'integrations-all',
        'ab-testing', 'ghl-native', 'custom-domain',
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
    maxUsers: 5,
    aiCreate: true,
    aiResult: true,
    aiAnalysisQuota: 5000,
    support: 'priority',
    features: [
      '25 quizzes ativos',
      '50.000 leads/mês',
      '5 usuários + roles',
      'Tudo do Pro +',
      'AI Analysis 5.000/mês',
      'White-label parcial',
      '25 custom domains',
      '10GB storage',
      'Suporte prioritário',
    ],
    limits: {
      quizzes: 25,
      leadsPerMonth: 50000,
      customDomains: 25,
      whiteLabel: false,
      whiteLabelPartial: true,
      integrations: true,
      abTesting: true,
      ghlNative: true,
      apiAccess: false,
      advancedExport: false,
      teams: true,
      storageMB: 10240,
      aiAnalysisQuota: 5000,
      features: [
        'basic', 'templates', 'analytics', 'webhook', 'embed', 'branding',
        'gamification-full', 'ai-create', 'ai-result', 'integrations-all',
        'ab-testing', 'ghl-native', 'custom-domain', 'white-label-partial', 'teams',
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
    maxUsers: 25,
    aiCreate: true,
    aiResult: true,
    aiAnalysisQuota: 25000,
    support: 'dedicated',
    features: [
      'Quizzes ilimitados (fair use)',
      'Leads ilimitados (>500k → escalar)',
      '25 usuários + roles',
      'Tudo do Business +',
      'AI Analysis 25.000/mês',
      'White-label completo',
      'Domínios ilimitados',
      'API completa',
      '100GB storage',
      'Suporte dedicado humano',
      'Onboarding personalizado',
    ],
    limits: {
      quizzes: -1,
      leadsPerMonth: -1,
      customDomains: -1,
      whiteLabel: true,
      whiteLabelPartial: true,
      integrations: true,
      abTesting: true,
      ghlNative: true,
      apiAccess: true,
      advancedExport: true,
      teams: true,
      storageMB: 102400,
      aiAnalysisQuota: 25000,
      features: [
        'basic', 'templates', 'analytics', 'webhook', 'embed', 'branding',
        'gamification-full', 'ai-create', 'ai-result', 'integrations-all',
        'ab-testing', 'ghl-native', 'custom-domain', 'white-label-partial',
        'white-label', 'teams', 'api', 'advanced-export',
        'dedicated-support', 'onboarding',
      ],
    },
  },
};

export const PLAN_ORDER = ['free', 'pro', 'business', 'agency'];

export const ALL_FEATURES = [
  'basic', 'templates', 'analytics', 'webhook', 'embed', 'branding',
  'gamification-basic', 'gamification-full',
  'ai-create', 'ai-result', 'integrations-all',
  'ab-testing', 'ghl-native', 'custom-domain',
  'white-label-partial', 'white-label', 'teams',
  'api', 'advanced-export',
  'dedicated-support', 'onboarding',
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
  'ab-testing': 'Testes A/B',
  'ghl-native': 'GHL Nativo',
  'custom-domain': 'Domínio Personalizado',
  'white-label-partial': 'White-label Parcial',
  'white-label': 'White-label Completo',
  teams: 'Teams + Roles',
  api: 'Acesso à API',
  'advanced-export': 'Export Avançado',
  'dedicated-support': 'Suporte Dedicado',
  onboarding: 'Onboarding Personalizado',
};

/**
 * Get plan by key. Handles backward compat for old tier names.
 * - 'advanced' → 'business' (merged into business in v0.4)
 * - 'enterprise' → 'agency' (renamed in v0.4)
 */
export function getPlan(planKey) {
  if (planKey === 'advanced') return PLANS.business;
  if (planKey === 'enterprise') return PLANS.agency;
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
  // Normalize legacy names before comparing
  const normalize = (p) => {
    if (p === 'advanced') return 'business';
    if (p === 'enterprise') return 'agency';
    return p;
  };
  const indexA = PLAN_ORDER.indexOf(normalize(planA));
  const indexB = PLAN_ORDER.indexOf(normalize(planB));
  return indexA > indexB;
}
