'use client';

import { useState, useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Plus,
  GripVertical,
  X,
  Trash2,
  Type,
  Video,
  Music,
  Image,
  LayoutGrid,
  CircleDot,
  CheckSquare,
  UserPlus,
  FileText,
  Info,
} from 'lucide-react';
import useQuizStore from '@/store/quizStore';
import InlineEdit from './InlineEdit';
import { AVAILABLE_VARIABLES, parseVariableSegments } from '@/lib/dynamicVariables';

// ── Shared lookups ──────────────────────────────────────────────
const ICONS = {
  text: Type,
  audio: Music,
  video: Video,
  image: Image,
  carousel: LayoutGrid,
  'question-single': CircleDot,
  'question-multiple': CheckSquare,
  'question-icons': LayoutGrid,
  'lead-form': UserPlus,
  script: FileText,
};

const COLORS = {
  text: { bg: 'bg-teal-100', text: 'text-teal-600' },
  audio: { bg: 'bg-orange-100', text: 'text-orange-600' },
  video: { bg: 'bg-orange-100', text: 'text-orange-600' },
  image: { bg: 'bg-orange-100', text: 'text-orange-600' },
  carousel: { bg: 'bg-orange-100', text: 'text-orange-600' },
  'question-single': { bg: 'bg-accent/10', text: 'text-accent' },
  'question-multiple': { bg: 'bg-accent/10', text: 'text-accent' },
  'question-icons': { bg: 'bg-accent/10', text: 'text-accent' },
  'lead-form': { bg: 'bg-blue-100', text: 'text-blue-600' },
  script: { bg: 'bg-teal-100', text: 'text-teal-600' },
};

const ELEMENT_TYPES = [
  { type: 'text', label: 'Texto' },
  { type: 'video', label: 'Vídeo' },
  { type: 'audio', label: 'Áudio' },
  { type: 'image', label: 'Imagem' },
  { type: 'carousel', label: 'Carrossel' },
  { type: 'question-single', label: 'Escolha Única' },
  { type: 'question-multiple', label: 'Múltipla Escolha' },
  { type: 'question-icons', label: 'Escolha Visual' },
  { type: 'lead-form', label: 'Formulário Lead' },
  { type: 'script', label: 'Script' },
];

// ── Factory ─────────────────────────────────────────────────────
export function createDefaultElement(type) {
  const id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  switch (type) {
    case 'text':
      return { id, type: 'text', content: 'Novo texto…' };
    case 'video':
      return { id, type: 'video', url: '', title: 'Vídeo' };
    case 'audio':
      return { id, type: 'audio', url: '', title: 'Áudio' };
    case 'image':
      return { id, type: 'image', url: '', title: 'Imagem' };
    case 'carousel':
      return { id, type: 'carousel', items: [], title: 'Carrossel' };
    case 'single-choice':
    case 'question-single':
      return {
        id,
        type: 'question-single',
        question: 'Nova Pergunta',
        options: [
          { text: 'Opção A', score: 10 },
          { text: 'Opção B', score: 5 },
          { text: 'Opção C', score: 0 },
        ],
      };
    case 'multiple-choice':
    case 'question-multiple':
      return {
        id,
        type: 'question-multiple',
        question: 'Nova Pergunta',
        options: [
          { text: 'Opção A', score: 10 },
          { text: 'Opção B', score: 5 },
          { text: 'Opção C', score: 0 },
        ],
      };
    case 'question-icons':
      return {
        id,
        type: 'question-icons',
        question: 'Nova Pergunta Visual',
        columns: 2,
        optionStyle: 'emoji',
        options: [
          { text: 'Sim', icon: '✅', image: '', score: 10 },
          { text: 'Não', icon: '❌', image: '', score: 0 },
        ],
      };
    case 'lead-form':
      return { id, type: 'lead-form', title: 'Capture seus dados', fields: ['name', 'email', 'phone'] };
    case 'script':
      return { id, type: 'script', content: '// Seu script aqui' };
    default:
      return { id, type, content: '' };
  }
}

// ── Variable Text Renderer (shows {{var}} as badges) ────────────

function VariableText({ text }) {
  const segments = parseVariableSegments(text);
  const hasVars = segments.some((s) => s.type === 'variable');

  if (!hasVars) return <>{text}</>;

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'variable') {
          return (
            <span
              key={i}
              className="inline-flex items-center px-1.5 py-0.5 bg-accent/10 text-accent text-[10px] font-mono rounded-md border border-accent/20 mx-0.5 align-middle"
              title={`Variável: ${seg.key}`}
            >
              {seg.value}
            </span>
          );
        }
        return <span key={i}>{seg.value}</span>;
      })}
    </>
  );
}

// ── Variable Hint Tooltip ───────────────────────────────────────

function VariableHint() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-1 relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="nodrag text-[10px] text-gray-400 hover:text-accent flex items-center gap-0.5 transition-colors"
      >
        <Info size={10} /> Variáveis disponíveis
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-xl p-2.5 z-50 min-w-[220px]">
          <p className="text-[10px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
            Variáveis disponíveis
          </p>
          {AVAILABLE_VARIABLES.map((v) => (
            <div key={v.key} className="flex items-center gap-1.5 py-0.5">
              <code className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
                {`{{${v.key}}}`}
              </code>
              <span className="text-[10px] text-gray-400">{v.description}</span>
            </div>
          ))}
          <p className="text-[9px] text-gray-300 mt-1.5 border-t border-gray-100 pt-1">
            Duplo clique no texto para editar e inserir variáveis
          </p>
        </div>
      )}
    </div>
  );
}

// ── Element Renderers ───────────────────────────────────────────

function TextElement({ element, nodeId }) {
  const updateNodeElement = useQuizStore((s) => s.updateNodeElement);
  return (
    <div className="p-2">
      <InlineEdit
        value={element.content || ''}
        onSave={(val) => updateNodeElement(nodeId, element.id, { content: val })}
        className="text-gray-700 text-sm"
        multiline
        placeholder="Digite o texto…"
        renderValue={(val) => <VariableText text={val} />}
      />
      <VariableHint />
    </div>
  );
}

function MediaElement({ element, nodeId }) {
  const updateNodeElement = useQuizStore((s) => s.updateNodeElement);
  const Icon = ICONS[element.type] || Image;
  const c = COLORS[element.type] || COLORS.image;
  return (
    <div className="p-2 flex items-center gap-2">
      <div className={`w-7 h-7 ${c.bg} rounded-lg flex items-center justify-center shrink-0`}>
        <Icon size={14} className={c.text} />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <InlineEdit
          value={element.title || element.type}
          onSave={(val) => updateNodeElement(nodeId, element.id, { title: val })}
          className="text-gray-700 text-sm font-medium block"
          placeholder="Título…"
        />
        <InlineEdit
          value={element.url || ''}
          onSave={(val) => updateNodeElement(nodeId, element.id, { url: val })}
          className="text-gray-400 text-xs truncate block"
          placeholder="URL…"
        />
      </div>
    </div>
  );
}

function QuestionElement({ element, nodeId }) {
  const updateNodeElement = useQuizStore((s) => s.updateNodeElement);
  const edges = useQuizStore((s) => s.edges);
  const isMultiple = element.type === 'question-multiple';
  const Icon = isMultiple ? CheckSquare : CircleDot;

  // Track which handles are connected
  const connectedHandles = useMemo(() => {
    const set = new Set();
    edges.forEach((e) => {
      if (e.source === nodeId && e.sourceHandle) set.add(e.sourceHandle);
    });
    return set;
  }, [edges, nodeId]);

  const handleOptionText = (idx, text) => {
    const opts = [...(element.options || [])];
    opts[idx] = { ...opts[idx], text };
    updateNodeElement(nodeId, element.id, { options: opts });
  };

  const addOption = (e) => {
    e.stopPropagation();
    const opts = [...(element.options || []), { text: `Opção ${(element.options?.length || 0) + 1}`, score: 0 }];
    updateNodeElement(nodeId, element.id, { options: opts });
  };

  return (
    <div className="p-2">
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="w-5 h-5 bg-accent/10 rounded flex items-center justify-center">
          <Icon size={12} className="text-accent" />
        </div>
        <span className="text-[10px] font-semibold text-accent uppercase tracking-wide">
          {isMultiple ? 'Múltipla Escolha' : 'Escolha Única'}
        </span>
      </div>
      <InlineEdit
        value={element.question || ''}
        onSave={(val) => updateNodeElement(nodeId, element.id, { question: val })}
        className="text-gray-800 font-medium text-sm mb-2 block"
        placeholder="Digite a pergunta…"
      />
      <div className="space-y-1.5">
        {(element.options || []).map((opt, idx) => {
          const handleId = `${element.id}-option-${idx}`;
          const isConnected = connectedHandles.has(handleId);
          return (
            <div
              key={idx}
              className="relative flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 text-sm text-gray-600"
            >
              <span className="w-4 h-4 bg-white border border-gray-300 rounded-full flex items-center justify-center text-[10px] shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1">
                <InlineEdit
                  value={opt.text}
                  onSave={(val) => handleOptionText(idx, val)}
                  className="text-sm"
                  placeholder="Opção…"
                />
              </span>
              {opt.score > 0 && <span className="text-xs text-accent font-medium">+{opt.score}</span>}
              <Handle
                type="source"
                position={Position.Right}
                id={handleId}
                className={
                  isConnected
                    ? '!bg-accent !w-2.5 !h-2.5 !right-[-5px] !border !border-white'
                    : '!bg-white !border-2 !border-accent/40 !w-2.5 !h-2.5 !right-[-5px]'
                }
                title="Conecte a uma pergunta ou resultado"
              />
            </div>
          );
        })}
        <button
          onClick={addOption}
          className="nodrag text-xs text-accent hover:text-accent-hover flex items-center gap-1 px-2 py-1"
        >
          <Plus size={12} /> Opção
        </button>

        {/* General "all options" handle */}
        {(() => {
          const generalId = `${element.id}-general`;
          const isGeneralConnected = connectedHandles.has(generalId);
          return (
            <div className="relative flex items-center justify-end gap-1.5 px-2.5 py-1 bg-purple-50/50 rounded-lg mt-1">
              <span className="text-[10px] text-purple-400 select-none flex-1">Todas as respostas</span>
              <Handle
                type="source"
                position={Position.Right}
                id={generalId}
                className={
                  isGeneralConnected
                    ? '!bg-purple-500 !w-3 !h-3 !right-[-5px] !border-2 !border-white'
                    : '!bg-white !border-2 !border-purple-400 !w-3 !h-3 !right-[-5px]'
                }
                title="Todas as respostas → mesmo destino"
              />
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function IconQuestionElement({ element, nodeId }) {
  const updateNodeElement = useQuizStore((s) => s.updateNodeElement);
  const edges = useQuizStore((s) => s.edges);
  const columns = element.columns || 2;

  const connectedHandles = useMemo(() => {
    const set = new Set();
    edges.forEach((e) => {
      if (e.source === nodeId && e.sourceHandle) set.add(e.sourceHandle);
    });
    return set;
  }, [edges, nodeId]);

  const addOption = (e) => {
    e.stopPropagation();
    const opts = [
      ...(element.options || []),
      { text: `Opção ${(element.options?.length || 0) + 1}`, icon: '⭐', image: '', score: 0 },
    ];
    updateNodeElement(nodeId, element.id, { options: opts });
  };

  return (
    <div className="p-2">
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="w-5 h-5 bg-accent/10 rounded flex items-center justify-center">
          <LayoutGrid size={12} className="text-accent" />
        </div>
        <span className="text-[10px] font-semibold text-accent uppercase tracking-wide">
          Escolha Visual
        </span>
      </div>
      <InlineEdit
        value={element.question || ''}
        onSave={(val) => updateNodeElement(nodeId, element.id, { question: val })}
        className="text-gray-800 font-medium text-sm mb-2 block"
        placeholder="Digite a pergunta…"
      />
      <div
        className="grid gap-1.5 mb-1.5"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {(element.options || []).map((opt, idx) => {
          const handleId = `${element.id}-option-${idx}`;
          const isConnected = connectedHandles.has(handleId);
          return (
            <div
              key={idx}
              className="relative flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-lg p-2 hover:border-accent/40 transition-colors"
            >
              {element.optionStyle === 'image' && opt.image ? (
                <img
                  src={opt.image}
                  alt={opt.text}
                  className="w-8 h-8 object-cover rounded mb-0.5"
                />
              ) : (
                <span className="text-2xl leading-none mb-0.5">{opt.icon || '⭐'}</span>
              )}
              <span className="text-[10px] text-gray-600 text-center truncate w-full">{opt.text}</span>
              {opt.score > 0 && (
                <span className="text-[9px] text-accent font-medium">+{opt.score}</span>
              )}
              <Handle
                type="source"
                position={Position.Right}
                id={handleId}
                className={
                  isConnected
                    ? '!bg-accent !w-2.5 !h-2.5 !right-[-5px] !border !border-white'
                    : '!bg-white !border-2 !border-accent/40 !w-2.5 !h-2.5 !right-[-5px]'
                }
                title="Conecte a uma pergunta ou resultado"
              />
            </div>
          );
        })}
      </div>
      <button
        onClick={addOption}
        className="nodrag text-xs text-accent hover:text-accent-hover flex items-center gap-1 px-2 py-1"
      >
        <Plus size={12} /> Opção
      </button>

      {/* General "all options" handle */}
      {(() => {
        const generalId = `${element.id}-general`;
        const isGeneralConnected = connectedHandles.has(generalId);
        return (
          <div className="relative flex items-center justify-end gap-1.5 px-2.5 py-1 bg-purple-50/50 rounded-lg mt-1">
            <span className="text-[10px] text-purple-400 select-none flex-1">Todas as respostas</span>
            <Handle
              type="source"
              position={Position.Right}
              id={generalId}
              className={
                isGeneralConnected
                  ? '!bg-purple-500 !w-3 !h-3 !right-[-5px] !border-2 !border-white'
                  : '!bg-white !border-2 !border-purple-400 !w-3 !h-3 !right-[-5px]'
              }
              title="Todas as respostas → mesmo destino"
            />
          </div>
        );
      })()}
    </div>
  );
}

function LeadFormElement({ element, nodeId }) {
  const updateNodeElement = useQuizStore((s) => s.updateNodeElement);
  return (
    <div className="p-2">
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
          <UserPlus size={12} className="text-blue-600" />
        </div>
        <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">Formulário Lead</span>
      </div>
      <InlineEdit
        value={element.title || 'Capture seus dados'}
        onSave={(val) => updateNodeElement(nodeId, element.id, { title: val })}
        className="text-gray-800 font-medium text-sm mb-2 block"
        placeholder="Título do formulário…"
      />
      <div className="space-y-1">
        <div className="bg-gray-100 rounded px-2 py-1 text-xs text-gray-400">Nome</div>
        <div className="bg-gray-100 rounded px-2 py-1 text-xs text-gray-400">Email</div>
        <div className="bg-gray-100 rounded px-2 py-1 text-xs text-gray-400">Telefone</div>
      </div>
    </div>
  );
}

function ScriptElement({ element, nodeId }) {
  const updateNodeElement = useQuizStore((s) => s.updateNodeElement);
  return (
    <div className="p-2">
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="w-5 h-5 bg-teal-100 rounded flex items-center justify-center">
          <FileText size={12} className="text-teal-600" />
        </div>
        <span className="text-[10px] font-semibold text-teal-600 uppercase tracking-wide">Script</span>
      </div>
      <InlineEdit
        value={element.content || ''}
        onSave={(val) => updateNodeElement(nodeId, element.id, { content: val })}
        className="text-gray-600 text-xs font-mono"
        multiline
        placeholder="// Script…"
      />
    </div>
  );
}

function ElementRenderer({ element, nodeId }) {
  switch (element.type) {
    case 'text':
      return <TextElement element={element} nodeId={nodeId} />;
    case 'video':
    case 'audio':
    case 'image':
    case 'carousel':
      return <MediaElement element={element} nodeId={nodeId} />;
    case 'question-single':
    case 'question-multiple':
      return <QuestionElement element={element} nodeId={nodeId} />;
    case 'question-icons':
      return <IconQuestionElement element={element} nodeId={nodeId} />;
    case 'lead-form':
      return <LeadFormElement element={element} nodeId={nodeId} />;
    case 'script':
      return <ScriptElement element={element} nodeId={nodeId} />;
    default:
      return <div className="p-2 text-gray-400 text-xs">Elemento: {element.type}</div>;
  }
}

// ── Main Composite Node ─────────────────────────────────────────

export default function CompositeNode({ id, data, selected }) {
  const [showMenu, setShowMenu] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);

  const addNodeElement = useQuizStore((s) => s.addNodeElement);
  const removeNodeElement = useQuizStore((s) => s.removeNodeElement);
  const reorderNodeElements = useQuizStore((s) => s.reorderNodeElements);
  const updateNode = useQuizStore((s) => s.updateNode);

  const elements = data.elements || [];

  const handleAdd = (type) => {
    addNodeElement(id, createDefaultElement(type));
    setShowMenu(false);
  };

  // ── drag reorder ──
  const onDragStart = (e, idx) => {
    e.dataTransfer.setData('composite-reorder', idx.toString());
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragIdx(idx);
  };
  const onDragLeave = () => setDragIdx(null);
  const onDrop = (e, toIdx) => {
    e.preventDefault();
    e.stopPropagation();
    const raw = e.dataTransfer.getData('composite-reorder');
    if (raw === '') return;
    const fromIdx = parseInt(raw, 10);
    if (fromIdx !== toIdx) reorderNodeElements(id, fromIdx, toIdx);
    setDragIdx(null);
  };

  const removeNode = useQuizStore((s) => s.removeNode);

  return (
    <div
      className={`group/node relative bg-white rounded-xl shadow-lg border-2 min-w-[300px] max-w-[400px] transition-all ${
        selected ? 'border-accent ring-2 ring-accent/20' : 'border-gray-200'
      }`}
    >
      {/* Delete node button — appears on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeNode(id);
        }}
        className="nodrag absolute -top-3 -right-3 z-10 w-7 h-7 bg-red-50 hover:bg-red-500 text-red-400 hover:text-white rounded-full flex items-center justify-center opacity-0 group-hover/node:opacity-100 transition-all shadow-sm border border-red-200 hover:border-red-500"
        title="Excluir bloco"
      >
        <Trash2 size={14} />
      </button>

      <Handle type="target" position={Position.Top} className="!bg-accent !w-3 !h-3" />

      {/* Header — dragging the node starts here */}
      <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-accent/5 to-transparent rounded-t-xl">
        <InlineEdit
          value={data.label || 'Novo Bloco'}
          onSave={(val) => updateNode(id, { label: val })}
          className="font-semibold text-gray-800 text-sm"
          placeholder="Nome do bloco…"
        />
      </div>

      {/* Elements list */}
      <div className="divide-y divide-gray-50">
        {elements.map((el, idx) => (
          <div
            key={el.id}
            className={`relative group nodrag ${dragIdx === idx ? 'bg-accent/5 border-t-2 border-accent' : ''}`}
            draggable
            onDragStart={(e) => onDragStart(e, idx)}
            onDragOver={(e) => onDragOver(e, idx)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, idx)}
          >
            {/* Grip + remove (visible on hover) */}
            <div className="absolute top-1.5 left-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
              <GripVertical size={12} className="text-gray-300" />
            </div>
            <button
              onClick={() => removeNodeElement(id, el.id)}
              className="nodrag absolute top-1.5 right-1.5 z-10 w-5 h-5 bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            >
              <X size={10} />
            </button>

            <div className="pl-5">
              <ElementRenderer element={el} nodeId={id} />
            </div>
          </div>
        ))}
      </div>

      {/* Add element */}
      <div className="p-2 border-t border-gray-100 relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="nodrag w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-accent hover:bg-accent/5 rounded-lg py-2 transition-colors"
        >
          <Plus size={14} /> Adicionar elemento
        </button>

        {showMenu && (
          <div className="nodrag absolute bottom-full left-2 right-2 mb-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-56 overflow-y-auto">
            {ELEMENT_TYPES.map(({ type, label }) => {
              const Icon = ICONS[type];
              const c = COLORS[type];
              return (
                <button
                  key={type}
                  onClick={() => handleAdd(type)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-accent/5 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className={`w-6 h-6 ${c.bg} rounded flex items-center justify-center`}>
                    <Icon size={12} className={c.text} />
                  </div>
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-accent !w-3 !h-3" />
    </div>
  );
}
