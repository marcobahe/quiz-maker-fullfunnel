'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Users,
  FileText,
  Target,
  TrendingUp,
  Crown,
  Loader2,
  Eye,
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 p-6 ${gradient}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <p className="text-gray-400 text-sm font-medium">{label}</p>
        <p className="text-white text-3xl font-bold mt-1">{value?.toLocaleString?.() ?? '—'}</p>
        {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function GrowthChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-sm text-center py-8">Sem dados de crescimento</div>;
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="flex items-end gap-1 h-40">
      {data.map((day, i) => {
        const height = Math.max((day.count / maxCount) * 100, 4);
        const dateStr = new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {dateStr}: {day.count}
            </div>
            <div
              className="w-full bg-indigo-500/80 rounded-t-sm hover:bg-indigo-400 transition-colors cursor-default"
              style={{ height: `${height}%`, minHeight: '3px' }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard Admin</h1>
        <p className="text-gray-400 mt-1">
          Visão geral da plataforma • Olá, {session?.user?.name || 'Admin'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Total Usuários"
          value={stats?.totalUsers}
          sub={`+${stats?.newUsersLast7 || 0} últimos 7 dias`}
          color="bg-indigo-500"
          gradient="bg-[#151837]/60 backdrop-blur"
        />
        <StatCard
          icon={FileText}
          label="Total Quizzes"
          value={stats?.totalQuizzes}
          sub={`${stats?.publishedQuizzes || 0} publicados, ${stats?.draftQuizzes || 0} draft`}
          color="bg-emerald-500"
          gradient="bg-[#151837]/60 backdrop-blur"
        />
        <StatCard
          icon={Target}
          label="Total Leads"
          value={stats?.totalLeads}
          color="bg-rose-500"
          gradient="bg-[#151837]/60 backdrop-blur"
        />
        <StatCard
          icon={TrendingUp}
          label="MRR Estimado"
          value={`R$ ${((stats?.planCounts?.pro || 0) * 97 + (stats?.planCounts?.business || 0) * 197 + (stats?.planCounts?.advanced || 0) * 297 + (stats?.planCounts?.enterprise || 0) * 497).toLocaleString()}`}
          sub={`${stats?.planCounts?.pro || 0} Pro, ${stats?.planCounts?.business || 0} Business, ${stats?.planCounts?.advanced || 0} Advanced, ${stats?.planCounts?.enterprise || 0} Enterprise`}
          color="bg-amber-500"
          gradient="bg-[#151837]/60 backdrop-blur"
        />
      </div>

      {/* Plans Breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {['free', 'pro', 'business', 'advanced', 'enterprise'].map(plan => {
          const count = stats?.planCounts?.[plan] || 0;
          const total = stats?.totalUsers || 1;
          const pct = Math.round((count / total) * 100);
          const colors = {
            free: 'bg-gray-500',
            pro: 'bg-indigo-500',
            business: 'bg-amber-500',
            advanced: 'bg-blue-500',
            enterprise: 'bg-purple-500',
          };
          return (
            <div key={plan} className="bg-[#151837]/60 backdrop-blur border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-semibold capitalize">{plan}</span>
                <span className="text-gray-400 text-sm">{count} users</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors[plan]} rounded-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-gray-500 text-xs mt-2">{pct}% do total</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <div className="bg-[#151837]/60 backdrop-blur border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-1">Crescimento de Usuários</h3>
          <p className="text-gray-500 text-sm mb-4">Últimos 30 dias</p>
          <GrowthChart data={stats?.dailyGrowth} />
        </div>

        {/* Recent Users */}
        <div className="bg-[#151837]/60 backdrop-blur border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Últimos Usuários</h3>
            <Link href="/admin/users" className="text-indigo-400 text-sm hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recentUsers?.slice(0, 6).map(user => (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <span className="text-indigo-400 font-semibold text-sm">
                    {(user.name || user.email)?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate group-hover:text-indigo-400 transition-colors">
                    {user.name || 'Sem nome'}
                  </p>
                  <p className="text-gray-500 text-xs truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    user.plan === 'pro' ? 'bg-indigo-500/20 text-indigo-400' :
                    user.plan === 'business' ? 'bg-amber-500/20 text-amber-400' :
                    user.plan === 'advanced' ? 'bg-blue-500/20 text-blue-400' :
                    user.plan === 'enterprise' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {user.plan?.toUpperCase()}
                  </span>
                  <span className="text-gray-500 text-xs">{user._count?.quizzes || 0} quizzes</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Quizzes */}
        <div className="bg-[#151837]/60 backdrop-blur border border-white/10 rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-white font-semibold mb-4">Quizzes Mais Populares</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-500 text-xs uppercase border-b border-white/5">
                  <th className="text-left py-3 px-2 font-medium">Quiz</th>
                  <th className="text-left py-3 px-2 font-medium">Autor</th>
                  <th className="text-left py-3 px-2 font-medium">Status</th>
                  <th className="text-right py-3 px-2 font-medium">Leads</th>
                  <th className="text-right py-3 px-2 font-medium">Criado</th>
                </tr>
              </thead>
              <tbody>
                {stats?.popularQuizzes?.map(quiz => (
                  <tr key={quiz.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2">
                      <p className="text-white text-sm font-medium">{quiz.name}</p>
                      <p className="text-gray-500 text-xs">/{quiz.slug}</p>
                    </td>
                    <td className="py-3 px-2 text-gray-400 text-sm">
                      {quiz.user?.name || quiz.user?.email || '—'}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        quiz.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {quiz.status === 'published' ? 'Publicado' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-white font-semibold text-sm">
                      {quiz._count?.leads?.toLocaleString() || 0}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-500 text-xs">
                      {new Date(quiz.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
