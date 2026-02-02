'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Trophy, ChevronRight, ArrowLeft, User, Mail, Phone, Loader2, CheckCircle } from 'lucide-react';

export default function QuizPlayerPage() {
  const params = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Player state
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState([]);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '' });
  const [leadSaved, setLeadSaved] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  
  // Canvas data
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    fetchQuiz();
  }, [params.slug]);

  const fetchQuiz = async () => {
    try {
      // Try finding by slug via the public endpoint
      const res = await fetch(`/api/quizzes/${params.slug}/public`);
      if (!res.ok) {
        setError('Quiz não encontrado');
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      setQuiz(data);
      
      const canvasData = typeof data.canvasData === 'string' 
        ? JSON.parse(data.canvasData) 
        : data.canvasData;
      
      if (canvasData?.nodes) {
        setNodes(canvasData.nodes);
        setEdges(canvasData.edges || []);
        
        // Find start node
        const startNode = canvasData.nodes.find(n => n.type === 'start');
        if (startNode) {
          // Find the first connected node after start
          const startEdge = (canvasData.edges || []).find(e => e.source === startNode.id);
          if (startEdge) {
            setCurrentNodeId(startEdge.target);
          } else {
            setCurrentNodeId(startNode.id);
          }
        }
      }
      
      // Track view
      if (data.id) {
        fetch(`/api/quizzes/${data.id}/analytics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'quiz_started' }),
        }).catch(() => {});
      }
    } catch (err) {
      setError('Erro ao carregar quiz');
    } finally {
      setLoading(false);
    }
  };

  const getNextNode = useCallback((fromNodeId, optionIndex = null) => {
    // Find edges from this node
    const nodeEdges = edges.filter(e => e.source === fromNodeId);
    
    if (optionIndex !== null) {
      // Try to find edge from specific option handle
      const optionEdge = nodeEdges.find(e => e.sourceHandle === `option-${optionIndex}`);
      if (optionEdge) return optionEdge.target;
    }
    
    // Fallback to first edge
    if (nodeEdges.length > 0) return nodeEdges[0].target;
    return null;
  }, [edges]);

  const currentNode = nodes.find(n => n.id === currentNodeId);
  
  // Count question nodes for progress
  const questionNodes = nodes.filter(n => n.type === 'single-choice' || n.type === 'multiple-choice');
  const answeredCount = Object.keys(answers).length;
  const progress = questionNodes.length > 0 ? Math.round((answeredCount / questionNodes.length) * 100) : 0;

  const handleOptionSelect = (optionIndex) => {
    if (!currentNode) return;
    setSelectedOption(optionIndex);
    
    const option = currentNode.data.options?.[optionIndex];
    const optionScore = option?.score || 0;
    const newScore = score + optionScore;
    
    setScore(newScore);
    setAnswers(prev => ({
      ...prev,
      [currentNodeId]: { 
        question: currentNode.data.question, 
        answer: option?.text, 
        score: optionScore,
        optionIndex,
      }
    }));

    // Delay transition for visual feedback
    setTimeout(() => {
      setSelectedOption(null);
      const nextId = getNextNode(currentNodeId, optionIndex);
      
      if (nextId) {
        const nextNode = nodes.find(n => n.id === nextId);
        if (nextNode?.type === 'lead-form') {
          setHistory(prev => [...prev, currentNodeId]);
          setCurrentNodeId(nextId);
          setShowLeadForm(true);
        } else if (nextNode?.type === 'result') {
          setHistory(prev => [...prev, currentNodeId]);
          setCurrentNodeId(nextId);
          setShowResult(true);
        } else {
          setHistory(prev => [...prev, currentNodeId]);
          setCurrentNodeId(nextId);
        }
      } else {
        // No more connected nodes, show result
        setShowResult(true);
      }
    }, 500);
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await fetch(`/api/quizzes/${quiz.id}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadForm,
          answers,
          score,
          resultCategory: getResultCategory(score),
        }),
      });
      setLeadSaved(true);
      
      // Move to next node (result)
      const nextId = getNextNode(currentNodeId);
      if (nextId) {
        setTimeout(() => {
          setShowLeadForm(false);
          setHistory(prev => [...prev, currentNodeId]);
          setCurrentNodeId(nextId);
          const nextNode = nodes.find(n => n.id === nextId);
          if (nextNode?.type === 'result') {
            setShowResult(true);
          }
        }, 1000);
      } else {
        setTimeout(() => {
          setShowLeadForm(false);
          setShowResult(true);
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to save lead:', err);
    }
  };

  const handleGoBack = () => {
    if (history.length > 0) {
      const prevId = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentNodeId(prevId);
      setShowLeadForm(false);
      setShowResult(false);
      
      // Remove last answer and adjust score
      const lastAnswer = answers[prevId];
      if (lastAnswer) {
        setScore(prev => prev - (lastAnswer.score || 0));
        setAnswers(prev => {
          const newAnswers = { ...prev };
          delete newAnswers[prevId];
          return newAnswers;
        });
      }
    }
  };

  const getResultCategory = (finalScore) => {
    const maxPossible = questionNodes.reduce((max, q) => {
      const maxOptionScore = Math.max(...(q.data.options || []).map(o => o.score || 0));
      return max + maxOptionScore;
    }, 0);
    
    const percentage = maxPossible > 0 ? (finalScore / maxPossible) * 100 : 0;
    
    if (percentage >= 80) return 'Excelente';
    if (percentage >= 60) return 'Bom';
    if (percentage >= 40) return 'Regular';
    return 'Iniciante';
  };

  const getResultEmoji = (category) => {
    const emojis = {
      'Excelente': '🏆',
      'Bom': '⭐',
      'Regular': '👍',
      'Iniciante': '📚',
    };
    return emojis[category] || '🎯';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">Q</span>
          </div>
          <span className="text-white/80 text-sm font-medium">{quiz?.name}</span>
        </div>
        {!showResult && (
          <span className="text-white/60 text-sm">
            {answeredCount}/{questionNodes.length}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {!showResult && (
        <div className="px-4 mb-6">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          
          {/* Result Screen */}
          {showResult && (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-in">
              <div className="w-20 h-20 bg-gradient-to-br from-accent to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="text-white" size={40} />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {currentNode?.data?.title || 'Seu Resultado'}
              </h1>
              
              <div className="text-6xl mb-4">{getResultEmoji(getResultCategory(score))}</div>
              
              <div className="bg-gradient-to-br from-accent/10 to-purple-100 rounded-xl p-6 mb-6">
                <p className="text-sm text-gray-500 mb-1">Sua pontuação</p>
                <p className="text-4xl font-bold text-accent">{score} pts</p>
                <p className="text-lg font-medium text-purple-700 mt-2">
                  {getResultCategory(score)}
                </p>
              </div>
              
              <div className="space-y-3 text-left mb-6">
                <h3 className="font-semibold text-gray-700">Suas respostas:</h3>
                {Object.values(answers).map((answer, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-500">{answer.question}</p>
                    <p className="font-medium text-gray-800 flex items-center justify-between">
                      {answer.answer}
                      <span className="text-accent text-sm">+{answer.score}</span>
                    </p>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-xl font-medium transition-colors"
              >
                Refazer Quiz
              </button>
            </div>
          )}

          {/* Lead Form */}
          {showLeadForm && !showResult && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {leadSaved ? (
                <div className="text-center py-8">
                  <CheckCircle className="text-success mx-auto mb-4" size={48} />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Obrigado!</h2>
                  <p className="text-gray-500">Seus dados foram salvos. Carregando resultado...</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {currentNode?.data?.title || 'Quase lá!'}
                  </h2>
                  <p className="text-gray-500 mb-6">
                    Preencha seus dados para ver o resultado
                  </p>
                  
                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <User size={16} className="inline mr-1" />
                        Nome
                      </label>
                      <input
                        type="text"
                        value={leadForm.name}
                        onChange={(e) => setLeadForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                        placeholder="Seu nome"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Mail size={16} className="inline mr-1" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Phone size={16} className="inline mr-1" />
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      Ver Meu Resultado
                      <ChevronRight size={20} />
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* Question */}
          {!showLeadForm && !showResult && currentNode && (currentNode.type === 'single-choice' || currentNode.type === 'multiple-choice') && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {history.length > 0 && (
                <button 
                  onClick={handleGoBack}
                  className="flex items-center gap-1 text-gray-400 hover:text-gray-600 mb-4 text-sm transition-colors"
                >
                  <ArrowLeft size={16} />
                  Voltar
                </button>
              )}
              
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {currentNode.data.question || 'Pergunta'}
              </h2>
              
              <div className="space-y-3">
                {(currentNode.data.options || []).map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    disabled={selectedOption !== null}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      selectedOption === index
                        ? 'border-accent bg-accent/10 ring-2 ring-accent/20'
                        : selectedOption !== null
                        ? 'border-gray-200 opacity-50'
                        : 'border-gray-200 hover:border-accent/50 hover:bg-accent/5'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                      selectedOption === index
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-medium text-gray-800">{option.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content/Media nodes - pass through */}
          {!showLeadForm && !showResult && currentNode && !['single-choice', 'multiple-choice', 'lead-form', 'result', 'start'].includes(currentNode.type) && (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <p className="text-gray-800 font-medium mb-4">{currentNode.data?.contentType || currentNode.data?.mediaType || 'Conteúdo'}</p>
              <button
                onClick={() => {
                  const nextId = getNextNode(currentNodeId);
                  if (nextId) {
                    setHistory(prev => [...prev, currentNodeId]);
                    setCurrentNodeId(nextId);
                  }
                }}
                className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Continuar
              </button>
            </div>
          )}

          {/* Start node - auto advance */}
          {!showLeadForm && !showResult && currentNode?.type === 'start' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">Q</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{quiz?.name}</h2>
              <p className="text-gray-500 mb-6">{quiz?.description || 'Teste seus conhecimentos!'}</p>
              <button
                onClick={() => {
                  const nextId = getNextNode(currentNodeId);
                  if (nextId) {
                    setHistory(prev => [...prev, currentNodeId]);
                    setCurrentNodeId(nextId);
                  }
                }}
                className="bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto transition-colors"
              >
                Começar
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center">
        <span className="text-white/40 text-xs">Feito com Quiz Maker</span>
      </div>
    </div>
  );
}
