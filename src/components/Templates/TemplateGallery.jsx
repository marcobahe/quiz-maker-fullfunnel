'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Sparkles, ArrowRight, FileText, Layers, ChevronRight } from 'lucide-react';
import { templates, categories } from '@/data/templates';

// ── Category badge colors ────────────────────────────────────────
const categoryColors = {
  'Lead Generation': 'bg-emerald-100 text-emerald-700',
  'Diagnóstico': 'bg-blue-100 text-blue-700',
  'Educação': 'bg-amber-100 text-amber-700',
  'Personalidade': 'bg-pink-100 text-pink-700',
  'Feedback': 'bg-yellow-100 text-yellow-700',
  'Vendas': 'bg-red-100 text-red-700',
  'Produto': 'bg-purple-100 text-purple-700',
};

// ── Template Card ────────────────────────────────────────────────
function TemplateCard({ template, onClick }) {
  const colorClass = categoryColors[template.category] || 'bg-gray-100 text-gray-600';
  const questionCount = template.canvasData.nodes.filter(
    (n) => n.type === 'composite' && n.data.elements?.some((el) => el.type === 'question-single' || el.type === 'question-multiple')
  ).length;

  return (
    <button
      onClick={() => onClick(template)}
      className="group text-left bg-white dark:bg-[#151837]/60 border border-gray-200 dark:border-white/10 rounded-xl p-5 hover:border-accent hover:shadow-lg transition-all duration-200 flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{template.icon}</span>
        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${colorClass}`}>
          {template.category}
        </span>
      </div>
      <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-accent transition-colors mb-1.5">
        {template.name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1 line-clamp-2">
        {template.description}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Layers size={12} />
            {questionCount} perguntas
          </span>
          <span className="flex items-center gap-1">
            <FileText size={12} />
            {template.scoreRanges.length} resultados
          </span>
        </div>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );
}

// ── Confirmation Modal ───────────────────────────────────────────
function ConfirmModal({ template, onConfirm, onCancel, loading }) {
  if (!template) return null;

  const questionCount = template.canvasData.nodes.filter(
    (n) => n.type === 'composite' && n.data.elements?.some((el) => el.type === 'question-single' || el.type === 'question-multiple')
  ).length;

  const hasLeadForm = template.canvasData.nodes.some(
    (n) => n.type === 'composite' && n.data.elements?.some((el) => el.type === 'lead-form')
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white dark:bg-[#151837] rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <span className="text-5xl block mb-3">{template.icon}</span>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{template.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{template.description}</p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Perguntas</span>
            <span className="font-medium text-gray-800 dark:text-white">{questionCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Faixas de resultado</span>
            <span className="font-medium text-gray-800 dark:text-white">{template.scoreRanges.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Formulário de lead</span>
            <span className="font-medium text-gray-800 dark:text-white">{hasLeadForm ? 'Sim ✅' : 'Não'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Categoria</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[template.category] || 'bg-gray-100 text-gray-600'}`}>
              {template.category}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-medium text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(template)}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Usar Template
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Gallery Component ───────────────────────────────────────
export default function TemplateGallery({ isOpen, onClose, onCreateBlank }) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const filtered = activeCategory === 'Todos'
    ? templates
    : templates.filter((t) => t.category === activeCategory);

  const handleConfirm = async (template) => {
    setLoading(true);
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          canvasData: template.canvasData,
          scoreRanges: template.scoreRanges,
          settings: template.settings,
        }),
      });

      if (res.ok) {
        const quiz = await res.json();
        router.push(`/builder/${quiz.id}`);
      } else {
        console.error('Failed to create quiz from template');
      }
    } catch (err) {
      console.error('Error creating quiz from template:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#151837] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Sparkles size={22} className="text-accent" />
              Escolha um Template
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Comece com um template pronto ou crie do zero
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-white/10 flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/15'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Create Blank Card */}
            <button
              onClick={() => {
                onClose();
                if (onCreateBlank) onCreateBlank();
              }}
              className="group text-left border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-5 hover:border-accent hover:bg-accent/5 transition-all duration-200 flex flex-col items-center justify-center min-h-[180px]"
            >
              <div className="w-14 h-14 bg-gray-100 dark:bg-white/10 group-hover:bg-accent/10 rounded-xl flex items-center justify-center mb-3 transition-colors">
                <FileText size={24} className="text-gray-400 group-hover:text-accent transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-600 dark:text-gray-300 group-hover:text-accent transition-colors mb-1">
                Criar do Zero
              </h3>
              <p className="text-xs text-gray-400 text-center">
                Comece com um canvas em branco
              </p>
            </button>

            {/* Template Cards */}
            {filtered.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onClick={setSelectedTemplate}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        template={selectedTemplate}
        onConfirm={handleConfirm}
        onCancel={() => setSelectedTemplate(null)}
        loading={loading}
      />
    </div>
  );
}
