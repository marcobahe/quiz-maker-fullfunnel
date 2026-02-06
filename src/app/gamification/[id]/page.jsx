'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import TopBar from '@/components/Layout/TopBar';
import GamificationSettings from '@/components/Settings/GamificationSettings';
import useQuizStore from '@/store/quizStore';
import { defaultQuizSettings } from '@/store/quizStore';

export default function GamificationPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { quizSettings, isSaved } = useQuizStore();
  const setQuizId = useQuizStore((s) => s.setQuizId);
  const setQuizName = useQuizStore((s) => s.setQuizName);
  const setNodes = useQuizStore((s) => s.setNodes);
  const setEdges = useQuizStore((s) => s.setEdges);
  const setQuizStatus = useQuizStore((s) => s.setQuizStatus);
  const setScoreRanges = useQuizStore((s) => s.setScoreRanges);
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
                },
                gamification: { ...(settings.gamification || {}) },
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

  // Auto-save quando gamification settings mudam
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
  }, [quizSettings, isSaved, params.id]);

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
          <GamificationSettings />
        </div>
      </div>
    </div>
  );
}
