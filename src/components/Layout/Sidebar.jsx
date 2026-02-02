'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  Puzzle, 
  Settings,
  Plus,
  User,
  LogOut,
  Sparkles,
  Crown,
  CreditCard,
  ChevronDown,
  Building2,
  Check,
  Users,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Quizzes', path: '/' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: FileText, label: 'Templates', path: '/templates' },
  { icon: Puzzle, label: 'Integrações', path: '/integrations' },
  { icon: Users, label: 'Time', path: '/settings/team' },
  { icon: CreditCard, label: 'Plano', path: '/settings/billing' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

const PLAN_BADGES = {
  free: { label: 'Free', className: 'bg-gray-600/50 text-gray-300' },
  pro: { label: 'Pro', className: 'bg-accent/20 text-accent' },
  business: { label: 'Business', className: 'bg-amber-500/20 text-amber-400' },
};

export default function Sidebar({ onCreateQuiz, onOpenTemplates, userName, activeWorkspaceId, onWorkspaceChange }) {
  const pathname = usePathname();
  const [userPlan, setUserPlan] = useState('free');
  const [workspaces, setWorkspaces] = useState([]);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const [showNewWs, setShowNewWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const wsDropdownRef = useRef(null);

  useEffect(() => {
    fetch('/api/billing/status')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.plan) setUserPlan(data.plan); })
      .catch(() => {});
    
    fetch('/api/workspaces')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setWorkspaces(data);
        // If no active workspace yet, pick first
        if (!activeWorkspaceId && data.length > 0 && onWorkspaceChange) {
          onWorkspaceChange(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (wsDropdownRef.current && !wsDropdownRef.current.contains(e.target)) {
        setWsDropdownOpen(false);
        setShowNewWs(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const activeWs = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  const handleCreateWorkspace = async () => {
    if (!newWsName.trim()) return;
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWsName.trim() }),
      });
      if (res.ok) {
        const ws = await res.json();
        setWorkspaces(prev => [...prev, ws]);
        onWorkspaceChange?.(ws.id);
        setNewWsName('');
        setShowNewWs(false);
        setWsDropdownOpen(false);
      }
    } catch (err) {
      console.error('Failed to create workspace:', err);
    }
  };

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

      {/* Workspace Switcher */}
      {workspaces.length > 0 && (
        <div className="px-4 pt-4 pb-1 relative" ref={wsDropdownRef} data-tour="workspace-switcher">
          <button
            onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-sidebar-hover rounded-lg text-white text-sm hover:bg-accent/20 transition-colors"
          >
            <Building2 size={16} className="text-accent shrink-0" />
            <span className="truncate flex-1 text-left">{activeWs?.name || 'Workspace'}</span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${wsDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {wsDropdownOpen && (
            <div className="absolute left-4 right-4 top-full mt-1 bg-[#1e2340] border border-sidebar-hover rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="max-h-48 overflow-y-auto">
                {workspaces.map(ws => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      onWorkspaceChange?.(ws.id);
                      setWsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors ${
                      ws.id === activeWorkspaceId
                        ? 'bg-accent/20 text-accent'
                        : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
                    }`}
                  >
                    <Building2 size={14} className="shrink-0" />
                    <span className="truncate flex-1 text-left">{ws.name}</span>
                    {ws.id === activeWorkspaceId && <Check size={14} />}
                  </button>
                ))}
              </div>
              <div className="border-t border-sidebar-hover">
                {showNewWs ? (
                  <div className="p-2 flex gap-1">
                    <input
                      type="text"
                      value={newWsName}
                      onChange={(e) => setNewWsName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
                      placeholder="Nome do workspace"
                      className="flex-1 bg-sidebar text-white text-xs px-2 py-1.5 rounded border border-sidebar-hover focus:border-accent outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleCreateWorkspace}
                      className="bg-accent text-white text-xs px-2 py-1.5 rounded hover:bg-accent-hover"
                    >
                      Criar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewWs(true)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-sidebar-hover transition-colors"
                  >
                    <Plus size={14} />
                    <span>Novo Workspace</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Buttons */}
      <div className="p-4 space-y-2">
        <button 
          onClick={onCreateQuiz}
          data-tour="create-quiz"
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

      {/* Upgrade CTA for free users */}
      {userPlan === 'free' && (
        <div className="px-3 mb-2">
          <Link
            href="/pricing"
            className="block bg-gradient-to-r from-accent/20 to-purple-500/20 border border-accent/30 rounded-lg p-3 hover:border-accent/50 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Crown size={16} className="text-accent" />
              <span className="text-xs font-medium text-white group-hover:text-accent transition-colors">
                Fazer Upgrade
              </span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              Desbloqueie mais quizzes e leads
            </p>
          </Link>
        </div>
      )}

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-hover">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-white font-medium text-sm truncate">{userName || 'Usuário'}</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${PLAN_BADGES[userPlan]?.className || PLAN_BADGES.free.className}`}>
                {PLAN_BADGES[userPlan]?.label || 'Free'}
              </span>
            </div>
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
