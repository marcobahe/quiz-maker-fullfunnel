'use client';

import { useState } from 'react';
import { Lock, DollarSign, Type, FileText, CreditCard } from 'lucide-react';
import useQuizStore from '@/store/quizStore';

export default function PaywallSettings() {
  const { paywall, updatePaywall } = useQuizStore();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { quizId, serverUpdatedAt, paywall: pw } = useQuizStore.getState();
      const res = await fetch(`/api/quizzes/${quizId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paywallEnabled: pw?.enabled,
          paywallPrice: pw?.price,
          paywallType: pw?.type,
          paywallStripePriceId: pw?.stripePriceId,
          paywallTitle: pw?.title,
          paywallDescription: pw?.description,
          clientUpdatedAt: serverUpdatedAt,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save paywall settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toggle Paywall */}
      <div className="bg-white dark:bg-[#151837] rounded-xl p-6 border border-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Lock size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Paywall</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cobrar pelo resultado do quiz
              </p>
            </div>
          </div>
          <button
            onClick={() => updatePaywall({ enabled: !paywall?.enabled })}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              paywall?.enabled ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                paywall?.enabled ? 'translate-x-7' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {paywall?.enabled && (
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-white/10">
            {/* Preco */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign size={16} /> Preco (em centavos)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={paywall?.price || 0}
                onChange={(e) => updatePaywall({ price: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1129] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Ex: 4700 = R$ 47,00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Valor exibido: R$ {((paywall?.price || 0) / 100).toFixed(2).replace('.', ',')}
              </p>
            </div>

            {/* Tipo */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <CreditCard size={16} /> Tipo de bloqueio
              </label>
              <select
                value={paywall?.type || 'result'}
                onChange={(e) => updatePaywall({ type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1129] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="result">Bloquear resultado</option>
                <option value="full">Bloquear quiz completo</option>
                <option value="lead">Bloquear apos lead</option>
              </select>
            </div>

            {/* Titulo */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Type size={16} /> Titulo do paywall
              </label>
              <input
                type="text"
                value={paywall?.title || ''}
                onChange={(e) => updatePaywall({ title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1129] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Ex: Desbloqueie seu resultado completo"
              />
            </div>

            {/* Descricao */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText size={16} /> Descricao
              </label>
              <textarea
                value={paywall?.description || ''}
                onChange={(e) => updatePaywall({ description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1129] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={3}
                placeholder="Ex: Invista em voce e descubra o resultado completo agora mesmo."
              />
            </div>

            {/* Stripe Price ID (opcional) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <CreditCard size={16} /> Stripe Price ID (opcional)
              </label>
              <input
                type="text"
                value={paywall?.stripePriceId || ''}
                onChange={(e) => updatePaywall({ stripePriceId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1129] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="price_... (deixe em branco para criar automaticamente)"
              />
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Configuracoes'}
        </button>
      </div>
    </div>
  );
}
