'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
  Play, CheckCircle, Target, Clock, Users, TrendingUp,
  BarChart2, ArrowLeft, Activity, PieChart, Loader2, Inbox
} from 'lucide-react';
import TopBar from '@/components/Layout/TopBar';
import useQuizStore from '@/store/quizStore';

// ── Stat Card ────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, subtitle, color = '#7c3aed' }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ── Funnel Chart ─────────────────────────────────────────────
function FunnelChart({ data }) {
  if (!data || data.length === 0) return null;
  const maxViews = Math.max(...data.map(d => d.views), 1);

  return (
    <div className="space-y-3">
      {data.map((step, i) => {
        const widthPercent = Math.max((step.views / maxViews) * 100, 8);
        return (
          <div key={step.nodeId} className="group">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-700 font-medium truncate max-w-[60%]">
                {step.label.length > 40 ? step.label.substring(0, 40) + '…' : step.label}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 font-medium">{step.views}</span>
                {i > 0 && step.dropoff > 0 && (
                  <span className="text-xs text-red-500 font-medium">-{step.dropoff}%</span>
                )}
              </div>
            </div>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-2"
                style={{
                  width: `${widthPercent}%`,
                  background: `linear-gradient(90deg, #7c3aed, ${i === 0 ? '#7c3aed' : '#a78bfa'})`,
                }}
              >
                {widthPercent > 15 && (
                  <span className="text-white text-xs font-medium">{Math.round(widthPercent)}%</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Daily Bar Chart ──────────────────────────────────────────
function DailyChart({ data, days = 14 }) {
  const sliced = data.slice(-days);
  if (sliced.length === 0) return null;
  const maxVal = Math.max(...sliced.map(d => Math.max(d.starts, d.completes)), 1);

  return (
    <div>
      <div className="flex items-center gap-4 mb-4 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#7c3aed]"></span>
          <span className="text-gray-600">Inícios</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#a78bfa]"></span>
          <span className="text-gray-600">Conclusões</span>
        </span>
      </div>
      <div className="flex items-end gap-1 h-44">
        {sliced.map((day, i) => {
          const startH = Math.max((day.starts / maxVal) * 100, day.starts > 0 ? 4 : 0);
          const completeH = Math.max((day.completes / maxVal) * 100, day.completes > 0 ? 4 : 0);
          const dateLabel = new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                <p className="font-medium">{dateLabel}</p>
                <p>Inícios: {day.starts}</p>
                <p>Conclusões: {day.completes}</p>
                <p>Leads: {day.leads}</p>
              </div>
              <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: '140px' }}>
                <div
                  className="w-[45%] rounded-t-sm transition-all duration-500 bg-[#7c3aed]"
                  style={{ height: `${startH}%`, minHeight: day.starts > 0 ? '4px' : '0' }}
                />
                <div
                  className="w-[45%] rounded-t-sm transition-all duration-500 bg-[#a78bfa]"
                  style={{ height: `${completeH}%`, minHeight: day.completes > 0 ? '4px' : '0' }}
                />
              </div>
              {i % Math.ceil(sliced.length / 7) === 0 && (
                <span className="text-[10px] text-gray-400 mt-1">{dateLabel}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Results Distribution ─────────────────────────────────────
function ResultsChart({ data }) {
  if (!data || data.length === 0) return null;
  const colors = ['#7c3aed', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff'];
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-4">
      {/* Simple pie preview */}
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
            {(() => {
              let cumulative = 0;
              return data.map((item, i) => {
                const pct = total > 0 ? (item.count / total) * 100 : 0;
                const offset = cumulative;
                cumulative += pct;
                return (
                  <circle
                    key={i}
                    cx="18" cy="18" r="15.9155"
                    fill="transparent"
                    stroke={colors[i % colors.length]}
                    strokeWidth="3.2"
                    strokeDasharray={`${pct} ${100 - pct}`}
                    strokeDashoffset={`${-offset}`}
                    className="transition-all duration-700"
                  />
                );
              });
            })()}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-700">{total}</span>
          </div>
        </div>
      </div>

      {/* Legend bars */}
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={item.title}>
            <div className="flex items-center justify-between text-sm mb-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></span>
                <span className="text-gray-700 font-medium">{item.title}</span>
              </div>
              <span className="text-gray-500">{item.count} ({item.percentage}%)</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${item.percentage}%`, backgroundColor: colors[i % colors.length] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Inbox size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum dado ainda</h3>
      <p className="text-gray-500 max-w-md">
        Os dados de analytics aparecerão aqui quando pessoas começarem a responder seu quiz.
        Publique e compartilhe o quiz para começar a receber respostas!
      </p>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { id: quizId } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { loadQuiz } = useQuizStore();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizLoaded, setQuizLoaded] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  // Load quiz into store (for TopBar)
  useEffect(() => {
    if (!quizId || quizLoaded) return;
    fetch(`/api/quizzes/${quizId}`)
      .then(r => r.json())
      .then(data => {
        if (data?.id) {
          loadQuiz(data);
          setQuizLoaded(true);
        }
      })
      .catch(() => {});
  }, [quizId, quizLoaded, loadQuiz]);

  // Fetch analytics
  useEffect(() => {
    if (!quizId) return;
    setLoading(true);
    fetch(`/api/quizzes/${quizId}/analytics`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then(data => {
        setAnalytics(data);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [quizId]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#7c3aed]" size={40} />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  const o = analytics?.overview || {};
  const hasData = o.totalStarts > 0;

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar quizId={quizId} />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/')} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart2 size={22} className="text-[#7c3aed]" />
              Analytics
            </h1>
            <p className="text-sm text-gray-500">Dados de performance do seu quiz</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#7c3aed]" size={36} />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 rounded-lg p-4 text-center">
            Erro ao carregar analytics: {error}
          </div>
        ) : !hasData ? (
          <EmptyState />
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
              <StatCard icon={Play} label="Inícios" value={o.totalStarts} color="#7c3aed" />
              <StatCard icon={CheckCircle} label="Conclusões" value={o.totalCompletes} color="#10b981" />
              <StatCard icon={Target} label="Taxa Conclusão" value={`${o.completionRate}%`} color="#f59e0b" />
              <StatCard icon={TrendingUp} label="Score Médio" value={o.avgScore} color="#3b82f6" />
              <StatCard icon={Clock} label="Tempo Médio" value={formatTime(o.avgTimeSeconds)} color="#8b5cf6" />
              <StatCard icon={Users} label="Leads" value={o.totalLeads} color="#ec4899" />
              <StatCard icon={Activity} label="Conversão" value={`${o.leadConversionRate}%`} color="#14b8a6" />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Funnel */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart2 size={18} className="text-[#7c3aed]" />
                  Funil de Conversão
                </h2>
                {analytics?.funnel?.length > 0 ? (
                  <FunnelChart data={analytics.funnel} />
                ) : (
                  <p className="text-gray-400 text-sm text-center py-8">Sem dados de funil</p>
                )}
              </div>

              {/* Daily */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-[#7c3aed]" />
                  Atividade Diária
                </h2>
                {analytics?.daily?.some(d => d.starts > 0 || d.completes > 0) ? (
                  <DailyChart data={analytics.daily} />
                ) : (
                  <p className="text-gray-400 text-sm text-center py-8">Sem dados diários</p>
                )}
              </div>
            </div>

            {/* Results Distribution */}
            {analytics?.results?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <PieChart size={18} className="text-[#7c3aed]" />
                  Distribuição de Resultados
                </h2>
                <ResultsChart data={analytics.results} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
