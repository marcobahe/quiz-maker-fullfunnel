'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useWorkspace } from '@/components/Workspace/WorkspaceProvider';
import Sidebar from '@/components/Layout/Sidebar';
import {
  Building2,
  Plus,
  Users,
  Crown,
  Shield,
  Pencil,
  Eye,
  Loader2,
  ChevronRight,
  Settings,
} from 'lucide-react';

const ROLE_BADGES = {
  owner: { label: 'Dono', icon: Crown, className: 'bg-amber-500/10 text-amber-400' },
  admin: { label: 'Admin', icon: Shield, className: 'bg-blue-500/10 text-blue-400' },
  editor: { label: 'Editor', icon: Pencil, className: 'bg-green-500/10 text-green-400' },
  viewer: { label: 'Viewer', icon: Eye, className: 'bg-gray-500/10 text-gray-400' },
};

export default function WorkspacesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { workspaces, loading, createWorkspace, activeWorkspaceId, setActiveWorkspaceId } = useWorkspace();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0f1129]">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await createWorkspace(newName.trim());
      setNewName('');
      setShowCreate(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0f1129]">
      <Sidebar
        userName={session?.user?.name || session?.user?.email}
        activeWorkspaceId={activeWorkspaceId}
        onWorkspaceChange={setActiveWorkspaceId}
      />

      <main className="flex-1 p-8">
        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                <Building2 size={28} className="text-accent" />
                Workspaces
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Gerencie seus workspaces e equipes
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Novo Workspace
            </button>
          </div>

          {showCreate && (
            <form
              onSubmit={handleCreate}
              className="bg-white dark:bg-[#151837]/60 dark:backdrop-blur rounded-xl border border-gray-200 dark:border-white/10 p-5 mb-6"
            >
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Criar Workspace</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nome do workspace"
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none text-sm bg-white dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
                  autoFocus
                  required
                />
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setNewName(''); setError(null); }}
                  className="px-4 py-2.5 rounded-lg font-medium text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </form>
          )}

          <div className="space-y-3">
            {workspaces.length === 0 ? (
              <div className="bg-white dark:bg-[#151837]/60 dark:backdrop-blur rounded-xl border border-gray-200 dark:border-white/10 p-8 text-center">
                <Building2 size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Nenhum workspace encontrado</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="text-accent text-sm font-medium mt-2 hover:underline"
                >
                  Criar seu primeiro workspace
                </button>
              </div>
            ) : (
              workspaces.map((ws) => {
                const roleBadge = ROLE_BADGES[ws.role] || ROLE_BADGES.viewer;
                const RoleIcon = roleBadge.icon;
                return (
                  <div
                    key={ws.id}
                    className={`bg-white dark:bg-[#151837]/60 dark:backdrop-blur rounded-xl border transition-colors p-5 ${
                      ws.id === activeWorkspaceId
                        ? 'border-accent/50 ring-1 ring-accent/20'
                        : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                          <Building2 size={18} className="text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-white">{ws.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${roleBadge.className}`}>
                              <RoleIcon size={10} />
                              {roleBadge.label}
                            </span>
                            <span className="text-xs text-gray-400">
                              {ws._count?.members || 0} membros · {ws._count?.quizzes || 0} quizzes
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {ws.id !== activeWorkspaceId && (
                          <button
                            onClick={() => setActiveWorkspaceId(ws.id)}
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-accent transition-colors"
                          >
                            Ativar
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/workspaces/${ws.id}/members`)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                          <Users size={14} />
                          Membros
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
