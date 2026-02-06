'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, Eye, Send, ChevronLeft, CheckCircle, Link2 } from 'lucide-react';
import useQuizStore from '@/store/quizStore';
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Toast component
function Toast({ message, show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-[100] bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"
        >
          <CheckCircle size={18} />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function TopBar({ quizId }) {
  const pathname = usePathname();
  const { quizName, setQuizName, isSaved, nodes, edges, quizStatus, scoreRanges, quizSettings } = useQuizStore();
  const [isEditing, setIsEditing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [quizSlug, setQuizSlug] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Nova estrutura de abas - mais organizada
  const tabs = [
    { label: 'Canvas', path: `/builder/${quizId || 'new'}` },
    { label: 'Configurações', path: `/diagnostic/${quizId || 'new'}` },
    { label: 'Aparência', path: `/appearance/${quizId || 'new'}` },
    { label: 'Integração', path: `/integration/${quizId || 'new'}` },
  ];

  // Carregar slug do quiz para mostrar botão de link
  useEffect(() => {
    if (quizId && quizStatus === 'Publicado') {
      fetch(`/api/quizzes/${quizId}/public`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.slug) setQuizSlug(data.slug);
        })
        .catch(() => {});
    }
  }, [quizId, quizStatus]);

  const handleNameChange = (e) => {
    setQuizName(e.target.value);
  };

  const handlePublish = useCallback(async () => {
    if (!quizId || publishing) return;
    setPublishing(true);
    
    try {
      // Pega dados frescos do store para publicar
      const { nodes: currentNodes, edges: currentEdges, quizName: currentName, scoreRanges: currentScoreRanges, quizSettings: currentSettings } = useQuizStore.getState();
      
      const res = await fetch(`/api/quizzes/${quizId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'published',
          name: currentName,
          canvasData: JSON.stringify({ nodes: currentNodes, edges: currentEdges }),
          scoreRanges: currentScoreRanges,
          settings: currentSettings,
        }),
      });
      if (res.ok) {
        const quiz = await res.json();
        useQuizStore.getState().publishQuiz();
        setQuizSlug(quiz.slug);
        
        // Copiar link automaticamente para a área de transferência
        const quizUrl = `${window.location.origin}/q/${quiz.slug}`;
        await navigator.clipboard.writeText(quizUrl);
        
        // Mostrar toast de sucesso
        setToastMessage('Publicado! Link copiado ✓');
        setShowToast(true);
      }
    } catch (err) {
      console.error('Failed to publish:', err);
      setToastMessage('Erro ao publicar');
      setShowToast(true);
    } finally {
      setPublishing(false);
    }
  }, [quizId, publishing]);

  const permanentQuizUrl = quizSlug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/q/${quizSlug}`
    : '';

  const copyPermanentLink = () => {
    navigator.clipboard.writeText(permanentQuizUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handlePreview = () => {
    if (quizId) {
      window.open(`/q/${quizId}?preview=true`, '_blank');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
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

          {/* Status badge */}
          {quizStatus === 'Publicado' && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Publicado
            </span>
          )}
        </div>

        {/* Center - Tabs */}
        <nav className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path || 
              (tab.label === 'Canvas' && pathname.includes('/builder')) ||
              (tab.label === 'Configurações' && pathname.includes('/diagnostic')) ||
              (tab.label === 'Aparência' && pathname.includes('/appearance'));
            return (
              <Link
                key={tab.path}
                href={tab.path}
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
          {/* Botão de Link - aparece quando quiz está publicado */}
          {quizSlug && (
            <button 
              onClick={copyPermanentLink}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                linkCopied
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
              title="Copiar link do quiz"
            >
              {linkCopied ? <Check size={16} /> : <Link2 size={16} />}
              {linkCopied ? 'Copiado!' : 'Link'}
            </button>
          )}
          
          <button 
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            <Eye size={18} />
            Preview
          </button>
          <button 
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            <Send size={18} />
            {publishing ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>

      {/* Toast de sucesso */}
      <Toast 
        message={toastMessage} 
        show={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </header>
  );
}
