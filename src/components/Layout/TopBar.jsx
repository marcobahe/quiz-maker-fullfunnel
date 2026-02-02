import { Link, useLocation } from 'react-router-dom';
import { Check, Eye, Send, ChevronLeft } from 'lucide-react';
import useQuizStore from '../../store/quizStore';
import { useState } from 'react';

export default function TopBar({ quizId }) {
  const location = useLocation();
  const { quizName, setQuizName, isSaved, saveQuiz, publishQuiz } = useQuizStore();
  const [isEditing, setIsEditing] = useState(false);

  const tabs = [
    { label: 'Canvas', path: `/builder/${quizId || 'new'}` },
    { label: 'Diagnóstico', path: `/diagnostic/${quizId || 'new'}` },
    { label: 'Integração', path: `/integration/${quizId || 'new'}` },
  ];

  const handleNameChange = (e) => {
    setQuizName(e.target.value);
  };

  const handlePreview = () => {
    alert('Preview do quiz aberto em nova aba');
  };

  const handlePublish = () => {
    publishQuiz();
    alert('Quiz publicado com sucesso!');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft size={24} />
          </Link>
          
          {isEditing ? (
            <input
              type="text"
              value={quizName}
              onChange={handleNameChange}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
              className="text-xl font-semibold text-gray-800 border-b-2 border-accent outline-none bg-transparent"
              autoFocus
            />
          ) : (
            <h1 
              className="text-xl font-semibold text-gray-800 cursor-pointer hover:text-accent transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {quizName}
            </h1>
          )}
          
          <span className={`flex items-center gap-1 text-sm ${isSaved ? 'text-success' : 'text-amber-500'}`}>
            <Check size={16} />
            {isSaved ? 'Salvo' : 'Não salvo'}
          </span>
        </div>

        {/* Center - Tabs */}
        <nav className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path || 
              (tab.label === 'Canvas' && location.pathname.includes('/builder'));
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-accent shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            <Eye size={18} />
            Preview
          </button>
          <button 
            onClick={handlePublish}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors font-medium"
          >
            <Send size={18} />
            Publicar
          </button>
        </div>
      </div>
    </header>
  );
}
