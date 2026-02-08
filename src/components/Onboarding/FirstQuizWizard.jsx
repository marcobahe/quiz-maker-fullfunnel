'use client';

import { useState } from 'react';
import { Sparkles, FileText, PenLine, Wand2, ChevronRight, Rocket } from 'lucide-react';

const OPTIONS = [
  {
    id: 'ai',
    icon: Wand2,
    title: 'Criar com IA',
    description: 'Descreva seu quiz e a IA cria para você em segundos',
    badge: '✨ Recomendado',
    gradient: 'from-purple-500 to-indigo-500',
    hoverGradient: 'hover:from-purple-600 hover:to-indigo-600',
  },
  {
    id: 'template',
    icon: FileText,
    title: 'Usar Template',
    description: 'Escolha um template pronto e personalize',
    badge: null,
    gradient: 'from-blue-500 to-cyan-500',
    hoverGradient: 'hover:from-blue-600 hover:to-cyan-600',
  },
  {
    id: 'blank',
    icon: PenLine,
    title: 'Começar do Zero',
    description: 'Canvas em branco para criar livremente',
    badge: null,
    gradient: 'from-gray-600 to-gray-700',
    hoverGradient: 'hover:from-gray-700 hover:to-gray-800',
  },
];

export default function FirstQuizWizard({ onSelectAI, onSelectTemplate, onSelectBlank }) {
  const [hoveredOption, setHoveredOption] = useState(null);

  const handleSelect = (optionId) => {
    switch (optionId) {
      case 'ai':
        onSelectAI?.();
        break;
      case 'template':
        onSelectTemplate?.();
        break;
      case 'blank':
        onSelectBlank?.();
        break;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
          <Rocket size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Crie seu primeiro Quiz! 🎉
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md">
          Escolha como você quer começar. Você pode mudar tudo depois!
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const isHovered = hoveredOption === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              onMouseEnter={() => setHoveredOption(option.id)}
              onMouseLeave={() => setHoveredOption(null)}
              className={`
                relative group flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300
                ${isHovered 
                  ? 'border-transparent shadow-xl scale-[1.02]' 
                  : 'border-gray-200 dark:border-white/10 hover:border-gray-300 shadow-sm'
                }
                bg-white dark:bg-[#151837]/60
              `}
            >
              {/* Badge */}
              {option.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  {option.badge}
                </span>
              )}

              {/* Icon */}
              <div
                className={`
                  w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300
                  ${isHovered 
                    ? `bg-gradient-to-br ${option.gradient} shadow-lg` 
                    : 'bg-gray-100 dark:bg-white/10'
                  }
                `}
              >
                <Icon 
                  size={28} 
                  className={`transition-colors duration-300 ${isHovered ? 'text-white' : 'text-gray-600'}`} 
                />
              </div>

              {/* Text */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {option.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                {option.description}
              </p>

              {/* CTA */}
              <div
                className={`
                  flex items-center gap-1 text-sm font-semibold transition-all duration-300
                  ${isHovered ? 'text-purple-600' : 'text-gray-400'}
                `}
              >
                Começar
                <ChevronRight 
                  size={16} 
                  className={`transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
                />
              </div>

              {/* Hover gradient border effect */}
              {isHovered && (
                <div 
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${option.gradient} opacity-10 pointer-events-none`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tip */}
      <div className="mt-8 flex items-center gap-2 text-sm text-gray-400">
        <Sparkles size={14} className="text-purple-400" />
        <span>Dica: A IA analisa seu site automaticamente para criar perguntas relevantes</span>
      </div>
    </div>
  );
}
