'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PanelRightOpen, PanelRightClose } from 'lucide-react';
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
  const { pointsToShow, selectedNode, setQuizId, setQuizName, setNodes, setEdges, setQuizStatus } = useQuizStore();
  const [loading, setLoading] = useState(true);
  const [showProperties, setShowProperties] = useState(true);

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

  // Auto-open properties panel when a node is selected
  useEffect(() => {
    if (selectedNode) {
      setShowProperties(true);
    }
  }, [selectedNode]);

  const loadQuiz = async (id) => {
    try {
      const res = await fetch(`/api/quizzes/${id}`);
      if (res.ok) {
        const quiz = await res.json();
        setQuizId(quiz.id);
        setQuizName(quiz.name);
        setQuizStatus(quiz.status === 'published' ? 'Publicado' : 'Rascunho');
        
        if (quiz.canvasData) {
          const canvasData = typeof quiz.canvasData === 'string' ? JSON.parse(quiz.canvasData) : quiz.canvasData;
          if (canvasData.nodes) setNodes(canvasData.nodes);
          if (canvasData.edges) {
            // Force all edges to bezier curves
            const fixedEdges = canvasData.edges.map(edge => ({
              ...edge,
              type: 'default',
              style: { stroke: '#7c3aed', strokeWidth: 2 },
            }));
            setEdges(fixedEdges);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <TopBar quizId={params.id} />
      
      <div className="flex flex-1 overflow-hidden">
        <ElementsPanel />
        
        <div className="flex-1 relative">
          <CanvasArea />
          
          {pointsToShow.map((p) => (
            <PointsBalloon key={p.id} points={p.points} x={p.x} y={p.y} />
          ))}
          
          {/* Toggle properties panel button */}
          {!showProperties && (
            <button
              onClick={() => setShowProperties(true)}
              className="absolute top-4 right-4 z-10 bg-white shadow-lg rounded-lg p-2 hover:bg-gray-50 transition-colors border border-gray-200"
              title="Abrir propriedades"
            >
              <PanelRightOpen size={20} className="text-gray-600" />
            </button>
          )}
        </div>
        
        {/* Properties panel with close button */}
        {showProperties && (
          <div className="relative">
            <button
              onClick={() => setShowProperties(false)}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors"
              title="Fechar propriedades"
            >
              <PanelRightClose size={18} />
            </button>
            <PropertiesPanel />
          </div>
        )}
      </div>
    </div>
  );
}
