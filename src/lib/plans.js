// Plan definitions for Quiz Maker Full Funnel
// Used across the app for feature gating and pricing display

export const PLANS = {
  free: {
    id: 'free',
    name: 'Grátis',
    price: 0,
    priceAnnual: 0,
    priceLabel: 'R$ 0',
    period: '/mês',
    description: 'Para começar a criar quizzes',
    features: [
      '3 quizzes ativos',
      '100 leads/mês',
      'Templates básicos',
      'Analytics básico',
      'Branding Quiz Maker',
    ],
    limits: {
      quizzes: 3,
      leadsPerMonth: 100,
      customDomains: 0,
      whiteLabel: false,
      integrations: false,
      abTesting: false,
      features: ['basic'],
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 49.90,
    priceAnnual: 39.92,
    priceLabel: 'R$ 49,90',
    period: '/mês',
    description: 'Para profissionais e pequenas empresas',
    popular: true,
    features: [
      '20 quizzes ativos',
      '5.000 leads/mês',
      'Todos os templates',
      'Analytics avançado',
      'Integrações (Webhook, GHL)',
      'Embed em sites',
      'Personalização de marca',
    ],
    limits: {
      quizzes: 20,
      leadsPerMonth: 5000,
      customDomains: 1,
      whiteLabel: false,
      integrations: true,
      abTesting: true,
      features: ['basic', 'templates', 'analytics', 'webhook', 'embed', 'branding'],
    },
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 149.90,
    priceAnnual: 119.92,
    priceLabel: 'R$ 149,90',
    period: '/mês',
    description: 'Para agências e empresas',
    features: [
      'Quizzes ilimitados',
      'Leads ilimitados',
      'Tudo do Pro',
      'White-Label completo',
      'Domínios customizados ilimitados',
      'Testes A/B',
      'Acesso à API',
    ],
    limits: {
      quizzes: -1,
      leadsPerMonth: -1,
      customDomains: -1,
      whiteLabel: true,
      integrations: true,
      abTesting: true,
      features: [
        'basic', 'templates', 'analytics', 'webhook', 'embed', 'branding',
        'custom-domain', 'ab-testing', 'white-label', 'api',
      ],
    },
  },
};

export const PLAN_ORDER = ['free', 'pro', 'business'];

export const ALL_FEATURES = [
  'basic', 'templates', 'analytics', 'webhook', 'embed', 'branding',
  'custom-domain', 'ab-testing', 'white-label', 'api',
];

export const FEATURE_LABELS = {
  basic: 'Funcionalidades Básicas',
  templates: 'Templates Prontos',
  analytics: 'Analytics Avançado',
  webhook: 'Webhooks & Integrações',
  embed: 'Embed em Sites',
  branding: 'Personalização de Marca',
  'custom-domain': 'Domínio Personalizado',
  'ab-testing': 'Testes A/B',
  'white-label': 'White Label',
  api: 'Acesso à API',
};

/**
 * Get plan by key (alias for getPlanInfo)
 */
export function getPlan(planKey) {
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
 * Check if user can use white-label features
 */
export function canUseWhiteLabel(userPlan) {
  return planHasFeature(userPlan || 'free', 'whiteLabel');
}

/**
 * Format a limit value for display
 */
export function formatLimit(value) {
  if (value === -1) return 'Ilimitado';
  return String(value);
}
