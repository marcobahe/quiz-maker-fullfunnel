'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Check, Star, ArrowLeft, X, Building2 } from 'lucide-react';
import { PLANS, PLAN_ORDER } from '@/lib/plans';

// Feature comparison table data
const COMPARISON_FEATURES = [
  { key: 'quizzes', label: 'Quizzes ativos', type: 'limit' },
  { key: 'leadsPerMonth', label: 'Leads/mês', type: 'limit' },
  { key: 'users', label: 'Usuários', type: 'custom' },
  { key: 'aiCreate', label: 'Criação por IA', type: 'custom' },
  { key: 'aiResult', label: 'Resultado por IA', type: 'boolean' },
  { key: 'gamification', label: 'Gamificação', type: 'custom' },
  { key: 'whiteLabel', label: 'Sem marca QuizMeBaby', type: 'boolean' },
  { key: 'integrations', label: 'Integrações', type: 'boolean' },
  { key: 'analytics', label: 'Analytics avançado', type: 'custom' },
  { key: 'customDomain', label: 'Custom domain', type: 'boolean' },
  { key: 'abTesting', label: 'A/B Testing', type: 'boolean' },
  { key: 'apiAccess', label: 'API completa', type: 'boolean' },
  { key: 'advancedExport', label: 'Export avançado', type: 'boolean' },
  { key: 'support', label: 'Suporte', type: 'custom' },
];

function getComparisonValue(plan, feature) {
  switch (feature.key) {
    case 'quizzes':
      return plan.limits.quizzes === -1 ? 'Ilimitado' : String(plan.limits.quizzes);
    case 'leadsPerMonth':
      return plan.limits.leadsPerMonth === -1 ? 'Ilimitado' : plan.limits.leadsPerMonth.toLocaleString('pt-BR');
    case 'users':
      return String(plan.maxUsers);
    case 'aiCreate':
      return plan.aiCreate === true ? 'Ilimitado' : plan.aiCreate === 1 ? '1 (experimentar)' : 'Não';
    case 'aiResult':
      return plan.aiResult;
    case 'gamification':
      return plan.limits.features.includes('gamification-full') ? 'Completa' : 'Básica';
    case 'whiteLabel':
      return plan.limits.whiteLabel;
    case 'integrations':
      return plan.limits.integrations;
    case 'analytics':
      return plan.limits.features.includes('analytics') ? 'Avançado' : 'Básico';
    case 'customDomain':
      return plan.limits.customDomains !== 0;
    case 'abTesting':
      return plan.limits.abTesting;
    case 'apiAccess':
      return plan.limits.apiAccess;
    case 'advancedExport':
      return plan.limits.advancedExport;
    case 'support':
      if (plan.support === 'dedicated') return 'Dedicado + Onboarding';
      if (plan.support === 'docs+bot+chat-priority') return 'Docs + Bot IA + Chat prioritário';
      if (plan.support === 'docs+bot+chat') return 'Docs + Bot IA + Chat';
      return 'Documentação';
    default:
      return false;
  }
}

export default function PricingPage() {
  const { data: session } = useSession();
  const currentPlan = session?.user?.plan || null;
  const [annual, setAnnual] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">Q</span>
              </div>
              <span className="text-lg font-bold text-gray-900">QuizMeBaby</span>
            </Link>
            <Link
              href={session ? '/' : '/login'}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <ArrowLeft size={16} />
              Voltar
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Escolha o plano ideal
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-8">
            Comece grátis e escale conforme seu negócio cresce. Cancele quando quiser.
          </p>

          {/* Annual/Monthly toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!annual ? 'text-gray-900' : 'text-gray-400'}`}>
              Mensal
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                annual ? 'bg-accent' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                  annual ? 'translate-x-7' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-gray-900' : 'text-gray-400'}`}>
              Anual
            </span>
            {annual && (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                ~17% OFF
              </span>
            )}
          </div>
        </div>

        {/* Plans grid - 5 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 xl:gap-6 mb-12">
          {PLAN_ORDER.map((planId) => {
            const plan = PLANS[planId];
            const isCurrentPlan = currentPlan === planId;
            const displayPrice = annual ? plan.priceAnnual : plan.price;
            const isEnterprise = planId === 'enterprise';

            return (
              <div
                key={planId}
                className={`relative rounded-2xl p-6 transition-all flex flex-col ${
                  plan.popular
                    ? 'bg-gradient-to-b from-accent to-purple-700 text-white shadow-xl shadow-accent/20 lg:scale-105 lg:-my-2 z-10'
                    : isEnterprise
                    ? 'bg-gradient-to-b from-gray-800 to-gray-900 text-white shadow-lg'
                    : 'bg-white border border-gray-200 hover:border-accent/30 hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                    <Star size={11} /> MAIS POPULAR
                  </div>
                )}
                {plan.badge && !plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-600 text-white text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                    <Building2 size={11} /> {plan.badge.toUpperCase()}
                  </div>
                )}

                <h3 className={`text-lg font-semibold mb-1 ${
                  plan.popular || isEnterprise ? 'text-white' : 'text-gray-900'
                }`}>
                  {plan.name}
                </h3>
                <p className={`text-xs mb-4 ${
                  plan.popular ? 'text-purple-200' : isEnterprise ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className={`text-3xl xl:text-4xl font-bold ${
                    plan.popular || isEnterprise ? 'text-white' : 'text-gray-900'
                  }`}>
                    {plan.price === 0 ? 'R$ 0' : `R$ ${Math.round(displayPrice)}`}
                  </span>
                  <span className={`text-xs ${
                    plan.popular ? 'text-purple-200' : isEnterprise ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {plan.period}
                  </span>
                  {annual && plan.price > 0 && (
                    <p className={`text-xs mt-1 ${
                      plan.popular ? 'text-purple-200' : isEnterprise ? 'text-gray-400' : 'text-gray-400'
                    }`}>
                      {plan.priceAnnualLabel}
                    </p>
                  )}
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs">
                      <Check
                        size={14}
                        className={`mt-0.5 shrink-0 ${
                          plan.popular ? 'text-purple-200' : isEnterprise ? 'text-gray-400' : 'text-accent'
                        }`}
                      />
                      <span className={
                        plan.popular ? 'text-white/90' : isEnterprise ? 'text-gray-300' : 'text-gray-600'
                      }>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <div
                    className={`w-full text-center py-2.5 rounded-xl font-medium text-sm ${
                      plan.popular ? 'bg-white/20 text-white' : isEnterprise ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    Plano Atual
                  </div>
                ) : (
                  <Link
                    href={plan.price === 0 ? '/login' : `/login?plan=${planId}${annual ? '&annual=true' : ''}`}
                    className={`w-full block text-center py-2.5 rounded-xl font-medium text-sm transition-all ${
                      plan.popular
                        ? 'bg-white text-accent hover:bg-gray-100'
                        : isEnterprise
                        ? 'bg-white text-gray-900 hover:bg-gray-100'
                        : 'bg-accent hover:bg-accent-hover text-white'
                    }`}
                  >
                    {plan.price === 0 ? 'Começar Grátis' : 'Assinar'}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Toggle comparison table */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="text-accent hover:underline font-medium text-sm"
          >
            {showComparison ? 'Ocultar comparativo' : 'Ver comparativo completo de features'}
          </button>
        </div>

        {/* Comparison Table */}
        {showComparison && (
          <div className="overflow-x-auto mb-16">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 w-48">Feature</th>
                  {PLAN_ORDER.map((planId) => (
                    <th key={planId} className="text-center py-3 px-3 font-semibold text-gray-900 min-w-[100px]">
                      {PLANS[planId].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((feature) => (
                  <tr key={feature.key} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-600">{feature.label}</td>
                    {PLAN_ORDER.map((planId) => {
                      const value = getComparisonValue(PLANS[planId], feature);
                      return (
                        <td key={planId} className="text-center py-3 px-3">
                          {typeof value === 'boolean' ? (
                            value ? (
                              <Check size={16} className="text-accent mx-auto" />
                            ) : (
                              <X size={16} className="text-gray-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-gray-700 text-xs">{value}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FAQ or extra info */}
        <div className="text-center">
          <p className="text-gray-500">
            Precisa de um plano customizado?{' '}
            <a href="mailto:contato@quizmebaby.app" className="text-accent hover:underline font-medium">
              Fale conosco
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
