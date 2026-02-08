'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, Eye, Send, ChevronLeft, CheckCircle, Link2, MoreHorizontal } from 'lucide-react';
import useQuizStore from '@/store/quizStore';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PLAYER_ORIGIN } from '@/lib/urls';

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

// Largura estimada de cada tab (para cálculo de overflow)
const TAB_WIDTHS = {
  canvas: 72,       // "Canvas"
  config: 112,      // "Configurações"
  appearance: 92,   // "Aparência"
  integration: 96,  // "Integração"
  gamification: 104, // "Gamificação"
  results: 92,      // "Resultados"
};
const TAB_GAP = 4;
const TAB_PADDING = 8; // padding interno do container (p-1 = 4px cada lado)
const OVERFLOW_BTN_WIDTH = 44; // largura do botão "..."

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
  const headerRef = useRef(null);

  // Nova estrutura de abas - mais organizada
  const tabs = useMemo(() => [
    { id: 'canvas', label: 'Canvas', path: `/builder/${quizId || 'new'}` },
    { id: 'config', label: 'Configurações', path: `/diagnostic/${quizId || 'new'}` },
    { id: 'appearance', label: 'Aparência', path: `/appearance/${quizId || 'new'}` },
    { id: 'integration', label: 'Integração', path: `/integration/${quizId || 'new'}` },
    { id: 'gamification', label: 'Gamificação', path: `/gamification/${quizId || 'new'}` },
    { id: 'results', label: 'Resultados', path: `/results/${quizId || 'new'}` },
  ], [quizId]);

  // Soma total de todas as tabs
  const ALL_TABS_WIDTH = Object.values(TAB_WIDTHS).reduce((a, b) => a + b, 0) + (tabs.length - 1) * TAB_GAP + TAB_PADDING;

  // Função para calcular quantas abas cabem
  const calculateVisibleTabs = useCallback((headerWidth) => {
    // Espaço ocupado pelos lados (estimativa):
    // Left side: ~300px (back button + nome + salvo + badge)
    // Right side: ~280px (link + preview + publicar)
    // Gaps e padding: ~32px
    const sideSpace = 300 + 280 + 32;
    
    // Espaço disponível para as tabs
    const availableWidth = Math.max(headerWidth - sideSpace, 200);
    
    // Se cabem todas as tabs
    if (availableWidth >= ALL_TABS_WIDTH) {
      return tabs.length;
    }
    
    // Precisa do botão overflow - calcula quantas cabem
    const availableForTabs = availableWidth - OVERFLOW_BTN_WIDTH - TAB_GAP;
    let totalWidth = 0;
    let visible = 0;

    for (let i = 0; i < tabs.length; i++) {
      const tabWidth = TAB_WIDTHS[tabs[i].id] + (i > 0 ? TAB_GAP : 0);
      if (totalWidth + tabWidth <= availableForTabs) {
        totalWidth += tabWidth;
        visible = i + 1;
      } else {
        break;
      }
    }

    return Math.max(visible, 1); // Mínimo 1 tab visível
  }, [tabs, ALL_TABS_WIDTH]);

  // ResizeObserver para detectar mudanças de tamanho bidirecionalmente
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    // Cálculo inicial
    setVisibleTabCount(calculateVisibleTabs(header.offsetWidth));

    // ResizeObserver para mudanças contínuas
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setVisibleTabCount(calculateVisibleTabs(width));
      }
    });

    resizeObserver.observe(header);

    // Fallback: window resize (para casos onde ResizeObserver não pega)
    const handleWindowResize = () => {
      if (header) {
        setVisibleTabCount(calculateVisibleTabs(header.offsetWidth));
      }
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [calculateVisibleTabs]);

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
        const quizUrl = `${PLAYER_ORIGIN}/q/${quiz.slug}`;
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
    ? `${PLAYER_ORIGIN}/q/${quizSlug}`
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
    <header ref={headerRef} className="bg-white border-b border-gray-200 px-4 py-3">
      {/* Grid layout: 3 colunas com centro verdadeiramente centralizado */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Left side */}
        <div className="flex items-center gap-3 min-w-0">
          <Link 
            href="/" 
            className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
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
              className="text-lg font-semibold text-gray-800 border-b-2 border-accent outline-none bg-transparent min-w-0 max-w-[180px]"
              autoFocus
            />
          ) : (
            <h1 
              className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-accent transition-colors truncate min-w-0"
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
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex-shrink-0 hidden sm:inline-flex">
              Publicado
            </span>
          )}
        </div>

        {/* Center - Tabs with overflow (sempre centralizado) */}
        <nav className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {visibleTabs.map((tab) => {
            const isActive = isTabActive(tab);
            return (
              <Link
                key={tab.id}
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
        <div className="flex items-center gap-2 justify-end">
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
              <span className="hidden sm:inline">{linkCopied ? 'Copiado!' : 'Link'}</span>
            </button>
          )}
          
          <button 
            onClick={handlePreview}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            <Eye size={18} />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button 
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            <Send size={18} />
            <span className="hidden sm:inline">{publishing ? 'Publicando...' : 'Publicar'}</span>
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
