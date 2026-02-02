'use client';

import { X, Plus, Trash2, GripVertical, ChevronRight } from 'lucide-react';
import {
  Type, Video, Music, Image, LayoutGrid,
  CircleDot, CheckSquare, UserPlus, FileText,
} from 'lucide-react';
import useQuizStore from '@/store/quizStore';
import { createDefaultElement } from '@/components/Canvas/CompositeNode';

// ── Element type metadata ─────────────────────────────────────
const EL_META = {
  text:              { label: 'Texto',          icon: Type,        color: 'text-teal-600',   bg: 'bg-teal-100' },
  video:             { label: 'Vídeo',          icon: Video,       color: 'text-orange-600', bg: 'bg-orange-100' },
  audio:             { label: 'Áudio',          icon: Music,       color: 'text-orange-600', bg: 'bg-orange-100' },
  image:             { label: 'Imagem',         icon: Image,       color: 'text-orange-600', bg: 'bg-orange-100' },
  carousel:          { label: 'Carrossel',      icon: LayoutGrid,  color: 'text-orange-600', bg: 'bg-orange-100' },
  'question-single': { label: 'Escolha Única',  icon: CircleDot,   color: 'text-accent',     bg: 'bg-accent/10' },
  'question-multiple':{ label: 'Múltipla Escolha', icon: CheckSquare, color: 'text-accent',  bg: 'bg-accent/10' },
  'lead-form':       { label: 'Formulário Lead', icon: UserPlus,   color: 'text-blue-600',   bg: 'bg-blue-100' },
  script:            { label: 'Script',          icon: FileText,   color: 'text-teal-600',   bg: 'bg-teal-100' },
};

// ── Composite element editor sub-components ───────────────────

function QuestionElementEditor({ element, nodeId }) {
  const { updateNodeElement } = useQuizStore();

  const setQuestion = (val) => updateNodeElement(nodeId, element.id, { question: val });
  const setOptionText = (idx, val) => {
    const opts = [...(element.options || [])];
    opts[idx] = { ...opts[idx], text: val };
    updateNodeElement(nodeId, element.id, { options: opts });
  };
  const setOptionScore = (idx, val) => {
    const opts = [...(element.options || [])];
    opts[idx] = { ...opts[idx], score: parseInt(val) || 0 };
    updateNodeElement(nodeId, element.id, { options: opts });
  };
  const addOption = () => {
    const opts = [...(element.options || []), { text: `Opção ${(element.options?.length || 0) + 1}`, score: 0 }];
    updateNodeElement(nodeId, element.id, { options: opts });
  };
  const removeOption = (idx) => {
    updateNodeElement(nodeId, element.id, { options: (element.options || []).filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Pergunta</label>
        <textarea
          value={element.question || ''}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-accent focus:border-transparent resize-none"
          rows={2}
          placeholder="Pergunta…"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-500">Opções</label>
          <button onClick={addOption} className="text-accent text-xs flex items-center gap-0.5 hover:text-accent-hover">
            <Plus size={12} /> Adicionar
          </button>
        </div>
        <div className="space-y-1.5">
          {(element.options || []).map((opt, idx) => (
            <div key={idx} className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1.5">
              <input
                type="text"
                value={opt.text}
                onChange={(e) => setOptionText(idx, e.target.value)}
                className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-accent focus:border-transparent"
              />
              <input
                type="number"
                value={opt.score || 0}
                onChange={(e) => setOptionScore(idx, e.target.value)}
                className="w-14 bg-white border border-gray-200 rounded px-1.5 py-1 text-xs text-center focus:ring-1 focus:ring-accent focus:border-transparent"
                title="Pontuação"
              />
              <button onClick={() => removeOption(idx)} className="text-gray-400 hover:text-red-500 p-0.5">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TextElementEditor({ element, nodeId }) {
  const { updateNodeElement } = useQuizStore();
  return (
    <textarea
      value={element.content || ''}
      onChange={(e) => updateNodeElement(nodeId, element.id, { content: e.target.value })}
      className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-accent focus:border-transparent resize-none"
      rows={3}
      placeholder="Conteúdo de texto…"
    />
  );
}

function MediaElementEditor({ element, nodeId }) {
  const { updateNodeElement } = useQuizStore();
  return (
    <div className="space-y-2">
      <input
        type="text"
        value={element.title || ''}
        onChange={(e) => updateNodeElement(nodeId, element.id, { title: e.target.value })}
        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-accent focus:border-transparent"
        placeholder="Título…"
      />
      <input
        type="url"
        value={element.url || ''}
        onChange={(e) => updateNodeElement(nodeId, element.id, { url: e.target.value })}
        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-accent focus:border-transparent"
        placeholder="URL da mídia…"
      />
    </div>
  );
}

function LeadFormElementEditor({ element, nodeId }) {
  const { updateNodeElement } = useQuizStore();
  return (
    <input
      type="text"
      value={element.title || ''}
      onChange={(e) => updateNodeElement(nodeId, element.id, { title: e.target.value })}
      className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-accent focus:border-transparent"
      placeholder="Título do formulário…"
    />
  );
}

function ScriptElementEditor({ element, nodeId }) {
  const { updateNodeElement } = useQuizStore();
  return (
    <textarea
      value={element.content || ''}
      onChange={(e) => updateNodeElement(nodeId, element.id, { content: e.target.value })}
      className="w-full p-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-1 focus:ring-accent focus:border-transparent resize-none"
      rows={4}
      placeholder="// Script…"
    />
  );
}

function ElementEditor({ element, nodeId }) {
  const type = element.type;
  if (type === 'question-single' || type === 'question-multiple')
    return <QuestionElementEditor element={element} nodeId={nodeId} />;
  if (type === 'text') return <TextElementEditor element={element} nodeId={nodeId} />;
  if (['video', 'audio', 'image', 'carousel'].includes(type))
    return <MediaElementEditor element={element} nodeId={nodeId} />;
  if (type === 'lead-form') return <LeadFormElementEditor element={element} nodeId={nodeId} />;
  if (type === 'script') return <ScriptElementEditor element={element} nodeId={nodeId} />;
  return <p className="text-xs text-gray-400">Sem editor para "{type}"</p>;
}

// ── Element type picker (for adding to composite) ─────────────
const ADD_TYPES = [
  'text','video','audio','image','carousel',
  'question-single','question-multiple','lead-form','script',
];

// ── Main Panel ────────────────────────────────────────────────

export default function PropertiesPanel({ onClose }) {
  const nodes = useQuizStore((s) => s.nodes);
  const selectedNodeId = useQuizStore((s) => s.selectedNodeId);
  const updateNode = useQuizStore((s) => s.updateNode);
  const removeNode = useQuizStore((s) => s.removeNode);
  const gamificationEnabled = useQuizStore((s) => s.gamificationEnabled);
  const toggleGamification = useQuizStore((s) => s.toggleGamification);
  const addNodeElement = useQuizStore((s) => s.addNodeElement);
  const removeNodeElement = useQuizStore((s) => s.removeNodeElement);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  // ── Empty state ────────
  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Propriedades</h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1" title="Fechar painel">
              <ChevronRight size={18} />
            </button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400 p-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <p className="font-medium">Nenhum elemento selecionado</p>
            <p className="text-sm mt-1">Clique em um elemento no canvas para editar</p>
          </div>
        </div>
      </div>
    );
  }

  const { data, type, id: nodeId } = selectedNode;

  // ── delete handler ────
  const handleDelete = () => {
    if (typeof window !== 'undefined' && window.confirm('Tem certeza que deseja excluir este elemento?')) {
      removeNode(nodeId);
    }
  };

  // ── Legacy question handlers ────
  const handleQuestionChange = (value) => updateNode(nodeId, { question: value });
  const handleOptionChange = (idx, value) => {
    const opts = [...(data.options || [])];
    opts[idx] = { ...opts[idx], text: value };
    updateNode(nodeId, { options: opts });
  };
  const handleScoreChange = (idx, value) => {
    const opts = [...(data.options || [])];
    opts[idx] = { ...opts[idx], score: parseInt(value) || 0 };
    updateNode(nodeId, { options: opts });
  };
  const addOption = () => {
    const opts = [...(data.options || []), { text: `Opção ${(data.options?.length || 0) + 1}`, score: 0 }];
    updateNode(nodeId, { options: opts });
  };
  const removeOption = (idx) => updateNode(nodeId, { options: (data.options || []).filter((_, i) => i !== idx) });

  // ── Render ─────────────
  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Propriedades</h2>
        <div className="flex items-center gap-1">
          <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Excluir node">
            <Trash2 size={18} />
          </button>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1" title="Fechar painel">
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* ── COMPOSITE NODE ──────────────────────────────────── */}
        {type === 'composite' && (
          <>
            {/* Type badge */}
            <div className="bg-accent/5 rounded-lg p-3">
              <span className="text-xs font-semibold text-accent uppercase">Bloco Composto</span>
            </div>

            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Bloco</label>
              <input
                type="text"
                value={data.label || ''}
                onChange={(e) => updateNode(nodeId, { label: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Nome do bloco…"
              />
            </div>

            {/* Elements list */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Elementos ({(data.elements || []).length})
              </label>

              <div className="space-y-3">
                {(data.elements || []).map((el) => {
                  const meta = EL_META[el.type] || { label: el.type, icon: Type, color: 'text-gray-600', bg: 'bg-gray-100' };
                  const ElIcon = meta.icon;
                  return (
                    <div key={el.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Element header */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                        <div className={`w-6 h-6 ${meta.bg} rounded flex items-center justify-center`}>
                          <ElIcon size={12} className={meta.color} />
                        </div>
                        <span className="text-xs font-medium text-gray-600 flex-1">{meta.label}</span>
                        <button
                          onClick={() => removeNodeElement(nodeId, el.id)}
                          className="text-gray-400 hover:text-red-500 p-0.5"
                          title="Remover elemento"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      {/* Element editor */}
                      <div className="p-2.5">
                        <ElementEditor element={el} nodeId={nodeId} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add element dropdown */}
              <details className="mt-3 group">
                <summary className="cursor-pointer text-accent hover:text-accent-hover text-sm font-medium flex items-center gap-1 select-none">
                  <Plus size={16} /> Adicionar elemento
                </summary>
                <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                  {ADD_TYPES.map((t) => {
                    const m = EL_META[t];
                    if (!m) return null;
                    const TIcon = m.icon;
                    return (
                      <button
                        key={t}
                        onClick={() => addNodeElement(nodeId, createDefaultElement(t))}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-accent/5 transition-colors"
                      >
                        <div className={`w-6 h-6 ${m.bg} rounded flex items-center justify-center`}>
                          <TIcon size={12} className={m.color} />
                        </div>
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </details>
            </div>

            {/* Gamification (if has question elements) */}
            {(data.elements || []).some((el) => el.type.startsWith('question-')) && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Gamificação</p>
                    <p className="text-sm text-gray-500">Mostrar pontos ao responder</p>
                  </div>
                  <button
                    onClick={toggleGamification}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      gamificationEnabled ? 'bg-accent' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      gamificationEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── LEGACY NODES ────────────────────────────────────── */}
        {type !== 'composite' && (
          <>
            {/* Type badge */}
            <div className="bg-accent/5 rounded-lg p-3">
              <span className="text-xs font-semibold text-accent uppercase">
                {type === 'single-choice' ? 'Escolha Única' :
                 type === 'multiple-choice' ? 'Múltipla Escolha' :
                 type === 'lead-form' ? 'Formulário Lead' :
                 type === 'result' ? 'Resultado' : type}
              </span>
            </div>

            {/* Question types */}
            {(type === 'single-choice' || type === 'multiple-choice') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pergunta</label>
                  <textarea
                    value={data.question || ''}
                    onChange={(e) => handleQuestionChange(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Digite sua pergunta…"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Opções</label>
                    <button onClick={addOption} className="text-accent hover:text-accent-hover text-sm font-medium flex items-center gap-1">
                      <Plus size={16} /> Adicionar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(data.options || []).map((option, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                        <GripVertical size={16} className="text-gray-400 cursor-grab" />
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 bg-white border border-gray-200 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:border-transparent"
                        />
                        <input
                          type="number"
                          value={option.score || 0}
                          onChange={(e) => handleScoreChange(index, e.target.value)}
                          className="w-16 bg-white border border-gray-200 rounded px-2 py-1.5 text-sm text-center focus:ring-1 focus:ring-accent focus:border-transparent"
                          title="Pontuação"
                        />
                        <button onClick={() => removeOption(index)} className="text-gray-400 hover:text-red-500 p-1">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">Gamificação</p>
                      <p className="text-sm text-gray-500">Mostrar pontos ao responder</p>
                    </div>
                    <button
                      onClick={toggleGamification}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        gamificationEnabled ? 'bg-accent' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        gamificationEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Lead Form */}
            {type === 'lead-form' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título do Formulário</label>
                <input
                  type="text"
                  value={data.title || 'Capture seus dados'}
                  onChange={(e) => updateNode(nodeId, { title: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            )}

            {/* Result */}
            {type === 'result' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título do Resultado</label>
                <input
                  type="text"
                  value={data.title || 'Seu Resultado'}
                  onChange={(e) => updateNode(nodeId, { title: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
