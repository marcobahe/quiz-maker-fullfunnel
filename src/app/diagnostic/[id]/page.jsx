'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import TopBar from '@/components/Layout/TopBar';
import ScoreRangesEditor from '@/components/ScoreRanges/ScoreRangesEditor';
import ThemeEditor from '@/components/Settings/ThemeEditor';
import { AlertCircle, CheckCircle, AlertTriangle, Info, Palette } from 'lucide-react';
import useQuizStore from '@/store/quizStore';
import { defaultQuizSettings } from '@/store/quizStore';

const getDiagnosticItems = (nodes, edges) => {
  const items = [];
  
  const hasStart = nodes.some(n => n.type === 'start');
  const hasResult = nodes.some(n => n.type === 'result');
  const hasLeadForm = nodes.some(n => n.type === 'lead-form');
  const questions = nodes.filter(n => n.type === 'single-choice' || n.type === 'multiple-choice');
  
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

  const noScoreOptions = questions.some(q => q.data.options?.every(o => !o.score || o.score === 0));
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

export default function DiagnosticPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { nodes, edges, scoreRanges, quizSettings, isSaved } = useQuizStore();
  const setScoreRanges = useQuizStore((s) => s.setScoreRanges);
  const setQuizSettings = useQuizStore((s) => s.setQuizSettings);
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

  // Load quiz data if store is empty (direct navigation to diagnostic page)
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
          // Use setState directly to avoid marking as unsaved
          useQuizStore.setState({ scoreRanges: ranges });
        }

        // Load settings
        if (quiz.settings) {
          try {
            const settings = typeof quiz.settings === 'string'
              ? JSON.parse(quiz.settings)
              : quiz.settings;
            if (settings && typeof settings === 'object' && Object.keys(settings).length > 0) {
              const merged = {
                theme: { ...defaultQuizSettings.theme, ...(settings.theme || {}) },
                branding: { ...defaultQuizSettings.branding, ...(settings.branding || {}) },
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

        // Mark as saved and allow auto-save
        useQuizStore.getState().saveQuiz();
        setTimeout(() => { isFirstLoad.current = false; }, 500);
      }
    } catch (err) {
      console.error('Failed to load quiz:', err);
    }
  };

  // Auto-save debounced when scoreRanges or quizSettings change
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Diagnóstico do Quiz</h1>
            <p className="text-gray-500">Verifique se seu quiz está configurado corretamente antes de publicar.</p>
          </div>

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

          {/* Score Ranges Editor */}
          <ScoreRangesEditor />

          {/* Theme & Branding Editor */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Palette size={20} className="text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Aparência</h2>
                <p className="text-sm text-gray-500">Personalize cores, fontes e branding do seu quiz</p>
              </div>
            </div>
            <ThemeEditor />
          </div>

          <div className="space-y-4 mt-8">
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
        </div>
      </div>
    </div>
  );
}
