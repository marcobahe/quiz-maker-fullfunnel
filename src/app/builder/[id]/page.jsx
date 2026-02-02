'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
  const { pointsToShow, setQuizId, setQuizName, setNodes, setEdges, setQuizStatus } = useQuizStore();
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
          if (canvasData.edges) setEdges(canvasData.edges);
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
        </div>
        
        <PropertiesPanel />
      </div>
    </div>
  );
}
