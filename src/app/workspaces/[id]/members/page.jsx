'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useWorkspace } from '@/components/Workspace/WorkspaceProvider';
import Sidebar from '@/components/Layout/Sidebar';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Shield,
  Eye,
  Pencil,
  Crown,
  Trash2,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Building2,
} from 'lucide-react';

const ROLE_INFO = {
  owner: { label: 'Dono', icon: Crown, color: 'text-amber-400', bg: 'bg-amber-400/10', desc: 'Controle total' },
  admin: { label: 'Admin', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-400/10', desc: 'Gerencia membros e quizzes' },
  editor: { label: 'Editor', icon: Pencil, color: 'text-green-400', bg: 'bg-green-400/10', desc: 'Cria e edita quizzes' },
  viewer: { label: 'Viewer', icon: Eye, color: 'text-gray-400', bg: 'bg-gray-400/10', desc: 'Apenas visualiza' },
};

export default function WorkspaceMembersPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { workspaces, activeWorkspaceId, setActiveWorkspaceId } = useWorkspace();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState(null);

  const workspace = workspaces.find(w => w.id === id);
  const myRole = workspace?.role || 'viewer';
  const canManage = myRole === 'owner' || myRole === 'admin';

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (!id || status !== 'authenticated') return;
    setMembersLoading(true);
    fetch(`/api/workspaces/${id}/members`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setMembers(data);
        setMembersLoading(false);
        setLoading(false);
      })
      .catch(() => { setMembersLoading(false); setLoading(false); });
  }, [id, status]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !id) return;
    setInviting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/workspaces/${id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setMembers(prev => [...prev, data]);
        setInviteEmail('');
        setMessage({ type: 'success', text: 'Membro adicionado com sucesso!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao convidar' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexão' });
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      const res = await fetch(`/api/workspaces/${id}/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setMembers(prev =>
          prev.map(m => (m.id === memberId ? { ...m, role: newRole } : m))
        );
      }
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const handleRemove = async (memberId, userName) => {
    if (!confirm(`Remover ${userName} do workspace?`)) return;
    try {
      const res = await fetch(`/api/workspaces/${id}/members/${memberId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== memberId));
      }
    } catch (err) {
      console.error('Error removing member:', err);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0f1129]">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0f1129]">
      <Sidebar
        userName={session?.user?.name || session?.user?.email}
        activeWorkspaceId={activeWorkspaceId}
        onWorkspaceChange={setActiveWorkspaceId}
      />

      <main className="flex-1 p-8">
        <div className="max-w-4xl">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <Link href="/workspaces" className="hover:text-accent transition-colors">Workspaces</Link>
            <ChevronLeft size={14} className="rotate-180" />
            <span className="text-gray-800 dark:text-white">Membros</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
              <Users size={28} className="text-accent" />
              {workspace?.name || 'Workspace'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie membros e permissões</p>
          </div>

          {/* Role Explanation */}
          <div className="bg-white dark:bg-[#151837]/60 dark:backdrop-blur rounded-xl border border-gray-200 dark:border-white/10 p-5 mb-6">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Níveis de Acesso</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(ROLE_INFO).map(([key, info]) => {
                const Icon = info.icon;
                return (
                  <div key={key} className={`${info.bg} rounded-lg p-3`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon size={14} className={info.color} />
                      <span className={`text-sm font-semibold ${info.color}`}>{info.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{info.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invite Form */}
          {canManage && (
            <div className="bg-white dark:bg-[#151837]/60 dark:backdrop-blur rounded-xl border border-gray-200 dark:border-white/10 p-5 mb-6">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <UserPlus size={18} className="text-accent" />
                Convidar Membro
              </h3>
              <form onSubmit={handleInvite} className="flex gap-3 flex-col sm:flex-row">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none text-sm bg-white dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
                  required
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none text-sm bg-white dark:bg-white/5 dark:text-white"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="submit"
                  disabled={inviting}
                  className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2 justify-center whitespace-nowrap"
                >
                  {inviting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                  Convidar
                </button>
              </form>
              {message && (
                <div className={`mt-3 flex items-center gap-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {message.text}
                </div>
              )}
            </div>
          )}

          {/* Members List */}
          <div className="bg-white dark:bg-[#151837]/60 dark:backdrop-blur rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10">
              <h3 className="font-semibold text-gray-800 dark:text-white">
                Membros <span className="text-gray-400 font-normal">— {members.length}</span>
              </h3>
            </div>

            {membersLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="animate-spin text-accent" size={24} />
              </div>
            ) : members.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Nenhum membro encontrado</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-white/10">
                {members.map((member) => {
                  const roleInfo = ROLE_INFO[member.role] || ROLE_INFO.viewer;
                  const RoleIcon = roleInfo.icon;
                  return (
                    <div key={member.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <span className="text-accent font-semibold text-sm">
                          {(member.user.name || member.user.email)?.[0]?.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-white truncate">
                          {member.user.name || 'Sem nome'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{member.user.email}</p>
                      </div>

                      {canManage && member.role !== 'owner' ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          className={`text-sm font-medium px-3 py-1.5 rounded-lg border-0 ${roleInfo.bg} ${roleInfo.color} cursor-pointer`}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`text-sm font-medium px-3 py-1.5 rounded-lg ${roleInfo.bg} ${roleInfo.color} flex items-center gap-1`}>
                          <RoleIcon size={12} />
                          {roleInfo.label}
                        </span>
                      )}

                      {canManage && member.role !== 'owner' && (
                        <button
                          onClick={() => handleRemove(member.id, member.user.name || member.user.email)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remover membro"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
