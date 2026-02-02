'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical, BarChart3, ExternalLink } from 'lucide-react';
import useQuizStore from '@/store/quizStore';

const RANGE_COLORS = [
  'bg-red-400',
  'bg-orange-400',
  'bg-yellow-400',
  'bg-lime-400',
  'bg-green-400',
  'bg-teal-400',
  'bg-cyan-400',
  'bg-blue-400',
  'bg-indigo-400',
  'bg-purple-400',
];

export default function ScoreRangesEditor() {
  const scoreRanges = useQuizStore((s) => s.scoreRanges);
  const addScoreRange = useQuizStore((s) => s.addScoreRange);
  const updateScoreRange = useQuizStore((s) => s.updateScoreRange);
  const removeScoreRange = useQuizStore((s) => s.removeScoreRange);

  const [expandedId, setExpandedId] = useState(null);

  const handleAdd = () => {
    // Calculate suggested min based on existing ranges
    const maxExisting = scoreRanges.length > 0
      ? Math.max(...scoreRanges.map((r) => r.max || 0))
      : -1;

    const newRange = {
      id: `range-${Date.now()}`,
      min: maxExisting + 1,
      max: maxExisting + 30,
      title: `Faixa ${scoreRanges.length + 1}`,
      description: '',
      image: '',
      ctaText: '',
      ctaUrl: '',
    };
    addScoreRange(newRange);
    setExpandedId(newRange.id);
  };

  const handleUpdate = (id, field, value) => {
    // Convert min/max to numbers
    if (field === 'min' || field === 'max') {
      value = value === '' ? 0 : parseInt(value, 10) || 0;
    }
    updateScoreRange(id, { [field]: value });
  };

  const handleRemove = (id) => {
    removeScoreRange(id);
    if (expandedId === id) setExpandedId(null);
  };

  // Calculate the visual bar
  const maxScore = scoreRanges.length > 0
    ? Math.max(...scoreRanges.map((r) => r.max || 0), 100)
    : 100;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
            <BarChart3 className="text-accent" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Faixas de Resultado</h2>
            <p className="text-sm text-gray-500">Configure resultados personalizados baseados na pontuação</p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Adicionar Faixa
        </button>
      </div>

      {/* Visual Score Bar */}
      {scoreRanges.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-400 font-medium">0</span>
            <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden flex relative">
              {scoreRanges
                .slice()
                .sort((a, b) => a.min - b.min)
                .map((range, i) => {
                  const width = ((range.max - range.min + 1) / (maxScore + 1)) * 100;
                  const left = (range.min / (maxScore + 1)) * 100;
                  return (
                    <div
                      key={range.id}
                      className={`absolute h-full ${RANGE_COLORS[i % RANGE_COLORS.length]} flex items-center justify-center transition-all duration-300`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={`${range.title}: ${range.min} - ${range.max}`}
                    >
                      <span className="text-[10px] text-white font-bold truncate px-1">
                        {range.title}
                      </span>
                    </div>
                  );
                })}
            </div>
            <span className="text-xs text-gray-400 font-medium">{maxScore}</span>
          </div>
        </div>
      )}

      {/* Ranges List */}
      {scoreRanges.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <BarChart3 className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-400 text-sm mb-1">Nenhuma faixa configurada</p>
          <p className="text-gray-400 text-xs">
            Sem faixas, o resultado será genérico (Excelente, Bom, Regular, Iniciante)
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scoreRanges.map((range, index) => {
            const isExpanded = expandedId === range.id;
            return (
              <div
                key={range.id}
                className={`border rounded-xl transition-all ${
                  isExpanded ? 'border-accent/30 shadow-sm' : 'border-gray-200'
                }`}
              >
                {/* Header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : range.id)}
                >
                  <GripVertical size={16} className="text-gray-300" />
                  <div
                    className={`w-3 h-3 rounded-full ${RANGE_COLORS[index % RANGE_COLORS.length]}`}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-800 text-sm">
                      {range.title || `Faixa ${index + 1}`}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      ({range.min} – {range.max} pts)
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(range.id);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Remover faixa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Expanded Fields */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {/* Min / Max */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Pontuação Mínima
                        </label>
                        <input
                          type="number"
                          value={range.min}
                          onChange={(e) => handleUpdate(range.id, 'min', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Pontuação Máxima
                        </label>
                        <input
                          type="number"
                          value={range.max}
                          onChange={(e) => handleUpdate(range.id, 'max', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Título do Resultado
                      </label>
                      <input
                        type="text"
                        value={range.title}
                        onChange={(e) => handleUpdate(range.id, 'title', e.target.value)}
                        placeholder="Ex: Perfil Conservador"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
                      />
                    </div>

                    {/* Description */}
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Descrição
                      </label>
                      <textarea
                        value={range.description}
                        onChange={(e) => handleUpdate(range.id, 'description', e.target.value)}
                        placeholder="Descreva o que esse resultado significa..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none resize-none"
                      />
                    </div>

                    {/* Image URL */}
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        URL da Imagem (opcional)
                      </label>
                      <input
                        type="url"
                        value={range.image || ''}
                        onChange={(e) => handleUpdate(range.id, 'image', e.target.value)}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
                      />
                    </div>

                    {/* CTA */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Texto do CTA
                        </label>
                        <input
                          type="text"
                          value={range.ctaText || ''}
                          onChange={(e) => handleUpdate(range.id, 'ctaText', e.target.value)}
                          placeholder="Ex: Saiba mais"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          URL do CTA
                        </label>
                        <div className="relative">
                          <input
                            type="url"
                            value={range.ctaUrl || ''}
                            onChange={(e) => handleUpdate(range.id, 'ctaUrl', e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
                          />
                          {range.ctaUrl && (
                            <a
                              href={range.ctaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
