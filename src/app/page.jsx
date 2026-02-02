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

export default function HomePage() {
  const { data: session, status } = useSession();

  // Show landing page for unauthenticated users
  if (status === 'unauthenticated') {
    return <LandingPage />;
  }

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
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

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/quizzes');
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

  const handleCreateQuiz = async () => {
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Meu Novo Quiz' }),
      });
      if (res.ok) {
        const quiz = await res.json();
        router.push(`/builder/${quiz.id}`);
      }
    } catch (err) {
      console.error('Failed to create quiz:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  const publishedCount = quizzes.filter(q => q.status === 'published').length;
  const totalLeads = quizzes.reduce((sum, q) => sum + (q._count?.leads || 0), 0);

  const metrics = [
    { icon: FileQuestion, label: 'Quizzes Ativos', value: String(publishedCount), change: String(quizzes.length), changeType: 'positive' },
    { icon: Users, label: 'Leads Totais', value: String(totalLeads), change: '', changeType: 'positive' },
    { icon: Eye, label: 'Quizzes Criados', value: String(quizzes.length), change: '', changeType: 'positive' },
    { icon: TrendingUp, label: 'Taxa de Conversão', value: totalLeads > 0 ? '—' : '0%', change: '', changeType: 'positive' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onCreateQuiz={handleCreateQuiz} onOpenTemplates={() => setShowTemplates(true)} userName={session?.user?.name || session?.user?.email} />
      
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Bem-vindo de volta! Aqui está um resumo dos seus quizzes.</p>
        </div>

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
    </div>
  );
}
