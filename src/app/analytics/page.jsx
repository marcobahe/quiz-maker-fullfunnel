'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarChart3, FileQuestion, Users, TrendingUp, Eye, Play, CheckCircle, Target, ArrowRight } from 'lucide-react';
import Sidebar from '@/components/Layout/Sidebar';

function StatCard({ icon: Icon, label, value, subtitle, color = '#7c3aed' }) {
  return (
    <div className="bg-white dark:bg-[#151837]/60 dark:backdrop-blur rounded-xl p-5 shadow-sm border border-gray-100 dark:border-white/10 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
      {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function QuizAnalyticsCard({ quiz, onClick }) {
  const conversionRate = quiz.totalStarts > 0 ? Math.round((quiz.totalLeads / quiz.totalStarts) * 100) : 0;
  const completionRate = quiz.totalStarts > 0 ? Math.round((quiz.totalCompletes / quiz.totalStarts) * 100) : 0;

  return (
    <div 
      onClick={() => onClick(quiz.id)}
      className="bg-white dark:bg-[#151837]/60 dark:backdrop-blur rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/10 hover:shadow-md hover:border-accent/20 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate group-hover:text-accent transition-colors">
            {quiz.name}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              quiz.status === 'published' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {quiz.status === 'published' ? 'Publicado' : 'Rascunho'}
            </span>
            <span className="text-xs text-gray-500">
              Criado em {new Date(quiz.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
        <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight size={20} className="text-accent" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Play size={14} className="text-accent" />
            <span className="text-xs text-gray-500">Inícios</span>
          </div>
          <p className="text-lg font-bold text-gray-800 dark:text-white">{quiz.totalStarts || 0}</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle size={14} className="text-green-600" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Conclusões</span>
          </div>
          <p className="text-lg font-bold text-gray-800 dark:text-white">{quiz.totalCompletes || 0}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{completionRate}%</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users size={14} className="text-pink-600" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Leads</span>
          </div>
          <p className="text-lg font-bold text-gray-800 dark:text-white">{quiz.totalLeads || 0}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{conversionRate}%</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Target size={14} className="text-blue-600" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Score Médio</span>
          </div>
          <p className="text-lg font-bold text-gray-800 dark:text-white">{quiz.avgScore || '—'}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onCreateQuiz }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
        <BarChart3 size={32} className="text-accent" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Nenhum quiz ainda</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
        Crie seu primeiro quiz para começar a ver analytics e insights detalhados sobre suas conversões.
      </p>
      <button
        onClick={onCreateQuiz}
        className="bg-accent hover:bg-accent-hover text-white py-3 px-6 rounded-lg flex items-center gap-2 transition-colors font-medium"
      >
        <FileQuestion size={20} />
        Criar Primeiro Quiz
      </button>
    </div>
  );
}

export default function AnalyticsOverviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeWorkspaceId') || null;
    }
    return null;
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchQuizzes();
    }
  }, [status, activeWorkspaceId]);

  const handleWorkspaceChange = (wsId) => {
    setActiveWorkspaceId(wsId);
    localStorage.setItem('activeWorkspaceId', wsId);
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const url = activeWorkspaceId
        ? `/api/quizzes?workspaceId=${activeWorkspaceId}&includeAnalytics=true`
        : '/api/quizzes?includeAnalytics=true';
      const res = await fetch(url);
      
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async () => {
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Meu Novo Quiz', workspaceId: activeWorkspaceId }),
      });
      if (res.ok) {
        const quiz = await res.json();
        router.push(`/builder/${quiz.id}`);
      }
    } catch (err) {
      console.error('Failed to create quiz:', err);
    }
  };

  const handleQuizClick = (quizId) => {
    router.push(`/analytics/${quizId}`);
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0f1129]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  // Calculate totals
  const totalQuizzes = quizzes.length;
  const publishedQuizzes = quizzes.filter(q => q.status === 'published').length;
  const totalStarts = quizzes.reduce((sum, q) => sum + (q.totalStarts || 0), 0);
  const totalCompletes = quizzes.reduce((sum, q) => sum + (q.totalCompletes || 0), 0);
  const totalLeads = quizzes.reduce((sum, q) => sum + (q.totalLeads || 0), 0);
  const avgConversionRate = totalStarts > 0 ? Math.round((totalLeads / totalStarts) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0f1129]">
      <Sidebar 
        onCreateQuiz={handleCreateQuiz} 
        onOpenTemplates={() => router.push('/templates')}
        userName={session?.user?.name || session?.user?.email} 
        activeWorkspaceId={activeWorkspaceId} 
        onWorkspaceChange={handleWorkspaceChange} 
      />
      
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <BarChart3 size={28} className="text-accent" />
            Analytics Overview
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Visão geral das métricas dos seus quizzes</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        ) : quizzes.length === 0 ? (
          <EmptyState onCreateQuiz={handleCreateQuiz} />
        ) : (
          <>
            {/* Overview Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                icon={FileQuestion} 
                label="Quizzes Criados" 
                value={String(totalQuizzes)}
                subtitle={`${publishedQuizzes} publicados`}
                color="#7c3aed" 
              />
              <StatCard 
                icon={Play} 
                label="Total de Inícios" 
                value={String(totalStarts)}
                color="#10b981" 
              />
              <StatCard 
                icon={Users} 
                label="Total de Leads" 
                value={String(totalLeads)}
                color="#ec4899" 
              />
              <StatCard 
                icon={TrendingUp} 
                label="Taxa de Conversão" 
                value={`${avgConversionRate}%`}
                color="#f59e0b" 
              />
            </div>

            {/* Quiz List */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Seus Quizzes</h2>
              
              {quizzes.map((quiz) => (
                <QuizAnalyticsCard 
                  key={quiz.id} 
                  quiz={quiz} 
                  onClick={handleQuizClick}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}