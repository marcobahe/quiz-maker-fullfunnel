'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState, useEffect, useRef, useMemo } from 'react';
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
  Sun,
  Moon,
  Shield,
  Search,
} from 'lucide-react';
import { useTheme } from '@/components/Layout/ThemeProvider';
import { useSession } from 'next-auth/react';

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

export default function Sidebar({ onCreateQuiz, onOpenTemplates, onOpenAIWizard, userName, activeWorkspaceId, onWorkspaceChange }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const userId = session?.user?.id;
  const isAdminOrOwner = userRole === 'owner' || userRole === 'admin';
  const [userPlan, setUserPlan] = useState('free');
  const [workspaces, setWorkspaces] = useState([]);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const [showNewWs, setShowNewWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [wsSearch, setWsSearch] = useState('');
  const wsDropdownRef = useRef(null);
  const wsSearchRef = useRef(null);

  useEffect(() => {
    fetch('/api/billing/status')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.plan) setUserPlan(data.plan); })
      .catch(() => {});
    
    // Admin/owner fetches ALL workspaces; regular users fetch their own
    let wsUrl = '/api/workspaces';
    
    if (isAdminOrOwner) {
      wsUrl = '/api/admin/workspaces';
    } else {
      // Check if admin is accessing another user's workspace (legacy support)
      try {
        const adminCtx = localStorage.getItem('adminWorkspaceContext');
        if (adminCtx) {
          const parsed = JSON.parse(adminCtx);
          if (parsed?.workspaceId && parsed?.fromAdmin) {
            wsUrl = `/api/workspaces?include=${parsed.workspaceId}`;
          }
        }
      } catch {}
    }

    fetch(wsUrl)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setWorkspaces(data);
        // If no active workspace yet, pick first
        if (!activeWorkspaceId && data.length > 0 && onWorkspaceChange) {
          // For admin, prefer own workspace first
          if (isAdminOrOwner && userId) {
            const ownWs = data.find(w => w.ownerId === userId);
            onWorkspaceChange(ownWs ? ownWs.id : data[0].id);
          } else {
            onWorkspaceChange(data[0].id);
          }
        }
      })
      .catch(() => {});
  }, [isAdminOrOwner, userId]);

  useEffect(() => {
    function handleClick(e) {
      if (wsDropdownRef.current && !wsDropdownRef.current.contains(e.target)) {
        setWsDropdownOpen(false);
        setShowNewWs(false);
        setWsSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Focus search input when dropdown opens (admin only)
  useEffect(() => {
    if (wsDropdownOpen && isAdminOrOwner && wsSearchRef.current) {
      setTimeout(() => wsSearchRef.current?.focus(), 50);
    }
  }, [wsDropdownOpen, isAdminOrOwner]);

  const activeWs = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];
  const isViewingOtherWorkspace = isAdminOrOwner && activeWs && activeWs.ownerId !== userId;

  // Split workspaces into "mine" and "others" for admin/owner
  const { myWorkspaces, otherWorkspaces, filteredAll } = useMemo(() => {
    if (!isAdminOrOwner) {
      // Regular users: simple filter by search (client-side)
      const filtered = wsSearch
        ? workspaces.filter(w => w.name.toLowerCase().includes(wsSearch.toLowerCase()))
        : workspaces;
      return { myWorkspaces: filtered, otherWorkspaces: [], filteredAll: filtered };
    }

    const searchLower = wsSearch.toLowerCase();
    const filtered = wsSearch
      ? workspaces.filter(w => {
          const nameMatch = w.name.toLowerCase().includes(searchLower);
          const ownerNameMatch = w.owner?.name?.toLowerCase().includes(searchLower);
          const ownerEmailMatch = w.owner?.email?.toLowerCase().includes(searchLower);
          return nameMatch || ownerNameMatch || ownerEmailMatch;
        })
      : workspaces;

    const mine = filtered.filter(w => w.ownerId === userId);
    const others = filtered.filter(w => w.ownerId !== userId);

    return { myWorkspaces: mine, otherWorkspaces: others, filteredAll: filtered };
  }, [workspaces, wsSearch, isAdminOrOwner, userId]);

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
        setWsSearch('');
      }
    } catch (err) {
      console.error('Failed to create workspace:', err);
    }
  };

  const renderWorkspaceItem = (ws) => {
    const isOther = isAdminOrOwner && ws.ownerId !== userId;
    return (
      <button
        key={ws.id}
        onClick={() => {
          onWorkspaceChange?.(ws.id);
          setWsDropdownOpen(false);
          setWsSearch('');
        }}
        className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors ${
          ws.id === activeWorkspaceId
            ? 'bg-accent/20 text-accent'
            : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
        }`}
      >
        <Building2 size={14} className="shrink-0" />
        <div className="flex-1 min-w-0 text-left">
          <span className="truncate block">
            {ws.name}
            {ws._adminAccess && (
              <span className="ml-1 text-[9px] bg-indigo-500/30 text-indigo-300 px-1 py-0.5 rounded font-bold">
                ADMIN
              </span>
            )}
          </span>
          {isOther && ws.owner && (
            <span className="text-[10px] text-gray-500 truncate block">
              Dono: {ws.owner.name || ws.owner.email}
            </span>
          )}
        </div>
        {ws.id === activeWorkspaceId && <Check size={14} className="shrink-0" />}
      </button>
    );
  };

  // Cap displayed workspaces for performance
  const MAX_DISPLAY = 20;
  const displayMyWorkspaces = myWorkspaces.slice(0, MAX_DISPLAY);
  const displayOtherWorkspaces = otherWorkspaces.slice(0, MAX_DISPLAY);
  const totalFiltered = filteredAll.length;

  return (
    <aside className="w-64 bg-sidebar min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-hover">
        <h1 className="text-white text-xl font-bold flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">Q</span>
          </div>
          QuizMeBaby
        </h1>
      </div>

      {/* Admin Panel Link - FIXED AT TOP for owner/admin */}
      {isAdminOrOwner && (
        <div className="px-4 pt-3 pb-1">
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm ${
              pathname.startsWith('/admin')
                ? 'bg-indigo-500/30 text-indigo-300 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300'
            }`}
          >
            <Shield size={18} className="shrink-0" />
            <span className="flex-1">Painel Administrativo</span>
            {userRole === 'owner' && (
              <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold tracking-wide">
                OWNER
              </span>
            )}
          </Link>
        </div>
      )}

      {/* Workspace Switcher */}
      {workspaces.length > 0 && (
        <div className="px-4 pt-3 pb-1 relative" ref={wsDropdownRef} data-tour="workspace-switcher">
          <button
            onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              isViewingOtherWorkspace
                ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30'
                : 'bg-sidebar-hover text-white hover:bg-accent/20'
            }`}
          >
            <Building2 size={16} className={`shrink-0 ${isViewingOtherWorkspace ? 'text-indigo-400' : 'text-accent'}`} />
            <span className="truncate flex-1 text-left">
              {activeWs?.name || 'Workspace'}
              {isViewingOtherWorkspace && (
                <span className="ml-1 text-[10px] text-indigo-400 font-semibold">(Suporte)</span>
              )}
            </span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${wsDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {wsDropdownOpen && (
            <div className="absolute left-4 right-4 top-full mt-1 bg-[#1e2340] border border-sidebar-hover rounded-lg shadow-xl z-50 overflow-hidden">
              
              {/* Search field (admin/owner) */}
              {isAdminOrOwner && (
                <div className="p-2 border-b border-sidebar-hover">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      ref={wsSearchRef}
                      type="text"
                      value={wsSearch}
                      onChange={(e) => setWsSearch(e.target.value)}
                      placeholder="Buscar workspace ou usuário..."
                      className="w-full bg-sidebar text-white text-xs pl-8 pr-3 py-2 rounded-md border border-sidebar-hover focus:border-indigo-500/50 outline-none placeholder:text-gray-500"
                    />
                  </div>
                </div>
              )}

              <div className="max-h-64 overflow-y-auto">
                {isAdminOrOwner ? (
                  <>
                    {/* My Workspaces */}
                    {displayMyWorkspaces.length > 0 && (
                      <>
                        <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Meus Workspaces
                        </div>
                        {displayMyWorkspaces.map(renderWorkspaceItem)}
                      </>
                    )}

                    {/* Divider */}
                    {displayMyWorkspaces.length > 0 && displayOtherWorkspaces.length > 0 && (
                      <div className="border-t border-sidebar-hover my-1" />
                    )}

                    {/* All Other Workspaces */}
                    {displayOtherWorkspaces.length > 0 && (
                      <>
                        <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Todos os Workspaces
                        </div>
                        {displayOtherWorkspaces.map(renderWorkspaceItem)}
                      </>
                    )}

                    {/* Truncation notice */}
                    {totalFiltered > MAX_DISPLAY * 2 && (
                      <div className="px-3 py-2 text-[10px] text-gray-500 text-center">
                        Mostrando {Math.min(displayMyWorkspaces.length + displayOtherWorkspaces.length, MAX_DISPLAY * 2)} de {totalFiltered} — use a busca para filtrar
                      </div>
                    )}

                    {/* No results */}
                    {totalFiltered === 0 && wsSearch && (
                      <div className="px-3 py-4 text-xs text-gray-500 text-center">
                        Nenhum workspace encontrado
                      </div>
                    )}
                  </>
                ) : (
                  /* Regular user: simple list */
                  workspaces.map(renderWorkspaceItem)
                )}
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
        {onOpenAIWizard && (
          <button 
            onClick={onOpenAIWizard}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all font-medium text-sm shadow-lg shadow-purple-500/20"
          >
            <Sparkles size={16} />
            ✨ Criar com IA
          </button>
        )}
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

      {/* Theme Toggle + User Profile */}
      <div className="p-4 border-t border-sidebar-hover">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-2 mb-3 rounded-lg text-gray-400 hover:bg-sidebar-hover hover:text-white transition-colors"
          title={theme === 'dark' ? 'Mudar para Light Mode' : 'Mudar para Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span className="text-sm font-medium">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

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
