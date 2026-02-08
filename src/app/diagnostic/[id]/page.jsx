'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import TopBar from '@/components/Layout/TopBar';
import { AlertCircle, CheckCircle, AlertTriangle, Info, Activity, Bell } from 'lucide-react';
import useQuizStore from '@/store/quizStore';
import { defaultQuizSettings } from '@/store/quizStore';

const getDiagnosticItems = (nodes, edges) => {
  const items = [];
  
  const hasStart = nodes.some(n => n.type === 'start');
  const hasResult = nodes.some(n => n.type === 'result');
  const hasLeadForm = nodes.some(n => n.type === 'lead-form') ||
    nodes.some(n => n.type === 'composite' && (n.data?.elements || []).some(el => el.type === 'lead-form'));
  const legacyQuestions = nodes.filter(n => n.type === 'single-choice' || n.type === 'multiple-choice');
  const compositeQuestionEls = nodes
    .filter(n => n.type === 'composite')
    .flatMap(n => (n.data?.elements || []).filter(el => el.type.startsWith('question-')));
  const questions = [...legacyQuestions, ...compositeQuestionEls];
  
  if (hasStart && hasResult && questions.length > 0) {
    items.push({ type: 'success', icon: CheckCircle, title: 'Estrutura do Quiz', description: 'O quiz possui início, perguntas e resultado.' });
  } else {
    items.push({ type: 'error', icon: AlertCircle, title: 'Estrutura Incompleta', description: 'O quiz precisa de início, pelo menos uma pergunta e resultado.' });
  }

  if (hasLeadForm) {
    items.push({ type: 'success', icon: CheckCircle, title: 'Formulário de Lead', description: 'Formulário de captura configurado.' });
  } else {
    items.push({ type: 'warning', icon: AlertTriangle, title: 'Sem Formulário de Lead', description: 'Adicione um formulário de lead para capturar contatos.' });
  }

  const connectedNodeIds = new Set(edges.flatMap(e => [e.source, e.target]));
  const orphanNodes = nodes.filter(n => n.type !== 'start' && !connectedNodeIds.has(n.id));
  if (orphanNodes.length > 0) {
    items.push({ type: 'error', icon: AlertCircle, title: 'Elementos Órfãos', description: `${orphanNodes.length} elemento(s) não conectados ao fluxo.` });
  } else if (nodes.length > 1) {
    items.push({ type: 'success', icon: CheckCircle, title: 'Conexões', description: 'Todos os elementos estão conectados.' });
  }

  const noScoreOptions = legacyQuestions.some(q => q.data?.options?.every(o => !o.score || o.score === 0)) ||
    compositeQuestionEls.some(el => el.options && el.options.length > 0 && el.options.every(o => !o.score || o.score === 0));
  if (noScoreOptions) {
    items.push({ type: 'warning', icon: AlertTriangle, title: 'Pontuação', description: 'Algumas opções não possuem pontuação definida.' });
  } else if (questions.length > 0) {
    items.push({ type: 'success', icon: CheckCircle, title: 'Pontuação', description: 'Todas as opções possuem pontuação.' });
  }

  items.push({ type: 'info', icon: Info, title: 'Integrações', description: 'Configure integrações para enviar leads automaticamente.' });

  return items;
};

const statusColors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconColors = {
  success: 'text-green-600',
  warning: 'text-amber-600',
  error: 'text-red-600',
  info: 'text-blue-600',
};

// ── Tracking & Pixels Editor ─────────────────────────────────

function TrackingEditor() {
  const tracking = useQuizStore((s) => s.quizSettings.tracking) || defaultQuizSettings.tracking;
  const updateTracking = useQuizStore((s) => s.updateTracking);

  const events = tracking.events || defaultQuizSettings.tracking.events;

  const handleEventToggle = (key) => {
    updateTracking({
      events: { ...events, [key]: !events[key] },
    });
  };

  const eventList = [
    { key: 'quizStart', label: 'Início do quiz', desc: 'QuizStart / ViewContent' },
    { key: 'questionAnswered', label: 'Resposta de pergunta', desc: 'QuestionAnswered' },
    { key: 'leadCaptured', label: 'Captura de lead', desc: 'Lead / generate_lead' },
    { key: 'quizCompleted', label: 'Quiz completo', desc: 'CompleteRegistration / quiz_complete' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Facebook Pixel */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Facebook Pixel ID
        </label>
        <input
          type="text"
          value={tracking.facebookPixelId || ''}
          onChange={(e) => updateTracking({ facebookPixelId: e.target.value.trim() })}
          placeholder="Ex: 123456789012345"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        />
        <p className="text-xs text-gray-400 mt-1.5">
          Eventos disparados: PageView, Lead, CompleteRegistration, ViewContent
        </p>
      </div>

      {/* Google Tag Manager */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Google Tag Manager ID
        </label>
        <input
          type="text"
          value={tracking.googleTagManagerId || ''}
          onChange={(e) => updateTracking({ googleTagManagerId: e.target.value.trim() })}
          placeholder="Ex: GTM-XXXXXX"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Google Analytics 4 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Google Analytics 4 ID
        </label>
        <input
          type="text"
          value={tracking.googleAnalyticsId || ''}
          onChange={(e) => updateTracking({ googleAnalyticsId: e.target.value.trim() })}
          placeholder="Ex: G-XXXXXXXXXX"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Custom Head Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Código personalizado (Head)
        </label>
        <textarea
          value={tracking.customHeadCode || ''}
          onChange={(e) => updateTracking({ customHeadCode: e.target.value })}
          placeholder="Cole aqui scripts adicionais..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-800 font-mono focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-y"
        />
        <p className="text-xs text-gray-400 mt-1.5">
          Será inserido no &lt;head&gt; do quiz. Use para pixels de TikTok, LinkedIn, etc.
        </p>
      </div>

      {/* Events checkboxes */}
      <div className="border-t border-gray-100 pt-5">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Eventos habilitados
        </label>
        <div className="space-y-3">
          {eventList.map((ev) => (
            <label
              key={ev.key}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <button
                type="button"
                onClick={() => handleEventToggle(ev.key)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  events[ev.key] !== false ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    events[ev.key] !== false ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <div>
                <span className="text-sm text-gray-800 font-medium group-hover:text-purple-700 transition-colors">
                  {ev.label}
                </span>
                <span className="text-xs text-gray-400 ml-2">{ev.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
        <Activity size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-green-700">
          <p className="font-medium mb-1">Sobre o rastreamento</p>
          <p>Os pixels são carregados de forma assíncrona para não impactar a performance do quiz. Funcionam tanto no acesso direto quanto em iframes (embed).</p>
        </div>
      </div>
    </div>
  );
}

// ── Notifications Editor ─────────────────────────────────────

function NotificationsEditor() {
  const notifications = useQuizStore((s) => s.quizSettings.notifications) || defaultQuizSettings.notifications;
  const updateNotifications = useQuizStore((s) => s.updateNotifications);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Enable toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-800">Ativar notificações por email</p>
          <p className="text-sm text-gray-500">Receba alertas quando novos leads completarem o quiz</p>
        </div>
        <button
          onClick={() => updateNotifications({ emailNotifications: !notifications.emailNotifications })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            notifications.emailNotifications ? 'bg-accent' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {notifications.emailNotifications && (
        <>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email para notificações
            </label>
            <input
              type="email"
              value={notifications.notificationEmail || ''}
              onChange={(e) => updateNotifications({ notificationEmail: e.target.value.trim() })}
              placeholder="seu@email.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modo de notificação
            </label>
            <div className="space-y-2">
              {[
                { value: 'instant-hot', label: 'Leads quentes (instantâneo)', desc: 'Receba imediatamente quando leads com alta pontuação completarem' },
                { value: 'instant-all', label: 'Todos os leads (instantâneo)', desc: 'Receba para cada lead que completar o quiz' },
                { value: 'daily-digest', label: 'Resumo diário', desc: 'Receba um resumo uma vez por dia' },
              ].map((mode) => (
                <label
                  key={mode.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    notifications.notificationMode === mode.value
                      ? 'border-accent bg-accent/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="notificationMode"
                    value={mode.value}
                    checked={notifications.notificationMode === mode.value}
                    onChange={() => updateNotifications({ notificationMode: mode.value })}
                    className="mt-1 accent-accent"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{mode.label}</p>
                    <p className="text-xs text-gray-500">{mode.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function DiagnosticPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { nodes, edges, scoreRanges, quizSettings, isSaved } = useQuizStore();
  const setQuizId = useQuizStore((s) => s.setQuizId);
  const setQuizName = useQuizStore((s) => s.setQuizName);
  const setNodes = useQuizStore((s) => s.setNodes);
  const setEdges = useQuizStore((s) => s.setEdges);
  const setQuizStatus = useQuizStore((s) => s.setQuizStatus);
  const autoSaveTimer = useRef(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && params.id && !useQuizStore.getState().quizId) {
      loadQuiz(params.id);
    }
  }, [status, params.id]);

  const loadQuiz = async (id) => {
    try {
      const res = await fetch(`/api/quizzes/${id}`);
      if (res.ok) {
        const quiz = await res.json();
        setQuizId(quiz.id);
        setQuizName(quiz.name);
        setQuizStatus(quiz.status === 'published' ? 'Publicado' : 'Rascunho');

        if (quiz.scoreRanges) {
          const ranges = typeof quiz.scoreRanges === 'string'
            ? JSON.parse(quiz.scoreRanges)
            : quiz.scoreRanges;
          useQuizStore.setState({ scoreRanges: ranges });
        }

        if (quiz.settings) {
          try {
            const settings = typeof quiz.settings === 'string'
              ? JSON.parse(quiz.settings)
              : quiz.settings;
            if (settings && typeof settings === 'object' && Object.keys(settings).length > 0) {
              const merged = {
                theme: { ...defaultQuizSettings.theme, ...(settings.theme || {}) },
                branding: { ...defaultQuizSettings.branding, ...(settings.branding || {}) },
                aiResultConfig: { ...defaultQuizSettings.aiResultConfig, ...(settings.aiResultConfig || {}) },
                tracking: {
                  ...defaultQuizSettings.tracking,
                  ...(settings.tracking || {}),
                  events: { ...defaultQuizSettings.tracking.events, ...(settings.tracking?.events || {}) },
                },
                notifications: {
                  ...defaultQuizSettings.notifications,
                  ...(settings.notifications || {}),
                  emailNotifications: quiz.emailNotifications ?? settings.notifications?.emailNotifications ?? false,
                  notificationMode: quiz.notificationMode ?? settings.notifications?.notificationMode ?? 'instant-hot',
                  notificationEmail: quiz.notificationEmail ?? settings.notifications?.notificationEmail ?? '',
                },
              };
              useQuizStore.setState({ quizSettings: merged });
            }
          } catch (_e) { /* ignore parse errors */ }
        }

        if (quiz.canvasData) {
          const canvasData = typeof quiz.canvasData === 'string'
            ? JSON.parse(quiz.canvasData)
            : quiz.canvasData;
          if (canvasData.nodes) setNodes(canvasData.nodes);
          if (canvasData.edges) setEdges(canvasData.edges);
        }

        useQuizStore.getState().saveQuiz();
        setTimeout(() => { isFirstLoad.current = false; }, 500);
      }
    } catch (err) {
      console.error('Failed to load quiz:', err);
    }
  };

  useEffect(() => {
    if (isFirstLoad.current || !params.id || isSaved) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      try {
        const { nodes: n, edges: e, quizName: name, scoreRanges: sr, quizSettings: qs } = useQuizStore.getState();
        const res = await fetch(`/api/quizzes/${params.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            canvasData: JSON.stringify({ nodes: n, edges: e }),
            scoreRanges: sr,
            settings: qs,
          }),
        });
        if (res.ok) {
          useQuizStore.getState().saveQuiz();
        }
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }, 2000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [scoreRanges, quizSettings, isSaved, params.id]);

  const diagnosticItems = getDiagnosticItems(nodes, edges);
  const successCount = diagnosticItems.filter(i => i.type === 'success').length;
  const totalCount = diagnosticItems.length;
  const healthScore = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopBar quizId={params.id} />
      
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Configurações</h1>
            <p className="text-gray-500">Configure resultados, rastreamento e diagnóstico do seu quiz</p>
          </div>

          {/* Health Score Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Saúde do Quiz</p>
                <p className="text-4xl font-bold text-gray-800">{healthScore}%</p>
              </div>
              <div className="w-24 h-24 relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                  <circle 
                    cx="48" cy="48" r="40" 
                    stroke={healthScore >= 80 ? '#10b981' : healthScore >= 50 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8" 
                    fill="none"
                    strokeDasharray={`${healthScore * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-800">{successCount}/{totalCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Items */}
          <div className="space-y-3 mb-8">
            {diagnosticItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${statusColors[item.type]} flex items-start gap-4`}
                >
                  <Icon className={`${iconColors[item.type]} flex-shrink-0 mt-0.5`} size={20} />
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm opacity-80 mt-1">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tracking & Pixels Section */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Activity size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800">Rastreamento & Pixels</h2>
                <p className="text-sm text-gray-500">Configure pixels de conversão e analytics para seu quiz</p>
              </div>
            </div>
            <TrackingEditor />
          </div>

          {/* Notifications Section */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Bell size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800">Notificações</h2>
                <p className="text-sm text-gray-500">Receba alertas quando novos leads completarem o quiz</p>
              </div>
            </div>
            <NotificationsEditor />
          </div>
        </div>
      </div>
    </div>
  );
}
