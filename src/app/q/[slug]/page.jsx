'use client';

import { useEffect, useState, useCallback, useMemo, Suspense, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Trophy, ChevronRight, ArrowLeft, User, Mail, Phone, Loader2, CheckCircle, Play, Video, Music, Image as ImageIcon } from 'lucide-react';
import { replaceVariables } from '@/lib/dynamicVariables';
import SpinWheel from '@/components/Player/SpinWheel';
import ScratchCard from '@/components/Player/ScratchCard';

// ── Default theme (matches store defaults) ───────────────────
const DEFAULT_THEME = {
  primaryColor: '#7c3aed',
  secondaryColor: '#5b21b6',
  backgroundColor: '#1e1b4b',
  backgroundType: 'gradient',
  backgroundGradient: 'from-purple-900 via-purple-800 to-indigo-900',
  textColor: '#ffffff',
  buttonStyle: 'rounded',
  fontFamily: 'Inter',
};

const DEFAULT_BRANDING = {
  logoUrl: '',
  faviconUrl: '',
  showBranding: true,
};

// ── Gradient CSS map ─────────────────────────────────────────
const GRADIENT_CSS = {
  'from-purple-900 via-purple-800 to-indigo-900': 'linear-gradient(135deg, #581c87, #6b21a8, #312e81)',
  'from-blue-900 via-blue-800 to-cyan-900': 'linear-gradient(135deg, #1e3a5f, #1e40af, #164e63)',
  'from-emerald-900 via-green-800 to-teal-900': 'linear-gradient(135deg, #064e3b, #166534, #134e4a)',
  'from-orange-900 via-red-800 to-pink-900': 'linear-gradient(135deg, #7c2d12, #991b1b, #831843)',
  'from-gray-900 via-slate-800 to-zinc-900': 'linear-gradient(135deg, #111827, #1e293b, #18181b)',
  'from-rose-900 via-pink-800 to-fuchsia-900': 'linear-gradient(135deg, #881337, #9d174d, #701a75)',
};

// ── Google Fonts loader ──────────────────────────────────────
function GoogleFontLink({ fontFamily }) {
  if (!fontFamily || fontFamily === 'Inter') return null;
  const fontName = fontFamily.replace(/ /g, '+');
  return (
    // eslint-disable-next-line @next/next/no-page-custom-font
    <link
      rel="stylesheet"
      href={`https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700&display=swap`}
    />
  );
}

// ── Button radius helper ─────────────────────────────────────
function getButtonRadius(style) {
  switch (style) {
    case 'pill': return '9999px';
    case 'square': return '0.25rem';
    default: return '0.75rem';
  }
}

// Wrap in Suspense because useSearchParams requires it in Next 14
// ── A/B Testing cookie helpers ───────────────────────────────
function getAbCookie(quizId) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`qm_ab_${quizId}=([^;]+)`));
  return match ? match[1] : null;
}

function setAbCookie(quizId, variantSlug) {
  if (typeof document === 'undefined') return;
  // Cookie lasts 30 days
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `qm_ab_${quizId}=${variantSlug};path=/;expires=${expires};SameSite=Lax`;
}

// ── Open Question Player Component ───────────────────────────
function OpenQuestionPlayer({ element, nodeId, theme, btnRadius, rv, onSubmit }) {
  const [text, setText] = useState('');
  const maxLen = element.maxLength || 500;
  const isRequired = element.required !== false;
  const canSubmit = !isRequired || text.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(text.trim());
  };

  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {rv(element.question || 'Pergunta')}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </h2>
      {element.multiline ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxLen))}
          placeholder={element.placeholder || 'Digite sua resposta...'}
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 focus:border-transparent outline-none resize-none text-gray-800 text-sm transition-all"
          style={{
            borderRadius: btnRadius,
            '--tw-ring-color': theme.primaryColor,
          }}
          onFocus={(e) => { e.target.style.borderColor = theme.primaryColor; e.target.style.boxShadow = `0 0 0 3px ${theme.primaryColor}20`; }}
          onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
          maxLength={maxLen}
        />
      ) : (
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxLen))}
          placeholder={element.placeholder || 'Digite sua resposta...'}
          className="w-full px-4 py-3 border-2 border-gray-200 focus:border-transparent outline-none text-gray-800 text-sm transition-all"
          style={{
            borderRadius: btnRadius,
            '--tw-ring-color': theme.primaryColor,
          }}
          onFocus={(e) => { e.target.style.borderColor = theme.primaryColor; e.target.style.boxShadow = `0 0 0 3px ${theme.primaryColor}20`; }}
          onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
          maxLength={maxLen}
          onKeyDown={(e) => { if (e.key === 'Enter' && canSubmit) handleSubmit(); }}
        />
      )}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">
          {text.length}/{maxLen}
        </span>
        {isRequired && text.trim().length === 0 && (
          <span className="text-xs text-red-400">Resposta obrigatória</span>
        )}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full text-white py-3 font-medium flex items-center justify-center gap-2 transition-all mt-3"
        style={{
          backgroundColor: canSubmit ? theme.primaryColor : '#d1d5db',
          borderRadius: btnRadius,
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          opacity: canSubmit ? 1 : 0.7,
        }}
      >
        Continuar <ChevronRight size={20} />
      </button>
    </div>
  );
}

function QuizPlayer() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isPreview = searchParams.get('preview') === 'true';
  const isEmbedParam = searchParams.get('embed') === 'true';
  const abHandledRef = useRef(false);

  // Detect if running inside an iframe (embed mode)
  const [isEmbed, setIsEmbed] = useState(false);
  useEffect(() => {
    try {
      setIsEmbed(isEmbedParam || window.self !== window.top);
    } catch (_) {
      setIsEmbed(true); // cross-origin iframe blocks access → we are embedded
    }
  }, [isEmbedParam]);

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Theme settings
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [branding, setBranding] = useState(DEFAULT_BRANDING);

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
  const [pointsBalloons, setPointsBalloons] = useState([]);

  // Canvas data
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [scoreRanges, setScoreRanges] = useState([]);

  // ── Custom favicon ───────────────────────────────────────────
  useEffect(() => {
    if (!branding.faviconUrl) return;
    // Remove existing favicons
    const existing = document.querySelectorAll("link[rel*='icon']");
    existing.forEach((el) => el.remove());
    // Add custom favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = branding.faviconUrl;
    link.type = branding.faviconUrl.endsWith('.ico') ? 'image/x-icon' : 'image/png';
    document.head.appendChild(link);
    return () => {
      try { document.head.removeChild(link); } catch (_) {}
    };
  }, [branding.faviconUrl]);

  // ── Embed: auto-resize via postMessage ───────────────────────
  useEffect(() => {
    if (!isEmbed) return;
    const send = () => {
      const h = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'quizmaker:resize', height: h }, '*');
    };
    send();
    const obs = new ResizeObserver(send);
    obs.observe(document.body);
    return () => obs.disconnect();
  }, [isEmbed, currentNodeId, showResult, showLeadForm]);

  // ── Derived styles ──────────────────────────────────────────

  const btnRadius = getButtonRadius(theme.buttonStyle);

  const bgStyle = useMemo(() => {
    if (theme.backgroundType === 'gradient' && GRADIENT_CSS[theme.backgroundGradient]) {
      return { background: GRADIENT_CSS[theme.backgroundGradient] };
    }
    return { backgroundColor: theme.backgroundColor };
  }, [theme.backgroundType, theme.backgroundGradient, theme.backgroundColor]);

  // ── Dynamic Variables context ───────────────────────────────

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

  const variableValues = useMemo(() => ({
    nome: leadForm.name || '',
    email: leadForm.email || '',
    score: String(score),
    total_perguntas: String(totalQuestions),
  }), [leadForm.name, leadForm.email, score, totalQuestions]);

  /** Replace dynamic variables in text */
  const rv = useCallback(
    (text) => replaceVariables(text, variableValues),
    [variableValues],
  );

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

      // ── A/B Testing: client-side split with cookie ──────────
      if (data.abTest && !isPreview && !abHandledRef.current) {
        abHandledRef.current = true;
        const { originalId, originalSlug, originalSplit, variants } = data.abTest;

        if (variants && variants.length > 0) {
          const variant = variants[0]; // Support single variant for now

          // Check cookie for existing assignment
          const existing = getAbCookie(originalId);

          if (existing && existing !== originalSlug) {
            // User was previously assigned to variant — redirect
            const embedParam = isEmbedParam ? '&embed=true' : '';
            router.replace(`/q/${existing}?${previewParam}${embedParam}`);
            return;
          }

          if (!existing) {
            // New visitor — do random split
            const rand = Math.random() * 100;
            const assignedSlug = rand < (originalSplit || 50) ? originalSlug : variant.slug;

            // Set cookie for consistency
            setAbCookie(originalId, assignedSlug);

            if (assignedSlug !== originalSlug) {
              // Redirect to variant
              const embedParam = isEmbedParam ? '&embed=true' : '';
              router.replace(`/q/${assignedSlug}?${previewParam}${embedParam}`);
              return;
            }
            // else: stay on original, continue loading
          }
          // Cookie matches original — continue loading
        }
      }

      setQuiz(data);

      // Load settings (theme & branding)
      if (data.settings) {
        try {
          const settings = typeof data.settings === 'string'
            ? JSON.parse(data.settings)
            : data.settings;
          if (settings && typeof settings === 'object') {
            if (settings.theme) setTheme((prev) => ({ ...prev, ...settings.theme }));
            if (settings.branding) setBranding((prev) => ({ ...prev, ...settings.branding }));
          }
        } catch (_e) { /* ignore */ }
      }

      // Load score ranges
      if (data.scoreRanges) {
        const ranges = typeof data.scoreRanges === 'string'
          ? JSON.parse(data.scoreRanges)
          : data.scoreRanges;
        if (Array.isArray(ranges) && ranges.length > 0) {
          setScoreRanges(ranges);
        }
      }

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

  // ── Navigation helpers (Enhanced Skip Logic) ────────────────

  const getNextNode = useCallback(
    (fromNodeId, optionIndex = null, elementId = null) => {
      const nodeEdges = edges.filter((e) => e.source === fromNodeId);

      if (optionIndex !== null) {
        // 1. Try specific option edge (composite element handle)
        if (elementId) {
          const compEdge = nodeEdges.find(
            (e) => e.sourceHandle === `${elementId}-option-${optionIndex}`,
          );
          if (compEdge) return compEdge.target;
        }

        // 2. Try specific option edge (legacy handle)
        const legacyEdge = nodeEdges.find(
          (e) => e.sourceHandle === `option-${optionIndex}`,
        );
        if (legacyEdge) return legacyEdge.target;

        // 3. Try any matching option edge (fuzzy)
        const anyOptionEdge = nodeEdges.find(
          (e) =>
            e.sourceHandle &&
            e.sourceHandle.endsWith(`-option-${optionIndex}`),
        );
        if (anyOptionEdge) return anyOptionEdge.target;

        // 4. Fallback: try "general" handle edge (composite)
        if (elementId) {
          const compGeneral = nodeEdges.find(
            (e) => e.sourceHandle === `${elementId}-general`,
          );
          if (compGeneral) return compGeneral.target;
        }

        // 5. Fallback: try "general" handle edge (legacy)
        const legacyGeneral = nodeEdges.find(
          (e) => e.sourceHandle === 'general',
        );
        if (legacyGeneral) return legacyGeneral.target;

        // 6. Try any general handle
        const anyGeneral = nodeEdges.find(
          (e) => e.sourceHandle && e.sourceHandle.endsWith('-general'),
        );
        if (anyGeneral) return anyGeneral.target;
      }

      // 7. Try default source handle (bottom handle, no sourceHandle id)
      const defaultEdge = nodeEdges.find(
        (e) => !e.sourceHandle,
      );
      if (defaultEdge) return defaultEdge.target;

      // 8. Any remaining edge
      if (nodeEdges.length > 0) return nodeEdges[0].target;

      // 9. No edges at all → try sequential navigation by Y position
      const currentNode = nodes.find((n) => n.id === fromNodeId);
      if (currentNode) {
        const sortedNodes = [...nodes]
          .filter((n) => n.type !== 'start' && n.id !== fromNodeId)
          .sort((a, b) => (a.position?.y || 0) - (b.position?.y || 0));

        const currentY = currentNode.position?.y || 0;
        const nextByPosition = sortedNodes.find(
          (n) => (n.position?.y || 0) > currentY,
        );
        if (nextByPosition) return nextByPosition.id;
      }

      return null;
    },
    [edges, nodes],
  );

  const advanceToNode = useCallback(
    (nextId) => {
      if (!nextId) {
        setShowResult(true);
        return;
      }
      const nextNode = nodes.find((n) => n.id === nextId);

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

  const answeredCount = Object.keys(answers).length;
  const progress =
    totalQuestions > 0
      ? Math.round((answeredCount / totalQuestions) * 100)
      : 0;

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

  // ── Embed: notify parent on quiz completion ─────────────────
  useEffect(() => {
    if (!isEmbed || !showResult) return;
    window.parent.postMessage({
      type: 'quizmaker:complete',
      slug: params.slug,
      score,
      category: getResultCategory(score),
    }, '*');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEmbed, showResult]);

  // ── Handlers ────────────────────────────────────────────────

  const showPointsBalloon = (points, event) => {
    if (points <= 0) return;
    const id = Date.now();
    const rect = event?.currentTarget?.getBoundingClientRect?.();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top : window.innerHeight / 2;
    setPointsBalloons((prev) => [...prev, { id, points, x, y }]);
    setTimeout(() => {
      setPointsBalloons((prev) => prev.filter((b) => b.id !== id));
    }, 1500);
  };

  const handleOptionSelect = (optionIndex, event) => {
    if (!currentNode) return;
    setSelectedOption(optionIndex);

    const option = currentNode.data.options?.[optionIndex];
    const optionScore = option?.score || 0;

    if (optionScore > 0) showPointsBalloon(optionScore, event);

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

  const handleCompositeOptionSelect = (element, optionIndex, event) => {
    if (!currentNode) return;
    setSelectedOption(`${element.id}-${optionIndex}`);

    const option = element.options?.[optionIndex];
    const optionScore = option?.score || 0;

    if (optionScore > 0) showPointsBalloon(optionScore, event);

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

  const getMatchingRange = (finalScore) => {
    if (!scoreRanges || scoreRanges.length === 0) return null;
    const sorted = [...scoreRanges].sort((a, b) => a.min - b.min);
    return sorted.find((r) => finalScore >= r.min && finalScore <= r.max) || null;
  };

  const getResultCategory = (finalScore) => {
    const matchedRange = getMatchingRange(finalScore);
    if (matchedRange) return matchedRange.title;

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

  const compositeHasGamification = useMemo(() => {
    if (currentNode?.type !== 'composite') return false;
    return (currentNode.data.elements || []).some(
      (el) => el.type === 'spin-wheel' || el.type === 'scratch-card',
    );
  }, [currentNode]);

  // ── Render ──────────────────────────────────────────────────

  const embedClass = isEmbed ? 'min-h-0 h-full' : 'min-h-screen';

  if (loading) {
    return (
      <div className={`${embedClass} flex items-center justify-center`} style={bgStyle}>
        <Loader2 className="animate-spin" size={48} style={{ color: theme.textColor }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${embedClass} flex items-center justify-center p-4`} style={bgStyle}>
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  // Determine what to render
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
    <div
      className={`${embedClass} flex flex-col`}
      style={{ ...bgStyle, fontFamily: theme.fontFamily, color: theme.textColor }}
    >
      {/* Google Font */}
      <GoogleFontLink fontFamily={theme.fontFamily} />

      {/* Preview badge */}
      {isPreview && !isEmbed && (
        <div className="bg-amber-500 text-white text-center text-xs py-1 font-medium">
          ⚡ Modo Preview — as respostas não serão salvas
        </div>
      )}

      {/* Header (hidden in embed mode for cleaner look) */}
      {!isEmbed && (
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt="Logo"
                className="w-8 h-8 rounded-lg object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <span className="text-sm font-bold" style={{ color: theme.textColor }}>Q</span>
              </div>
            )}
            <span className="text-sm font-medium" style={{ color: theme.textColor, opacity: 0.8 }}>
              {quiz?.name}
            </span>
          </div>
          {!showResult && (
            <span className="text-sm" style={{ color: theme.textColor, opacity: 0.6 }}>
              {answeredCount}/{totalQuestions}
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      {!showResult && (
        <div className={isEmbed ? 'px-2 mb-4' : 'px-4 mb-6'}>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: theme.textColor }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 flex items-center justify-center ${isEmbed ? 'p-2' : 'p-4'}`}>
        <div className="w-full max-w-lg">
          {/* ── Result Screen ─────────────────────────────── */}
          {showResult && (() => {
            const matchedRange = getMatchingRange(score);
            return (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center" style={{ fontFamily: theme.fontFamily }}>
                {matchedRange?.image ? (
                  <img
                    src={matchedRange.image}
                    alt={matchedRange.title}
                    className="w-full h-48 object-cover rounded-xl mb-6"
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
                  >
                    <Trophy className="text-white" size={40} />
                  </div>
                )}

                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {rv(matchedRange?.title || currentNode?.data?.title || 'Seu Resultado')}
                </h1>

                {matchedRange?.description ? (
                  <p className="text-gray-600 mb-4 whitespace-pre-wrap">
                    {rv(matchedRange.description)}
                  </p>
                ) : (
                  <div className="text-6xl mb-4">
                    {getResultEmoji(getResultCategory(score))}
                  </div>
                )}

                <div
                  className="rounded-xl p-6 mb-6"
                  style={{ backgroundColor: `${theme.primaryColor}10` }}
                >
                  <p className="text-sm text-gray-500 mb-1">Sua pontuação</p>
                  <p className="text-4xl font-bold" style={{ color: theme.primaryColor }}>{score} pts</p>
                  {!matchedRange && (
                    <p className="text-lg font-medium mt-2" style={{ color: theme.secondaryColor }}>
                      {getResultCategory(score)}
                    </p>
                  )}
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
                        <span className="text-sm" style={{ color: theme.primaryColor }}>
                          +{answer.score}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>

                {matchedRange?.ctaText && matchedRange?.ctaUrl ? (
                  <a
                    href={matchedRange.ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-block text-white py-3 font-medium transition-opacity hover:opacity-90 mb-3 text-center"
                    style={{ backgroundColor: theme.primaryColor, borderRadius: btnRadius }}
                  >
                    {matchedRange.ctaText}
                  </a>
                ) : null}

                <button
                  onClick={() => window.location.reload()}
                  className={`w-full py-3 font-medium transition-opacity hover:opacity-90`}
                  style={{
                    backgroundColor: matchedRange?.ctaText ? '#f3f4f6' : theme.primaryColor,
                    color: matchedRange?.ctaText ? '#374151' : '#ffffff',
                    borderRadius: btnRadius,
                  }}
                >
                  Refazer Quiz
                </button>
              </div>
            );
          })()}

          {/* ── Lead Form ─────────────────────────────────── */}
          {showLeadForm && !showResult && (
            <div className="bg-white rounded-2xl shadow-xl p-8" style={{ fontFamily: theme.fontFamily }}>
              {leadSaved ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto mb-4" size={48} style={{ color: '#10b981' }} />
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
                    {rv(currentNode?.data?.title ||
                      (isComposite
                        ? (currentNode?.data?.elements || []).find(
                            (el) => el.type === 'lead-form',
                          )?.title
                        : null) ||
                      'Quase lá!')}
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
                        className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:border-transparent outline-none"
                        style={{ borderRadius: btnRadius, '--tw-ring-color': theme.primaryColor }}
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
                        className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:border-transparent outline-none"
                        style={{ borderRadius: btnRadius }}
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
                        className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:border-transparent outline-none"
                        style={{ borderRadius: btnRadius }}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full text-white py-3 font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                      style={{ backgroundColor: theme.primaryColor, borderRadius: btnRadius }}
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
            <div className="bg-white rounded-2xl shadow-xl p-8" style={{ fontFamily: theme.fontFamily }}>
              {history.length > 0 && (
                <button
                  onClick={handleGoBack}
                  className="flex items-center gap-1 text-gray-400 hover:text-gray-600 mb-4 text-sm transition-colors"
                >
                  <ArrowLeft size={16} /> Voltar
                </button>
              )}
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {rv(currentNode.data.question || 'Pergunta')}
              </h2>
              <div className="space-y-3">
                {(currentNode.data.options || []).map((option, index) => (
                  <button
                    key={index}
                    onClick={(e) => handleOptionSelect(index, e)}
                    disabled={selectedOption !== null}
                    className="w-full text-left p-4 border-2 transition-all flex items-center gap-3"
                    style={{
                      borderRadius: btnRadius,
                      borderColor:
                        selectedOption === index
                          ? theme.primaryColor
                          : selectedOption !== null
                            ? '#e5e7eb'
                            : '#e5e7eb',
                      backgroundColor:
                        selectedOption === index ? `${theme.primaryColor}10` : 'transparent',
                      opacity: selectedOption !== null && selectedOption !== index ? 0.5 : 1,
                      boxShadow:
                        selectedOption === index
                          ? `0 0 0 3px ${theme.primaryColor}20`
                          : 'none',
                    }}
                  >
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
                      style={{
                        backgroundColor:
                          selectedOption === index ? theme.primaryColor : '#f3f4f6',
                        color:
                          selectedOption === index ? '#ffffff' : '#6b7280',
                      }}
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
            <div className="bg-white rounded-2xl shadow-xl p-8" style={{ fontFamily: theme.fontFamily }}>
              {history.length > 0 && (
                <button
                  onClick={handleGoBack}
                  className="flex items-center gap-1 text-gray-400 hover:text-gray-600 mb-4 text-sm transition-colors"
                >
                  <ArrowLeft size={16} /> Voltar
                </button>
              )}

              {(currentNode.data.elements || []).map((el) => {
                if (el.type === 'text') {
                  return (
                    <p
                      key={el.id}
                      className="text-gray-700 mb-4 whitespace-pre-wrap"
                    >
                      {rv(el.content)}
                    </p>
                  );
                }

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

                if (el.type === 'question-icons') {
                  const iconCols = el.columns || 2;
                  return (
                    <div key={el.id} className="mb-4">
                      <h2 className="text-xl font-bold text-gray-800 mb-4">
                        {rv(el.question || 'Pergunta')}
                      </h2>
                      <div
                        className="grid gap-3"
                        style={{ gridTemplateColumns: `repeat(${iconCols}, 1fr)` }}
                      >
                        {(el.options || []).map((opt, idx) => {
                          const selKey = `${el.id}-${idx}`;
                          const isSelected = selectedOption === selKey;
                          return (
                            <button
                              key={idx}
                              onClick={(e) =>
                                handleCompositeOptionSelect(el, idx, e)
                              }
                              disabled={selectedOption !== null}
                              className="flex flex-col items-center justify-center p-4 border-2 transition-all"
                              style={{
                                borderRadius: btnRadius,
                                borderColor: isSelected ? theme.primaryColor : '#e5e7eb',
                                backgroundColor: isSelected ? `${theme.primaryColor}10` : 'transparent',
                                opacity: selectedOption !== null && !isSelected ? 0.5 : 1,
                                boxShadow: isSelected ? `0 0 0 3px ${theme.primaryColor}20` : 'none',
                                transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                                aspectRatio: '1 / 1',
                              }}
                              onMouseEnter={(e) => {
                                if (selectedOption === null) {
                                  e.currentTarget.style.borderColor = theme.primaryColor;
                                  e.currentTarget.style.transform = 'scale(1.05)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected && selectedOption === null) {
                                  e.currentTarget.style.borderColor = '#e5e7eb';
                                  e.currentTarget.style.transform = 'scale(1)';
                                }
                              }}
                            >
                              {el.optionStyle === 'image' && opt.image ? (
                                <img
                                  src={opt.image}
                                  alt={opt.text}
                                  className="w-16 h-16 object-cover rounded-lg mb-2"
                                />
                              ) : (
                                <span className="text-5xl mb-2 leading-none">{opt.icon || '⭐'}</span>
                              )}
                              <span className="text-sm font-medium text-gray-700 text-center">
                                {opt.text}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                if (el.type.startsWith('question-')) {
                  return (
                    <div key={el.id} className="mb-4">
                      <h2 className="text-xl font-bold text-gray-800 mb-4">
                        {rv(el.question || 'Pergunta')}
                      </h2>
                      <div className="space-y-3">
                        {(el.options || []).map((opt, idx) => {
                          const selKey = `${el.id}-${idx}`;
                          return (
                            <button
                              key={idx}
                              onClick={(e) =>
                                handleCompositeOptionSelect(el, idx, e)
                              }
                              disabled={selectedOption !== null}
                              className="w-full text-left p-4 border-2 transition-all flex items-center gap-3"
                              style={{
                                borderRadius: btnRadius,
                                borderColor:
                                  selectedOption === selKey
                                    ? theme.primaryColor
                                    : '#e5e7eb',
                                backgroundColor:
                                  selectedOption === selKey
                                    ? `${theme.primaryColor}10`
                                    : 'transparent',
                                opacity:
                                  selectedOption !== null && selectedOption !== selKey ? 0.5 : 1,
                                boxShadow:
                                  selectedOption === selKey
                                    ? `0 0 0 3px ${theme.primaryColor}20`
                                    : 'none',
                              }}
                            >
                              <span
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
                                style={{
                                  backgroundColor:
                                    selectedOption === selKey
                                      ? theme.primaryColor
                                      : '#f3f4f6',
                                  color:
                                    selectedOption === selKey
                                      ? '#ffffff'
                                      : '#6b7280',
                                }}
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

                if (el.type === 'spin-wheel') {
                  return (
                    <div key={el.id} className="mb-4">
                      <SpinWheel
                        element={el}
                        theme={theme}
                        btnRadius={btnRadius}
                        onComplete={(result) => {
                          // Add score if defined
                          if (el.score > 0) {
                            setScore((prev) => prev + el.score);
                          }
                          // Auto-advance to next node
                          advanceToNode(getNextNode(currentNodeId));
                        }}
                      />
                    </div>
                  );
                }

                if (el.type === 'scratch-card') {
                  return (
                    <div key={el.id} className="mb-4">
                      <ScratchCard
                        element={el}
                        theme={theme}
                        btnRadius={btnRadius}
                        onComplete={(result) => {
                          if (el.score > 0) {
                            setScore((prev) => prev + el.score);
                          }
                          advanceToNode(getNextNode(currentNodeId));
                        }}
                      />
                    </div>
                  );
                }

                if (el.type === 'question-open') {
                  return (
                    <OpenQuestionPlayer
                      key={el.id}
                      element={el}
                      nodeId={currentNodeId}
                      theme={theme}
                      btnRadius={btnRadius}
                      rv={rv}
                      onSubmit={(text) => {
                        const elScore = el.score || 0;
                        if (elScore > 0) setScore((prev) => prev + elScore);
                        setAnswers((prev) => ({
                          ...prev,
                          [`${currentNodeId}__${el.id}`]: {
                            question: el.question,
                            answer: text,
                            score: elScore,
                            elementId: el.id,
                          },
                        }));
                        advanceToNode(getNextNode(currentNodeId, null, el.id));
                      }}
                    />
                  );
                }

                return null;
              })}

              {!compositeQuestionEl && !compositeHasLeadForm && !compositeHasGamification && (
                <button
                  onClick={() =>
                    advanceToNode(getNextNode(currentNodeId))
                  }
                  className="w-full text-white py-3 font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90 mt-2"
                  style={{ backgroundColor: theme.primaryColor, borderRadius: btnRadius }}
                >
                  Continuar <ChevronRight size={20} />
                </button>
              )}
            </div>
          )}

          {/* ── Content / Media legacy nodes ──────────────── */}
          {!showLeadForm && !showResult && isContentOrMedia && (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center" style={{ fontFamily: theme.fontFamily }}>
              <p className="text-gray-800 font-medium mb-4">
                {currentNode.data?.contentType ||
                  currentNode.data?.mediaType ||
                  'Conteúdo'}
              </p>
              <button
                onClick={() =>
                  advanceToNode(getNextNode(currentNodeId))
                }
                className="text-white px-6 py-3 font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: theme.primaryColor, borderRadius: btnRadius }}
              >
                Continuar
              </button>
            </div>
          )}

          {/* ── Start node ────────────────────────────────── */}
          {!showLeadForm && !showResult && isStart && (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center" style={{ fontFamily: theme.fontFamily }}>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
              >
                {branding.logoUrl ? (
                  <img
                    src={branding.logoUrl}
                    alt="Logo"
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => { e.target.outerHTML = '<span class="text-white text-2xl font-bold">Q</span>'; }}
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">Q</span>
                )}
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
                className="text-white px-8 py-3 font-medium flex items-center gap-2 mx-auto transition-opacity hover:opacity-90"
                style={{ backgroundColor: theme.primaryColor, borderRadius: btnRadius }}
              >
                Começar <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Points Balloons */}
      {pointsBalloons.map((b) => (
        <div
          key={b.id}
          className="fixed pointer-events-none z-50"
          style={{ left: b.x - 40, top: b.y - 20 }}
        >
          <div
            className="animate-balloon text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg flex items-center gap-1"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <span>+{b.points}</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      ))}

      {/* Footer */}
      {branding.showBranding && !isEmbed && (
        <div className="p-4 text-center">
          <span className="text-xs" style={{ color: theme.textColor, opacity: 0.4 }}>
            Feito com Quiz Maker
          </span>
        </div>
      )}
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
