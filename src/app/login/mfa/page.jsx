'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

export default function MfaChallengePage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If no MFA pending, nothing to do here
  if (session && !session.user?.mfaPending) {
    router.replace('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/user/mfa/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Código inválido');
        setLoading(false);
        return;
      }

      // Clear mfaPending from session JWT
      await update({ mfaVerified: true });
      router.push('/');
      router.refresh();
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">Q</span>
            </div>
            <h1 className="text-3xl font-bold text-white">QuizMeBaby</h1>
          </div>
          <p className="text-purple-200">Verificação em dois fatores</p>
        </div>

        <div className="bg-white dark:bg-[#151837] rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Código MFA</h2>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            Abra seu aplicativo autenticador e insira o código de 6 dígitos, ou use um código de backup.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Código de verificação
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9A-Za-z-]/g, ''))}
                maxLength={9}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-[#1e2340] dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Verificando...' : 'Verificar'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Sem acesso ao app? Use um dos seus{' '}
            <span className="text-purple-600 font-medium">códigos de backup</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
