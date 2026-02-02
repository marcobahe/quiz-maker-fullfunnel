'use client';

import { useEffect, useState } from 'react';
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

  const [loading, setLoading] = useState(true);

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

        if (quiz.canvasData) {
          const canvasData =
            typeof quiz.canvasData === 'string'
              ? JSON.parse(quiz.canvasData)
              : quiz.canvasData;
          if (canvasData.nodes) setNodes(canvasData.nodes);
          if (canvasData.edges) {
            // Migrate old edge types to custom-bezier
            const migratedEdges = canvasData.edges.map((edge) => ({
              ...edge,
              type: 'custom-bezier',
              style: { stroke: '#7c3aed', strokeWidth: 2 },
            }));
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
