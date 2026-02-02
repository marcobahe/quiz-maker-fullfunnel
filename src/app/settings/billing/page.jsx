'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  ChevronLeft,
  ArrowUpRight,
  Crown,
  Zap,
  Rocket,
  BarChart3,
  FileQuestion,
  Users,
  Check,
  ExternalLink,
} from 'lucide-react';
import { PLANS, FEATURE_LABELS } from '@/lib/plans';

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500"></div>
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}

const PLAN_ICONS = {
  free: Zap,
  pro: Crown,
  business: Rocket,
};

const PLAN_COLORS = {
  free: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  pro: 'bg-accent/10 text-accent border-accent/20',
  business: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

function UsageBar({ label, icon: Icon, current, limit, className }) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min(Math.round((current / limit) * 100), 100);
  const isWarning = !isUnlimited && percentage >= 80;
  const isDanger = !isUnlimited && percentage >= 100;

  return (
    <div className={`bg-white/[0.02] border border-white/10 rounded-xl p-5 ${className || ''}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon size={18} className="text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-xs text-gray-500">
            {isUnlimited
              ? `${current} utilizados • Ilimitado`
              : `${current} de ${limit.toLocaleString('pt-BR')}`}
          </p>
        </div>
        {!isUnlimited && (
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              isDanger
                ? 'bg-red-500/10 text-red-400'
                : isWarning
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-green-500/10 text-green-400'
            }`}
          >
            {percentage}%
          </span>
        )}
      </div>
      {!isUnlimited && (
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isDanger
                ? 'bg-red-500'
                : isWarning
                ? 'bg-amber-500'
                : 'bg-accent'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function BillingContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const success = searchParams.get('success');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBilling();
    }
  }, [status]);

  const fetchBilling = async () => {
    try {
      const res = await fetch('/api/billing/status');
      if (res.ok) {
        const data = await res.json();
        setBilling(data);
      }
    } catch (err) {
      console.error('Failed to fetch billing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Erro ao abrir portal.');
      }
    } catch (err) {
      console.error('Portal error:', err);
    } finally {
      setPortalLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
      </div>
    );
  }

  const plan = billing?.plan || 'free';
  const planDetails = PLANS[plan];
  const PlanIcon = PLAN_ICONS[plan];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-white/5 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/settings"
            className="text-gray-500 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <CreditCard size={20} className="text-accent" />
            <h1 className="text-white font-semibold">Plano & Cobrança</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Success Banner */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-300 px-5 py-4 rounded-xl flex items-center gap-3">
            <Check size={20} />
            <div>
              <p className="font-medium">Assinatura ativada com sucesso!</p>
              <p className="text-sm text-green-400/70">
                Seu plano foi atualizado. Aproveite todas as funcionalidades.
              </p>
            </div>
          </div>
        )}

        {/* Current Plan Card */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  plan === 'pro'
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                    : plan === 'business'
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                    : 'bg-gradient-to-br from-gray-500 to-gray-600'
                }`}
              >
                <PlanIcon size={24} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">
                    Plano {planDetails.name}
                  </h2>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${PLAN_COLORS[plan]}`}
                  >
                    Atual
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  {plan === 'free'
                    ? 'Funcionalidades básicas para começar'
                    : `R$ ${planDetails.price.toFixed(2).replace('.', ',')} /mês`}
                </p>
                {billing?.planExpiresAt && (
                  <p className="text-gray-600 text-xs mt-1">
                    Renova em{' '}
                    {new Date(billing.planExpiresAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {billing?.hasSubscription && (
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {portalLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ExternalLink size={16} />
                  )}
                  Gerenciar Assinatura
                </button>
              )}
              {plan !== 'business' && (
                <Link
                  href="/pricing"
                  className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <ArrowUpRight size={16} />
                  {plan === 'free' ? 'Fazer Upgrade' : 'Upgrade'}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Usage Section */}
        <div>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-accent" />
            Uso Atual
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <UsageBar
              label="Quizzes Criados"
              icon={FileQuestion}
              current={billing?.usage?.quizzes?.current || 0}
              limit={billing?.usage?.quizzes?.limit ?? 3}
            />
            <UsageBar
              label="Leads este mês"
              icon={Users}
              current={billing?.usage?.leadsPerMonth?.current || 0}
              limit={billing?.usage?.leadsPerMonth?.limit ?? 100}
            />
          </div>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Zap size={18} className="text-accent" />
            Funcionalidades do Plano
          </h3>
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
            <div className="grid sm:grid-cols-2 gap-3">
              {planDetails.limits.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-accent" />
                  </div>
                  <span className="text-gray-300">
                    {FEATURE_LABELS[feature] || feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upgrade CTA for free users */}
        {plan === 'free' && (
          <div className="bg-gradient-to-r from-accent/10 to-purple-500/10 border border-accent/20 rounded-2xl p-8 text-center">
            <Crown size={40} className="text-accent mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Desbloqueie todo o potencial
            </h3>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
              Faça upgrade para o Pro e tenha acesso a templates, analytics
              avançado, webhooks e muito mais.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium transition-colors"
            >
              Ver Planos
              <ArrowUpRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
