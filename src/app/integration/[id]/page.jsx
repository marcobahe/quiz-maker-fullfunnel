'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import TopBar from '@/components/Layout/TopBar';
import {
  Mail, MessageSquare, Database, Webhook, Check, Code, Copy, CheckCircle,
  Monitor, Smartphone, ExternalLink, Eye, EyeOff, Plus, Trash2, Zap,
  ToggleLeft, ToggleRight, Send, Loader2, AlertCircle, CheckCircle2, X,
} from 'lucide-react';

// ── Copy button with feedback ────────────────────────────────
function CopyButton({ text, label = 'Copiar' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
        copied
          ? 'bg-green-500 text-white'
          : 'bg-accent text-white hover:bg-accent-hover'
      }`}
    >
      {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
      {copied ? 'Copiado!' : label}
    </button>
  );
}

// ── Webhooks Section ─────────────────────────────────────────
function WebhooksSection({ quizId }) {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [testResults, setTestResults] = useState({});

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}/integrations`);
      const data = await res.json();
      setWebhooks(data.filter((i) => i.type === 'webhook'));
    } catch (err) {
      console.error('Error fetching webhooks:', err);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    if (quizId) fetchWebhooks();
  }, [quizId, fetchWebhooks]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formUrl.trim()) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/quizzes/${quizId}/integrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'webhook',
          name: formName.trim(),
          config: JSON.stringify({ url: formUrl.trim() }),
          active: true,
        }),
      });

      if (res.ok) {
        setFormName('');
        setFormUrl('');
        setShowForm(false);
        fetchWebhooks();
      }
    } catch (err) {
      console.error('Error adding webhook:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (webhook) => {
    try {
      await fetch(`/api/quizzes/${quizId}/integrations/${webhook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !webhook.active }),
      });
      fetchWebhooks();
    } catch (err) {
      console.error('Error toggling webhook:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja remover este webhook?')) return;
    try {
      await fetch(`/api/quizzes/${quizId}/integrations/${id}`, { method: 'DELETE' });
      fetchWebhooks();
    } catch (err) {
      console.error('Error deleting webhook:', err);
    }
  };

  const handleTest = async (webhook) => {
    setTestingId(webhook.id);
    setTestResults((prev) => ({ ...prev, [webhook.id]: null }));

    try {
      const res = await fetch(`/api/quizzes/${quizId}/integrations/${webhook.id}/test`, {
        method: 'POST',
      });
      const data = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [webhook.id]: data.success ? { success: true, status: data.status } : { success: false, error: data.error },
      }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [webhook.id]: { success: false, error: err.message },
      }));
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Webhook className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">Webhooks</h3>
              <p className="text-gray-500 text-sm">Envie dados de leads em tempo real para qualquer URL (Zapier, Make, n8n, etc)</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:bg-accent-hover transition-colors"
          >
            <Plus size={16} />
            Adicionar
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Add Form */}
        {showForm && (
          <form onSubmit={handleAdd} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Zapier - Email Marketing"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL do Webhook</label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://hooks.zapier.com/..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {saving ? 'Salvando...' : 'Salvar Webhook'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormName(''); setFormUrl(''); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium text-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Webhook List */}
        {loading ? (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <Loader2 size={24} className="animate-spin mr-2" />
            Carregando...
          </div>
        ) : webhooks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Webhook size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhum webhook configurado</p>
            <p className="text-xs mt-1">Clique em &quot;Adicionar&quot; para criar seu primeiro webhook</p>
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.map((wh) => {
              const config = JSON.parse(wh.config || '{}');
              const testResult = testResults[wh.id];
              return (
                <div
                  key={wh.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    wh.active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  {/* Status indicator */}
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${wh.active ? 'bg-green-500' : 'bg-gray-300'}`} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${wh.active ? 'text-gray-800' : 'text-gray-400'}`}>
                        {wh.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${wh.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {wh.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{config.url}</p>
                    {testResult && (
                      <div className={`flex items-center gap-1 mt-1 text-xs ${testResult.success ? 'text-green-600' : 'text-red-500'}`}>
                        {testResult.success ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {testResult.success ? `Sucesso (HTTP ${testResult.status})` : testResult.error}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleTest(wh)}
                      disabled={testingId === wh.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50"
                      title="Testar webhook"
                    >
                      {testingId === wh.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      Testar
                    </button>
                    <button
                      onClick={() => handleToggle(wh)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      title={wh.active ? 'Desativar' : 'Ativar'}
                    >
                      {wh.active ? (
                        <ToggleRight size={22} className="text-green-500" />
                      ) : (
                        <ToggleLeft size={22} className="text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(wh.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Full Funnel Section ──────────────────────────────────────

/** Extract questions from canvasData nodes */
function extractQuestions(canvasData) {
  const questions = [];
  if (!canvasData?.nodes) return questions;

  for (const node of canvasData.nodes) {
    // Legacy single/multiple choice nodes
    if (node.type === 'single-choice' || node.type === 'multiple-choice') {
      questions.push({
        id: node.id,
        question: node.data?.question || 'Pergunta sem título',
        type: node.type,
      });
    }
    // Composite nodes with question elements
    if (node.type === 'composite' && node.data?.elements) {
      for (const el of node.data.elements) {
        if (el.type.startsWith('question-')) {
          questions.push({
            id: `${node.id}__${el.id}`,
            elementId: el.id,
            nodeId: node.id,
            question: el.question || 'Pergunta sem título',
            type: el.type,
          });
        }
      }
    }
  }
  return questions;
}

function FullFunnelSection({ quizId }) {
  const [ghl, setGhl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Form state
  const [privateToken, setPrivateToken] = useState('');
  const [pipelineId, setPipelineId] = useState('');
  const [stageId, setStageId] = useState('');
  const [tags, setTags] = useState('quiz-lead');
  const [active, setActive] = useState(true);
  const [showToken, setShowToken] = useState(false);

  // Custom field mappings
  const [customFieldMappings, setCustomFieldMappings] = useState({});
  const [questions, setQuestions] = useState([]);
  const [showMappings, setShowMappings] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Fetch quiz canvasData to extract questions
  const fetchQuizQuestions = useCallback(async () => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}`);
      if (!res.ok) return;
      const quiz = await res.json();
      const canvasData = typeof quiz.canvasData === 'string'
        ? JSON.parse(quiz.canvasData || '{}')
        : quiz.canvasData || {};
      setQuestions(extractQuestions(canvasData));
    } catch (err) {
      console.error('Error fetching quiz questions:', err);
    }
  }, [quizId]);

  const fetchIntegration = useCallback(async () => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}/integrations`);
      const data = await res.json();
      const existing = data.find((i) => i.type === 'gohighlevel');
      if (existing) {
        setGhl(existing);
        const config = JSON.parse(existing.config || '{}');
        // Backward compat: use privateToken, fallback to apiKey
        setPrivateToken(config.privateToken || config.apiKey || '');
        setPipelineId(config.pipelineId || '');
        setStageId(config.stageId || '');
        setTags((config.tags || ['quiz-lead']).join(', '));
        setCustomFieldMappings(config.customFieldMappings || {});
        setActive(existing.active);
      }
    } catch (err) {
      console.error('Error fetching Full Funnel integration:', err);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    if (quizId) {
      fetchIntegration();
      fetchQuizQuestions();
    }
  }, [quizId, fetchIntegration, fetchQuizQuestions]);

  const handleMappingChange = (key, value) => {
    setCustomFieldMappings((prev) => {
      const next = { ...prev };
      if (value.trim()) {
        next[key] = value.trim();
      } else {
        delete next[key];
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setTestResult(null);

    const config = {
      privateToken,
      pipelineId: pipelineId || undefined,
      stageId: stageId || undefined,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      customFieldMappings: Object.keys(customFieldMappings).length > 0 ? customFieldMappings : undefined,
    };

    try {
      if (ghl) {
        // Update existing
        const res = await fetch(`/api/quizzes/${quizId}/integrations/${ghl.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config, active, name: 'Full Funnel' }),
        });
        if (res.ok) {
          const updated = await res.json();
          setGhl(updated);
        }
      } else {
        // Create new
        const res = await fetch(`/api/quizzes/${quizId}/integrations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'gohighlevel',
            name: 'Full Funnel',
            config: JSON.stringify(config),
            active,
          }),
        });
        if (res.ok) {
          const created = await res.json();
          setGhl(created);
        }
      }
    } catch (err) {
      console.error('Error saving Full Funnel integration:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!ghl) {
      setTestResult({ success: false, error: 'Salve a configuração primeiro' });
      return;
    }
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`/api/quizzes/${quizId}/integrations/${ghl.id}/test`, {
        method: 'POST',
      });
      const data = await res.json();
      setTestResult(data.success
        ? { success: true, message: `Conectado! Location: ${data.locationName || 'OK'}` }
        : { success: false, error: data.error }
      );
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleToggle = async () => {
    const newActive = !active;
    setActive(newActive);
    if (ghl) {
      try {
        await fetch(`/api/quizzes/${quizId}/integrations/${ghl.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: newActive }),
        });
        fetchIntegration();
      } catch (err) {
        console.error('Error toggling Full Funnel integration:', err);
      }
    }
  };

  const handleDelete = async () => {
    if (!ghl) return;
    if (!confirm('Remover integração Full Funnel?')) return;
    try {
      await fetch(`/api/quizzes/${quizId}/integrations/${ghl.id}`, { method: 'DELETE' });
      setGhl(null);
      setPrivateToken('');
      setPipelineId('');
      setStageId('');
      setTags('quiz-lead');
      setCustomFieldMappings({});
      setActive(true);
      setTestResult(null);
    } catch (err) {
      console.error('Error deleting Full Funnel integration:', err);
    }
  };

  if (loading) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Zap className="text-orange-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">Full Funnel</h3>
              <p className="text-gray-500 text-sm">Envie leads automaticamente para seu CRM Full Funnel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {ghl && (
              <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-gray-400'}`} />
                {active ? 'Conectado' : 'Desativado'}
              </span>
            )}
            <button
              onClick={handleToggle}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title={active ? 'Desativar' : 'Ativar'}
            >
              {active ? (
                <ToggleRight size={24} className="text-green-500" />
              ) : (
                <ToggleLeft size={24} className="text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        {/* Setup Instructions Card */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center gap-2 text-sm font-medium text-orange-700 hover:text-orange-800 transition-colors"
          >
            <span className="text-base">📋</span>
            Como configurar a Integração Privada
            <svg
              className={`w-4 h-4 transition-transform ${showInstructions ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showInstructions && (
            <div className="mt-3 p-5 bg-orange-50 border border-orange-200 rounded-xl">
              <ol className="space-y-2.5 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="font-semibold text-orange-600 shrink-0">1.</span>
                  <span>No Full Funnel, vá em <strong>Configurações → Integrações → Integrações Privadas</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-orange-600 shrink-0">2.</span>
                  <span>Clique em <strong>&quot;Criar Nova Integração&quot;</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-orange-600 shrink-0">3.</span>
                  <span>Dê um nome (ex: <strong>&quot;QuizMeBaby&quot;</strong>)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-orange-600 shrink-0">4.</span>
                  <div>
                    <span>Marque os escopos necessários:</span>
                    <ul className="mt-1.5 ml-2 space-y-1">
                      <li className="flex items-center gap-1.5 text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                        <code className="bg-orange-100 px-1.5 py-0.5 rounded text-xs font-mono">contacts.write</code>
                      </li>
                      <li className="flex items-center gap-1.5 text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                        <code className="bg-orange-100 px-1.5 py-0.5 rounded text-xs font-mono">contacts.readonly</code>
                      </li>
                      <li className="flex items-center gap-1.5 text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                        <code className="bg-orange-100 px-1.5 py-0.5 rounded text-xs font-mono">locations.readonly</code>
                      </li>
                      <li className="flex items-center gap-1.5 text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                        <code className="bg-orange-100 px-1.5 py-0.5 rounded text-xs font-mono">opportunities.write</code>
                        <span className="text-xs text-gray-400 italic">(opcional, só se usar pipelines)</span>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-orange-600 shrink-0">5.</span>
                  <span>Clique em <strong>&quot;Criar&quot;</strong> e copie o token gerado</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-orange-600 shrink-0">6.</span>
                  <span>Cole o token abaixo</span>
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Token field - full width */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Token da Integração Privada *</label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={privateToken}
              onChange={(e) => setPrivateToken(e.target.value)}
              placeholder="pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">O token já é vinculado à sua sub-account — não é necessário informar Location ID.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline ID <span className="text-gray-400">(opcional)</span></label>
            <input
              type="text"
              value={pipelineId}
              onChange={(e) => setPipelineId(e.target.value)}
              placeholder="ID do pipeline"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage ID <span className="text-gray-400">(opcional)</span></label>
            <input
              type="text"
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
              placeholder="ID do estágio"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags <span className="text-gray-400">(separar por vírgula)</span></label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="quiz-lead, prospect"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
            />
          </div>
        </div>

        {/* ── Custom Field Mappings Section ──────────────── */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowMappings(!showMappings)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-accent transition-colors"
          >
            <Database size={16} />
            Mapeamento de Respostas para Campos Personalizados
            <svg
              className={`w-4 h-4 transition-transform ${showMappings ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showMappings && (
            <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 mb-4">
                Associe cada pergunta do quiz a um campo personalizado no Full Funnel.
                Cole o ID do campo (ex: <code className="bg-gray-200 px-1 py-0.5 rounded text-xs">custom_field_abc123</code>).
                Encontre os IDs em Full Funnel → Settings → Custom Fields.
              </p>

              {/* Question mappings */}
              {questions.length > 0 ? (
                <div className="space-y-3 mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Perguntas do Quiz</h4>
                  {questions.map((q) => (
                    <div key={q.id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate" title={q.question}>
                          {q.question}
                        </p>
                        <p className="text-xs text-gray-400">
                          {q.type === 'question-icons' ? 'Ícones' : q.type === 'question-multiple' || q.type === 'multiple-choice' ? 'Múltipla escolha' : q.type === 'question-open' ? 'Pergunta aberta' : q.type === 'question-rating' ? 'Nota / Avaliação' : 'Escolha única'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <div className="w-56">
                        <input
                          type="text"
                          value={customFieldMappings[q.id] || ''}
                          onChange={(e) => handleMappingChange(q.id, e.target.value)}
                          placeholder="custom_field_abc123"
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
                        />
                        {!customFieldMappings[q.id] && (
                          <p className="text-xs text-gray-400 mt-0.5">Não mapeado</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400 text-sm mb-4">
                  <Database size={20} className="mx-auto mb-1 opacity-40" />
                  Nenhuma pergunta encontrada no quiz.
                  <br />
                  <span className="text-xs">Adicione perguntas no Canvas para mapear campos.</span>
                </div>
              )}

              {/* Special mappings */}
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Campos Especiais</h4>

                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">Pontuação Total</p>
                    <p className="text-xs text-gray-400">Score final do quiz</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div className="w-56">
                    <input
                      type="text"
                      value={customFieldMappings['_score'] || ''}
                      onChange={(e) => handleMappingChange('_score', e.target.value)}
                      placeholder="custom_field_score"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
                    />
                    {!customFieldMappings['_score'] && (
                      <p className="text-xs text-gray-400 mt-0.5">Não mapeado</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">Resultado / Faixa</p>
                    <p className="text-xs text-gray-400">Categoria do resultado (ex: Excelente, Bom)</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div className="w-56">
                    <input
                      type="text"
                      value={customFieldMappings['_result'] || ''}
                      onChange={(e) => handleMappingChange('_result', e.target.value)}
                      placeholder="custom_field_result"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
                    />
                    {!customFieldMappings['_result'] && (
                      <p className="text-xs text-gray-400 mt-0.5">Não mapeado</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Test result */}
        {testResult && (
          <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm ${
            testResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {testResult.success ? testResult.message : testResult.error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !privateToken}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {saving ? 'Salvando...' : ghl ? 'Atualizar' : 'Salvar'}
          </button>
          <button
            onClick={handleTest}
            disabled={testing || !ghl}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {testing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            {testing ? 'Testando...' : 'Testar Conexão'}
          </button>
          {ghl && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-lg font-medium text-sm hover:bg-red-50 transition-colors ml-auto"
            >
              <Trash2 size={16} />
              Remover
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Embed Section Component ──────────────────────────────────
function EmbedSection({ quizId }) {
  const [quiz, setQuiz] = useState(null);
  const [embedStyle, setEmbedStyle] = useState('inline');
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('600');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!quizId) return;
    fetch(`/api/quizzes/${quizId}`)
      .then((r) => r.json())
      .then((data) => setQuiz(data))
      .catch(() => {});
  }, [quizId]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://seudominio.com';
  const slug = quiz?.slug || quizId;

  const iframeCode = `<iframe\n  src="${origin}/q/${slug}?embed=true"\n  width="${width}"\n  height="${height}"\n  frameborder="0"\n  style="border:none;"\n  allow="autoplay; fullscreen"\n></iframe>`;

  const popupCode = `<!-- QuizMeBaby Embed -->\n<script src="${origin}/embed.js" data-quiz="${slug}"></script>\n<button onclick="QuizMaker.open('${slug}')" style="background:#7c3aed;color:#fff;padding:12px 24px;border:none;border-radius:8px;font-size:16px;cursor:pointer;">Fazer Quiz</button>`;

  const activeCode = embedStyle === 'inline' ? iframeCode : popupCode;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
            <Code className="text-accent" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">Embed do Quiz</h3>
            <p className="text-gray-500 text-sm">Incorpore o quiz em qualquer site ou landing page</p>
          </div>
        </div>
      </div>

      <div className="px-6 pt-5">
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setEmbedStyle('inline')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              embedStyle === 'inline'
                ? 'bg-accent text-white shadow-md shadow-accent/25'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Monitor size={16} />
            Inline (iframe)
          </button>
          <button
            onClick={() => setEmbedStyle('popup')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              embedStyle === 'popup'
                ? 'bg-accent text-white shadow-md shadow-accent/25'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Smartphone size={16} />
            Popup (modal)
          </button>
        </div>

        {embedStyle === 'inline' && (
          <div className="flex gap-4 mb-5">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Largura</label>
              <input
                type="text"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
                placeholder="100% ou 600px"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Altura</label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
                placeholder="600"
              />
            </div>
          </div>
        )}

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {embedStyle === 'inline' ? 'Código HTML (iframe)' : 'Código HTML (popup)'}
            </span>
            <CopyButton text={activeCode} />
          </div>
          <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
            <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all leading-relaxed">
              {activeCode}
            </pre>
          </div>
        </div>

        <div className="mb-5">
          <span className="text-sm font-medium text-gray-700 mb-2 block">URL direta do quiz</span>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={`${origin}/q/${slug}`}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-600 text-sm"
            />
            <CopyButton text={`${origin}/q/${slug}`} label="Copiar" />
            <a
              href={`/q/${slug}?preview=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        <div className="pb-6">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            {showPreview ? 'Ocultar preview' : 'Mostrar preview'}
          </button>

          {showPreview && (
            <div className="mt-4 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-gray-500 ml-2 font-mono truncate">
                  {origin}/q/{slug}?embed=true
                </span>
              </div>
              <iframe
                src={`/q/${slug}?embed=true&preview=true`}
                width="100%"
                height={embedStyle === 'inline' ? height : '500'}
                style={{ border: 'none', display: 'block' }}
                title="Quiz Preview"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function IntegrationPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopBar quizId={params.id} />
      
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Integrações</h1>
            <p className="text-gray-500">Conecte seu quiz com suas ferramentas favoritas para automatizar o fluxo de leads.</p>
          </div>

          {/* ── Webhooks Section ──────────────────────────── */}
          <div className="mb-8">
            <WebhooksSection quizId={params.id} />
          </div>

          {/* ── Full Funnel Section ────────────────────────── */}
          <div className="mb-8">
            <FullFunnelSection quizId={params.id} />
          </div>

          {/* ── Embed Section ─────────────────────────────── */}
          <div className="mb-8">
            <EmbedSection quizId={params.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
