import { MoreVertical, Edit2, Trash2, Copy, BarChart2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuizTable({ quizzes }) {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);

  const handleEdit = (quizId) => {
    navigate(`/builder/${quizId}`);
    setOpenMenu(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Meus Quizzes</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Criado em</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Leads</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Conversão</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {quizzes.map((quiz) => (
              <tr key={quiz.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleEdit(quiz.id)}
                    className="text-gray-800 font-medium hover:text-accent transition-colors text-left"
                  >
                    {quiz.name}
                  </button>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">
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
                <td className="px-6 py-4 text-gray-800 font-medium">{quiz.leads}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${quiz.conversion}%` }}
                      />
                    </div>
                    <span className="text-gray-600 text-sm">{quiz.conversion}%</span>
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
                    <div className="absolute right-6 top-12 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                      <button 
                        onClick={() => handleEdit(quiz.id)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit2 size={16} />
                        Editar
                      </button>
                      <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Copy size={16} />
                        Duplicar
                      </button>
                      <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <BarChart2 size={16} />
                        Analytics
                      </button>
                      <hr className="my-1" />
                      <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
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
    </div>
  );
}
