'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  Puzzle, 
  Settings,
  Plus,
  User,
  LogOut,
  Sparkles
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Quizzes', path: '/' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: FileText, label: 'Templates', path: '/templates' },
  { icon: Puzzle, label: 'Integrações', path: '/integrations' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

export default function Sidebar({ onCreateQuiz, onOpenTemplates, userName }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-sidebar min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-hover">
        <h1 className="text-white text-xl font-bold flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">Q</span>
          </div>
          Quiz Maker
        </h1>
      </div>

      {/* Create Buttons */}
      <div className="p-4 space-y-2">
        <button 
          onClick={onCreateQuiz}
          className="w-full bg-accent hover:bg-accent-hover text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
        >
          <Plus size={20} />
          Criar Quiz
        </button>
        {onOpenTemplates && (
          <button 
            onClick={onOpenTemplates}
            className="w-full bg-sidebar-hover hover:bg-accent/20 text-gray-300 hover:text-white py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-sm"
          >
            <Sparkles size={16} />
            Usar Template
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                isActive 
                  ? 'bg-accent text-white' 
                  : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-hover">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">{userName || 'Usuário'}</p>
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })} 
              className="text-gray-400 text-xs hover:text-white flex items-center gap-1 transition-colors"
            >
              <LogOut size={12} />
              Sair
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
