'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Check, Star, ArrowLeft, X } from 'lucide-react';
import { PLANS, PLAN_ORDER } from '@/lib/plans';

export default function PricingPage() {
  const { data: session } = useSession();
  const currentPlan = session?.user?.plan || null;

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
              <span className="text-lg font-bold text-gray-900">Quiz Maker</span>
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
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Escolha o plano ideal
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Comece grátis e escale conforme seu negócio cresce. Cancele quando quiser.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PLAN_ORDER.map((planId) => {
            const plan = PLANS[planId];
            const isCurrentPlan = currentPlan === planId;

            return (
              <div
                key={planId}
                className={`relative rounded-2xl p-8 transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-b from-accent to-purple-700 text-white shadow-xl shadow-accent/20 scale-[1.02] lg:scale-105'
                    : 'bg-white border border-gray-200 hover:border-accent/30 hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                    <Star size={12} /> MAIS POPULAR
                  </div>
                )}

                <h3 className={`text-xl font-semibold mb-1 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.popular ? 'text-purple-200' : 'text-gray-500'}`}>
                  {plan.description}
                </p>

                <div className="mb-8">
                  <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.priceLabel}
                  </span>
                  <span className={`text-sm ${plan.popular ? 'text-purple-200' : 'text-gray-500'}`}>
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check
                        size={16}
                        className={`mt-0.5 shrink-0 ${plan.popular ? 'text-purple-200' : 'text-accent'}`}
                      />
                      <span className={plan.popular ? 'text-white/90' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <div
                    className={`w-full text-center py-3 rounded-xl font-medium ${
                      plan.popular ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    Plano Atual
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className={`w-full block text-center py-3 rounded-xl font-medium transition-all ${
                      plan.popular
                        ? 'bg-white text-accent hover:bg-gray-100'
                        : 'bg-accent hover:bg-accent-hover text-white'
                    }`}
                  >
                    {plan.price === 0 ? 'Começar Grátis' : 'Escolher Plano'}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ or extra info */}
        <div className="mt-16 text-center">
          <p className="text-gray-500">
            Precisa de um plano customizado?{' '}
            <a href="mailto:contato@quizmaker.com.br" className="text-accent hover:underline font-medium">
              Fale conosco
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
