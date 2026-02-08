'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  FileText,
  Globe,
  Settings,
  ArrowLeft,
  Shield,
  Loader2,
} from 'lucide-react';

const adminMenu = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Usuários', path: '/admin/users' },
  { icon: FileText, label: 'Quizzes', path: '/admin/quizzes' },
  { icon: Globe, label: 'Domínios', path: '/admin/domains' },
  { icon: Settings, label: 'Configurações', path: '/admin/settings' },
];

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      const role = session?.user?.role;
      if (role !== 'owner' && role !== 'admin') {
        router.push('/');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1129]">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  const role = session?.user?.role;
  if (role !== 'owner' && role !== 'admin') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#0f1129]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#151837]/80 backdrop-blur-xl border-r border-white/5 min-h-screen flex flex-col">
        {/* Back to app (topo — mesma posição visual de onde se entra no admin) */}
        <div className="p-4 border-b border-white/5">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-gray-300 hover:bg-indigo-500/20 hover:text-indigo-400 transition-all duration-200 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-medium text-sm">Voltar ao App</span>
          </Link>
        </div>

        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">Admin</h1>
              <p className="text-gray-500 text-xs">QuizMeBaby</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminMenu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || 
              (item.path !== '/admin' && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-400 shadow-lg shadow-indigo-500/5'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
