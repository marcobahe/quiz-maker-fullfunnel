'use client';

import { MoreVertical, Edit2, Trash2, Copy, BarChart2, ExternalLink, Users, Sparkles, Plus } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QuizTable({ quizzes, onRefresh, onOpenTemplates }) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(null);

  const handleEdit = (quizId) => {
    router.push(`/builder/${quizId}`);
    setOpenMenu(null);
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('Tem certeza que deseja excluir este quiz?')) return;
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, { method: 'DELETE' });
      if (res.ok && onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to delete quiz:', err);
    }
    setOpenMenu(null);
  };

  return (
    <div className="bg-white dark:bg-[#151837]/60 dark:backdrop-blur rounded-xl shadow-sm border border-gray-100 dark:border-white/10">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Meus Quizzes</h2>
        {onOpenTemplates && (
          <button
            onClick={onOpenTemplates}
            className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition-colors text-sm font-medium"
          >
            <Sparkles size={16} />
            Usar Template
          </button>
        )}
      </div>
      
      {quizzes.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-accent" />
          </div>
          <p className="text-gray-700 dark:text-gray-200 font-medium mb-1">Nenhum quiz criado ainda</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">Comece com um template pronto ou crie do zero</p>
          {onOpenTemplates && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onOpenTemplates}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Sparkles size={16} />
                Ver Templates
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-white/5 rounded-t-xl">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Criado em</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Leads</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Conversão</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleEdit(quiz.id)}
                      className="text-gray-800 dark:text-white font-medium hover:text-accent transition-colors text-left"
                    >
                      {quiz.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                    {new Date(quiz.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      quiz.status === 'Publicado' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {quiz.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => router.push(`/quiz/${quiz.id}/leads`)}
                      className="text-gray-800 dark:text-white font-medium hover:text-accent transition-colors"
                      title="Ver leads"
                    >
                      {quiz.leads}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${quiz.conversion}%` }}
                        />
                      </div>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">{quiz.conversion}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setOpenMenu(openMenu === quiz.id ? null : quiz.id)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                    >
                      <MoreVertical size={20} />
                    </button>
                    
                    {openMenu === quiz.id && (
                      <div className="absolute right-6 bottom-full mb-1 bg-white dark:bg-[#1a1e3d] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl py-1 z-50 min-w-[180px]">
                        <button 
                          onClick={() => handleEdit(quiz.id)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
                        >
                          <Edit2 size={16} />
                          Editar
                        </button>
                        {quiz.slug && quiz.status === 'Publicado' && (
                          <button 
                            onClick={() => { window.open(`/q/${quiz.slug}`, '_blank'); setOpenMenu(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
                          >
                            <ExternalLink size={16} />
                            Ver Quiz
                          </button>
                        )}
                        <button 
                          onClick={() => { router.push(`/quiz/${quiz.id}/leads`); setOpenMenu(null); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
                        >
                          <Users size={16} />
                          Ver Leads
                        </button>
                        <button 
                          onClick={() => { router.push(`/analytics/${quiz.id}`); setOpenMenu(null); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
                        >
                          <BarChart2 size={16} />
                          Analytics
                        </button>
                        <hr className="my-1" />
                        <button 
                          onClick={() => handleDelete(quiz.id)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 size={16} />
                          Excluir
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
