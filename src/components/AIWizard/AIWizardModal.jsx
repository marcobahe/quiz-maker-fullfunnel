'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Loader2,
  Check,
  Wand2,
  Brain,
  Target,
  Users,
  Hash,
  MessageSquare,
  ToggleLeft,
  ToggleRight,
  Pencil,
  AlertCircle,
  Link2,
  Globe,
} from 'lucide-react';

// ── Step Indicator ─────────────────────────────────────────────
function StepIndicator({ currentStep }) {
  const steps = [
    { num: 1, label: 'O Básico' },
    { num: 2, label: 'Personalização' },
    { num: 3, label: 'Preview' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, idx) => (
        <div key={step.num} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              currentStep === step.num
                ? 'bg-white text-purple-700 shadow-lg scale-110'
                : currentStep > step.num
                ? 'bg-white/30 text-white'
                : 'bg-white/10 text-white/50'
            }`}
          >
            {currentStep > step.num ? <Check size={16} /> : step.num}
          </div>
          <span
            className={`text-xs font-medium hidden sm:inline transition-colors duration-300 ${
              currentStep === step.num ? 'text-white' : 'text-white/50'
            }`}
          >
            {step.label}
          </span>
          {idx < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 transition-colors duration-300 ${
                currentStep > step.num ? 'bg-white/30' : 'bg-white/10'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Loading Animation ──────────────────────────────────────────
function LoadingAnimation({ progress, hasUrl }) {
  const baseSteps = [
    { text: 'Analisando seu briefing...', icon: Brain },
    { text: 'Criando perguntas...', icon: MessageSquare },
    { text: 'Definindo pontuação...', icon: Target },
    { text: 'Montando resultados...', icon: Sparkles },
  ];

  // Insert URL analysis step if URL was provided
  const steps = hasUrl
    ? [{ text: 'Analisando sua página de vendas...', icon: Globe }, ...baseSteps]
    : baseSteps;

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center animate-pulse">
          <Wand2 size={32} className="text-white animate-bounce" />
        </div>
        <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-purple-300/30 animate-ping" />
      </div>

      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">✨ Gerando seu quiz...</h3>

      <div className="space-y-3 w-full max-w-xs">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === progress;
          const isDone = idx < progress;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-500 ${
                isActive
                  ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                  : isDone
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isActive
                    ? 'bg-purple-500 text-white'
                    : isDone
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isDone ? <Check size={12} /> : isActive ? <Loader2 size={12} className="animate-spin" /> : <Icon size={12} />}
              </div>
              <span
                className={`text-sm transition-colors duration-300 ${
                  isActive ? 'text-purple-700 font-medium' : isDone ? 'text-green-700' : 'text-gray-400'
                }`}
              >
                {step.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Preview Card ────────────────────────────────────────────────
function QuestionPreview({ question, index, onChange }) {
  const typeLabels = {
    'question-single': '🎯 Escolha Única',
    'question-multiple': '☑️ Múltipla Escolha',
    'question-icons': '🖼️ Escolha Visual',
    'question-open': '💬 Pergunta Aberta',
    'question-rating': '⭐ Nota / Avaliação',
  };

  return (
    <div className="bg-white dark:bg-[#151837]/60 border border-gray-200 dark:border-white/10 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
          Pergunta {index + 1}
        </span>
        <span className="text-xs text-gray-400">
          {typeLabels[question.type] || question.type}
        </span>
      </div>

      <textarea
        value={question.question}
        onChange={(e) => onChange({ ...question, question: e.target.value })}
        className="w-full text-sm font-medium text-gray-800 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
        rows={2}
      />

      {question.type === 'question-rating' ? (
        <div className="mt-2 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500">
          <span className="font-medium">
            {question.ratingType === 'stars' ? '★★★★★' : question.ratingType === 'slider' ? '🎚️ Slider' : `${question.minValue ?? 0} — ${question.maxValue ?? 10}`}
          </span>
          {question.scoreMultiplier && question.scoreMultiplier !== 1 && (
            <span className="text-purple-400 ml-2">×{question.scoreMultiplier}</span>
          )}
        </div>
      ) : question.type === 'question-open' ? (
        <div className="mt-2 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-400 italic">
          {question.placeholder || 'Resposta aberta...'}
        </div>
      ) : (
        <div className="mt-2 space-y-1.5">
          {(question.options || []).map((opt, optIdx) => (
            <div key={optIdx} className="flex items-center gap-2">
              {question.type === 'question-icons' && (
                <input
                  type="text"
                  value={opt.icon || '⭐'}
                  onChange={(e) => {
                    const newOpts = [...question.options];
                    newOpts[optIdx] = { ...opt, icon: e.target.value };
                    onChange({ ...question, options: newOpts });
                  }}
                  className="w-8 text-center text-lg border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:border-purple-400"
                />
              )}
              <input
                type="text"
                value={opt.label}
                onChange={(e) => {
                  const newOpts = [...question.options];
                  newOpts[optIdx] = { ...opt, label: e.target.value };
                  onChange({ ...question, options: newOpts });
                }}
                className="flex-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-400"
              />
              <span className="text-xs text-purple-500 font-medium bg-purple-50 px-2 py-0.5 rounded min-w-[40px] text-center">
                +{opt.score}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreRangePreview({ range, index, onChange }) {
  return (
    <div className="bg-white dark:bg-[#151837]/60 border border-gray-200 dark:border-white/10 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
          Faixa {index + 1}
        </span>
        <span className="text-xs text-gray-400">
          {range.min} — {range.max} pts
        </span>
      </div>
      <input
        type="text"
        value={range.title}
        onChange={(e) => onChange({ ...range, title: e.target.value })}
        className="w-full text-sm font-semibold text-gray-800 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
      />
      <textarea
        value={range.description}
        onChange={(e) => onChange({ ...range, description: e.target.value })}
        className="w-full text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 resize-none"
        rows={2}
      />
    </div>
  );
}

// ── Main Modal ──────────────────────────────────────────────────
export default function AIWizardModal({ isOpen, onClose, activeWorkspaceId }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState('');

  // Step 1 fields
  const [tema, setTema] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [publicoAlvo, setPublicoAlvo] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [numPerguntas, setNumPerguntas] = useState(5);
  const [tiposPerguntas, setTiposPerguntas] = useState(['Escolha única']);

  // Step 2 fields
  const [temMetodologia, setTemMetodologia] = useState(false);
  const [metodologia, setMetodologia] = useState('');
  const [categorias, setCategorias] = useState('');
  const [tom, setTom] = useState('Casual');
  const [informacoesAdicionais, setInformacoesAdicionais] = useState('');

  // Step 3 data
  const [quizData, setQuizData] = useState(null);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setError('');
        setIsGenerating(false);
        setIsCreating(false);
        setLoadingProgress(0);
        setTema('');
        setObjetivo('');
        setPublicoAlvo('');
        setSiteUrl('');
        setNumPerguntas(5);
        setTiposPerguntas(['Escolha única']);
        setTemMetodologia(false);
        setMetodologia('');
        setCategorias('');
        setTom('Casual');
        setInformacoesAdicionais('');
        setQuizData(null);
      }, 300);
    }
  }, [isOpen]);

  const toggleTipoPergunta = (tipo) => {
    setTiposPerguntas((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  };

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError('');
    setStep(3);
    setLoadingProgress(0);

    // Animate progress steps (extra step if URL provided)
    const totalSteps = siteUrl ? 4 : 3;
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= totalSteps) {
          clearInterval(progressInterval);
          return totalSteps;
        }
        return prev + 1;
      });
    }, siteUrl ? 2500 : 2000);

    try {
      const res = await fetch('/api/quizzes/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tema,
          objetivo,
          publicoAlvo,
          siteUrl,
          numPerguntas,
          tiposPerguntas,
          temMetodologia,
          metodologia,
          categorias,
          tom,
          informacoesAdicionais,
        }),
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao gerar quiz.');
      }

      const data = await res.json();
      setQuizData(data);
      setLoadingProgress(siteUrl ? 5 : 4);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || 'Erro ao gerar quiz. Tente novamente.');
      setStep(2);
    } finally {
      setIsGenerating(false);
    }
  }, [tema, objetivo, publicoAlvo, siteUrl, numPerguntas, tiposPerguntas, temMetodologia, metodologia, categorias, tom, informacoesAdicionais]);

  const handleCreateQuiz = async () => {
    if (!quizData) return;
    setIsCreating(true);
    setError('');

    try {
      // 1. Create the quiz
      const createRes = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: quizData.title,
          description: quizData.description,
          workspaceId: activeWorkspaceId,
        }),
      });

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao criar quiz.');
      }

      const quiz = await createRes.json();

      // 2. Transform AI data to canvasData
      const { nodes, edges } = transformToCanvasData(quizData);

      // 3. Save canvasData + settings
      const updateRes = await fetch(`/api/quizzes/${quiz.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canvasData: JSON.stringify({ nodes, edges }),
          scoreRanges: quizData.scoreRanges,
          settings: {},
        }),
      });

      if (!updateRes.ok) {
        throw new Error('Erro ao salvar dados do quiz.');
      }

      // 4. Redirect to builder
      onClose();
      router.push(`/builder/${quiz.id}`);
    } catch (err) {
      setError(err.message || 'Erro ao criar quiz.');
    } finally {
      setIsCreating(false);
    }
  };

  const updateQuestion = (index, updatedQuestion) => {
    setQuizData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[index] = updatedQuestion;
      return { ...prev, questions: newQuestions };
    });
  };

  const updateScoreRange = (index, updatedRange) => {
    setQuizData((prev) => {
      const newRanges = [...prev.scoreRanges];
      newRanges[index] = updatedRange;
      return { ...prev, scoreRanges: newRanges };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#151837] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Wand2 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Criar Quiz com IA</h2>
              <p className="text-white/70 text-xs">Descreva seu quiz e deixe a IA criar para você</p>
            </div>
          </div>

          <StepIndicator currentStep={step} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Step 1: O Básico */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <Target size={14} className="text-purple-500" />
                  Tema do quiz <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  placeholder="Ex: Perfil de investidor"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <Sparkles size={14} className="text-purple-500" />
                  Objetivo
                </label>
                <input
                  type="text"
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                  placeholder="Ex: Captar leads e segmentar por perfil de risco"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <Users size={14} className="text-purple-500" />
                  Público-alvo
                </label>
                <input
                  type="text"
                  value={publicoAlvo}
                  onChange={(e) => setPublicoAlvo(e.target.value)}
                  placeholder="Ex: Empreendedores de 25-45 anos"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>

              {/* Optional site URL for AI context */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <Globe size={14} className="text-purple-500" />
                  Link do seu site ou página de vendas
                  <span className="text-xs font-normal text-gray-400">(opcional)</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    placeholder="https://seusite.com.br/pagina-de-vendas"
                    className="w-full px-4 py-2.5 pl-10 border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                  <Link2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <p className="text-xs text-gray-400 mt-1.5 flex items-start gap-1">
                  <Sparkles size={12} className="text-purple-400 mt-0.5 shrink-0" />
                  Cole um link e nossa IA vai analisar seu negócio automaticamente
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <Hash size={14} className="text-purple-500" />
                  Número de perguntas
                </label>
                <select
                  value={numPerguntas}
                  onChange={(e) => setNumPerguntas(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white dark:bg-white/5 dark:text-white transition-all"
                >
                  <option value={3}>3 perguntas</option>
                  <option value={5}>5 perguntas</option>
                  <option value={7}>7 perguntas</option>
                  <option value={10}>10 perguntas</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MessageSquare size={14} className="text-purple-500" />
                  Tipo de perguntas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Múltipla escolha', 'Escolha única', 'Escolha visual', 'Pergunta aberta', 'Nota / Avaliação'].map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() => toggleTipoPergunta(tipo)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                        tiposPerguntas.includes(tipo)
                          ? 'bg-purple-50 border-purple-300 text-purple-700 font-medium'
                          : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                          tiposPerguntas.includes(tipo) ? 'bg-purple-500 border-purple-500' : 'border-gray-300'
                        }`}
                      >
                        {tiposPerguntas.includes(tipo) && <Check size={10} className="text-white" />}
                      </div>
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Personalização Avançada */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Toggle Metodologia */}
              <div>
                <button
                  onClick={() => setTemMetodologia(!temMetodologia)}
                  className="flex items-center gap-3 w-full text-left"
                >
                  {temMetodologia ? (
                    <ToggleRight size={28} className="text-purple-500 shrink-0" />
                  ) : (
                    <ToggleLeft size={28} className="text-gray-400 shrink-0" />
                  )}
                  <div>
                    <span className="text-sm font-semibold text-gray-700 block">
                      Tenho uma metodologia própria
                    </span>
                    <span className="text-xs text-gray-400">
                      Descreva sua metodologia para resultados mais precisos
                    </span>
                  </div>
                </button>
              </div>

              {temMetodologia && (
                <div className="space-y-4 pl-2 border-l-2 border-purple-200 ml-3.5">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Descreva sua metodologia
                    </label>
                    <textarea
                      value={metodologia}
                      onChange={(e) => setMetodologia(e.target.value)}
                      placeholder="Ex: Uso a metodologia DISC com 4 perfis: Dominante (orientado a resultados), Influente (orientado a pessoas), Estável (orientado a processos), Cauteloso (orientado a dados). Cada pergunta deve ter 4 opções, uma para cada perfil."
                      className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none transition-all"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Categorias de resultado
                    </label>
                    <textarea
                      value={categorias}
                      onChange={(e) => setCategorias(e.target.value)}
                      placeholder="Ex: Conservador, Moderado, Arrojado, Agressivo"
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none transition-all"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Tom da linguagem
                    </label>
                    <select
                      value={tom}
                      onChange={(e) => setTom(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white dark:bg-white/5 dark:text-white transition-all"
                    >
                      <option value="Formal">Formal</option>
                      <option value="Casual">Casual</option>
                      <option value="Divertido">Divertido</option>
                      <option value="Técnico">Técnico</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Sempre visível */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Informações adicionais
                </label>
                <textarea
                  value={informacoesAdicionais}
                  onChange={(e) => setInformacoesAdicionais(e.target.value)}
                  placeholder="Qualquer contexto extra que ajude a IA: referências, exemplos de perguntas, observações sobre o público, etc."
                  className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none transition-all"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-purple-500 bg-purple-50 px-3 py-2 rounded-lg">
                <Sparkles size={14} />
                <span>Quanto mais contexto, melhor o resultado ✨</span>
              </div>
            </div>
          )}

          {/* Step 3: Preview & Edição */}
          {step === 3 && (
            <div className="animate-in fade-in duration-300">
              {isGenerating ? (
                <LoadingAnimation progress={loadingProgress} hasUrl={!!siteUrl} />
              ) : quizData ? (
                <div className="space-y-6">
                  {/* Title & Description */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/30">
                    <label className="text-xs font-bold text-purple-600 mb-1 block">TÍTULO</label>
                    <input
                      type="text"
                      value={quizData.title}
                      onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                      className="w-full text-lg font-bold text-gray-800 dark:text-white bg-transparent border-none focus:outline-none"
                    />
                    <label className="text-xs font-bold text-purple-600 mt-2 mb-1 block">DESCRIÇÃO</label>
                    <input
                      type="text"
                      value={quizData.description}
                      onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                      className="w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none"
                    />
                  </div>

                  {/* Questions */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <MessageSquare size={14} className="text-purple-500" />
                      Perguntas ({quizData.questions.length})
                    </h4>
                    <div className="space-y-3">
                      {quizData.questions.map((q, idx) => (
                        <QuestionPreview
                          key={idx}
                          question={q}
                          index={idx}
                          onChange={(updated) => updateQuestion(idx, updated)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Score Ranges */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Target size={14} className="text-indigo-500" />
                      Faixas de Resultado ({quizData.scoreRanges.length})
                    </h4>
                    <div className="space-y-3">
                      {quizData.scoreRanges.map((range, idx) => (
                        <ScoreRangePreview
                          key={idx}
                          range={range}
                          index={idx}
                          onChange={(updated) => updateScoreRange(idx, updated)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-[#0f1129]/50 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
          {step === 1 && (
            <>
              <button
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!tema.trim()) {
                    setError('O tema do quiz é obrigatório.');
                    return;
                  }
                  if (tiposPerguntas.length === 0) {
                    setError('Selecione ao menos um tipo de pergunta.');
                    return;
                  }
                  // Validate URL if provided
                  if (siteUrl.trim()) {
                    try {
                      const url = new URL(siteUrl);
                      if (!['http:', 'https:'].includes(url.protocol)) {
                        setError('A URL deve começar com http:// ou https://');
                        return;
                      }
                    } catch {
                      setError('URL inválida. Verifique o formato (ex: https://seusite.com)');
                      return;
                    }
                  }
                  setError('');
                  setStep(2);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-500/25"
              >
                Próximo
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => { setError(''); setStep(1); }}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ChevronLeft size={16} />
                Voltar
              </button>
              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-500/25"
              >
                Gerar Quiz
                <Sparkles size={16} />
              </button>
            </>
          )}

          {step === 3 && !isGenerating && quizData && (
            <>
              <button
                onClick={handleGenerate}
                disabled={isCreating}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={14} />
                🔄 Regenerar
              </button>
              <button
                onClick={handleCreateQuiz}
                disabled={isCreating}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    Criar Quiz
                    <Sparkles size={16} />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Transform AI response to canvasData ─────────────────────────
function transformToCanvasData(quizData) {
  const nodes = [];
  const edges = [];

  // Start node
  nodes.push({
    id: 'start',
    type: 'start',
    position: { x: 400, y: 50 },
    data: { label: 'Início' },
  });

  // Question nodes
  const questionNodeIds = [];
  quizData.questions.forEach((q, idx) => {
    const nodeId = `composite-ai-${idx + 1}-${Date.now()}`;
    const elementId = `el-ai-${idx + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    questionNodeIds.push({ nodeId, elementId });

    let element;
    switch (q.type) {
      case 'question-single':
        element = {
          id: elementId,
          type: 'question-single',
          question: q.question,
          options: (q.options || []).map((opt) => ({
            text: opt.label,
            score: opt.score || 0,
          })),
        };
        break;

      case 'question-multiple':
        element = {
          id: elementId,
          type: 'question-multiple',
          question: q.question,
          options: (q.options || []).map((opt) => ({
            text: opt.label,
            score: opt.score || 0,
          })),
        };
        break;

      case 'question-icons':
        element = {
          id: elementId,
          type: 'question-icons',
          question: q.question,
          columns: 2,
          optionStyle: 'emoji',
          options: (q.options || []).map((opt) => ({
            text: opt.label,
            icon: opt.icon || '⭐',
            image: '',
            score: opt.score || 0,
          })),
        };
        break;

      case 'question-open':
        element = {
          id: elementId,
          type: 'question-open',
          question: q.question,
          placeholder: q.placeholder || 'Digite sua resposta...',
          required: q.required !== false,
          multiline: q.multiline !== false,
          maxLength: 500,
          score: 0,
        };
        break;

      case 'question-rating':
        element = {
          id: elementId,
          type: 'question-rating',
          question: q.question,
          ratingType: q.ratingType || 'number',
          maxStars: 5,
          minValue: typeof q.minValue === 'number' ? q.minValue : 0,
          maxValue: typeof q.maxValue === 'number' ? q.maxValue : 10,
          sliderMin: 0,
          sliderMax: 100,
          sliderStep: 1,
          sliderUnit: '',
          labelMin: '',
          labelMax: '',
          scoreMultiplier: q.scoreMultiplier || 1,
          required: q.required !== false,
        };
        break;

      default:
        element = {
          id: elementId,
          type: 'question-single',
          question: q.question,
          options: (q.options || []).map((opt) => ({
            text: opt.label,
            score: opt.score || 0,
          })),
        };
    }

    // Add heading element for the question label
    const headingId = `el-heading-${idx + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    nodes.push({
      id: nodeId,
      type: 'composite',
      position: { x: 400, y: 50 + (idx + 1) * 500 },
      data: {
        label: `Pergunta ${idx + 1}`,
        elements: [element],
      },
    });
  });

  // Result node
  const resultNodeId = `result-ai-${Date.now()}`;
  nodes.push({
    id: resultNodeId,
    type: 'result',
    position: { x: 400, y: 50 + (quizData.questions.length + 1) * 500 },
    data: { title: 'Resultado' },
  });

  // Edges: start → q1
  if (questionNodeIds.length > 0) {
    edges.push({
      id: `edge-start-to-q1-${Date.now()}`,
      source: 'start',
      target: questionNodeIds[0].nodeId,
      type: 'custom-bezier',
      animated: true,
      style: { stroke: '#7c3aed', strokeWidth: 2 },
    });

    // q1 → q2 → ... → qN
    for (let i = 0; i < questionNodeIds.length - 1; i++) {
      edges.push({
        id: `edge-q${i + 1}-to-q${i + 2}-${Date.now()}`,
        source: questionNodeIds[i].nodeId,
        sourceHandle: `${questionNodeIds[i].elementId}-general`,
        target: questionNodeIds[i + 1].nodeId,
        type: 'custom-bezier',
        animated: true,
        style: { stroke: '#7c3aed', strokeWidth: 2 },
      });
    }

    // qN → result
    const lastQ = questionNodeIds[questionNodeIds.length - 1];
    edges.push({
      id: `edge-last-to-result-${Date.now()}`,
      source: lastQ.nodeId,
      sourceHandle: `${lastQ.elementId}-general`,
      target: resultNodeId,
      type: 'custom-bezier',
      animated: true,
      style: { stroke: '#7c3aed', strokeWidth: 2 },
    });
  }

  return { nodes, edges };
}
