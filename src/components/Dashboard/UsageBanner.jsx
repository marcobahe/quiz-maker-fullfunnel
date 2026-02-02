'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowUpRight, X } from 'lucide-react';

export default function UsageBanner() {
  const [billing, setBilling] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/billing/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setBilling(data);
      })
      .catch(() => {});
  }, []);

  if (dismissed || !billing) return null;

  const { usage, plan } = billing;
  if (plan === 'business') return null; // unlimited

  const quizPct = usage?.quizzes?.percentage || 0;
  const leadPct = usage?.leadsPerMonth?.percentage || 0;

  const atLimit = quizPct >= 100 || leadPct >= 100;
  const nearLimit = quizPct >= 80 || leadPct >= 80;

  if (!nearLimit && !atLimit) return null;

  const messages = [];
  if (usage.quizzes.limit !== -1) {
    messages.push(
      `${usage.quizzes.current} de ${usage.quizzes.limit} quizzes`
    );
  }
  if (usage.leadsPerMonth.limit !== -1) {
    messages.push(
      `${usage.leadsPerMonth.current} de ${usage.leadsPerMonth.limit.toLocaleString('pt-BR')} leads/mês`
    );
  }

  return (
    <div
      className={`rounded-xl px-5 py-4 flex items-center justify-between gap-4 mb-6 ${
        atLimit
          ? 'bg-red-50 border border-red-200'
          : 'bg-amber-50 border border-amber-200'
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <AlertTriangle
          size={20}
          className={atLimit ? 'text-red-500 shrink-0' : 'text-amber-500 shrink-0'}
        />
        <div className="min-w-0">
          <p
            className={`text-sm font-medium ${
              atLimit ? 'text-red-700' : 'text-amber-700'
            }`}
          >
            {atLimit
              ? 'Você atingiu o limite do seu plano'
              : 'Você está se aproximando do limite'}
          </p>
          <p
            className={`text-xs ${
              atLimit ? 'text-red-500' : 'text-amber-500'
            }`}
          >
            Usando: {messages.join(' • ')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/pricing"
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            atLimit
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-amber-500 hover:bg-amber-600 text-white'
          }`}
        >
          Fazer Upgrade
          <ArrowUpRight size={14} />
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className={`p-1.5 rounded-lg transition-colors ${
            atLimit
              ? 'text-red-400 hover:bg-red-100'
              : 'text-amber-400 hover:bg-amber-100'
          }`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
