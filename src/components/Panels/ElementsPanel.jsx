'use client';

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
} from 'lucide-react';

const elements = [
  {
    category: 'Perguntas',
    items: [
      { type: 'single-choice', icon: CircleDot, label: 'Escolha Única' },
      { type: 'multiple-choice', icon: CheckSquare, label: 'Múltipla Escolha' },
      { type: 'question-icons', icon: Grid2X2, label: 'Escolha Visual' },
      { type: 'question-open', icon: MessageSquare, label: 'Pergunta Aberta' },
      { type: 'question-rating', icon: Star, label: 'Nota / Avaliação' },
    ]
  },
  {
    category: 'Mídia',
    items: [
      { type: 'video', icon: Video, label: 'Vídeo' },
      { type: 'audio', icon: Music, label: 'Áudio' },
      { type: 'image', icon: Image, label: 'Imagem' },
      { type: 'carousel', icon: LayoutGrid, label: 'Carrossel' },
    ]
  },
  {
    category: 'Conteúdo',
    items: [
      { type: 'text', icon: Type, label: 'Texto' },
      { type: 'button', icon: MousePointerClick, label: 'Botão' },
      { type: 'script', icon: FileText, label: 'Script' },
    ]
  },
  {
    category: 'Captura',
    items: [
      { type: 'lead-form', icon: UserPlus, label: 'Formulário Lead' },
    ]
  },
  {
    category: 'Gamificação',
    items: [
      { type: 'spin-wheel', icon: Disc, label: 'Roleta' },
      { type: 'scratch-card', icon: Gift, label: 'Raspadinha' },
    ]
  },
  {
    category: 'Final',
    items: [
      { type: 'result', icon: Trophy, label: 'Resultado' },
    ]
  }
];

export default function ElementsPanel({ onDragStart }) {
  const handleDragStart = (e, elementType) => {
    e.dataTransfer.setData('application/reactflow', elementType);
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(elementType);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-800">Elementos</h2>
        <p className="text-sm text-gray-500">Arraste para o canvas</p>
      </div>
      
      <div className="p-4 space-y-6">
        {elements.map((category) => (
          <div key={category.category}>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {category.category}
            </h3>
            <div className="space-y-2">
              {category.items.map((item) => {
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
          </div>
        ))}
      </div>
    </div>
  );
}
