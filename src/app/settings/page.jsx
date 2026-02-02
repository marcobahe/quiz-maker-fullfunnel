'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import TopBar from '@/components/Layout/TopBar';
import Link from 'next/link';
import { Globe, Settings, ChevronRight } from 'lucide-react';

const settingsItems = [
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

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <Settings className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app">
      <TopBar title="Configurações" />

      <div className="max-w-4xl mx-auto p-6 space-y-4">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="block bg-card border border-card-border rounded-xl p-5 hover:border-accent/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Icon size={24} className="text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium group-hover:text-accent transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {item.description}
                  </p>
                </div>
                <ChevronRight size={20} className="text-gray-600 group-hover:text-accent transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
