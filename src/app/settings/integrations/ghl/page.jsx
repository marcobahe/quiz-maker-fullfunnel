'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Layout/Sidebar';
import {
  Zap,
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2,
  Check,
  AlertTriangle,
  Globe,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  X,
} from 'lucide-react';

const GHL_SCOPES = [
  { key: 'contacts.write', label: 'contacts.write', required: true },
  { key: 'contacts.readonly', label: 'contacts.readonly', required: true },
  { key: 'locations.readonly', label: 'locations.readonly', required: true },
  { key: 'opportunities.write', label: 'opportunities.write', required: false },
];

const GHL_INTEGRATION_URL = 'https://app.gohighlevel.com/';

export default function GhlIntegrationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeWorkspaceId') || null;
    }
    return null;
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null); // { type, text }
  const [showTutorial, setShowTutorial] = useState(false);
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);

  // Form state
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Validation result
  const [validationResult, setValidationResult] = useState(null); // { valid, accountName, locationId, requiredScopes }

  // Current connection (from GET /api/workspaces/:id/integrations/ghl)
  const [connection, setConnection] = useState(null); // { configured, ghlSyncStatus, accountName?, locationId? }

  const handleWorkspaceChange = (wsId) => {
    setActiveWorkspaceId(wsId);
    localStorage.setItem('activeWorkspaceId', wsId);
  };

  const handleCreateQuiz = async () => {
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Meu Novo Quiz', workspaceId: activeWorkspaceId }),
      });
      if (res.ok) {
        const quiz = await res.json();
        router.push(`/builder/${quiz.id}`);
      }
    } catch (err) {
      console.error('Failed to create quiz:', err);
    }
  };

  // Fetch current connection on mount
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && activeWorkspaceId) {
      fetchConnection();
    } else if (status === 'authenticated' && !activeWorkspaceId) {
      setLoading(false);
    }
  }, [status, activeWorkspaceId, router]);

  const fetchConnection = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/integrations/ghl`);
      if (res.ok) {
        const data = await res.json();
        setConnection(data);
      } else if (res.status === 404) {
        setConnection(null);
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: data.error || 'Erro ao carregar integração' });
        setConnection(null);
      }
    } catch (err) {
      console.error('Failed to fetch GHL connection:', err);
      setConnection(null);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Informe a API key' });
      return;
    }
    setValidating(true);
    setMessage(null);
    setValidationResult(null);

    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/integrations/ghl/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: apiKey.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Erro ao validar token' });
        setValidationResult(null);
      } else if (!data.valid) {
        setMessage({ type: 'error', text: data.error || 'Token inválido ou sem permissões suficientes' });
        setValidationResult(null);
      } else {
        setValidationResult(data);
        setMessage(null);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro de conexão ao validar token' });
      setValidationResult(null);
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async () => {
    if (!validationResult?.valid) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/integrations/ghl`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          accountName: validationResult.accountName ?? null,
          locationId: validationResult.locationId ?? null,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setConnection({
          configured: true,
          ghlSyncStatus: data.ghlSyncStatus,
          accountName: validationResult.accountName,
          locationId: validationResult.locationId,
        });
        setApiKey('');
        setValidationResult(null);
        setMessage({ type: 'success', text: 'Integração com GoHighLevel salva com sucesso!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar integração' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro de conexão ao salvar' });
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/integrations/ghl`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setConnection(null);
        setApiKey('');
        setValidationResult(null);
        setShowConfirmDisconnect(false);
        setMessage({ type: 'success', text: 'Integração desconectada.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao desconectar' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro de conexão ao desconectar' });
    } finally {
      setDisconnecting(false);
    }
  };

  const handleCancelValidation = () => {
    setValidationResult(null);
    setApiKey('');
    setMessage(null);
  };

  if (status === 'loading' || (loading && !connection)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0f1129]">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  const isConnected = connection?.configured === true;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0f1129]">
      <Sidebar
        onCreateQuiz={handleCreateQuiz}
        onOpenTemplates={() => router.push('/templates')}
        userName={session?.user?.name || session?.user?.email}
        activeWorkspaceId={activeWorkspaceId}
        onWorkspaceChange={handleWorkspaceChange}
      />

      <main className="flex-1 p-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/settings"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-accent flex items-center gap-1 mb-3"
          >
            <ChevronLeft size={16} /> Configurações
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Globe size={28} className="text-accent" />
            GoHighLevel
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Conecte seu workspace ao GoHighLevel para sincronizar leads automaticamente
          </p>
        </div>

        {/* Feedback message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}
          >
            {message.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
            {message.text}
            <button
              onClick={() => setMessage(null)}
              className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Connected State */}
        {isConnected ? (
          <div className="bg-white dark:bg-[#151837]/60 dark:backdrop-blur border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <ShieldCheck size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                {connection.accountName ? (
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Conectado como <span className="text-accent">{connection.accountName}</span>
                  </h3>
                ) : (
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    GoHighLevel conectado
                  </h3>
                )}
                {connection.locationId && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Location ID: <code className="text-xs bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">{connection.locationId}</code>
                  </p>
                )}
              </div>
              <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Ativo
              </span>
            </div>

            {/* Required scopes reminder */}
            <div className="pt-4 border-t border-gray-200 dark:border-white/10">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Escopos necessários
              </h4>
              <div className="flex flex-wrap gap-2">
                {GHL_SCOPES.map((scope) => (
                  <span
                    key={scope.key}
                    className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"
                  >
                    {scope.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Disconnect */}
            <div className="pt-4 border-t border-gray-200 dark:border-white/10">
              {!showConfirmDisconnect ? (
                <button
                  onClick={() => setShowConfirmDisconnect(true)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={16} />
                  Desconectar
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Tem certeza? Os quizzes deste workspace deixarão de enviar leads para o GoHighLevel.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDisconnect}
                      disabled={disconnecting}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {disconnecting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      {disconnecting ? 'Desconectando...' : 'Sim, desconectar'}
                    </button>
                    <button
                      onClick={() => setShowConfirmDisconnect(false)}
                      disabled={disconnecting}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-white/10 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Not Connected State */
          <div className="space-y-6">
            {/* Tutorial Card */}
            <div className="bg-white dark:bg-[#151837]/60 dark:backdrop-blur border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowTutorial(!showTutorial)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Zap size={20} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      Como obter sua API Key no GoHighLevel
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Siga os passos abaixo para criar uma integração privada
                    </p>
                  </div>
                </div>
                {showTutorial ? (
                  <ChevronUp size={18} className="text-gray-400" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </button>

              {showTutorial && (
                <div className="px-5 pb-5">
                  <div className="p-5 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 rounded-xl">
                    <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex gap-3">
                        <span className="font-semibold text-orange-600 shrink-0">1.</span>
                        <span>
                          Acesse{' '}
                          <a
                            href={GHL_INTEGRATION_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline inline-flex items-center gap-1"
                          >
                            app.gohighlevel.com <ExternalLink size={12} />
                          </a>{' '}
                          e faça login na sua sub-conta
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-orange-600 shrink-0">2.</span>
                        <span>
                          Vá em <strong>Settings → Integrations → Private Integrations</strong>
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-orange-600 shrink-0">3.</span>
                        <span>
                          Clique em <strong>&quot;Create New Integration&quot;</strong> e dê o nome <strong>&quot;QuizMeBaby&quot;</strong>
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-orange-600 shrink-0">4.</span>
                        <div className="flex-1">
                          <span>Marque os escopos necessários:</span>
                          <ul className="mt-2 space-y-1.5">
                            {GHL_SCOPES.map((scope) => (
                              <li key={scope.key} className="flex items-center gap-2">
                                <code className="bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded text-xs font-mono text-orange-700 dark:text-orange-300">
                                  {scope.label}
                                </code>
                                {scope.required && (
                                  <span className="text-[10px] uppercase tracking-wider text-orange-600 dark:text-orange-400 font-semibold">
                                    obrigatório
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-orange-600 shrink-0">5.</span>
                        <span>
                          Clique em <strong>&quot;Create&quot;</strong> e copie o token gerado
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-orange-600 shrink-0">6.</span>
                        <span>Cole o token no campo abaixo e clique em Validar</span>
                      </li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-[#151837]/60 dark:backdrop-blur border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-5">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <Globe size={18} className="text-accent" />
                Conectar ao GoHighLevel
              </h3>

              {/* API Key input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  API Key (Private Integration Token)
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      if (validationResult) setValidationResult(null);
                      if (message?.type === 'error') setMessage(null);
                    }}
                    disabled={saving}
                    placeholder="pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  O token é vinculado à sua sub-conta no GoHighLevel. Não é necessário informar Location ID.
                </p>
              </div>

              {/* Validation result */}
              {validationResult?.valid && (
                <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Check size={18} />
                    <span className="text-sm font-medium">Token válido!</span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <p>
                      <span className="text-gray-500 dark:text-gray-400">Conta:</span>{' '}
                      <strong>{validationResult.accountName}</strong>
                    </p>
                    <p>
                      <span className="text-gray-500 dark:text-gray-400">Location ID:</span>{' '}
                      <code className="text-xs bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">
                        {validationResult.locationId}
                      </code>
                    </p>
                  </div>
                  {validationResult.requiredScopes && validationResult.requiredScopes.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Escopos necessários:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {validationResult.requiredScopes.map((scope) => (
                          <span
                            key={scope}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      {saving ? 'Salvando...' : 'Confirmar e Salvar'}
                    </button>
                    <button
                      onClick={handleCancelValidation}
                      disabled={saving}
                      className="px-5 py-2.5 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              {!validationResult?.valid && (
                <div className="flex gap-3">
                  <button
                    onClick={handleValidate}
                    disabled={validating || !apiKey.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {validating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                    {validating ? 'Validando...' : 'Validar'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
