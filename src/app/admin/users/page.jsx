'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Shield,
  ShieldOff,
  UserCog,
  Loader2,
  Crown,
  Users,
} from 'lucide-react';

const PLAN_COLORS = {
  free: 'bg-gray-500/20 text-gray-400',
  pro: 'bg-indigo-500/20 text-indigo-400',
  business: 'bg-amber-500/20 text-amber-400',
  advanced: 'bg-blue-500/20 text-blue-400',
  enterprise: 'bg-purple-500/20 text-purple-400',
};

const ROLE_COLORS = {
  owner: 'bg-amber-500/20 text-amber-400',
  admin: 'bg-blue-500/20 text-blue-400',
  user: 'bg-gray-500/20 text-gray-400',
};

export default function AdminUsersPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filterPlan) params.set('plan', filterPlan);
    if (filterRole) params.set('role', filterRole);
    params.set('page', page.toString());
    params.set('limit', '20');

    try {
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [search, filterPlan, filterRole]);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(1), 300);
    return () => clearTimeout(timer);
  }, [search, filterPlan, filterRole, fetchUsers]);

  const handleImpersonate = async (userId) => {
    setActionLoading(userId);
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
      console.error('Impersonate error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMakeAdmin = async (userId) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/make-admin`, { method: 'POST' });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'admin' } : u));
      }
    } catch (err) {
      console.error('Make admin error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveAdmin = async (userId) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/remove-admin`, { method: 'POST' });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'user' } : u));
      }
    } catch (err) {
      console.error('Remove admin error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const isOwner = session?.user?.role === 'owner';

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Users size={32} className="text-indigo-400" />
          Gestão de Usuários
        </h1>
        <p className="text-gray-400 mt-1">{pagination.total} usuários cadastrados</p>
      </div>

      {/* Filters */}
      <div className="bg-[#151837]/60 backdrop-blur border border-white/10 rounded-2xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {/* Plan Filter */}
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-gray-300 text-sm focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
          >
            <option value="">Todos os planos</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="business">Business</option>
            <option value="advanced">Advanced</option>
            <option value="enterprise">Enterprise</option>
          </select>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-gray-300 text-sm focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
          >
            <option value="">Todos os roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#151837]/60 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-indigo-500" size={28} />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            Nenhum usuário encontrado
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase border-b border-white/5">
                    <th className="text-left py-4 px-5 font-medium">Usuário</th>
                    <th className="text-left py-4 px-3 font-medium">Plano</th>
                    <th className="text-left py-4 px-3 font-medium">Role</th>
                    <th className="text-right py-4 px-3 font-medium">Quizzes</th>
                    <th className="text-right py-4 px-3 font-medium">Leads</th>
                    <th className="text-right py-4 px-3 font-medium">Criado em</th>
                    <th className="text-right py-4 px-5 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className={`border-b border-white/5 hover:bg-white/5 transition-colors ${user.suspended ? 'opacity-50' : ''}`}
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                            <span className="text-indigo-400 font-semibold text-sm">
                              {(user.name || user.email)?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {user.name || 'Sem nome'}
                              {user.suspended && (
                                <span className="ml-2 text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">
                                  Suspenso
                                </span>
                              )}
                            </p>
                            <p className="text-gray-500 text-xs truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${PLAN_COLORS[user.plan] || PLAN_COLORS.free}`}>
                          {user.plan?.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${ROLE_COLORS[user.role] || ROLE_COLORS.user}`}>
                          {user.role?.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right text-gray-300 text-sm font-medium">
                        {user.quizCount || 0}
                      </td>
                      <td className="py-4 px-3 text-right text-gray-300 text-sm font-medium">
                        {user.leadCount?.toLocaleString() || 0}
                      </td>
                      <td className="py-4 px-3 text-right text-gray-500 text-xs">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View details */}
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye size={16} />
                          </Link>

                          {/* Impersonate */}
                          {user.role !== 'owner' && (
                            <button
                              onClick={() => handleImpersonate(user.id)}
                              disabled={actionLoading === user.id}
                              className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
                              title="Impersonar"
                            >
                              {actionLoading === user.id ? <Loader2 size={16} className="animate-spin" /> : <UserCog size={16} />}
                            </button>
                          )}

                          {/* Make/Remove Admin (owner only) */}
                          {isOwner && user.role === 'user' && (
                            <button
                              onClick={() => handleMakeAdmin(user.id)}
                              disabled={actionLoading === user.id}
                              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50"
                              title="Promover a Admin"
                            >
                              <Shield size={16} />
                            </button>
                          )}
                          {isOwner && user.role === 'admin' && (
                            <button
                              onClick={() => handleRemoveAdmin(user.id)}
                              disabled={actionLoading === user.id}
                              className="p-2 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors disabled:opacity-50"
                              title="Remover Admin"
                            >
                              <ShieldOff size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
                <p className="text-gray-500 text-sm">
                  Página {pagination.page} de {pagination.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchUsers(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => fetchUsers(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
