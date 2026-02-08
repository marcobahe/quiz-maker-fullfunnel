'use client';

import { useEffect, useState } from 'react';
import { FileText, Loader2, ExternalLink, Search } from 'lucide-react';
import Link from 'next/link';

export default function AdminQuizzesPage() {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FileText size={32} className="text-emerald-400" />
          Quizzes
        </h1>
        <p className="text-gray-400 mt-1">
          {stats?.totalQuizzes || 0} quizzes • {stats?.publishedQuizzes || 0} publicados • {stats?.draftQuizzes || 0} drafts
        </p>
      </div>

      {/* Popular Quizzes */}
      <div className="bg-[#151837]/60 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-white font-semibold">Quizzes por Leads</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-500 text-xs uppercase border-b border-white/5">
                <th className="text-left py-4 px-5 font-medium">Quiz</th>
                <th className="text-left py-4 px-3 font-medium">Autor</th>
                <th className="text-left py-4 px-3 font-medium">Status</th>
                <th className="text-right py-4 px-3 font-medium">Leads</th>
                <th className="text-right py-4 px-5 font-medium">Criado</th>
              </tr>
            </thead>
            <tbody>
              {stats?.popularQuizzes?.map(quiz => (
                <tr key={quiz.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-5">
                    <p className="text-white text-sm font-medium">{quiz.name}</p>
                    <p className="text-gray-500 text-xs font-mono">/{quiz.slug}</p>
                  </td>
                  <td className="py-4 px-3 text-gray-400 text-sm">
                    {quiz.user?.name || quiz.user?.email || '—'}
                  </td>
                  <td className="py-4 px-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      quiz.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {quiz.status === 'published' ? 'Publicado' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-right text-white font-semibold">
                    {quiz._count?.leads?.toLocaleString() || 0}
                  </td>
                  <td className="py-4 px-5 text-right text-gray-500 text-xs">
                    {new Date(quiz.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
