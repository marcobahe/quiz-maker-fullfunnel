'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FileQuestion, Users, Eye, TrendingUp } from 'lucide-react';
import Sidebar from '@/components/Layout/Sidebar';
import MetricCard from '@/components/Dashboard/MetricCard';
import QuizTable from '@/components/Dashboard/QuizTable';
import TemplateGallery from '@/components/Templates/TemplateGallery';
import LandingPage from '@/components/Landing/LandingPage';
import OnboardingTour from '@/components/Onboarding/OnboardingTour';
import FirstQuizWizard from '@/components/Onboarding/FirstQuizWizard';
import HelpButton from '@/components/Help/HelpButton';
import AIWizardModal from '@/components/AIWizard/AIWizardModal';

export default function HomePage() {
  const { data: session, status } = useSession();

  // Show landing page for unauthenticated users
  if (status === 'unauthenticated') {
    return <LandingPage />;
  }

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0f1129]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  // Authenticated → show dashboard
  return <Dashboard session={session} />;
}

function Dashboard({ session }) {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAIWizard, setShowAIWizard] = useState(false);
  const [error, setError] = useState('');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeWorkspaceId') || null;
    }
    return null;
  });

  const fetchQuizzes = async (wsId) => {
    const workspaceId = wsId !== undefined ? wsId : activeWorkspaceId;
    try {
      const url = workspaceId
        ? `/api/quizzes?workspaceId=${workspaceId}`
        : '/api/quizzes';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      }
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkspaceChange = (wsId) => {
    setActiveWorkspaceId(wsId);
    localStorage.setItem('activeWorkspaceId', wsId);
    setLoading(true);
    fetchQuizzes(wsId);
  };

  useEffect(() => {
    fetchQuizzes(activeWorkspaceId);
  }, [activeWorkspaceId]);

  const handleCreateQuiz = async () => {
    try {
      setError(''); // Clear previous errors
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Meu Novo Quiz', workspaceId: activeWorkspaceId }),
      });
      
      if (res.ok) {
        const quiz = await res.json();
        router.push(`/builder/${quiz.id}`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        
        if (res.status === 401) {
          setError('Sessão expirada. Faça login novamente.');
          setTimeout(() => router.push('/login'), 3000);
        } else if (res.status === 403) {
          setError(errorData.message || 'Você atingiu o limite do seu plano. Faça upgrade para criar mais quizzes.');
        } else {
          setError(errorData.message || 'Erro ao criar quiz. Tente novamente.');
        }
      }
    } catch (err) {
      console.error('Failed to create quiz:', err);
      setError('Erro ao criar quiz. Verifique sua conexão e tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0f1129]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  const publishedCount = quizzes.filter(q => q.status === 'published').length;
  const totalLeads = quizzes.reduce((sum, q) => sum + (q._count?.leads || 0), 0);
  const hasNoQuizzes = quizzes.length === 0;

  const metrics = [
    { icon: FileQuestion, label: 'Quizzes Ativos', value: String(publishedCount), change: '', changeType: 'positive' },
    { icon: Users, label: 'Leads Totais', value: String(totalLeads), change: '', changeType: 'positive' },
    { icon: Eye, label: 'Quizzes Criados', value: String(quizzes.length), change: '', changeType: 'positive' },
    { icon: TrendingUp, label: 'Taxa de Conversão', value: totalLeads > 0 ? '—' : '0%', change: '', changeType: 'positive' },
  ];

  // Show First Quiz Wizard when user has no quizzes
  if (hasNoQuizzes) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#0f1129]">
        <Sidebar onCreateQuiz={handleCreateQuiz} onOpenTemplates={() => setShowTemplates(true)} onOpenAIWizard={() => setShowAIWizard(true)} userName={session?.user?.name || session?.user?.email} activeWorkspaceId={activeWorkspaceId} onWorkspaceChange={handleWorkspaceChange} />
        
        <main className="flex-1 p-8">
          <FirstQuizWizard
            onSelectAI={() => setShowAIWizard(true)}
            onSelectTemplate={() => setShowTemplates(true)}
            onSelectBlank={handleCreateQuiz}
          />
        </main>

        <TemplateGallery
          isOpen={showTemplates}
          onClose={() => setShowTemplates(false)}
          onCreateBlank={handleCreateQuiz}
        />

        <AIWizardModal
          isOpen={showAIWizard}
          onClose={() => setShowAIWizard(false)}
          activeWorkspaceId={activeWorkspaceId}
        />

        <HelpButton />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0f1129]">
      <Sidebar onCreateQuiz={handleCreateQuiz} onOpenTemplates={() => setShowTemplates(true)} onOpenAIWizard={() => setShowAIWizard(true)} userName={session?.user?.name || session?.user?.email} activeWorkspaceId={activeWorkspaceId} onWorkspaceChange={handleWorkspaceChange} />
      
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Bem-vindo de volta! Aqui está um resumo dos seus quizzes.</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-red-800 dark:text-red-300 font-medium">{error}</p>
              {error.includes('limite do seu plano') && (
                <button
                  onClick={() => router.push('/pricing')}
                  className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
                >
                  Ver planos disponíveis →
                </button>
              )}
              {error.includes('login novamente') && (
                <button
                  onClick={() => router.push('/login')}
                  className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
                >
                  Ir para login →
                </button>
              )}
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>

        <QuizTable
          quizzes={quizzes.map(q => ({
            id: q.id,
            name: q.name,
            createdAt: q.createdAt,
            status: q.status === 'published' ? 'Publicado' : 'Rascunho',
            leads: q._count?.leads || 0,
            conversion: 0,
            slug: q.slug,
          }))}
          onRefresh={fetchQuizzes}
          onOpenTemplates={() => setShowTemplates(true)}
        />
      </main>

      <TemplateGallery
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onCreateBlank={handleCreateQuiz}
      />

      <AIWizardModal
        isOpen={showAIWizard}
        onClose={() => setShowAIWizard(false)}
        activeWorkspaceId={activeWorkspaceId}
      />

      <OnboardingTour />
      <HelpButton />
    </div>
  );
}
