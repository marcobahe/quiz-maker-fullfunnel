'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  CircleDot, 
  CheckSquare, 
  Video, 
  Music, 
  Image, 
  LayoutGrid, 
  Type, 
  FileText, 
  UserPlus,
  Trophy,
  Grid2X2,
  Disc,
  Gift,
  MessageSquare,
  Star,
  MousePointerClick,
  Package,
  FlipVertical,
  Dices,
  Phone,
  Heart,
  MoreHorizontal,
  Gamepad2,
  Flag,
} from 'lucide-react';

// Definição das categorias/abas
const categories = [
  {
    id: 'perguntas',
    label: 'Perguntas',
    icon: MessageSquare,
    items: [
      { type: 'single-choice', icon: CircleDot, label: 'Escolha Única' },
      { type: 'multiple-choice', icon: CheckSquare, label: 'Múltipla Escolha' },
      { type: 'question-icons', icon: Grid2X2, label: 'Escolha Visual' },
      { type: 'question-swipe', icon: Heart, label: 'Swipe (Tinder)' },
      { type: 'question-open', icon: MessageSquare, label: 'Pergunta Aberta' },
      { type: 'question-rating', icon: Star, label: 'Nota / Avaliação' },
    ]
  },
  {
    id: 'midia',
    label: 'Mídia',
    icon: Image,
    items: [
      { type: 'video', icon: Video, label: 'Vídeo' },
      { type: 'audio', icon: Music, label: 'Áudio' },
      { type: 'image', icon: Image, label: 'Imagem' },
      { type: 'carousel', icon: LayoutGrid, label: 'Carrossel' },
    ]
  },
  {
    id: 'conteudo',
    label: 'Conteúdo',
    icon: Type,
    items: [
      { type: 'text', icon: Type, label: 'Texto' },
      { type: 'button', icon: MousePointerClick, label: 'Botão' },
      { type: 'script', icon: FileText, label: 'Script' },
    ]
  },
  {
    id: 'captura',
    label: 'Captura',
    icon: UserPlus,
    items: [
      { type: 'lead-form', icon: UserPlus, label: 'Formulário Lead' },
    ]
  },
  {
    id: 'gamificacao',
    label: 'Gamificação',
    icon: Gamepad2,
    items: [
      { type: 'spin-wheel', icon: Disc, label: 'Roleta' },
      { type: 'scratch-card', icon: Gift, label: 'Raspadinha' },
      { type: 'mystery-box', icon: Package, label: 'Mystery Box' },
      { type: 'card-flip', icon: FlipVertical, label: 'Card Flip' },
      { type: 'slot-machine', icon: Dices, label: 'Slot Machine' },
      { type: 'phone-call', icon: Phone, label: 'Chamada' },
    ]
  },
  {
    id: 'resultados',
    label: 'Resultados',
    icon: Flag,
    items: [
      { type: 'result', icon: Trophy, label: 'Resultado' },
    ]
  }
];

export default function ElementsPanel({ onDragStart }) {
  const [activeTab, setActiveTab] = useState('perguntas');
  const [showOverflow, setShowOverflow] = useState(false);
  const [visibleTabs, setVisibleTabs] = useState(categories.length);
  const tabsContainerRef = useRef(null);
  const tabRefs = useRef({});

  // Verifica quais abas cabem no container
  useEffect(() => {
    const checkOverflow = () => {
      if (!tabsContainerRef.current) return;
      
      const container = tabsContainerRef.current;
      const containerWidth = container.offsetWidth - 40; // 40px para o botão overflow
      let totalWidth = 0;
      let visible = 0;

      categories.forEach((cat, index) => {
        const tabEl = tabRefs.current[cat.id];
        if (tabEl) {
          const tabWidth = tabEl.offsetWidth + 4; // 4px gap
          if (totalWidth + tabWidth <= containerWidth) {
            totalWidth += tabWidth;
            visible = index + 1;
          }
        }
      });

      setVisibleTabs(visible);
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  const handleDragStart = (e, elementType) => {
    e.dataTransfer.setData('application/reactflow', elementType);
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(elementType);
  };

  const activeCategory = categories.find(c => c.id === activeTab);
  const visibleCategories = categories.slice(0, visibleTabs);
  const overflowCategories = categories.slice(visibleTabs);

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col overflow-hidden">
      {/* Header com abas */}
      <div className="border-b border-gray-200">
        <div className="p-3 pb-0">
          <h2 className="font-semibold text-gray-800 mb-1">Elementos</h2>
          <p className="text-xs text-gray-500 mb-2">Arraste para o canvas</p>
        </div>
        
        {/* Abas com overflow */}
        <div className="relative px-2 pb-2" ref={tabsContainerRef}>
          <div className="flex gap-1 overflow-hidden">
            {visibleCategories.map((category) => {
              const Icon = category.icon;
              const isActive = activeTab === category.id;
              return (
                <button
                  key={category.id}
                  ref={el => tabRefs.current[category.id] = el}
                  onClick={() => setActiveTab(category.id)}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={category.label}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{category.label}</span>
                </button>
              );
            })}
            
            {/* Botão de overflow */}
            {overflowCategories.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowOverflow(!showOverflow)}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                    showOverflow || overflowCategories.some(c => c.id === activeTab)
                      ? 'bg-accent/10 text-accent'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  title="Mais categorias"
                >
                  <MoreHorizontal size={14} />
                </button>
                
                {/* Dropdown de overflow */}
                {showOverflow && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowOverflow(false)}
                    />
                    <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[140px]">
                      {overflowCategories.map((category) => {
                        const Icon = category.icon;
                        const isActive = activeTab === category.id;
                        return (
                          <button
                            key={category.id}
                            onClick={() => {
                              setActiveTab(category.id);
                              setShowOverflow(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                              isActive
                                ? 'bg-accent/10 text-accent'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Icon size={16} />
                            {category.label}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Lista de elementos da categoria ativa */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeCategory && (
          <div className="space-y-2">
            {activeCategory.items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.type)}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-grab hover:bg-accent/10 hover:border-accent border border-transparent transition-all active:cursor-grabbing"
                >
                  <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-sm">
                    <Icon size={18} className="text-accent" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
