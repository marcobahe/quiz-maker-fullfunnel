'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Layout/Sidebar';
import Link from 'next/link';
import {
  Globe, Plus, Trash2, RefreshCw, CheckCircle, Clock, AlertCircle,
  Copy, CheckCircle2, Loader2, X, ChevronDown, ExternalLink, Info, ChevronLeft,
} from 'lucide-react';

// ── Copy button ─────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
      title="Copiar"
    >
      {copied ? (
        <CheckCircle2 size={16} className="text-green-500" />
      ) : (
        <Copy size={16} className="text-gray-400" />
      )}
    </button>
  );
}

// ── Status badge ────────────────────────────────────────────
function StatusBadge({ verified, checking }) {
  if (checking) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
        <Loader2 size={12} className="animate-spin" /> Verificando...
      </span>
    );
  }
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
        <CheckCircle size={12} /> Verificado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
      <Clock size={12} /> Pendente
    </span>
  );
}

export default function DomainsSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [domains, setDomains] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [newQuizId, setNewQuizId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [checkingId, setCheckingId] = useState(null);
  const [verifyMessage, setVerifyMessage] = useState({});
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeWorkspaceId') || null;
    }
    return null;
  });

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

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchDomains = useCallback(async () => {
    try {
      const res = await fetch('/api/domains');
      if (res.ok) {
        const data = await res.json();
        setDomains(data);
      }
    } catch (err) {
      console.error('Error fetching domains:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await fetch('/api/quizzes');
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.filter((q) => q.status === 'published'));
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchDomains();
      fetchQuizzes();
    }
  }, [session, fetchDomains, fetchQuizzes]);

  const handleAddDomain = async (e) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: newDomain.trim(),
          quizId: newQuizId || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao adicionar domínio');
        return;
      }

      setDomains((prev) => [data, ...prev]);
      setNewDomain('');
      setNewQuizId('');
      setShowForm(false);
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async (domainId) => {
    setCheckingId(domainId);
    setVerifyMessage((prev) => ({ ...prev, [domainId]: null }));

    try {
      const res = await fetch(`/api/domains/${domainId}/verify`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok) {
        setDomains((prev) =>
          prev.map((d) =>
            d.id === domainId ? { ...d, verified: data.verified, quiz: data.quiz } : d
          )
        );
        if (data.errorMessage) {
          setVerifyMessage((prev) => ({
            ...prev,
            [domainId]: { type: 'error', text: data.errorMessage },
          }));
        } else {
          setVerifyMessage((prev) => ({
            ...prev,
            [domainId]: { type: 'success', text: 'DNS verificado com sucesso!' },
          }));
        }
      } else {
        setVerifyMessage((prev) => ({
          ...prev,
          [domainId]: { type: 'error', text: data.error || 'Erro na verificação' },
        }));
      }
    } catch (err) {
      setVerifyMessage((prev) => ({
        ...prev,
        [domainId]: { type: 'error', text: 'Erro de conexão' },
      }));
    } finally {
      setCheckingId(null);
    }
  };

  const handleDelete = async (domainId) => {
    if (!confirm('Tem certeza que deseja remover este domínio?')) return;

    try {
      const res = await fetch(`/api/domains/${domainId}`, { method: 'DELETE' });
      if (res.ok) {
        setDomains((prev) => prev.filter((d) => d.id !== domainId));
      }
    } catch (err) {
      console.error('Error deleting domain:', err);
    }
  };

  const handleQuizChange = async (domainId, quizId) => {
    try {
      const res = await fetch(`/api/domains/${domainId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: quizId || null }),
      });

      if (res.ok) {
        const updated = await res.json();
        setDomains((prev) =>
          prev.map((d) => (d.id === domainId ? updated : d))
        );
      }
    } catch (err) {
      console.error('Error updating domain:', err);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        onCreateQuiz={handleCreateQuiz}
        onOpenTemplates={() => router.push('/templates')}
        userName={session?.user?.name || session?.user?.email}
        activeWorkspaceId={activeWorkspaceId}
        onWorkspaceChange={handleWorkspaceChange}
      />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link href="/settings" className="hover:text-accent transition-colors">Configurações</Link>
            <ChevronLeft size={14} className="rotate-180" />
            <span className="text-gray-800">Domínios</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Globe size={28} className="text-accent" />
            Domínios Personalizados
          </h1>
          <p className="text-gray-500">Configure domínios customizados (CNAME) para seus quizzes</p>
        </div>

      <div className="max-w-4xl space-y-6">
        {/* Instructions Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Globe size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Como configurar um domínio personalizado
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>Sirva seus quizzes diretamente no seu domínio (ex: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-accent">quiz.seusite.com.br</code>).</p>
                <ol className="list-decimal list-inside space-y-1.5 mt-3">
                  <li>Acesse o <strong className="text-gray-800">painel DNS</strong> do seu provedor de domínio</li>
                  <li>Crie um registro <strong className="text-gray-800">CNAME</strong> apontando para:
                    <span className="inline-flex items-center gap-1 ml-1">
                      <code className="bg-gray-100 px-2 py-0.5 rounded text-accent font-mono text-xs">quiz.fullfunnel.com.br</code>
                      <CopyButton text="quiz.fullfunnel.com.br" />
                    </span>
                  </li>
                  <li>Aguarde a propagação DNS (pode levar <strong className="text-gray-800">até 48 horas</strong>)</li>
                  <li>Clique em <strong className="text-gray-800">&quot;Verificar&quot;</strong> para confirmar a configuração</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Header + Add Button */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Seus Domínios
            {domains.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({domains.length})
              </span>
            )}
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancelar' : 'Adicionar Domínio'}
          </button>
        </div>

        {/* Add Domain Form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <form onSubmit={handleAddDomain} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Domínio
                </label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="quiz.seusite.com.br"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Não inclua http:// ou https://
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Quiz associado <span className="text-gray-500">(opcional)</span>
                </label>
                <select
                  value={newQuizId}
                  onChange={(e) => setNewQuizId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="">Selecionar depois...</option>
                  {quizzes.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.name}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving || !newDomain.trim()}
                className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Adicionar Domínio
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Domains List */}
        {domains.length === 0 && !showForm ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
            <Globe size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Nenhum domínio configurado
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Adicione um domínio personalizado para servir seus quizzes no seu próprio endereço.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
            >
              <Plus size={16} /> Adicionar Domínio
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Globe size={18} className="text-accent shrink-0" />
                      <span className="font-mono text-gray-800 font-medium truncate">
                        {domain.domain}
                      </span>
                      <StatusBadge
                        verified={domain.verified}
                        checking={checkingId === domain.id}
                      />
                    </div>

                    {/* Quiz selector */}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-gray-500">Quiz:</span>
                      <select
                        value={domain.quizId || ''}
                        onChange={(e) => handleQuizChange(domain.id, e.target.value)}
                        className="border border-gray-300 rounded-md px-2.5 py-1 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-accent"
                      >
                        <option value="">Nenhum quiz selecionado</option>
                        {quizzes.map((q) => (
                          <option key={q.id} value={q.id}>
                            {q.name}
                          </option>
                        ))}
                      </select>
                      {domain.quiz && domain.verified && (
                        <a
                          href={`https://${domain.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:text-accent-hover transition-colors"
                          title="Abrir domínio"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>

                    {/* CNAME target info */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">CNAME →</span>
                      <code className="text-xs font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                        {domain.cnameTarget}
                      </code>
                      <CopyButton text={domain.cnameTarget} />
                    </div>

                    {/* Verify message */}
                    {verifyMessage[domain.id] && (
                      <div
                        className={`mt-2 text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
                          verifyMessage[domain.id].type === 'success'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {verifyMessage[domain.id].type === 'success' ? (
                          <CheckCircle size={14} />
                        ) : (
                          <AlertCircle size={14} />
                        )}
                        {verifyMessage[domain.id].text}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleVerify(domain.id)}
                      disabled={checkingId === domain.id}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      title="Verificar DNS"
                    >
                      <RefreshCw
                        size={14}
                        className={checkingId === domain.id ? 'animate-spin' : ''}
                      />
                      Verificar
                    </button>
                    <button
                      onClick={() => handleDelete(domain.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Remover domínio"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DNS Example Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-gray-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Exemplo de configuração DNS
              </h4>
              <div className="bg-gray-100 rounded-lg p-4 font-mono text-xs text-gray-600 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-500">
                      <td className="pr-4 pb-2">Tipo</td>
                      <td className="pr-4 pb-2">Nome</td>
                      <td className="pr-4 pb-2">Valor</td>
                      <td className="pb-2">TTL</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-accent">
                      <td className="pr-4">CNAME</td>
                      <td className="pr-4">quiz</td>
                      <td className="pr-4">quiz.fullfunnel.com.br</td>
                      <td>3600</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Neste exemplo, <code className="text-gray-600">quiz.seudominio.com.br</code> será
                redirecionado para o seu quiz.
              </p>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
