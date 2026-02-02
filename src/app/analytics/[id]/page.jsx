'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
  Play, CheckCircle, Target, Clock, Users, TrendingUp,
  BarChart2, ArrowLeft, Activity, PieChart, Loader2, Inbox,
  FlaskConical, Trophy, ExternalLink, Sliders, Copy
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

// ── A/B Test Section ─────────────────────────────────────────
function ABTestSection({ quizId, onRefresh }) {
  const [abData, setAbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [splitValue, setSplitValue] = useState(50);
  const [declaring, setDeclaring] = useState(false);
  const router = useRouter();

  const fetchAbData = () => {
    setLoading(true);
    fetch(`/api/quizzes/${quizId}/ab-test`)
      .then(r => r.json())
      .then(data => {
        if (data.original) {
          setAbData(data);
          setSplitValue(data.original.splitPercent || 50);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAbData(); }, [quizId]);

  const handleCreateVariant = async () => {
    setCreating(true);
    try {
      const res = await fetch(`/api/quizzes/${quizId}/variant`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        fetchAbData();
      } else {
        alert(data.error || 'Erro ao criar variante');
      }
    } catch {
      alert('Erro ao criar variante');
    } finally {
      setCreating(false);
    }
  };

  const handleSplitChange = async (value) => {
    setSplitValue(value);
    await fetch(`/api/quizzes/${quizId}/ab-test`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ splitPercent: value }),
    });
    fetchAbData();
  };

  const handleDeclareWinner = async (winnerId) => {
    if (!confirm('Tem certeza? Isso desativará a versão perdedora e redirecionará 100% do tráfego para o vencedor.')) return;
    setDeclaring(true);
    try {
      await fetch(`/api/quizzes/${quizId}/ab-test`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId }),
      });
      fetchAbData();
      if (onRefresh) onRefresh();
    } catch {
      alert('Erro ao declarar vencedor');
    } finally {
      setDeclaring(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical size={18} className="text-[#7c3aed]" />
          <h2 className="text-lg font-semibold text-gray-800">A/B Test</h2>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-[#7c3aed]" size={24} />
        </div>
      </div>
    );
  }

  const hasVariants = abData?.variants && abData.variants.length > 0;
  const variant = hasVariants ? abData.variants[0] : null;
  const original = abData?.original;

  // Determine test status
  let testStatus = 'inactive';
  if (hasVariants) {
    if (original?.splitPercent === 100 || (variant && variant.splitPercent === 100)) {
      testStatus = 'completed';
    } else if (variant?.status === 'published') {
      testStatus = 'active';
    }
  }

  const statusColors = {
    active: { bg: '#dcfce7', text: '#16a34a', label: 'Ativo' },
    inactive: { bg: '#fef3c7', text: '#d97706', label: 'Inativo' },
    completed: { bg: '#dbeafe', text: '#2563eb', label: 'Concluído' },
  };

  const statusStyle = statusColors[testStatus];

  // Determine winner (by conversion rate, then completion rate)
  let winnerId = null;
  if (hasVariants && original && variant) {
    if (original.conversionRate > variant.conversionRate) winnerId = original.id;
    else if (variant.conversionRate > original.conversionRate) winnerId = variant.id;
    else if (original.completionRate > variant.completionRate) winnerId = original.id;
    else if (variant.completionRate > original.completionRate) winnerId = variant.id;
  }

  const splitPresets = [
    { label: '50/50', value: 50 },
    { label: '70/30', value: 70 },
    { label: '80/20', value: 80 },
    { label: '90/10', value: 90 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FlaskConical size={18} className="text-[#7c3aed]" />
          <h2 className="text-lg font-semibold text-gray-800">A/B Test</h2>
          {hasVariants && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
            >
              {statusStyle.label}
            </span>
          )}
        </div>

        {!hasVariants && (
          <button
            onClick={handleCreateVariant}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#7c3aed' }}
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Copy size={16} />}
            Criar Variante B
          </button>
        )}
      </div>

      {!hasVariants ? (
        <div className="text-center py-8">
          <FlaskConical size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            Crie uma variante B para iniciar um teste A/B.
            <br />
            O quiz será duplicado e o tráfego será dividido entre as versões.
          </p>
        </div>
      ) : (
        <>
          {/* Split Control */}
          {testStatus !== 'completed' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Sliders size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Divisão de Tráfego</span>
              </div>
              <div className="flex gap-2 mb-3">
                {splitPresets.map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => handleSplitChange(preset.value)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                    style={{
                      backgroundColor: splitValue === preset.value ? '#7c3aed' : '#f3f4f6',
                      color: splitValue === preset.value ? '#ffffff' : '#6b7280',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={splitValue}
                  onChange={(e) => handleSplitChange(parseInt(e.target.value))}
                  className="flex-1 accent-[#7c3aed]"
                />
                <span className="text-sm font-medium text-gray-600 min-w-[80px] text-right">
                  A:{splitValue}% / B:{100 - splitValue}%
                </span>
              </div>
            </div>
          )}

          {/* Side-by-side Comparison */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Original (A) */}
            <div
              className="rounded-xl p-5 border-2 transition-all"
              style={{
                borderColor: winnerId === original.id ? '#22c55e' : '#e5e7eb',
                backgroundColor: winnerId === original.id ? '#f0fdf4' : '#ffffff',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#7c3aed] text-white text-xs font-bold flex items-center justify-center">A</span>
                  <span className="font-semibold text-gray-800 text-sm">Original</span>
                </div>
                {winnerId === original.id && (
                  <Trophy size={16} className="text-green-500" />
                )}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Inícios</span>
                  <span className="text-sm font-bold text-gray-800">{original.starts || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Conclusões</span>
                  <span className="text-sm font-bold text-gray-800">{original.completes || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Taxa Conclusão</span>
                  <span className="text-sm font-bold" style={{ color: winnerId === original.id && original.completionRate > variant.completionRate ? '#22c55e' : '#374151' }}>
                    {original.completionRate || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Leads</span>
                  <span className="text-sm font-bold text-gray-800">{original.leads || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Conversão</span>
                  <span className="text-sm font-bold" style={{ color: winnerId === original.id && original.conversionRate > variant.conversionRate ? '#22c55e' : '#374151' }}>
                    {original.conversionRate || 0}%
                  </span>
                </div>
              </div>
              {testStatus !== 'completed' && (
                <button
                  onClick={() => handleDeclareWinner(original.id)}
                  disabled={declaring}
                  className="w-full mt-4 text-xs font-medium py-2 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
                >
                  {declaring ? '...' : '🏆 Declarar Vencedor'}
                </button>
              )}
            </div>

            {/* Variant (B) */}
            <div
              className="rounded-xl p-5 border-2 transition-all"
              style={{
                borderColor: winnerId === variant.id ? '#22c55e' : '#e5e7eb',
                backgroundColor: winnerId === variant.id ? '#f0fdf4' : '#ffffff',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">B</span>
                  <span className="font-semibold text-gray-800 text-sm">Variante</span>
                </div>
                <div className="flex items-center gap-1">
                  {winnerId === variant.id && (
                    <Trophy size={16} className="text-green-500" />
                  )}
                  <button
                    onClick={() => router.push(`/builder/${variant.id}`)}
                    className="text-gray-400 hover:text-[#7c3aed] transition-colors"
                    title="Editar variante"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Inícios</span>
                  <span className="text-sm font-bold text-gray-800">{variant.starts || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Conclusões</span>
                  <span className="text-sm font-bold text-gray-800">{variant.completes || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Taxa Conclusão</span>
                  <span className="text-sm font-bold" style={{ color: winnerId === variant.id && variant.completionRate > original.completionRate ? '#22c55e' : '#374151' }}>
                    {variant.completionRate || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Leads</span>
                  <span className="text-sm font-bold text-gray-800">{variant.leads || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Conversão</span>
                  <span className="text-sm font-bold" style={{ color: winnerId === variant.id && variant.conversionRate > original.conversionRate ? '#22c55e' : '#374151' }}>
                    {variant.conversionRate || 0}%
                  </span>
                </div>
              </div>
              {testStatus !== 'completed' && (
                <button
                  onClick={() => handleDeclareWinner(variant.id)}
                  disabled={declaring}
                  className="w-full mt-4 text-xs font-medium py-2 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
                >
                  {declaring ? '...' : '🏆 Declarar Vencedor'}
                </button>
              )}
            </div>
          </div>

          {/* Edit Variant Link */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <button
              onClick={() => router.push(`/builder/${variant.id}`)}
              className="flex items-center gap-1 text-[#7c3aed] hover:underline"
            >
              <ExternalLink size={14} />
              Editar Variante B no Builder
            </button>
          </div>
        </>
      )}
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-lg mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <PieChart size={18} className="text-[#7c3aed]" />
                  Distribuição de Resultados
                </h2>
                <ResultsChart data={analytics.results} />
              </div>
            )}

            {/* A/B Test Section */}
            <div className="mb-8">
              <ABTestSection
                quizId={quizId}
                onRefresh={() => {
                  // Re-fetch analytics after declaring winner
                  fetch(`/api/quizzes/${quizId}/analytics`)
                    .then(r => r.json())
                    .then(data => setAnalytics(data))
                    .catch(() => {});
                }}
              />
            </div>
          </>
        )}

        {/* Show A/B Test section even when no analytics data yet */}
        {!loading && !error && !hasData && (
          <div className="mt-8">
            <ABTestSection quizId={quizId} />
          </div>
        )}
      </main>
    </div>
  );
}
