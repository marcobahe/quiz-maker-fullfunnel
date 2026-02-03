'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Puzzle, 
  Settings, 
  ChevronRight, 
  Zap,
  Globe,
  Mail,
  FileSpreadsheet,
  Facebook,
  Webhook,
  ExternalLink,
  Check,
  X
} from 'lucide-react';
import Sidebar from '@/components/Layout/Sidebar';

// Integration configurations
const availableIntegrations = [
  {
    id: 'webhook',
    name: 'Webhook',
    description: 'Envie dados dos leads diretamente para sua aplicação via HTTP',
    icon: Webhook,
    color: '#7c3aed',
    category: 'Desenvolvimento',
    status: 'available',
    features: ['Dados em tempo real', 'Configuração flexível', 'Retry automático'],
    setupUrl: '/integration'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Conecte com mais de 5.000+ aplicações usando Zapier',
    icon: Zap,
    color: '#ff4a00',
    category: 'Automação',
    status: 'available',
    features: ['5000+ apps', 'Sem código', 'Fluxos personalizados'],
    setupUrl: '/integration'
  },
  {
    id: 'gohighlevel',
    name: 'GoHighLevel',
    description: 'Integração nativa com GoHighLevel CRM e automação',
    icon: Globe,
    color: '#00d4ff',
    category: 'CRM',
    status: 'available',
    features: ['CRM direto', 'Funis automatizados', 'SMS & Email'],
    setupUrl: '/integration'
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Receba leads por email automaticamente',
    icon: Mail,
    color: '#10b981',
    category: 'Comunicação',
    status: 'available',
    features: ['Notificação instantânea', 'Templates customizáveis', 'Múltiplos destinatários'],
    setupUrl: '/integration'
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Salve leads diretamente numa planilha do Google Sheets',
    icon: FileSpreadsheet,
    color: '#0f9d58',
    category: 'Planilhas',
    status: 'available',
    features: ['Atualizações em tempo real', 'Filtros e fórmulas', 'Colaboração'],
    setupUrl: '/integration'
  },
  {
    id: 'facebook-pixel',
    name: 'Facebook Pixel',
    description: 'Rastreie conversões para otimizar campanhas do Facebook Ads',
    icon: Facebook,
    color: '#1877f2',
    category: 'Analytics',
    status: 'available',
    features: ['Eventos personalizados', 'Remarketing', 'Otimização de campanhas'],
    setupUrl: '/integration'
  }
];

function IntegrationCard({ integration, onConfigure }) {
  const Icon = integration.icon;
  const isActive = integration.status === 'active';

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-accent/20 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${integration.color}15` }}
          >
            <Icon size={24} style={{ color: integration.color }} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-gray-800 group-hover:text-accent transition-colors">
                {integration.name}
              </h3>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {integration.category}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              {integration.description}
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-4">
              {integration.features.slice(0, 3).map((feature, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent text-xs rounded-full"
                >
                  <Check size={12} />
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight size={20} className="text-accent" />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className="text-xs text-gray-500">
            {isActive ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        <button
          onClick={() => onConfigure(integration)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-accent text-accent hover:bg-accent hover:text-white transition-colors font-medium text-sm"
        >
          <Settings size={14} />
          {isActive ? 'Configurar' : 'Ativar'}
        </button>
      </div>
    </div>
  );
}

function CategorySection({ category, integrations, onConfigure }) {
  if (integrations.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{category}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map(integration => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConfigure={onConfigure}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onCreateQuiz }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
        <Puzzle size={32} className="text-accent" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Configure suas integrações</h3>
      <p className="text-gray-500 max-w-md mb-6">
        As integrações são configuradas por quiz. Crie seu primeiro quiz para começar a conectar com suas ferramentas favoritas.
      </p>
      <button
        onClick={onCreateQuiz}
        className="bg-accent hover:bg-accent-hover text-white py-3 px-6 rounded-lg flex items-center gap-2 transition-colors font-medium"
      >
        <Settings size={20} />
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
      const url = activeWorkspaceId
        ? `/api/quizzes?workspaceId=${activeWorkspaceId}`
        : '/api/quizzes';
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

  const handleConfigureIntegration = (integration) => {
    if (quizzes.length === 0) {
      // If no quizzes, create one first
      if (confirm('Você precisa de um quiz para configurar integrações. Criar um agora?')) {
        handleCreateQuiz();
      }
      return;
    }

    if (quizzes.length === 1) {
      // If only one quiz, go directly to its integration page
      router.push(`/integration/${quizzes[0].id}`);
      return;
    }

    // If multiple quizzes, show selection (for now, let's just pick the first published one or the first one)
    const targetQuiz = quizzes.find(q => q.status === 'published') || quizzes[0];
    router.push(`/integration/${targetQuiz.id}`);
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  // Group integrations by category
  const integrationsByCategory = availableIntegrations.reduce((acc, integration) => {
    const category = integration.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(integration);
    return acc;
  }, {});

  const categories = Object.keys(integrationsByCategory);

  return (
    <div className="flex min-h-screen bg-gray-50">
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
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Puzzle size={28} className="text-accent" />
            Integrações
          </h1>
          <p className="text-gray-500">Conecte seus quizzes com suas ferramentas favoritas</p>
          {quizzes.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Você tem <strong>{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''}</strong> disponível{quizzes.length !== 1 ? 'eis' : ''} para integração
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        ) : (
          <>
            {quizzes.length === 0 ? (
              <EmptyState onCreateQuiz={handleCreateQuiz} />
            ) : (
              <>
                {/* Info Banner */}
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center shrink-0">
                      <Settings size={20} className="text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Como funcionam as integrações</h3>
                      <p className="text-sm text-gray-600">
                        Cada integração é configurada individualmente por quiz. Ao clicar em "Configurar", você será direcionado para a página de integração do seu quiz ativo.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Integrations by Category */}
                {categories.map(category => (
                  <CategorySection
                    key={category}
                    category={category}
                    integrations={integrationsByCategory[category]}
                    onConfigure={handleConfigureIntegration}
                  />
                ))}

                {/* Footer */}
                <div className="mt-12 text-center">
                  <p className="text-gray-500 text-sm mb-4">
                    Precisa de uma integração específica?
                  </p>
                  <button
                    onClick={() => window.open('mailto:suporte@fullybots.com?subject=Solicitação de Nova Integração', '_blank')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                  >
                    <Mail size={16} />
                    Solicitar nova integração
                    <ExternalLink size={12} />
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}