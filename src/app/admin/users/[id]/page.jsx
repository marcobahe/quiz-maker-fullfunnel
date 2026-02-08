'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  FileText,
  Target,
  Crown,
  Shield,
  ShieldOff,
  UserCog,
  Ban,
  CheckCircle,
  Trash2,
  Loader2,
  Building2,
  Eye,
  ExternalLink,
} from 'lucide-react';

const PLAN_COLORS = {
  free: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  pro: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  business: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export default function AdminUserDetailPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [editingPlan, setEditingPlan] = useState(false);

  const isOwner = session?.user?.role === 'owner';

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/admin/users/${userId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  const handlePlanChange = async (newPlan) => {
    setActionLoading('plan');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(prev => ({ ...prev, ...updated }));
        setEditingPlan(false);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async () => {
    const action = user.suspended ? 'reativar' : 'suspender';
    if (!confirm(`Deseja ${action} este usuário?`)) return;
    setActionLoading('suspend');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended: !user.suspended }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(prev => ({ ...prev, ...updated }));
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMakeAdmin = async () => {
    setActionLoading('admin');
    try {
      const res = await fetch(`/api/admin/users/${userId}/make-admin`, { method: 'POST' });
      if (res.ok) {
        setUser(prev => ({ ...prev, role: 'admin' }));
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveAdmin = async () => {
    setActionLoading('admin');
    try {
      const res = await fetch(`/api/admin/users/${userId}/remove-admin`, { method: 'POST' });
      if (res.ok) {
        setUser(prev => ({ ...prev, role: 'user' }));
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleImpersonate = async () => {
    setActionLoading('impersonate');
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        await updateSession({
          impersonatingAs: data.impersonatingAs,
          impersonatingName: data.impersonatingName,
          originalUserId: data.originalUserId,
          originalRole: data.originalRole,
        });
        router.push('/');
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccessWorkspace = (workspaceId, workspaceName, ownerName) => {
    // Store admin workspace context in localStorage for the banner
    localStorage.setItem('activeWorkspaceId', workspaceId);
    localStorage.setItem('adminWorkspaceContext', JSON.stringify({
      workspaceId,
      workspaceName,
      ownerName,
      fromAdmin: true,
    }));
    router.push('/?adminWs=' + workspaceId);
  };

  const handleDelete = async () => {
    if (!confirm('⚠️ ATENÇÃO: Isso vai deletar PERMANENTEMENTE o usuário, todos os quizzes, leads e dados. Continuar?')) return;
    if (!confirm('Tem certeza absoluta? Esta ação NÃO pode ser desfeita.')) return;
    setActionLoading('delete');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin/users');
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">Usuário não encontrado</p>
        <Link href="/admin/users" className="text-indigo-400 hover:underline mt-2 inline-block">
          ← Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Back */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar para Usuários
      </Link>

      {/* Header */}
      <div className="bg-[#151837]/60 backdrop-blur border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20 shrink-0">
            <span className="text-white text-3xl font-bold">
              {(user.name || user.email)?.[0]?.toUpperCase()}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{user.name || 'Sem nome'}</h1>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${PLAN_COLORS[user.plan] || PLAN_COLORS.free}`}>
                {user.plan?.toUpperCase()}
              </span>
              {user.role !== 'user' && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  user.role === 'owner' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {user.role === 'owner' ? '👑 OWNER' : '🛡️ ADMIN'}
                </span>
              )}
              {user.suspended && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400">
                  ⛔ SUSPENSO
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-gray-400 text-sm">
              <span className="flex items-center gap-1.5">
                <Mail size={14} /> {user.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> Desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
              </span>
              <span className="flex items-center gap-1.5">
                <FileText size={14} /> {user.quizzes?.length || 0} quizzes
              </span>
              <span className="flex items-center gap-1.5">
                <Target size={14} /> {user.totalLeads?.toLocaleString() || 0} leads
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/5">
          {user.role !== 'owner' && (
            <button
              onClick={handleImpersonate}
              disabled={actionLoading === 'impersonate'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all text-sm font-medium disabled:opacity-50"
            >
              {actionLoading === 'impersonate' ? <Loader2 size={16} className="animate-spin" /> : <UserCog size={16} />}
              Impersonar
            </button>
          )}

          {/* Edit Plan */}
          {editingPlan ? (
            <div className="flex items-center gap-2">
              {['free', 'pro', 'business'].map(plan => (
                <button
                  key={plan}
                  onClick={() => handlePlanChange(plan)}
                  disabled={actionLoading === 'plan'}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    user.plan === plan
                      ? 'bg-indigo-500 text-white border-indigo-500'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:border-indigo-500/50'
                  }`}
                >
                  {plan.charAt(0).toUpperCase() + plan.slice(1)}
                </button>
              ))}
              <button
                onClick={() => setEditingPlan(false)}
                className="px-3 py-2.5 text-gray-400 text-sm hover:text-white"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingPlan(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all text-sm font-medium"
            >
              <Crown size={16} />
              Alterar Plano
            </button>
          )}

          {/* Make/Remove Admin */}
          {isOwner && user.role === 'user' && (
            <button
              onClick={handleMakeAdmin}
              disabled={actionLoading === 'admin'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all text-sm font-medium disabled:opacity-50"
            >
              {actionLoading === 'admin' ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              Promover a Admin
            </button>
          )}
          {isOwner && user.role === 'admin' && (
            <button
              onClick={handleRemoveAdmin}
              disabled={actionLoading === 'admin'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 transition-all text-sm font-medium disabled:opacity-50"
            >
              {actionLoading === 'admin' ? <Loader2 size={16} className="animate-spin" /> : <ShieldOff size={16} />}
              Remover Admin
            </button>
          )}

          {/* Suspend */}
          {user.role !== 'owner' && (
            <button
              onClick={handleSuspend}
              disabled={actionLoading === 'suspend'}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium disabled:opacity-50 ${
                user.suspended
                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20'
                  : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border-orange-500/20'
              }`}
            >
              {actionLoading === 'suspend' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : user.suspended ? (
                <CheckCircle size={16} />
              ) : (
                <Ban size={16} />
              )}
              {user.suspended ? 'Reativar' : 'Suspender'}
            </button>
          )}

          {/* Delete */}
          {user.role !== 'owner' && (
            <button
              onClick={handleDelete}
              disabled={actionLoading === 'delete'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all text-sm font-medium disabled:opacity-50 ml-auto"
            >
              {actionLoading === 'delete' ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Deletar Conta
            </button>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Billing Info */}
        <div className="bg-[#151837]/60 backdrop-blur border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Crown size={18} className="text-amber-400" />
            Billing & Plano
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Plano</span>
              <span className={`font-semibold px-2 py-0.5 rounded ${PLAN_COLORS[user.plan] || PLAN_COLORS.free}`}>
                {user.plan?.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Stripe Customer</span>
              <span className="text-gray-300 font-mono text-xs">{user.stripeCustomerId || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Subscription</span>
              <span className="text-gray-300 font-mono text-xs">{user.stripeSubscriptionId || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Expira em</span>
              <span className="text-gray-300">
                {user.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString('pt-BR') : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Onboarding</span>
              <span className={user.onboardingDone ? 'text-emerald-400' : 'text-gray-500'}>
                {user.onboardingDone ? '✓ Completo' : 'Pendente'}
              </span>
            </div>
          </div>
        </div>

        {/* Workspaces */}
        <div className="bg-[#151837]/60 backdrop-blur border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-indigo-400" />
            Workspaces ({user.memberships?.length || 0})
          </h3>
          <div className="space-y-2">
            {user.memberships?.length > 0 ? (
              user.memberships.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl group">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{m.workspace.name}</p>
                    <p className="text-gray-500 text-xs">
                      {m.workspace._count?.members} membros • {m.workspace._count?.quizzes} quizzes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${
                      m.role === 'owner' ? 'bg-amber-500/20 text-amber-400' :
                      m.role === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                      m.role === 'editor' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {m.role.toUpperCase()}
                    </span>
                    <button
                      onClick={() => handleAccessWorkspace(m.workspace.id, m.workspace.name, user.name || user.email)}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 text-xs font-medium transition-all"
                      title="Acessar workspace como admin"
                    >
                      <Eye size={12} />
                      Acessar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Nenhum workspace</p>
            )}
          </div>
        </div>

        {/* Quizzes */}
        <div className="bg-[#151837]/60 backdrop-blur border border-white/10 rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FileText size={18} className="text-emerald-400" />
            Quizzes ({user.quizzes?.length || 0})
          </h3>
          {user.quizzes?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase border-b border-white/5">
                    <th className="text-left py-3 px-2 font-medium">Nome</th>
                    <th className="text-left py-3 px-2 font-medium">Slug</th>
                    <th className="text-left py-3 px-2 font-medium">Status</th>
                    <th className="text-right py-3 px-2 font-medium">Leads</th>
                    <th className="text-right py-3 px-2 font-medium">Criado</th>
                    <th className="text-right py-3 px-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {user.quizzes.map(quiz => (
                    <tr key={quiz.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2 text-white text-sm font-medium">{quiz.name}</td>
                      <td className="py-3 px-2 text-gray-400 text-sm font-mono text-xs">/{quiz.slug}</td>
                      <td className="py-3 px-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          quiz.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {quiz.status === 'published' ? 'Publicado' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-gray-300 text-sm font-semibold">
                        {quiz._count?.leads || 0}
                      </td>
                      <td className="py-3 px-2 text-right text-gray-500 text-xs">
                        {new Date(quiz.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {quiz.status === 'published' && (
                          <a
                            href={`/q/${quiz.slug}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-indigo-400 inline-flex"
                            title="Ver quiz"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">Nenhum quiz criado</p>
          )}
        </div>
      </div>
    </div>
  );
}
