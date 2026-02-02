'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Trophy, ChevronRight, ArrowLeft, User, Mail, Phone, Loader2, CheckCircle, Play, Video, Music, Image as ImageIcon } from 'lucide-react';

// Wrap in Suspense because useSearchParams requires it in Next 14
function QuizPlayer() {
  const params = useParams();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Player state
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState([]);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '' });
  const [leadSaved, setLeadSaved] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // Canvas data
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // ── Fetch quiz ──────────────────────────────────────────────

  useEffect(() => {
    fetchQuiz();
  }, [params.slug]);

  const fetchQuiz = async () => {
    try {
      const previewParam = isPreview ? '?preview=true' : '';
      const res = await fetch(`/api/quizzes/${params.slug}/public${previewParam}`);
      if (!res.ok) {
        setError('Quiz não encontrado');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setQuiz(data);

      const canvasData =
        typeof data.canvasData === 'string'
          ? JSON.parse(data.canvasData)
          : data.canvasData;

      if (canvasData?.nodes) {
        setNodes(canvasData.nodes);
        setEdges(canvasData.edges || []);

        // Find start → jump to first connected node
        const startNode = canvasData.nodes.find((n) => n.type === 'start');
        if (startNode) {
          const startEdge = (canvasData.edges || []).find(
            (e) => e.source === startNode.id,
          );
          if (startEdge) {
            setCurrentNodeId(startEdge.target);
          } else {
            setCurrentNodeId(startNode.id);
          }
        }
      }

      // Track view
      if (data.id) {
        fetch(`/api/quizzes/${data.id}/analytics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'quiz_started' }),
        }).catch(() => {});
      }
    } catch (_err) {
      setError('Erro ao carregar quiz');
    } finally {
      setLoading(false);
    }
  };

  // ── Navigation helpers ──────────────────────────────────────

  const getNextNode = useCallback(
    (fromNodeId, optionIndex = null, elementId = null) => {
      const nodeEdges = edges.filter((e) => e.source === fromNodeId);

      if (optionIndex !== null) {
        // 1. Composite handle: elementId-option-N
        if (elementId) {
          const compEdge = nodeEdges.find(
            (e) => e.sourceHandle === `${elementId}-option-${optionIndex}`,
          );
          if (compEdge) return compEdge.target;
        }

        // 2. Legacy handle: option-N
        const legacyEdge = nodeEdges.find(
          (e) => e.sourceHandle === `option-${optionIndex}`,
        );
        if (legacyEdge) return legacyEdge.target;

        // 3. Catch-all: any handle ending with -option-N
        const anyEdge = nodeEdges.find(
          (e) =>
            e.sourceHandle &&
            e.sourceHandle.endsWith(`-option-${optionIndex}`),
        );
        if (anyEdge) return anyEdge.target;
      }

      // 4. Default: first available edge
      if (nodeEdges.length > 0) return nodeEdges[0].target;
      return null;
    },
    [edges],
  );

  const advanceToNode = useCallback(
    (nextId) => {
      if (!nextId) {
        setShowResult(true);
        return;
      }
      const nextNode = nodes.find((n) => n.id === nextId);

      // Check if next node (or composite with lead-form element) triggers lead form
      const isLeadForm =
        nextNode?.type === 'lead-form' ||
        (nextNode?.type === 'composite' &&
          (nextNode.data.elements || []).some((el) => el.type === 'lead-form') &&
          !(nextNode.data.elements || []).some((el) => el.type.startsWith('question-')));

      const isResult = nextNode?.type === 'result';

      setHistory((prev) => [...prev, currentNodeId]);
      setCurrentNodeId(nextId);

      if (isLeadForm) setShowLeadForm(true);
      if (isResult) setShowResult(true);
    },
    [nodes, currentNodeId],
  );

  // ── Derived data ────────────────────────────────────────────

  const currentNode = nodes.find((n) => n.id === currentNodeId);

  // Count ALL question items (legacy + composite elements) for progress
  const totalQuestions = useMemo(() => {
    let count = 0;
    for (const n of nodes) {
      if (n.type === 'single-choice' || n.type === 'multiple-choice') count++;
      if (n.type === 'composite') {
        count += (n.data.elements || []).filter((el) =>
          el.type.startsWith('question-'),
        ).length;
      }
    }
    return count;
  }, [nodes]);

  const answeredCount = Object.keys(answers).length;
  const progress =
    totalQuestions > 0
      ? Math.round((answeredCount / totalQuestions) * 100)
      : 0;

  // For result category calculation, gather max possible score from all questions
  const maxPossibleScore = useMemo(() => {
    let total = 0;
    for (const n of nodes) {
      const opts =
        n.type === 'single-choice' || n.type === 'multiple-choice'
          ? n.data.options || []
          : [];
      if (opts.length)
        total += Math.max(...opts.map((o) => o.score || 0));

      if (n.type === 'composite') {
        for (const el of n.data.elements || []) {
          if (el.type.startsWith('question-') && el.options?.length) {
            total += Math.max(...el.options.map((o) => o.score || 0));
          }
        }
      }
    }
    return total;
  }, [nodes]);

  // ── Handlers ────────────────────────────────────────────────

  /** Legacy question node option click */
  const handleOptionSelect = (optionIndex) => {
    if (!currentNode) return;
    setSelectedOption(optionIndex);

    const option = currentNode.data.options?.[optionIndex];
    const optionScore = option?.score || 0;

    setScore((prev) => prev + optionScore);
    setAnswers((prev) => ({
      ...prev,
      [currentNodeId]: {
        question: currentNode.data.question,
        answer: option?.text,
        score: optionScore,
        optionIndex,
      },
    }));

    setTimeout(() => {
      setSelectedOption(null);
      advanceToNode(getNextNode(currentNodeId, optionIndex));
    }, 500);
  };

  /** Composite question element option click */
  const handleCompositeOptionSelect = (element, optionIndex) => {
    if (!currentNode) return;
    setSelectedOption(`${element.id}-${optionIndex}`);

    const option = element.options?.[optionIndex];
    const optionScore = option?.score || 0;

    setScore((prev) => prev + optionScore);
    setAnswers((prev) => ({
      ...prev,
      [`${currentNodeId}__${element.id}`]: {
        question: element.question,
        answer: option?.text,
        score: optionScore,
        optionIndex,
        elementId: element.id,
      },
    }));

    setTimeout(() => {
      setSelectedOption(null);
      advanceToNode(
        getNextNode(currentNodeId, optionIndex, element.id),
      );
    }, 500);
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`/api/quizzes/${quiz.id}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadForm,
          answers,
          score,
          resultCategory: getResultCategory(score),
        }),
      });
      setLeadSaved(true);

      const nextId = getNextNode(currentNodeId);
      setTimeout(() => {
        setShowLeadForm(false);
        if (nextId) {
          setHistory((prev) => [...prev, currentNodeId]);
          setCurrentNodeId(nextId);
          const nextNode = nodes.find((n) => n.id === nextId);
          if (nextNode?.type === 'result') setShowResult(true);
        } else {
          setShowResult(true);
        }
      }, 1000);
    } catch (err) {
      console.error('Failed to save lead:', err);
    }
  };

  const handleGoBack = () => {
    if (history.length === 0) return;
    const prevId = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCurrentNodeId(prevId);
    setShowLeadForm(false);
    setShowResult(false);

    // Undo last answer(s) from the node we're leaving
    const keysToRemove = Object.keys(answers).filter(
      (k) => k === currentNodeId || k.startsWith(`${currentNodeId}__`),
    );
    if (keysToRemove.length) {
      const removedScore = keysToRemove.reduce(
        (s, k) => s + (answers[k]?.score || 0),
        0,
      );
      setScore((prev) => prev - removedScore);
      setAnswers((prev) => {
        const next = { ...prev };
        keysToRemove.forEach((k) => delete next[k]);
        return next;
      });
    }
  };

  const getResultCategory = (finalScore) => {
    const percentage =
      maxPossibleScore > 0 ? (finalScore / maxPossibleScore) * 100 : 0;
    if (percentage >= 80) return 'Excelente';
    if (percentage >= 60) return 'Bom';
    if (percentage >= 40) return 'Regular';
    return 'Iniciante';
  };

  const getResultEmoji = (cat) =>
    ({ Excelente: '🏆', Bom: '⭐', Regular: '👍', Iniciante: '📚' })[cat] ||
    '🎯';

  // ── Helper: detect what the current composite node contains ─

  const compositeQuestionEl = useMemo(() => {
    if (currentNode?.type !== 'composite') return null;
    return (currentNode.data.elements || []).find((el) =>
      el.type.startsWith('question-'),
    );
  }, [currentNode]);

  const compositeHasLeadForm = useMemo(() => {
    if (currentNode?.type !== 'composite') return false;
    return (currentNode.data.elements || []).some(
      (el) => el.type === 'lead-form',
    );
  }, [currentNode]);

  // ── Render ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  // Determine what to render based on flags & current node type
  const nodeType = currentNode?.type;
  const isLegacyQuestion =
    nodeType === 'single-choice' || nodeType === 'multiple-choice';
  const isComposite = nodeType === 'composite';
  const isLegacyLeadForm = nodeType === 'lead-form';
  const isResult = nodeType === 'result';
  const isStart = nodeType === 'start';
  const isContentOrMedia =
    !isLegacyQuestion &&
    !isComposite &&
    !isLegacyLeadForm &&
    !isResult &&
    !isStart &&
    !!currentNode;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex flex-col">
      {/* Preview badge */}
      {isPreview && (
        <div className="bg-amber-500 text-white text-center text-xs py-1 font-medium">
          ⚡ Modo Preview — as respostas não serão salvas
        </div>
      )}

      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">Q</span>
          </div>
          <span className="text-white/80 text-sm font-medium">
            {quiz?.name}
          </span>
        </div>
        {!showResult && (
          <span className="text-white/60 text-sm">
            {answeredCount}/{totalQuestions}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {!showResult && (
        <div className="px-4 mb-6">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* ── Result Screen ─────────────────────────────── */}
          {showResult && (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-accent to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="text-white" size={40} />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {currentNode?.data?.title || 'Seu Resultado'}
              </h1>
              <div className="text-6xl mb-4">
                {getResultEmoji(getResultCategory(score))}
              </div>
              <div className="bg-gradient-to-br from-accent/10 to-purple-100 rounded-xl p-6 mb-6">
                <p className="text-sm text-gray-500 mb-1">Sua pontuação</p>
                <p className="text-4xl font-bold text-accent">{score} pts</p>
                <p className="text-lg font-medium text-purple-700 mt-2">
                  {getResultCategory(score)}
                </p>
              </div>
              <div className="space-y-3 text-left mb-6">
                <h3 className="font-semibold text-gray-700">
                  Suas respostas:
                </h3>
                {Object.values(answers).map((answer, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-500">{answer.question}</p>
                    <p className="font-medium text-gray-800 flex items-center justify-between">
                      {answer.answer}
                      <span className="text-accent text-sm">
                        +{answer.score}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-xl font-medium transition-colors"
              >
                Refazer Quiz
              </button>
            </div>
          )}

          {/* ── Lead Form ─────────────────────────────────── */}
          {showLeadForm && !showResult && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {leadSaved ? (
                <div className="text-center py-8">
                  <CheckCircle className="text-success mx-auto mb-4" size={48} />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Obrigado!
                  </h2>
                  <p className="text-gray-500">
                    Seus dados foram salvos. Carregando resultado…
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {currentNode?.data?.title ||
                      (isComposite
                        ? (currentNode?.data?.elements || []).find(
                            (el) => el.type === 'lead-form',
                          )?.title
                        : null) ||
                      'Quase lá!'}
                  </h2>
                  <p className="text-gray-500 mb-6">
                    Preencha seus dados para ver o resultado
                  </p>
                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <User size={16} className="inline mr-1" /> Nome
                      </label>
                      <input
                        type="text"
                        value={leadForm.name}
                        onChange={(e) =>
                          setLeadForm((p) => ({ ...p, name: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                        placeholder="Seu nome"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Mail size={16} className="inline mr-1" /> Email
                      </label>
                      <input
                        type="email"
                        value={leadForm.email}
                        onChange={(e) =>
                          setLeadForm((p) => ({ ...p, email: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Phone size={16} className="inline mr-1" /> Telefone
                      </label>
                      <input
                        type="tel"
                        value={leadForm.phone}
                        onChange={(e) =>
                          setLeadForm((p) => ({ ...p, phone: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      Ver Meu Resultado
                      <ChevronRight size={20} />
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* ── Legacy Question Node ──────────────────────── */}
          {!showLeadForm && !showResult && isLegacyQuestion && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {history.length > 0 && (
                <button
                  onClick={handleGoBack}
                  className="flex items-center gap-1 text-gray-400 hover:text-gray-600 mb-4 text-sm transition-colors"
                >
                  <ArrowLeft size={16} /> Voltar
                </button>
              )}
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {currentNode.data.question || 'Pergunta'}
              </h2>
              <div className="space-y-3">
                {(currentNode.data.options || []).map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    disabled={selectedOption !== null}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      selectedOption === index
                        ? 'border-accent bg-accent/10 ring-2 ring-accent/20'
                        : selectedOption !== null
                          ? 'border-gray-200 opacity-50'
                          : 'border-gray-200 hover:border-accent/50 hover:bg-accent/5'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                        selectedOption === index
                          ? 'bg-accent text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-medium text-gray-800">
                      {option.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Composite Node ────────────────────────────── */}
          {!showLeadForm && !showResult && isComposite && currentNode && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {history.length > 0 && (
                <button
                  onClick={handleGoBack}
                  className="flex items-center gap-1 text-gray-400 hover:text-gray-600 mb-4 text-sm transition-colors"
                >
                  <ArrowLeft size={16} /> Voltar
                </button>
              )}

              {/* Render each element */}
              {(currentNode.data.elements || []).map((el) => {
                // ─ Text ─
                if (el.type === 'text') {
                  return (
                    <p
                      key={el.id}
                      className="text-gray-700 mb-4 whitespace-pre-wrap"
                    >
                      {el.content}
                    </p>
                  );
                }

                // ─ Media ─
                if (['video', 'audio', 'image', 'carousel'].includes(el.type)) {
                  const MediaIcon =
                    el.type === 'video'
                      ? Video
                      : el.type === 'audio'
                        ? Music
                        : ImageIcon;
                  return (
                    <div
                      key={el.id}
                      className="mb-4 bg-gray-100 rounded-xl p-6 flex flex-col items-center gap-2"
                    >
                      {el.url && el.type === 'image' ? (
                        <img
                          src={el.url}
                          alt={el.title || ''}
                          className="rounded-lg max-h-64 object-cover"
                        />
                      ) : el.url && el.type === 'video' ? (
                        <video
                          src={el.url}
                          controls
                          className="rounded-lg max-h-64 w-full"
                        />
                      ) : (
                        <>
                          <MediaIcon
                            size={32}
                            className="text-gray-400"
                          />
                          <span className="text-sm text-gray-500">
                            {el.title || el.type}
                          </span>
                        </>
                      )}
                    </div>
                  );
                }

                // ─ Question ─
                if (el.type.startsWith('question-')) {
                  return (
                    <div key={el.id} className="mb-4">
                      <h2 className="text-xl font-bold text-gray-800 mb-4">
                        {el.question || 'Pergunta'}
                      </h2>
                      <div className="space-y-3">
                        {(el.options || []).map((opt, idx) => {
                          const selKey = `${el.id}-${idx}`;
                          return (
                            <button
                              key={idx}
                              onClick={() =>
                                handleCompositeOptionSelect(el, idx)
                              }
                              disabled={selectedOption !== null}
                              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                                selectedOption === selKey
                                  ? 'border-accent bg-accent/10 ring-2 ring-accent/20'
                                  : selectedOption !== null
                                    ? 'border-gray-200 opacity-50'
                                    : 'border-gray-200 hover:border-accent/50 hover:bg-accent/5'
                              }`}
                            >
                              <span
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                                  selectedOption === selKey
                                    ? 'bg-accent text-white'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="font-medium text-gray-800">
                                {opt.text}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // ─ Lead form (rendered via showLeadForm flag) ─
                // ─ Script (invisible) ─
                return null;
              })}

              {/* If no question elements, show Continue */}
              {!compositeQuestionEl && !compositeHasLeadForm && (
                <button
                  onClick={() =>
                    advanceToNode(getNextNode(currentNodeId))
                  }
                  className="w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors mt-2"
                >
                  Continuar <ChevronRight size={20} />
                </button>
              )}
            </div>
          )}

          {/* ── Content / Media legacy nodes ──────────────── */}
          {!showLeadForm && !showResult && isContentOrMedia && (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <p className="text-gray-800 font-medium mb-4">
                {currentNode.data?.contentType ||
                  currentNode.data?.mediaType ||
                  'Conteúdo'}
              </p>
              <button
                onClick={() =>
                  advanceToNode(getNextNode(currentNodeId))
                }
                className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Continuar
              </button>
            </div>
          )}

          {/* ── Start node ────────────────────────────────── */}
          {!showLeadForm && !showResult && isStart && (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">Q</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {quiz?.name}
              </h2>
              <p className="text-gray-500 mb-6">
                {quiz?.description || 'Teste seus conhecimentos!'}
              </p>
              <button
                onClick={() =>
                  advanceToNode(getNextNode(currentNodeId))
                }
                className="bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto transition-colors"
              >
                Começar <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center">
        <span className="text-white/40 text-xs">Feito com Quiz Maker</span>
      </div>
    </div>
  );
}

// Wrap with Suspense for useSearchParams (Next.js 14 requirement)
export default function QuizPlayerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
          <Loader2 className="animate-spin text-white" size={48} />
        </div>
      }
    >
      <QuizPlayer />
    </Suspense>
  );
}
