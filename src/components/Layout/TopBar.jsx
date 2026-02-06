'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, Eye, Send, ChevronLeft, CheckCircle, Link2, MoreHorizontal } from 'lucide-react';
import useQuizStore from '@/store/quizStore';
import { useState, useCallback, useEffect, useRef } from 'react';
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
  
  // Overflow state
  const [showOverflow, setShowOverflow] = useState(false);
  const [visibleTabCount, setVisibleTabCount] = useState(6);
  const tabsContainerRef = useRef(null);
  const tabRefs = useRef({});

  // Nova estrutura de abas - mais organizada
  const tabs = [
    { id: 'canvas', label: 'Canvas', path: `/builder/${quizId || 'new'}` },
    { id: 'config', label: 'Configurações', path: `/diagnostic/${quizId || 'new'}` },
    { id: 'appearance', label: 'Aparência', path: `/appearance/${quizId || 'new'}` },
    { id: 'integration', label: 'Integração', path: `/integration/${quizId || 'new'}` },
    { id: 'gamification', label: 'Gamificação', path: `/gamification/${quizId || 'new'}` },
    { id: 'results', label: 'Resultados', path: `/results/${quizId || 'new'}` },
  ];

  // Verifica quais abas cabem no container
  useEffect(() => {
    const checkOverflow = () => {
      if (!tabsContainerRef.current) return;
      
      const container = tabsContainerRef.current;
      const containerWidth = container.offsetWidth - 48; // 48px para o botão overflow
      let totalWidth = 0;
      let visible = 0;

      tabs.forEach((tab, index) => {
        const tabEl = tabRefs.current[tab.id];
        if (tabEl) {
          const tabWidth = tabEl.offsetWidth + 4; // 4px gap
          if (totalWidth + tabWidth <= containerWidth) {
            totalWidth += tabWidth;
            visible = index + 1;
          }
        }
      });

      setVisibleTabCount(Math.max(visible, 2)); // Mínimo 2 tabs visíveis
    };

    // Delay inicial para garantir que os refs estão populados
    const timer = setTimeout(checkOverflow, 100);
    window.addEventListener('resize', checkOverflow);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [tabs]);

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

  const isTabActive = (tab) => {
    if (tab.id === 'canvas' && pathname.includes('/builder')) return true;
    if (tab.id === 'config' && pathname.includes('/diagnostic')) return true;
    if (tab.id === 'appearance' && pathname.includes('/appearance')) return true;
    if (tab.id === 'integration' && pathname.includes('/integration')) return true;
    if (tab.id === 'gamification' && pathname.includes('/gamification')) return true;
    if (tab.id === 'results' && pathname.includes('/results')) return true;
    return pathname === tab.path;
  };

  const visibleTabs = tabs.slice(0, visibleTabCount);
  const overflowTabs = tabs.slice(visibleTabCount);
  const hasOverflowActiveTab = overflowTabs.some(isTabActive);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4 flex-shrink-0">
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
              className="text-xl font-semibold text-gray-800 border-b-2 border-accent outline-none bg-transparent max-w-[200px]"
              autoFocus
            />
          ) : (
            <h1 
              className="text-xl font-semibold text-gray-800 cursor-pointer hover:text-accent transition-colors truncate max-w-[200px]"
              onClick={() => setIsEditing(true)}
              title={quizName}
            >
              {quizName}
            </h1>
          )}
          
          <span className={`flex items-center gap-1 text-sm flex-shrink-0 ${isSaved ? 'text-success' : 'text-amber-500'}`}>
            <Check size={16} />
            {isSaved ? 'Salvo' : 'Não salvo'}
          </span>

          {/* Status badge */}
          {quizStatus === 'Publicado' && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex-shrink-0">
              Publicado
            </span>
          )}
        </div>

        {/* Center - Tabs with overflow */}
        <nav 
          ref={tabsContainerRef}
          className="flex gap-1 bg-gray-100 rounded-lg p-1 flex-1 max-w-[600px] mx-4 relative"
        >
          {visibleTabs.map((tab) => {
            const isActive = isTabActive(tab);
            return (
              <Link
                key={tab.id}
                ref={el => tabRefs.current[tab.id] = el}
                href={tab.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-accent shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
          
          {/* Overflow dropdown */}
          {overflowTabs.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowOverflow(!showOverflow)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  showOverflow || hasOverflowActiveTab
                    ? 'bg-white text-accent shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Mais opções"
              >
                <MoreHorizontal size={18} />
              </button>
              
              {showOverflow && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowOverflow(false)}
                  />
                  <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[160px]">
                    {overflowTabs.map((tab) => {
                      const isActive = isTabActive(tab);
                      return (
                        <Link
                          key={tab.id}
                          href={tab.path}
                          onClick={() => setShowOverflow(false)}
                          className={`block w-full px-4 py-2 text-sm transition-colors text-left ${
                            isActive
                              ? 'bg-accent/10 text-accent'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {tab.label}
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
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
