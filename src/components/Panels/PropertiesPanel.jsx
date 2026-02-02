'use client';

import { useState } from 'react';
import {
  X, Plus, Trash2, GripVertical, ChevronDown, ChevronRight,
  CircleDot, CheckSquare, Video, Music, Image, LayoutGrid,
  Type, FileText, UserPlus, PanelRightClose,
} from 'lucide-react';
import useQuizStore from '@/store/quizStore';
import { createDefaultElement } from '@/components/Canvas/CompositeNode';

// ── Element type metadata ────────────────────────────────────────

const ELEMENT_META = {
  text:              { label: 'Texto',           icon: Type,        color: 'teal' },
  video:             { label: 'Vídeo',           icon: Video,       color: 'orange' },
  audio:             { label: 'Áudio',           icon: Music,       color: 'orange' },
  image:             { label: 'Imagem',          icon: Image,       color: 'orange' },
  carousel:          { label: 'Carrossel',       icon: LayoutGrid,  color: 'orange' },
  'question-single': { label: 'Escolha Única',   icon: CircleDot,   color: 'purple' },
  'question-multiple':{ label: 'Múltipla Escolha',icon: CheckSquare, color: 'purple' },
  'lead-form':       { label: 'Formulário Lead', icon: UserPlus,    color: 'blue' },
  script:            { label: 'Script',          icon: FileText,    color: 'teal' },
};

const ELEMENT_TYPES = [
  { type: 'text',              label: 'Texto' },
  { type: 'video',             label: 'Vídeo' },
  { type: 'audio',             label: 'Áudio' },
  { type: 'image',             label: 'Imagem' },
  { type: 'carousel',          label: 'Carrossel' },
  { type: 'question-single',   label: 'Escolha Única' },
  { type: 'question-multiple',  label: 'Múltipla Escolha' },
  { type: 'lead-form',         label: 'Formulário Lead' },
  { type: 'script',            label: 'Script' },
];

const COLOR_CLASSES = {
  teal:   'bg-teal-100 text-teal-600',
  orange: 'bg-orange-100 text-orange-600',
  purple: 'bg-accent/10 text-accent',
  blue:   'bg-blue-100 text-blue-600',
  gray:   'bg-gray-100 text-gray-600',
};

// ── Composite Element Editors ────────────────────────────────────

function TextElementEditor({ element, nodeId }) {
  const updateNodeElement = useQuizStore((s) => s.updateNodeElement);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo</label>
      <textarea
        value={element.content || ''}
        onChange={(e) => updateNodeElement(nodeId, element.id, { content: e.target.value })}
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none text-sm"
        rows={3}
        placeholder="Digite o texto..."
      />
    </div>
  );
}

function MediaElementEditor({ element, nodeId }) {
  const updateNodeElement = useQuizStore((s) => s.updateNodeElement);
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
        <input
          type="text"
          value={element.title || ''}
          onChange={(e) => updateNodeElement(nodeId, element.id, { title: e.target.value })}
          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
          placeholder="Título..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
        <input
          type="text"
          value={element.url || ''}
          onChange={(e) => updateNodeElement(nodeId, element.id, { url: e.target.value })}
          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
          placeholder="https://..."
        />
      </div>
    </div>
  );
}

function QuestionElementEditor({ element, nodeId }) {
  const updateNodeElement = useQuizStore((s) => s.updateNodeElement);

  const handleOptionChange = (index, value) => {
    const opts = [...(element.options || [])];
    opts[index] = { ...opts[index], text: value };
    updateNodeElement(nodeId, element.id, { options: opts });
  };
  const handleScoreChange = (index, value) => {
    const opts = [...(element.options || [])];
    opts[index] = { ...opts[index], score: parseInt(value) || 0 };
    updateNodeElement(nodeId, element.id, { options: opts });
  };
  const addOption = () => {
    const opts = [
      ...(element.options || []),
      { text: `Opção ${(element.options?.length || 0) + 1}`, score: 0 },
    ];
    updateNodeElement(nodeId, element.id, { options: opts });
  };
  const removeOption = (index) => {
    const opts = (element.options || []).filter((_, i) => i !== index);
    updateNodeElement(nodeId, element.id, { options: opts });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Pergunta</label>
        <textarea
          value={element.question || ''}
          onChange={(e) => updateNodeElement(nodeId, element.id, { question: e.target.value })}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none text-sm"
          rows={2}
          placeholder="Digite a pergunta..."
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Opções</label>
          <button
            onClick={addOption}
            className="text-accent hover:text-accent-hover text-sm font-medium flex items-center gap-1"
          >
            <Plus size={16} /> Adicionar
          </button>
        </div>
        <div className="space-y-2">
          {(element.options || []).map((option, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
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
    </div>
  );
}

function LeadFormElementEditor({ element, nodeId }) {
  const updateNodeElement = useQuizStore((s) => s.updateNodeElement);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
      <input
        type="text"
        value={element.title || ''}
        onChange={(e) => updateNodeElement(nodeId, element.id, { title: e.target.value })}
        className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
        placeholder="Título do formulário..."
      />
    </div>
  );
}

function ScriptElementEditor({ element, nodeId }) {
  const updateNodeElement = useQuizStore((s) => s.updateNodeElement);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Código</label>
      <textarea
        value={element.content || ''}
        onChange={(e) => updateNodeElement(nodeId, element.id, { content: e.target.value })}
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none text-sm font-mono"
        rows={4}
        placeholder="// Seu script aqui..."
      />
    </div>
  );
}

function ElementEditor({ element, nodeId }) {
  switch (element.type) {
    case 'text':
      return <TextElementEditor element={element} nodeId={nodeId} />;
    case 'video':
    case 'audio':
    case 'image':
    case 'carousel':
      return <MediaElementEditor element={element} nodeId={nodeId} />;
    case 'question-single':
    case 'question-multiple':
      return <QuestionElementEditor element={element} nodeId={nodeId} />;
    case 'lead-form':
      return <LeadFormElementEditor element={element} nodeId={nodeId} />;
    case 'script':
      return <ScriptElementEditor element={element} nodeId={nodeId} />;
    default:
      return <div className="text-gray-400 text-sm">Editor não disponível para {element.type}</div>;
  }
}

// ── Main Panel ───────────────────────────────────────────────────

export default function PropertiesPanel({ onClose }) {
  const selectedNodeId = useQuizStore((s) => s.selectedNodeId);
  const nodes = useQuizStore((s) => s.nodes);
  const updateNode = useQuizStore((s) => s.updateNode);
  const removeNode = useQuizStore((s) => s.removeNode);
  const gamificationEnabled = useQuizStore((s) => s.gamificationEnabled);
  const toggleGamification = useQuizStore((s) => s.toggleGamification);
  const addNodeElement = useQuizStore((s) => s.addNodeElement);
  const removeNodeElement = useQuizStore((s) => s.removeNodeElement);

  const [expandedElements, setExpandedElements] = useState({});
  const [showAddMenu, setShowAddMenu] = useState(false);

  const freshNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;

  if (!freshNode) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Propriedades</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              title="Fechar painel"
            >
              <PanelRightClose size={18} />
            </button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400 p-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <p className="font-medium">Nenhum elemento selecionado</p>
            <p className="text-sm mt-1">Clique em um elemento no canvas para editar suas propriedades</p>
          </div>
        </div>
      </div>
    );
  }

  const { data, type } = freshNode;
  const nodeId = freshNode.id;

  const toggleElement = (elId) => {
    setExpandedElements((prev) => ({ ...prev, [elId]: !prev[elId] }));
  };

  // ── Legacy node handlers ──────────────────────────────────────

  const handleQuestionChange = (value) => updateNode(nodeId, { question: value });

  const handleOptionChange = (index, value) => {
    const newOptions = [...(data.options || [])];
    newOptions[index] = { ...newOptions[index], text: value };
    updateNode(nodeId, { options: newOptions });
  };

  const handleScoreChange = (index, value) => {
    const newOptions = [...(data.options || [])];
    newOptions[index] = { ...newOptions[index], score: parseInt(value) || 0 };
    updateNode(nodeId, { options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...(data.options || []), { text: `Opção ${(data.options?.length || 0) + 1}`, score: 0 }];
    updateNode(nodeId, { options: newOptions });
  };

  const removeOption = (index) => {
    const newOptions = (data.options || []).filter((_, i) => i !== index);
    updateNode(nodeId, { options: newOptions });
  };

  const handleDelete = () => {
    if (typeof window !== 'undefined' && window.confirm('Tem certeza que deseja excluir este elemento?')) {
      removeNode(nodeId);
    }
  };

  const handleAddElement = (elType) => {
    addNodeElement(nodeId, createDefaultElement(elType));
    setShowAddMenu(false);
  };

  const typeLabel =
    type === 'single-choice'   ? 'Escolha Única' :
    type === 'multiple-choice' ? 'Múltipla Escolha' :
    type === 'lead-form'       ? 'Formulário Lead' :
    type === 'result'          ? 'Resultado' :
    type === 'composite'       ? 'Bloco Composto' :
    type === 'start'           ? 'Início' : type;

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Propriedades</h2>
        <div className="flex items-center gap-1">
          {type !== 'start' && (
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              title="Excluir"
            >
              <Trash2 size={18} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              title="Fechar painel"
            >
              <PanelRightClose size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Node Type Badge */}
        <div className="bg-accent/5 rounded-lg p-3">
          <span className="text-xs font-semibold text-accent uppercase">{typeLabel}</span>
        </div>

        {/* ───────────────────── Composite Node ───────────────────── */}
        {type === 'composite' && (
          <>
            {/* Block label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Bloco</label>
              <input
                type="text"
                value={data.label || ''}
                onChange={(e) => updateNode(nodeId, { label: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Nome do bloco..."
              />
            </div>

            {/* Elements list */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Elementos ({(data.elements || []).length})
              </label>
              <div className="space-y-2">
                {(data.elements || []).map((el) => {
                  const meta = ELEMENT_META[el.type] || { label: el.type, icon: Type, color: 'gray' };
                  const Icon = meta.icon;
                  const isExpanded = expandedElements[el.id] !== false;
                  const colorClass = COLOR_CLASSES[meta.color] || COLOR_CLASSES.gray;

                  return (
                    <div key={el.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Element header (collapsible) */}
                      <div
                        className="flex items-center gap-2 p-2.5 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleElement(el.id)}
                      >
                        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${colorClass}`}>
                          <Icon size={12} />
                        </div>
                        <span className="flex-1 text-sm font-medium text-gray-700 truncate">
                          {meta.label}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNodeElement(nodeId, el.id);
                          }}
                          className="text-gray-400 hover:text-red-500 p-0.5 shrink-0"
                        >
                          <X size={14} />
                        </button>
                        {isExpanded
                          ? <ChevronDown size={14} className="text-gray-400 shrink-0" />
                          : <ChevronRight size={14} className="text-gray-400 shrink-0" />}
                      </div>

                      {/* Element properties (expanded) */}
                      {isExpanded && (
                        <div className="p-3 border-t border-gray-100">
                          <ElementEditor element={el} nodeId={nodeId} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add element button + dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-accent hover:text-accent transition-colors text-sm font-medium"
              >
                <Plus size={16} /> Adicionar Elemento
              </button>
              {showAddMenu && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-56 overflow-y-auto">
                  {ELEMENT_TYPES.map(({ type: elType, label }) => {
                    const meta = ELEMENT_META[elType];
                    const Icon = meta?.icon || Type;
                    return (
                      <button
                        key={elType}
                        onClick={() => handleAddElement(elType)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-accent/5 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        <Icon size={14} className="text-accent" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Gamification toggle (if composite has question elements) */}
            {(data.elements || []).some(
              (el) => el.type === 'question-single' || el.type === 'question-multiple',
            ) && (
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
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        gamificationEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ───────────────── Legacy: Question Nodes ───────────────── */}
        {(type === 'single-choice' || type === 'multiple-choice') && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pergunta</label>
              <textarea
                value={data.question || ''}
                onChange={(e) => handleQuestionChange(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                rows={3}
                placeholder="Digite sua pergunta..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Opções</label>
                <button
                  onClick={addOption}
                  className="text-accent hover:text-accent-hover text-sm font-medium flex items-center gap-1"
                >
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
                    <button
                      onClick={() => removeOption(index)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
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
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      gamificationEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ───────────────── Legacy: Lead Form ────────────────────── */}
        {type === 'lead-form' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título do Formulário
            </label>
            <input
              type="text"
              value={data.title || 'Capture seus dados'}
              onChange={(e) => updateNode(nodeId, { title: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        )}

        {/* ───────────────── Legacy: Result ────────────────────────── */}
        {type === 'result' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título do Resultado
            </label>
            <input
              type="text"
              value={data.title || 'Seu Resultado'}
              onChange={(e) => updateNode(nodeId, { title: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        )}
      </div>
    </div>
  );
}
