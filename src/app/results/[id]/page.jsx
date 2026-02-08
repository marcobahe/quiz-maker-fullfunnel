'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import TopBar from '@/components/Layout/TopBar';
import ScoreRangesEditor from '@/components/ScoreRanges/ScoreRangesEditor';
import { Trophy, Sparkles, Share2, MessageSquare, FileText, Bot } from 'lucide-react';
import useQuizStore from '@/store/quizStore';
import { defaultQuizSettings } from '@/store/quizStore';

// Componente de compartilhamento de resultado
function ResultSharingSettings() {
  const { quizSettings, updateQuizSettings } = useQuizStore();
  const sharing = quizSettings.resultSharing || {};

  const handleToggle = (key) => {
    updateQuizSettings({
      resultSharing: {
        ...sharing,
        [key]: !sharing[key]
      }
    });
  };

  const handleChange = (key, value) => {
    updateQuizSettings({
      resultSharing: {
        ...sharing,
        [key]: value
      }
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Share2 size={18} className="text-blue-500" />
        <h3 className="font-semibold text-gray-800">Compartilhamento de Resultado</h3>
      </div>
      
      <div className="space-y-4">
        {/* Botões de share */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">Botões de compartilhamento</p>
            <p className="text-sm text-gray-500">WhatsApp, Twitter, Facebook, LinkedIn</p>
          </div>
          <button
            onClick={() => handleToggle('showShareButtons')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              sharing.showShareButtons !== false ? 'bg-blue-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                sharing.showShareButtons !== false ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Copy link */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">Botão copiar link</p>
            <p className="text-sm text-gray-500">Permite copiar link do quiz</p>
          </div>
          <button
            onClick={() => handleToggle('showCopyLink')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              sharing.showCopyLink !== false ? 'bg-blue-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                sharing.showCopyLink !== false ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Texto customizado para share */}
        {sharing.showShareButtons !== false && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Texto do compartilhamento</label>
            <textarea
              value={sharing.shareText || 'Acabei de fazer este quiz e consegui {{score}} pontos! Faça você também: {{link}}'}
              onChange={(e) => handleChange('shareText', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
              placeholder="Texto que será compartilhado..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {`{{score}}`} para pontuação, {`{{resultado}}`} para título do resultado, {`{{link}}`} para URL
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de configurações de exibição do resultado
function ResultDisplaySettings() {
  const { quizSettings, updateQuizSettings } = useQuizStore();
  const display = quizSettings.resultDisplay || {};

  const handleToggle = (key) => {
    updateQuizSettings({
      resultDisplay: {
        ...display,
        [key]: !display[key]
      }
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText size={18} className="text-green-500" />
        <h3 className="font-semibold text-gray-800">Exibição do Resultado</h3>
      </div>
      
      <div className="space-y-4">
        {/* Mostrar pontuação */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">Mostrar pontuação</p>
            <p className="text-sm text-gray-500">Exibe a pontuação numérica no resultado</p>
          </div>
          <button
            onClick={() => handleToggle('showScore')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              display.showScore !== false ? 'bg-green-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                display.showScore !== false ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Mostrar percentual */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">Mostrar percentual</p>
            <p className="text-sm text-gray-500">Exibe % de acertos ao lado da pontuação</p>
          </div>
          <button
            onClick={() => handleToggle('showPercentage')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              display.showPercentage ? 'bg-green-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                display.showPercentage ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Mostrar revisão das respostas */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">Revisão das respostas</p>
            <p className="text-sm text-gray-500">Permite ver quais respostas acertou/errou</p>
          </div>
          <button
            onClick={() => handleToggle('showAnswerReview')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              display.showAnswerReview ? 'bg-green-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                display.showAnswerReview ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Refazer quiz */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">Botão &quot;Refazer Quiz&quot;</p>
            <p className="text-sm text-gray-500">Permite reiniciar o quiz ao terminar</p>
          </div>
          <button
            onClick={() => handleToggle('showRetryButton')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              display.showRetryButton !== false ? 'bg-green-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                display.showRetryButton !== false ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente de feedback por resposta
function AnswerFeedbackSettings() {
  const { quizSettings, updateQuizSettings } = useQuizStore();
  const feedback = quizSettings.answerFeedback || {};

  const handleToggle = (key) => {
    updateQuizSettings({
      answerFeedback: {
        ...feedback,
        [key]: !feedback[key]
      }
    });
  };

  const handleChange = (key, value) => {
    updateQuizSettings({
      answerFeedback: {
        ...feedback,
        [key]: value
      }
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={18} className="text-purple-500" />
        <h3 className="font-semibold text-gray-800">Feedback por Resposta</h3>
      </div>
      
      <div className="space-y-4">
        {/* Mostrar feedback imediato */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">Feedback imediato</p>
            <p className="text-sm text-gray-500">Mostra se acertou/errou após cada resposta</p>
          </div>
          <button
            onClick={() => handleToggle('showImmediateFeedback')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              feedback.showImmediateFeedback ? 'bg-purple-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                feedback.showImmediateFeedback ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {feedback.showImmediateFeedback && (
          <>
            {/* Mostrar resposta correta */}
            <div className="flex items-center justify-between ml-4">
              <div>
                <p className="font-medium text-gray-700">Revelar resposta correta</p>
                <p className="text-sm text-gray-500">Mostra qual era a opção correta</p>
              </div>
              <button
                onClick={() => handleToggle('showCorrectAnswer')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  feedback.showCorrectAnswer ? 'bg-purple-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    feedback.showCorrectAnswer ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Mostrar explicação */}
            <div className="flex items-center justify-between ml-4">
              <div>
                <p className="font-medium text-gray-700">Mostrar explicação</p>
                <p className="text-sm text-gray-500">Exibe explicação da resposta (se configurada)</p>
              </div>
              <button
                onClick={() => handleToggle('showExplanation')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  feedback.showExplanation ? 'bg-purple-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    feedback.showExplanation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Delay para próxima pergunta */}
            <div className="ml-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Tempo de exibição do feedback
              </label>
              <select
                value={feedback.feedbackDelay || 2000}
                onChange={(e) => handleChange('feedbackDelay', parseInt(e.target.value))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={1000}>1 segundo</option>
                <option value={2000}>2 segundos</option>
                <option value={3000}>3 segundos</option>
                <option value={5000}>5 segundos</option>
                <option value={0}>Até clicar em &quot;Próximo&quot;</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Componente de configuração de Resultado por IA
function AIResultSettings() {
  const aiResultConfig = useQuizStore((s) => s.quizSettings.aiResultConfig) || defaultQuizSettings.aiResultConfig;
  const updateAiResultConfig = useQuizStore((s) => s.updateAiResultConfig);

  const aiVariables = [
    { key: '{{nome}}', label: 'Nome do lead' },
    { key: '{{email}}', label: 'Email do lead' },
    { key: '{{score}}', label: 'Pontuação total' },
    { key: '{{maxScore}}', label: 'Pontuação máxima' },
    { key: '{{respostas}}', label: 'Todas as respostas' },
    { key: '{{resultado}}', label: 'Faixa de resultado' },
  ];

  const insertVariable = (variable) => {
    const textarea = document.getElementById('ai-prompt-textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentPrompt = aiResultConfig.prompt || '';
      const newPrompt = currentPrompt.substring(0, start) + variable + currentPrompt.substring(end);
      updateAiResultConfig({ prompt: newPrompt });
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    } else {
      updateAiResultConfig({ prompt: (aiResultConfig.prompt || '') + variable });
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
          <Bot size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-800">Resultado por IA</h2>
          <p className="text-sm text-gray-500">Gere análises personalizadas com inteligência artificial</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-medium text-gray-800">Ativar análise por IA</p>
            <p className="text-sm text-gray-500">Gera uma análise personalizada das respostas do respondente</p>
          </div>
          <button
            onClick={() => updateAiResultConfig({ enabled: !aiResultConfig.enabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              aiResultConfig.enabled ? 'bg-accent' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                aiResultConfig.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {aiResultConfig.enabled && (
          <div className="space-y-5 border-t border-gray-100 pt-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt de Análise
              </label>
              <textarea
                id="ai-prompt-textarea"
                value={aiResultConfig.prompt || ''}
                onChange={(e) => updateAiResultConfig({ prompt: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-y"
                placeholder="Analise as respostas deste quiz sobre {{tema}}..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variáveis disponíveis <span className="text-gray-400 font-normal">(clique para inserir)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {aiVariables.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => insertVariable(v.key)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-100 transition-colors border border-purple-200"
                    title={v.label}
                  >
                    <code className="font-mono">{v.key}</code>
                    <span className="text-purple-400">— {v.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo de IA
                </label>
                <select
                  value={aiResultConfig.model || 'gpt-4o-mini'}
                  onChange={(e) => updateAiResultConfig({ model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="gpt-4o-mini">GPT-4o Mini (Rápido)</option>
                  <option value="gpt-4o">GPT-4o (Avançado)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  min={100}
                  max={2000}
                  step={50}
                  value={aiResultConfig.maxTokens || 500}
                  onChange={(e) => updateAiResultConfig({ maxTokens: Math.min(2000, Math.max(100, parseInt(e.target.value) || 500)) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-800">Combinar com resultado estático</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {aiResultConfig.combineWithStatic !== false
                    ? 'Mostra o resultado estático + análise da IA abaixo'
                    : 'Mostra SOMENTE a análise da IA (substitui o resultado estático)'}
                </p>
              </div>
              <button
                onClick={() => updateAiResultConfig({ combineWithStatic: aiResultConfig.combineWithStatic === false ? true : false })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  aiResultConfig.combineWithStatic !== false ? 'bg-accent' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    aiResultConfig.combineWithStatic !== false ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { quizSettings, scoreRanges, isSaved } = useQuizStore();
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
                tracking: { ...defaultQuizSettings.tracking, ...(settings.tracking || {}) },
                notifications: { ...defaultQuizSettings.notifications, ...(settings.notifications || {}) },
                gamification: { ...(settings.gamification || {}) },
                resultSharing: { ...(settings.resultSharing || {}) },
                resultDisplay: { ...(settings.resultDisplay || {}) },
                answerFeedback: { ...(settings.answerFeedback || {}) },
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

  // Auto-save
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
  }, [quizSettings, scoreRanges, isSaved, params.id]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopBar quizId={params.id} />
      
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Trophy size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Resultados</h1>
              <p className="text-gray-500">Configure como os resultados são exibidos e compartilhados</p>
            </div>
          </div>

          {/* Score Ranges - Principal */}
          <div className="mb-8">
            <ScoreRangesEditor />
          </div>

          {/* Resultado por IA */}
          <AIResultSettings />

          {/* Outras configurações */}
          <div className="space-y-6">
            <ResultDisplaySettings />
            <AnswerFeedbackSettings />
            <ResultSharingSettings />
          </div>

          {/* Info note */}
          <div className="mt-8 flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
            <Sparkles size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-700">
              <p className="font-medium mb-1">Dica</p>
              <p>As faixas de resultado permitem mostrar conteúdos diferentes baseados na pontuação. 
              Configure CTAs, redirecionamentos e imagens específicas para cada faixa de pontuação.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
