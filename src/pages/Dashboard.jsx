import { useNavigate } from 'react-router-dom';
import { FileQuestion, Users, Eye, TrendingUp } from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import MetricCard from '../components/Dashboard/MetricCard';
import QuizTable from '../components/Dashboard/QuizTable';
import useQuizStore from '../store/quizStore';

const metrics = [
  { icon: FileQuestion, label: 'Quizzes Ativos', value: '12', change: '3', changeType: 'positive' },
  { icon: Users, label: 'Leads do Mês', value: '1.284', change: '18%', changeType: 'positive' },
  { icon: Eye, label: 'Visualizações', value: '8.432', change: '12%', changeType: 'positive' },
  { icon: TrendingUp, label: 'Taxa de Conversão', value: '54%', change: '5%', changeType: 'positive' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { quizzes } = useQuizStore();

  const handleCreateQuiz = () => {
    navigate('/builder/new');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onCreateQuiz={handleCreateQuiz} />
      
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Bem-vindo de volta! Aqui está um resumo dos seus quizzes.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>

        {/* Quizzes Table */}
        <QuizTable quizzes={quizzes} />
      </main>
    </div>
  );
}
