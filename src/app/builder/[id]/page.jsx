'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PanelRightOpen } from 'lucide-react';
import TopBar from '@/components/Layout/TopBar';
import ElementsPanel from '@/components/Panels/ElementsPanel';
import PropertiesPanel from '@/components/Panels/PropertiesPanel';
import CanvasArea from '@/components/Canvas/CanvasArea';
import PointsBalloon from '@/components/Gamification/PointsBalloon';
import useQuizStore from '@/store/quizStore';
import { defaultQuizSettings } from '@/store/quizStore';

export default function BuilderPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();

  const pointsToShow = useQuizStore((s) => s.pointsToShow);
  const selectedNodeId = useQuizStore((s) => s.selectedNodeId);
  const propertiesPanelOpen = useQuizStore((s) => s.propertiesPanelOpen);
  const setPropertiesPanelOpen = useQuizStore((s) => s.setPropertiesPanelOpen);
  const setQuizId = useQuizStore((s) => s.setQuizId);
  const setQuizName = useQuizStore((s) => s.setQuizName);
  const setNodes = useQuizStore((s) => s.setNodes);
  const setEdges = useQuizStore((s) => s.setEdges);
  const setQuizStatus = useQuizStore((s) => s.setQuizStatus);
  const setScoreRanges = useQuizStore((s) => s.setScoreRanges);

  const [loading, setLoading] = useState(true);
  const autoSaveTimer = useRef(null);
  const isFirstLoad = useRef(true);

  // ── Auto-save (debounced 2s after any change) ─────────────────
  const nodes = useQuizStore((s) => s.nodes);
  const edges = useQuizStore((s) => s.edges);
  const isSaved = useQuizStore((s) => s.isSaved);
  const quizName = useQuizStore((s) => s.quizName);

  const autoSave = useCallback(async () => {
    if (!params.id || isFirstLoad.current) return;
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
  }, [params.id]);

  useEffect(() => {
    if (isFirstLoad.current || loading || isSaved) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(autoSave, 2000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [nodes, edges, quizName, isSaved, loading, autoSave]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && params.id) {
      loadQuiz(params.id);
    }
  }, [status, params.id]);

  // Auto-open panel when a node is selected (store already does this in selectNode)
  // but if panel was manually closed and user clicks a node, it re-opens via selectNode

  const loadQuiz = async (id) => {
    try {
      const res = await fetch(`/api/quizzes/${id}`);
      if (res.ok) {
        const quiz = await res.json();
        setQuizId(quiz.id);
        setQuizName(quiz.name);
        setQuizStatus(quiz.status === 'published' ? 'Publicado' : 'Rascunho');

        // Load score ranges
        if (quiz.scoreRanges) {
          const ranges = typeof quiz.scoreRanges === 'string'
            ? JSON.parse(quiz.scoreRanges)
            : quiz.scoreRanges;
          setScoreRanges(ranges);
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
                aiResultConfig: { ...defaultQuizSettings.aiResultConfig, ...(settings.aiResultConfig || {}) },
                tracking: {
                  ...defaultQuizSettings.tracking,
                  ...(settings.tracking || {}),
                  events: { ...defaultQuizSettings.tracking.events, ...(settings.tracking?.events || {}) },
                },
              };
              useQuizStore.setState({ quizSettings: merged });
            }
          } catch (_e) { /* ignore parse errors */ }
        }

        if (quiz.canvasData) {
          const canvasData =
            typeof quiz.canvasData === 'string'
              ? JSON.parse(quiz.canvasData)
              : quiz.canvasData;
          if (canvasData.nodes) {
            // Migrate legacy nodes to composite format
            const migratedNodes = canvasData.nodes.map((node) => {
              // Keep start and result as-is
              if (node.type === 'start' || node.type === 'result' || node.type === 'composite') {
                return node;
              }
              // Convert single-choice / multiple-choice to composite
              if (node.type === 'single-choice' || node.type === 'multiple-choice') {
                const elType = node.type === 'multiple-choice' ? 'question-multiple' : 'question-single';
                return {
                  ...node,
                  type: 'composite',
                  data: {
                    label: node.data.question || 'Pergunta',
                    elements: [{
                      id: `el-migrated-${node.id}`,
                      type: elType,
                      question: node.data.question || 'Nova Pergunta',
                      options: node.data.options || [],
                    }],
                  },
                };
              }
              // Convert lead-form to composite
              if (node.type === 'lead-form') {
                return {
                  ...node,
                  type: 'composite',
                  data: {
                    label: node.data.title || 'Formulário Lead',
                    elements: [{
                      id: `el-migrated-${node.id}`,
                      type: 'lead-form',
                      title: node.data.title || 'Capture seus dados',
                      fields: ['name', 'email', 'phone'],
                    }],
                  },
                };
              }
              // Convert media nodes to composite
              if (node.type === 'media') {
                return {
                  ...node,
                  type: 'composite',
                  data: {
                    label: node.data.mediaType || 'Mídia',
                    elements: [{
                      id: `el-migrated-${node.id}`,
                      type: node.data.mediaType || 'image',
                      title: node.data.mediaType || 'Mídia',
                      url: '',
                    }],
                  },
                };
              }
              // Convert content nodes to composite
              if (node.type === 'content') {
                return {
                  ...node,
                  type: 'composite',
                  data: {
                    label: node.data.contentType || 'Conteúdo',
                    elements: [{
                      id: `el-migrated-${node.id}`,
                      type: node.data.contentType === 'script' ? 'script' : 'text',
                      content: '',
                    }],
                  },
                };
              }
              return node;
            });
            setNodes(migratedNodes);
          }
          if (canvasData.edges) {
            // Migrate old edge types to custom-bezier + fix handles for composite nodes
            const migratedEdges = canvasData.edges.map((edge) => {
              const newEdge = {
                ...edge,
                type: 'custom-bezier',
                style: { stroke: '#7c3aed', strokeWidth: 2 },
              };
              // Migrate option handles: option-0 → el-migrated-{nodeId}-option-0
              if (edge.sourceHandle && edge.sourceHandle.startsWith('option-')) {
                const sourceNode = canvasData.nodes.find(n => n.id === edge.source);
                if (sourceNode && sourceNode.type !== 'composite') {
                  newEdge.sourceHandle = `el-migrated-${edge.source}-${edge.sourceHandle}`;
                }
              }
              // Migrate general handle
              if (edge.sourceHandle === 'general') {
                const sourceNode = canvasData.nodes.find(n => n.id === edge.source);
                if (sourceNode && sourceNode.type !== 'composite') {
                  newEdge.sourceHandle = `el-migrated-${edge.source}-general`;
                }
              }
              return newEdge;
            });
            setEdges(migratedEdges);
          }
        }
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      setLoading(false);
      // Allow auto-save after initial load completes
      setTimeout(() => { isFirstLoad.current = false; }, 500);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <TopBar quizId={params.id} />

      <div className="flex flex-1 overflow-hidden">
        <ElementsPanel />

        {/* Canvas area */}
        <div className="flex-1 relative">
          <CanvasArea />

          {pointsToShow.map((p) => (
            <PointsBalloon key={p.id} points={p.points} x={p.x} y={p.y} />
          ))}

          {/* Re-open button (visible when panel is closed) */}
          {!propertiesPanelOpen && (
            <button
              onClick={() => setPropertiesPanelOpen(true)}
              className="absolute top-4 right-4 z-10 bg-white shadow-lg rounded-lg p-2.5 hover:bg-gray-50 transition-all border border-gray-200 hover:shadow-xl group"
              title="Abrir propriedades"
            >
              <PanelRightOpen size={20} className="text-gray-500 group-hover:text-accent transition-colors" />
            </button>
          )}
        </div>

        {/* Properties panel with slide animation */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            propertiesPanelOpen ? 'w-80' : 'w-0'
          }`}
        >
          <div className="w-80 h-full">
            <PropertiesPanel onClose={() => setPropertiesPanelOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}
