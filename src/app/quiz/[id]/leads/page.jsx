'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Download,
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  ArrowLeft,
  Loader2,
  X,
} from 'lucide-react';
import Sidebar from '@/components/Layout/Sidebar';

export default function LeadsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [quizName, setQuizName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const limit = 10;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch quiz name
  useEffect(() => {
    if (status === 'authenticated' && params.id) {
      fetch(`/api/quizzes/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.name) setQuizName(data.name);
        })
        .catch(() => {});
    }
  }, [status, params.id]);

  const fetchLeads = useCallback(async () => {
    if (!params.id) return;
    setLoading(true);
    try {
      const searchParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (dateFrom) searchParams.set('from', dateFrom);
      if (dateTo) searchParams.set('to', dateTo);

      const res = await fetch(
        `/api/quizzes/${params.id}/leads?${searchParams.toString()}`
      );
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  }, [params.id, page, dateFrom, dateTo]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLeads();
    }
  }, [status, fetchLeads]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const searchParams = new URLSearchParams();
      if (dateFrom) searchParams.set('from', dateFrom);
      if (dateTo) searchParams.set('to', dateTo);

      const url = `/api/quizzes/${params.id}/leads/export${
        searchParams.toString() ? '?' + searchParams.toString() : ''
      }`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Export failed');
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;

      // Extract filename from Content-Disposition header
      const disposition = res.headers.get('Content-Disposition');
      let filename = 'leads.csv';
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Erro ao exportar leads. Tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  const handleFilterApply = () => {
    setPage(1);
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const handleCreateQuiz = async () => {
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Meu Novo Quiz' }),
      });
      if (res.ok) {
        const quiz = await res.json();
        router.push(`/builder/${quiz.id}`);
      }
    } catch (err) {
      console.error('Failed to create quiz:', err);
    }
  };

  if (status === 'loading' || (status === 'authenticated' && loading && leads.length === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  const hasFilters = dateFrom || dateTo;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        onCreateQuiz={handleCreateQuiz}
        userName={session?.user?.name || session?.user?.email}
      />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm mb-3 transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar ao Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Users className="text-accent" size={22} />
                </div>
                Leads {quizName ? `— ${quizName}` : ''}
              </h1>
              <p className="text-gray-500 mt-1">
                {total} lead{total !== 1 ? 's' : ''} capturado{total !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg transition-colors font-medium shadow-sm"
            >
              {exporting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              {exporting ? 'Exportando...' : 'Exportar CSV'}
            </button>
          </div>
        </div>

        {/* Date Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Filtrar por data:</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">De:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Até:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
            <button
              onClick={handleFilterApply}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-1.5 rounded-lg transition-colors font-medium"
            >
              Aplicar
            </button>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-sm transition-colors"
              >
                <X size={14} />
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 size={24} className="animate-spin text-accent" />
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">Nenhum lead encontrado</p>
              <p className="text-gray-400 text-sm">
                {hasFilters
                  ? 'Tente ajustar os filtros de data.'
                  : 'Os leads aparecerão aqui quando alguém responder seu quiz.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Telefone
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Pontuação
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Resultado
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-800 font-medium">
                          {lead.name || '—'}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {lead.email || '—'}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {lead.phone || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center bg-accent/10 text-accent font-semibold text-sm rounded-full w-10 h-10">
                            {lead.score ?? 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {lead.resultCategory ? (
                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                              {lead.resultCategory}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {new Date(lead.createdAt).toLocaleString('pt-BR', {
                            timeZone: 'America/Sao_Paulo',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Mostrando {(page - 1) * limit + 1}–
                    {Math.min(page * limit, total)} de {total}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={18} className="text-gray-600" />
                    </button>
                    <span className="text-sm text-gray-600 px-3">
                      Página {page} de {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={18} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
