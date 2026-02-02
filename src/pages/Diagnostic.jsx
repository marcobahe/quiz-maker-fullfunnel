import { useParams } from 'react-router-dom';
import TopBar from '../components/Layout/TopBar';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const diagnosticItems = [
  { type: 'success', icon: CheckCircle, title: 'Estrutura do Quiz', description: 'O quiz possui início, perguntas e resultado conectados corretamente.' },
  { type: 'success', icon: CheckCircle, title: 'Formulário de Lead', description: 'Formulário de captura configurado antes do resultado.' },
  { type: 'warning', icon: AlertTriangle, title: 'Pontuação', description: 'Algumas opções não possuem pontuação definida. Considere adicionar para melhorar a gamificação.' },
  { type: 'info', icon: Info, title: 'Integrações', description: 'Nenhuma integração configurada. Configure para enviar leads automaticamente.' },
  { type: 'error', icon: AlertCircle, title: 'Perguntas Órfãs', description: '2 perguntas não estão conectadas ao fluxo principal.' },
];

const statusColors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconColors = {
  success: 'text-green-600',
  warning: 'text-amber-600',
  error: 'text-red-600',
  info: 'text-blue-600',
};

export default function Diagnostic() {
  const { id } = useParams();

  const successCount = diagnosticItems.filter(i => i.type === 'success').length;
  const totalCount = diagnosticItems.length;
  const healthScore = Math.round((successCount / totalCount) * 100);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopBar quizId={id} />
      
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Diagnóstico do Quiz</h1>
            <p className="text-gray-500">Verifique se seu quiz está configurado corretamente antes de publicar.</p>
          </div>

          {/* Health Score */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Saúde do Quiz</p>
                <p className="text-4xl font-bold text-gray-800">{healthScore}%</p>
              </div>
              <div className="w-24 h-24 relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                  <circle 
                    cx="48" cy="48" r="40" 
                    stroke={healthScore >= 80 ? '#10b981' : healthScore >= 50 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8" 
                    fill="none"
                    strokeDasharray={`${healthScore * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-800">{successCount}/{totalCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Items */}
          <div className="space-y-4">
            {diagnosticItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${statusColors[item.type]} flex items-start gap-4`}
                >
                  <Icon className={`${iconColors[item.type]} flex-shrink-0 mt-0.5`} size={20} />
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm opacity-80 mt-1">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
