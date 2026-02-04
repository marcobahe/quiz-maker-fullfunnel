'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import Link from 'next/link';
import { Globe, Settings, ChevronRight, CreditCard, Users } from 'lucide-react';

const settingsItems = [
  {
    icon: Users,
    title: 'Time & Workspace',
    description: 'Gerencie membros, convide pessoas e defina permissões',
    href: '/settings/team',
  },
  {
    icon: CreditCard,
    title: 'Plano & Cobrança',
    description: 'Gerencie seu plano, veja uso e histórico de pagamentos',
    href: '/settings/billing',
  },
  {
    icon: Globe,
    title: 'Domínios Personalizados',
    description: 'Configure domínios customizados (CNAME) para seus quizzes',
    href: '/settings/domains',
  },
];

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeWorkspaceId') || null;
    }
    return null;
  });

  const handleWorkspaceChange = (wsId) => {
    setActiveWorkspaceId(wsId);
    localStorage.setItem('activeWorkspaceId', wsId);
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

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Settings className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Settings size={28} className="text-accent" />
            Configurações
          </h1>
          <p className="text-gray-500">Gerencie seu workspace, plano e preferências</p>
        </div>

        <div className="max-w-4xl space-y-4">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-accent/50 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Icon size={24} className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-800 font-medium group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 group-hover:text-accent transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
