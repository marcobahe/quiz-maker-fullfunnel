'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { 
  Puzzle, 
  Settings, 
  ArrowRight,
  Globe,
  Mail,
  FileSpreadsheet,
  Facebook,
  Webhook,
  Zap,
  Lightbulb,
  Plus,
} from 'lucide-react';
import Sidebar from '@/components/Layout/Sidebar';

// Integration type definitions
const INTEGRATION_TYPES = [
  {
    key: 'gohighlevel',
    label: 'Full Funnel',
    icon: Globe,
    color: '#00d4ff',
    comingSoon: false,
  },
  {
    key: 'webhook',
    label: 'Webhook',
    icon: Webhook,
    color: '#7c3aed',
    comingSoon: false,
  },
  {
    key: 'facebook-pixel',
    label: 'Facebook Pixel',
    icon: Facebook,
    color: '#1877f2',
    comingSoon: false,
  },
  {
    key: 'google-sheets',
    label: 'Google Sheets',
    icon: FileSpreadsheet,
    color: '#0f9d58',
    comingSoon: true,
  },
  {
    key: 'zapier',
    label: 'Zapier',
    icon: Zap,
    color: '#ff4a00',
    comingSoon: true,
  },
  {
    key: 'email',
    label: 'Email',
    icon: Mail,
    color: '#10b981',
    comingSoon: true,
  },
];

/**
 * Extracts active integrations from a quiz, including both Integration records
 * and Facebook Pixel from quiz settings.
 */
function getQuizIntegrations(quiz) {
  const integrations = [];

  // From Integration model records
  if (quiz.integrations) {
    for (const integration of quiz.integrations) {
      if (integration.active) {
        integrations.push(integration.type);
      }
    }
  }

  // Facebook Pixel from settings
  try {
    const settings = typeof quiz.settings === 'string' ? JSON.parse(quiz.settings) : quiz.settings;
    if (settings?.tracking?.facebookPixelId) {
      integrations.push('facebook-pixel');
    }
  } catch {
    // ignore parse errors
  }

  return [...new Set(integrations)]; // dedupe
}

function SummaryCard({ type, count }) {
  const Icon = type.icon;
  return (
    <div className="bg-white dark:bg-[#151837]/60 dark:backdrop-blur rounded-xl p-5 border border-gray-100 dark:border-white/10 relative overflow-hidden">
      {type.comingSoon && (
        <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">
          Em breve
        </span>
      )}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${type.color}15` }}
        >
          <Icon size={20} style={{ color: type.color }} />
        </div>
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
          {type.label}
        </h3>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {type.comingSoon ? '—' : count}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {type.comingSoon ? 'Disponível em breve' : `quiz${count !== 1 ? 'zes' : ''} conectado${count !== 1 ? 's' : ''}`}
      </p>
    </div>
  );
}

function IntegrationBadge({ typeKey }) {
  const type = INTEGRATION_TYPES.find(t => t.key === typeKey);
  if (!type) return null;
  const Icon = type.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${type.color}15`,
        color: type.color,
      }}
    >
      <Icon size={12} />
      {type.label}
    </span>
  );
}

function QuizRow({ quiz, integrationKeys, onConfigure }) {
  const isPublished = quiz.status === 'published';
  return (
    <tr className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
      <td className="py-4 px-4">
        <div>
          <p className="font-medium text-gray-800 dark:text-white text-sm">{quiz.name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{quiz.slug}</p>
        </div>
      </td>
      <td className="py-4 px-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            isPublished
              ? 'bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400'
              : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-green-500' : 'bg-gray-400'}`} />
          {isPublished ? 'Publicado' : 'Rascunho'}
        </span>
      </td>
      <td className="py-4 px-4">
        {integrationKeys.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {integrationKeys.map(key => (
              <IntegrationBadge key={key} typeKey={key} />
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-500">Nenhuma configurada</span>
        )}
      </td>
      <td className="py-4 px-4 text-right">
        <button
          onClick={() => onConfigure(quiz.id)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
        >
          Configurar
          <ArrowRight size={14} />
        </button>
      </td>
    </tr>
  );
}

function EmptyState({ onCreateQuiz }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
        <Puzzle size={32} className="text-accent" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
        Crie seu primeiro quiz
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
        Crie seu primeiro quiz para começar a integrar com suas ferramentas
      </p>
      <button
        onClick={onCreateQuiz}
        className="bg-accent hover:bg-accent-hover text-white py-3 px-6 rounded-lg flex items-center gap-2 transition-colors font-medium"
      >
        <Plus size={20} />
        Criar Quiz
      </button>
    </div>
  );
}

export default function IntegrationsPage() {
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
      const params = new URLSearchParams({ includeIntegrations: 'true' });
      if (activeWorkspaceId) params.set('workspaceId', activeWorkspaceId);
      const res = await fetch(`/api/quizzes?${params}`);
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

  // Compute integration map: quizId -> [typeKeys]
  const quizIntegrationMap = useMemo(() => {
    const map = {};
    for (const quiz of quizzes) {
      map[quiz.id] = getQuizIntegrations(quiz);
    }
    return map;
  }, [quizzes]);

  // Count quizzes per integration type
  const integrationCounts = useMemo(() => {
    const counts = {};
    for (const type of INTEGRATION_TYPES) {
      counts[type.key] = 0;
    }
    for (const keys of Object.values(quizIntegrationMap)) {
      for (const key of keys) {
        if (counts[key] !== undefined) counts[key]++;
      }
    }
    return counts;
  }, [quizIntegrationMap]);

  // Check if any quiz has at least one integration
  const hasAnyIntegration = useMemo(() => {
    return Object.values(quizIntegrationMap).some(keys => keys.length > 0);
  }, [quizIntegrationMap]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0f1129]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Puzzle size={28} className="text-accent" />
            Integrações
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Visão geral das integrações dos seus quizzes
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        ) : quizzes.length === 0 ? (
          <EmptyState onCreateQuiz={handleCreateQuiz} />
        ) : (
          <>
            {/* Tip banner when no integrations at all */}
            {!hasAnyIntegration && (
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                <Lightbulb size={20} className="text-accent mt-0.5 shrink-0" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Dica:</strong> Configure integrações nos seus quizzes para enviar leads automaticamente.
                </p>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {INTEGRATION_TYPES.map(type => (
                <SummaryCard
                  key={type.key}
                  type={type}
                  count={integrationCounts[type.key]}
                />
              ))}
            </div>

            {/* Quiz Table */}
            <div className="bg-white dark:bg-[#151837]/60 dark:backdrop-blur rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10">
                <h2 className="text-base font-semibold text-gray-800 dark:text-white">
                  Meus Quizzes
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/10 text-left">
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Quiz
                      </th>
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Integrações
                      </th>
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzes.map(quiz => (
                      <QuizRow
                        key={quiz.id}
                        quiz={quiz}
                        integrationKeys={quizIntegrationMap[quiz.id] || []}
                        onConfigure={(id) => router.push(`/integration/${id}`)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
