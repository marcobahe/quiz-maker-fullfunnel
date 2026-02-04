'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Layout/Sidebar';
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
  owner: { label: 'Dono', icon: Crown, color: 'text-amber-400', bg: 'bg-amber-400/10', desc: 'Controle total do workspace' },
  admin: { label: 'Admin', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-400/10', desc: 'Gerencia membros e quizzes' },
  editor: { label: 'Editor', icon: Pencil, color: 'text-green-400', bg: 'bg-green-400/10', desc: 'Cria e edita quizzes' },
  viewer: { label: 'Viewer', icon: Eye, color: 'text-gray-400', bg: 'bg-gray-400/10', desc: 'Apenas visualiza' },
};

export default function TeamPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWsId, setSelectedWsId] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/workspaces')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setWorkspaces(data);
        if (data.length > 0) {
          // Try to restore from localStorage
          const saved = localStorage.getItem('activeWorkspaceId');
          const found = data.find(w => w.id === saved);
          setSelectedWsId(found ? found.id : data[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    if (!selectedWsId) return;
    setMembersLoading(true);
    fetch(`/api/workspaces/${selectedWsId}/members`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setMembers(data);
        setMembersLoading(false);
      })
      .catch(() => setMembersLoading(false));
  }, [selectedWsId]);

  const myRole = workspaces.find(w => w.id === selectedWsId)?.role || 'viewer';
  const canManage = myRole === 'owner' || myRole === 'admin';

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !selectedWsId) return;
    setInviting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/workspaces/${selectedWsId}/invite`, {
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
      const res = await fetch(`/api/workspaces/${selectedWsId}/members/${memberId}`, {
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
      const res = await fetch(`/api/workspaces/${selectedWsId}/members/${memberId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== memberId));
      }
    } catch (err) {
      console.error('Error removing member:', err);
    }
  };

  const handleCreateQuiz = async () => {
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Meu Novo Quiz', workspaceId: selectedWsId }),
      });
      if (res.ok) {
        const quiz = await res.json();
        router.push(`/builder/${quiz.id}`);
      }
    } catch (err) {
      console.error('Failed to create quiz:', err);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  const selectedWs = workspaces.find(w => w.id === selectedWsId);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        onCreateQuiz={handleCreateQuiz}
        onOpenTemplates={() => router.push('/templates')}
        userName={session?.user?.name || session?.user?.email}
        activeWorkspaceId={selectedWsId}
        onWorkspaceChange={(wsId) => {
          setSelectedWsId(wsId);
          localStorage.setItem('activeWorkspaceId', wsId);
        }}
      />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link href="/settings" className="hover:text-accent transition-colors">Configurações</Link>
            <ChevronLeft size={14} className="rotate-180" />
            <span className="text-gray-800">Time</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Users size={28} className="text-accent" />
            Time & Workspace
          </h1>
          <p className="text-gray-500">Gerencie membros e permissões</p>
        </div>

      <div className="max-w-4xl space-y-6">
        {/* Workspace Selector */}
        {workspaces.length > 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Workspace</label>
            <div className="flex gap-2 flex-wrap">
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => setSelectedWsId(ws.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    ws.id === selectedWsId
                      ? 'bg-accent text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Building2 size={14} />
                  {ws.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Role Explanation */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Níveis de Acesso</h3>
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
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <UserPlus size={18} className="text-accent" />
              Convidar Membro
            </h3>
            <form onSubmit={handleInvite} className="flex gap-3 flex-col sm:flex-row">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none text-sm"
                required
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none text-sm bg-white"
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
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">
              Membros {selectedWs && <span className="text-gray-400 font-normal">— {selectedWs.name}</span>}
            </h3>
          </div>

          {membersLoading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="animate-spin text-accent" size={24} />
            </div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Nenhum membro encontrado</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {members.map((member) => {
                const roleInfo = ROLE_INFO[member.role] || ROLE_INFO.viewer;
                const RoleIcon = roleInfo.icon;
                return (
                  <div key={member.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <span className="text-accent font-semibold text-sm">
                        {(member.user.name || member.user.email)?.[0]?.toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {member.user.name || 'Sem nome'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{member.user.email}</p>
                    </div>

                    {/* Role */}
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

                    {/* Remove */}
                    {canManage && member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemove(member.id, member.user.name || member.user.email)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
