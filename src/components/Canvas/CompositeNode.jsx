'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react';
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
  Disc,
  Gift,
  MessageSquare,
  Star,
  MousePointerClick,
} from 'lucide-react';
import useQuizStore from '@/store/quizStore';
import InlineEdit from './InlineEdit';
import { AVAILABLE_VARIABLES, parseVariableSegments } from '@/lib/dynamicVariables';
import EmojiPicker from '@/components/EmojiPicker';

// ── Shared lookups ──────────────────────────────────────────────
const ICONS = {
  text: Type,
  button: MousePointerClick,
  audio: Music,
  video: Video,
  image: Image,
  carousel: LayoutGrid,
  'question-single': CircleDot,
  'question-multiple': CheckSquare,
  'question-icons': LayoutGrid,
  'question-open': MessageSquare,
  'question-rating': Star,
  'lead-form': UserPlus,
  script: FileText,
  'spin-wheel': Disc,
  'scratch-card': Gift,
};

const COLORS = {
  text: { bg: 'bg-teal-100', text: 'text-teal-600' },
  button: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  audio: { bg: 'bg-orange-100', text: 'text-orange-600' },
  video: { bg: 'bg-orange-100', text: 'text-orange-600' },
  image: { bg: 'bg-orange-100', text: 'text-orange-600' },
  carousel: { bg: 'bg-orange-100', text: 'text-orange-600' },
  'question-single': { bg: 'bg-accent/10', text: 'text-accent' },
  'question-multiple': { bg: 'bg-accent/10', text: 'text-accent' },
  'question-icons': { bg: 'bg-accent/10', text: 'text-accent' },
  'question-open': { bg: 'bg-accent/10', text: 'text-accent' },
  'question-rating': { bg: 'bg-amber-100', text: 'text-amber-600' },
  'lead-form': { bg: 'bg-blue-100', text: 'text-blue-600' },
  script: { bg: 'bg-teal-100', text: 'text-teal-600' },
  'spin-wheel': { bg: 'bg-orange-100', text: 'text-orange-600' },
  'scratch-card': { bg: 'bg-orange-100', text: 'text-orange-600' },
};

const ELEMENT_TYPES = [
  { type: 'text', label: 'Texto' },
  { type: 'button', label: 'Botão' },
  { type: 'video', label: 'Vídeo' },
  { type: 'audio', label: 'Áudio' },
  { type: 'image', label: 'Imagem' },
  { type: 'carousel', label: 'Carrossel' },
  { type: 'question-single', label: 'Escolha Única' },
  { type: 'question-multiple', label: 'Múltipla Escolha' },
  { type: 'question-icons', label: 'Escolha Visual' },
  { type: 'question-open', label: 'Pergunta Aberta' },
  { type: 'question-rating', label: 'Nota / Avaliação' },
  { type: 'lead-form', label: 'Formulário Lead' },
  { type: 'script', label: 'Script' },
  { type: 'spin-wheel', label: 'Roleta' },
  { type: 'scratch-card', label: 'Raspadinha' },
];

// ── Factory ─────────────────────────────────────────────────────
export function createDefaultElement(type) {
  const id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  switch (type) {
    case 'text':
      return { 
        id, type: 'text', 
        content: 'Novo texto…',
        style: {
          fontFamily: 'Inter',
          fontSize: 16,
          fontWeight: '400',
          fontStyle: 'normal',
          textDecoration: 'none',
          textColor: '#374151',
          backgroundColor: 'transparent',
          textAlign: 'left',
          lineHeight: 1.5,
        }
      };
    case 'button':
      return {
        id, type: 'button',
        text: 'Clique aqui',
        action: 'next-node',
        actionValue: '',
        openInNewTab: true,
        style: {
          fontFamily: 'Inter',
          fontSize: 16,
          fontWeight: '600',
          textColor: '#ffffff',
          backgroundColor: '#7c3aed',
          hoverBackgroundColor: '#6d28d9',
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 8,
          paddingX: 24,
          paddingY: 12,
          width: 'full',
          alignment: 'center',
        }
      };
    case 'video':
      return { id, type: 'video', url: '', title: 'Vídeo' };
    case 'audio':
      return { id, type: 'audio', url: '', title: 'Áudio' };
    case 'image':
      return { id, type: 'image', url: '', title: 'Imagem' };
    case 'carousel':
      return { id, type: 'carousel', slides: [], title: 'Carrossel' };
    case 'single-choice':
    case 'question-single':
      return {
        id,
        type: 'question-single',
        question: 'Nova Pergunta',
        options: [
          { text: 'Opção A', score: 10, emoji: '' },
          { text: 'Opção B', score: 5, emoji: '' },
          { text: 'Opção C', score: 0, emoji: '' },
        ],
      };
    case 'multiple-choice':
    case 'question-multiple':
      return {
        id,
        type: 'question-multiple',
        question: 'Nova Pergunta',
        options: [
          { text: 'Opção A', score: 10, emoji: '' },
          { text: 'Opção B', score: 5, emoji: '' },
          { text: 'Opção C', score: 0, emoji: '' },
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
    case 'question-open':
      return {
        id,
        type: 'question-open',
        question: 'Pergunta aberta',
        placeholder: 'Digite sua resposta...',
        required: true,
        multiline: true,
        maxLength: 500,
        score: 0,
      };
    case 'question-rating':
      return {
        id,
        type: 'question-rating',
        question: 'Dê sua nota',
        ratingType: 'number',
        maxStars: 5,
        minValue: 0,
        maxValue: 10,
        sliderMin: 0,
        sliderMax: 100,
        sliderStep: 1,
        sliderUnit: '',
        labelMin: '',
        labelMax: '',
        scoreMultiplier: 1,
        required: true,
      };
    case 'lead-form':
      return { id, type: 'lead-form', title: 'Capture seus dados', fields: ['name', 'email', 'phone'] };
    case 'script':
      return { id, type: 'script', content: '// Seu script aqui' };
    case 'spin-wheel':
      return {
        id,
        type: 'spin-wheel',
        title: 'Gire a roleta e descubra seu prêmio!',
        buttonText: 'GIRAR!',
        segments: [
          { text: '10% OFF', color: '#7c3aed', probability: 30 },
          { text: '20% OFF', color: '#ec4899', probability: 20 },
          { text: '30% OFF', color: '#f59e0b', probability: 10 },
          { text: 'Frete Grátis', color: '#10b981', probability: 25 },
          { text: 'Tente novamente', color: '#6b7280', probability: 15 },
        ],
        score: 0,
      };
    case 'scratch-card':
      return {
        id,
        type: 'scratch-card',
        title: 'Raspe e descubra!',
        instruction: 'Passe o dedo para revelar seu prêmio',
        revealText: '🎉 20% de desconto!',
        coverColor: '#7c3aed',
        coverPattern: 'dots',
        score: 0,
      };
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

const FONT_FAMILIES = [
  'Inter', 'Roboto', 'Poppins', 'Montserrat', 'Open Sans',
  'Lato', 'Nunito', 'Playfair Display', 'Oswald', 'Raleway',
  'Source Sans Pro', 'PT Sans', 'Ubuntu', 'Merriweather', 'Quicksand'
];

function InlineStyleToolbar({ style, onChange, onClose }) {
  const toolbarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const updateStyle = (updates) => {
    onChange({ ...style, ...updates });
  };

  return (
    <div
      ref={toolbarRef}
      className="absolute -top-12 left-0 z-50 bg-white shadow-lg border border-gray-200 rounded-lg p-1.5 flex flex-wrap gap-1 items-center nodrag nopan nowheel"
      style={{
        opacity: 1,
        transform: 'scale(1)',
        transition: 'opacity 150ms ease, transform 150ms ease'
      }}
    >
      {/* Font Family */}
      <select
        value={style.fontFamily || 'Inter'}
        onChange={(e) => updateStyle({ fontFamily: e.target.value })}
        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-accent"
        style={{ width: '100px' }}
      >
        {FONT_FAMILIES.map((font) => (
          <option key={font} value={font}>{font}</option>
        ))}
      </select>

      {/* Font Size */}
      <input
        type="number"
        value={style.fontSize || 16}
        onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) || 16 })}
        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-accent"
        style={{ width: '40px' }}
        min="10"
        max="72"
      />

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 mx-1"></div>

      {/* Bold */}
      <button
        onClick={() => updateStyle({ 
          fontWeight: style.fontWeight === '700' ? '400' : '700' 
        })}
        className={`w-6 h-6 text-xs font-bold border rounded transition-colors flex items-center justify-center ${
          style.fontWeight === '700' || style.fontWeight === '800'
            ? 'bg-accent text-white border-accent'
            : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-accent/40'
        }`}
      >
        B
      </button>

      {/* Italic */}
      <button
        onClick={() => updateStyle({ 
          fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic' 
        })}
        className={`w-6 h-6 text-xs italic border rounded transition-colors flex items-center justify-center ${
          style.fontStyle === 'italic'
            ? 'bg-accent text-white border-accent'
            : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-accent/40'
        }`}
      >
        I
      </button>

      {/* Underline */}
      <button
        onClick={() => updateStyle({ 
          textDecoration: style.textDecoration === 'underline' ? 'none' : 'underline' 
        })}
        className={`w-6 h-6 text-xs underline border rounded transition-colors flex items-center justify-center ${
          style.textDecoration === 'underline'
            ? 'bg-accent text-white border-accent'
            : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-accent/40'
        }`}
      >
        U
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 mx-1"></div>

      {/* Text Color */}
      <input
        type="color"
        value={style.textColor || '#374151'}
        onChange={(e) => updateStyle({ textColor: e.target.value })}
        className="w-5 h-5 rounded border border-gray-200 cursor-pointer"
        title="Cor do texto"
      />

      {/* Background Color */}
      <input
        type="color"
        value={style.backgroundColor || '#ffffff'}
        onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
        className="w-5 h-5 rounded border border-gray-200 cursor-pointer"
        title="Cor de fundo"
      />

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 mx-1"></div>

      {/* Text Align Left */}
      <button
        onClick={() => updateStyle({ textAlign: 'left' })}
        className={`w-6 h-6 text-xs border rounded transition-colors flex items-center justify-center ${
          (style.textAlign === 'left' || !style.textAlign)
            ? 'bg-accent text-white border-accent'
            : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-accent/40'
        }`}
        title="Alinhar à esquerda"
      >
        ←
      </button>

      {/* Text Align Center */}
      <button
        onClick={() => updateStyle({ textAlign: 'center' })}
        className={`w-6 h-6 text-xs border rounded transition-colors flex items-center justify-center ${
          style.textAlign === 'center'
            ? 'bg-accent text-white border-accent'
            : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-accent/40'
        }`}
        title="Centralizar"
      >
        ↔
      </button>

      {/* Text Align Right */}
      <button
        onClick={() => updateStyle({ textAlign: 'right' })}
        className={`w-6 h-6 text-xs border rounded transition-colors flex items-center justify-center ${
          style.textAlign === 'right'
            ? 'bg-accent text-white border-accent'
            : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-accent/40'
        }`}
        title="Alinhar à direita"
      >
        →
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 mx-1"></div>

      {/* Line Height */}
      <input
        type="number"
        value={style.lineHeight || 1.5}
        onChange={(e) => updateStyle({ lineHeight: parseFloat(e.target.value) || 1.5 })}
        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-accent"
        style={{ width: '40px' }}
        min="1.0"
        max="3.0"
        step="0.1"
        title="Altura da linha"
      />
    </div>
  );
}

function TextElement({ element, nodeId }) {
  const updateNodeElement = useQuizStore((s) => s.updateNodeElement);
  const [showToolbar, setShowToolbar] = useState(false);
  const style = element.style || {};
  
  const textStyles = {
    fontFamily: style.fontFamily || 'Inter',
    fontSize: `${style.fontSize || 16}px`,
    fontWeight: style.fontWeight || '400',
    fontStyle: style.fontStyle || 'normal',
    textDecoration: style.textDecoration || 'none',
    color: style.textColor || '#374151',
    backgroundColor: style.backgroundColor && style.backgroundColor !== 'transparent' ? style.backgroundColor : undefined,
    textAlign: style.textAlign || 'left',
    lineHeight: style.lineHeight || 1.5,
  };

  const handleStyleChange = (newStyle) => {
    updateNodeElement(nodeId, element.id, { 
      style: { ...style, ...newStyle } 
    });
  };

  return (
    <div className="p-2 relative">
      {showToolbar && (
        <InlineStyleToolbar
          style={style}
          onChange={handleStyleChange}
          onClose={() => setShowToolbar(false)}
        />
      )}
      
      <div onClick={() => setShowToolbar(true)}>
        <InlineEdit
          value={element.content || ''}
          onSave={(val) => updateNodeElement(nodeId, element.id, { content: val })}
          className="text-sm"
          style={textStyles}
          multiline
          placeholder="Digite o texto…"
          renderValue={(val) => <span style={textStyles}><VariableText text={val} /></span>}
        />
      </div>
      
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

  const handleOptionEmoji = (idx, emoji) => {
    const opts = [...(element.options || [])];
    opts[idx] = { ...opts[idx], emoji };
    updateNodeElement(nodeId, element.id, { options: opts });
  };

  const addOption = (e) => {
    e.stopPropagation();
    const opts = [...(element.options || []), { text: `Opção ${(element.options?.length || 0) + 1}`, score: 0, emoji: '' }];
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
              <div className="nodrag w-6 shrink-0">
                <EmojiPicker
                  value={opt.emoji || ''}
                  onChange={(emoji) => handleOptionEmoji(idx, emoji)}
                />
              </div>
              <span className="w-4 h-4 bg-white border border-gray-300 rounded-full flex items-center justify-center text-[10px] shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1 flex items-center gap-1">
                {opt.emoji && (
                  <span style={{ fontSize: '1.3em', lineHeight: 1 }}>
                    {opt.emoji}
                  </span>
                )}
                <InlineEdit
                  value={opt.text}
                  onSave={(val) => handleOptionText(idx, val)}
                  className="text-sm flex-1"
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

function RatingElement({ element, nodeId }) {
  const updateNodeElement = useQuizStore((s) => s.updateNodeElement);
  const edges = useQuizStore((s) => s.edges);

  const connectedHandles = useMemo(() => {
    const set = new Set();
    edges.forEach((e) => {
      if (e.source === nodeId && e.sourceHandle) set.add(e.sourceHandle);
    });
    return set;
  }, [edges, nodeId]);

  const generalId = `${element.id}-general`;
  const isGeneralConnected = connectedHandles.has(generalId);

  const renderPreview = () => {
    const ratingType = element.ratingType || 'number';

    if (ratingType === 'stars') {
      const max = element.maxStars || 5;
      const filled = Math.ceil(max / 2);
      return (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: max }).map((_, i) => (
            <span key={i} className={`text-sm ${i < filled ? 'text-amber-400' : 'text-gray-300'}`}>★</span>
          ))}
        </div>
      );
    }

    if (ratingType === 'slider') {
      return (
        <div className="flex items-center gap-1.5 w-full">
          <span className="text-[9px] text-gray-400 shrink-0">{element.sliderMin ?? 0}</span>
          <div className="flex-1 relative h-2 bg-gray-200 rounded-full">
            <div className="absolute left-0 top-0 h-full w-1/2 bg-amber-400 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-sm" />
          </div>
          <span className="text-[9px] text-gray-400 shrink-0">{element.sliderMax ?? 100}</span>
        </div>
      );
    }

    // number (default)
    const min = element.minValue ?? 0;
    const max = element.maxValue ?? 10;
    const count = max - min + 1;
    const display = count > 11 ? 11 : count;
    return (
      <div className="flex items-center gap-0.5 flex-wrap">
        {Array.from({ length: display }).map((_, i) => {
          const val = min + i;
          return (
            <span
              key={i}
              className="w-5 h-5 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-[8px] text-gray-500 font-medium"
            >
              {val}
            </span>
          );
        })}
        {count > 11 && <span className="text-[8px] text-gray-400">…</span>}
      </div>
    );
  };

  return (
    <div className="p-2">
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="w-5 h-5 bg-amber-100 rounded flex items-center justify-center">
          <Star size={12} className="text-amber-600" />
        </div>
        <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">
          Nota / Avaliação
        </span>
      </div>
      <InlineEdit
        value={element.question || ''}
        onSave={(val) => updateNodeElement(nodeId, element.id, { question: val })}
        className="text-gray-800 font-medium text-sm mb-2 block"
        placeholder="Digite a pergunta…"
      />
      <div className="bg-gray-50 rounded-lg px-2.5 py-2 mb-1">
        {renderPreview()}
      </div>
      {(element.labelMin || element.labelMax) && (
        <div className="flex justify-between text-[9px] text-gray-400 px-1 mb-1">
          <span>{element.labelMin}</span>
          <span>{element.labelMax}</span>
        </div>
      )}
      {element.required && (
        <span className="text-[9px] text-red-400 mt-0.5 inline-block">* Obrigatório</span>
      )}
      {/* General handle — always goes to next node */}
      <div className="relative flex items-center justify-end gap-1.5 px-2.5 py-1 bg-purple-50/50 rounded-lg mt-1.5">
        <span className="text-[10px] text-purple-400 select-none flex-1">Continuar</span>
        <Handle
          type="source"
          position={Position.Right}
          id={generalId}
          className={
            isGeneralConnected
              ? '!bg-purple-500 !w-3 !h-3 !right-[-5px] !border-2 !border-white'
              : '!bg-white !border-2 !border-purple-400 !w-3 !h-3 !right-[-5px]'
          }
          title="Continuar → próximo bloco"
        />
      </div>
    </div>
  );
}

function OpenQuestionElement({ element, nodeId }) {
  const updateNodeElement = useQuizStore((s) => s.updateNodeElement);
  const edges = useQuizStore((s) => s.edges);

  const connectedHandles = useMemo(() => {
    const set = new Set();
    edges.forEach((e) => {
      if (e.source === nodeId && e.sourceHandle) set.add(e.sourceHandle);
    });
    return set;
  }, [edges, nodeId]);

  const generalId = `${element.id}-general`;
  const isGeneralConnected = connectedHandles.has(generalId);

  return (
    <div className="p-2">
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="w-5 h-5 bg-accent/10 rounded flex items-center justify-center">
          <MessageSquare size={12} className="text-accent" />
        </div>
        <span className="text-[10px] font-semibold text-accent uppercase tracking-wide">
          Pergunta Aberta
        </span>
      </div>
      <InlineEdit
        value={element.question || ''}
        onSave={(val) => updateNodeElement(nodeId, element.id, { question: val })}
        className="text-gray-800 font-medium text-sm mb-2 block"
        placeholder="Digite a pergunta…"
      />
      <div className="bg-gray-100 rounded-lg px-3 py-2 text-xs text-gray-400 border border-gray-200">
        {element.multiline ? (
          <div className="space-y-1">
            <div>{element.placeholder || 'Digite sua resposta...'}</div>
            <div className="border-t border-gray-200" />
            <div className="opacity-50">↵</div>
          </div>
        ) : (
          <div>{element.placeholder || 'Digite sua resposta...'}</div>
        )}
      </div>
      {element.required && (
        <span className="text-[9px] text-red-400 mt-1 inline-block">* Obrigatório</span>
      )}
      {/* General handle — always goes to next node */}
      <div className="relative flex items-center justify-end gap-1.5 px-2.5 py-1 bg-purple-50/50 rounded-lg mt-1.5">
        <span className="text-[10px] text-purple-400 select-none flex-1">Continuar</span>
        <Handle
          type="source"
          position={Position.Right}
          id={generalId}
          className={
            isGeneralConnected
              ? '!bg-purple-500 !w-3 !h-3 !right-[-5px] !border-2 !border-white'
              : '!bg-white !border-2 !border-purple-400 !w-3 !h-3 !right-[-5px]'
          }
          title="Continuar → próximo bloco"
        />
      </div>
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

function SpinWheelPreview({ element }) {
  const segments = element.segments || [];
  const total = segments.reduce((s, seg) => s + (seg.probability || 0), 0);
  return (
    <div className="p-2">
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="w-5 h-5 bg-orange-100 rounded flex items-center justify-center">
          <Disc size={12} className="text-orange-600" />
        </div>
        <span className="text-[10px] font-semibold text-orange-600 uppercase tracking-wide">Roleta</span>
      </div>
      <p className="text-gray-800 font-medium text-sm mb-2">{element.title || 'Gire a roleta!'}</p>
      <div className="flex items-center justify-center mb-2">
        <svg width="80" height="80" viewBox="0 0 80 80">
          {segments.map((seg, i) => {
            const startAngle = segments.slice(0, i).reduce((a, s) => a + ((s.probability || 0) / (total || 1)) * 360, 0);
            const sweepAngle = ((seg.probability || 0) / (total || 1)) * 360;
            const startRad = (startAngle - 90) * (Math.PI / 180);
            const endRad = (startAngle + sweepAngle - 90) * (Math.PI / 180);
            const largeArc = sweepAngle > 180 ? 1 : 0;
            const x1 = 40 + 35 * Math.cos(startRad);
            const y1 = 40 + 35 * Math.sin(startRad);
            const x2 = 40 + 35 * Math.cos(endRad);
            const y2 = 40 + 35 * Math.sin(endRad);
            return (
              <path
                key={i}
                d={`M40,40 L${x1},${y1} A35,35 0 ${largeArc},1 ${x2},${y2} Z`}
                fill={seg.color || '#ccc'}
                stroke="white"
                strokeWidth="1"
              />
            );
          })}
          <circle cx="40" cy="40" r="6" fill="white" stroke="#e5e7eb" strokeWidth="1" />
        </svg>
      </div>
      <div className="flex flex-wrap gap-1">
        {segments.map((seg, i) => (
          <span key={i} className="inline-flex items-center gap-1 text-[9px] text-gray-500">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: seg.color }} />
            {seg.text}
          </span>
        ))}
      </div>
    </div>
  );
}

function ScratchCardPreview({ element }) {
  return (
    <div className="p-2">
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="w-5 h-5 bg-orange-100 rounded flex items-center justify-center">
          <Gift size={12} className="text-orange-600" />
        </div>
        <span className="text-[10px] font-semibold text-orange-600 uppercase tracking-wide">Raspadinha</span>
      </div>
      <p className="text-gray-800 font-medium text-sm mb-2">{element.title || 'Raspe e descubra!'}</p>
      <div
        className="rounded-lg h-16 flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: element.coverColor || '#7c3aed' }}
      >
        {element.coverPattern === 'dots' && (
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-white"
                style={{ left: `${(i * 17) % 90}%`, top: `${(i * 23) % 80}%` }}
              />
            ))}
          </div>
        )}
        {element.coverPattern === 'stars' && (
          <div className="absolute inset-0 opacity-20 text-white text-xs flex flex-wrap justify-center items-center gap-2">
            {'⭐✨⭐✨⭐✨'.split('').map((s, i) => <span key={i}>{s}</span>)}
          </div>
        )}
        <span className="text-white font-bold text-sm z-10">Raspe aqui ✨</span>
      </div>
    </div>
  );
}

function ButtonElement({ element, nodeId }) {
  const edges = useQuizStore((s) => s.edges);
  const style = element.style || {};
  
  // Track if action is 'next-node' to show Handle
  const showHandle = element.action === 'next-node';
  
  // Connected handle check
  const connectedHandles = useMemo(() => {
    const set = new Set();
    edges.forEach((e) => {
      if (e.source === nodeId && e.sourceHandle) set.add(e.sourceHandle);
    });
    return set;
  }, [edges, nodeId]);
  
  const handleId = `${element.id}-button`;
  const isConnected = connectedHandles.has(handleId);

  const buttonStyles = {
    fontFamily: style.fontFamily || 'Inter',
    fontSize: `${style.fontSize || 16}px`,
    fontWeight: style.fontWeight || '600',
    color: style.textColor || '#ffffff',
    backgroundColor: style.backgroundColor || '#7c3aed',
    borderColor: style.borderColor || 'transparent',
    borderWidth: `${style.borderWidth || 0}px`,
    borderRadius: `${style.borderRadius || 8}px`,
    paddingLeft: `${style.paddingX || 24}px`,
    paddingRight: `${style.paddingX || 24}px`,
    paddingTop: `${style.paddingY || 12}px`,
    paddingBottom: `${style.paddingY || 12}px`,
    width: style.width === 'auto' ? 'auto' : '100%',
    textAlign: style.alignment || 'center',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: style.alignment === 'left' ? 'flex-start' : style.alignment === 'right' ? 'flex-end' : 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderStyle: 'solid',
    textDecoration: 'none',
  };

  // Action type icon
  const getActionIcon = () => {
    switch (element.action) {
      case 'url': return '🔗';
      case 'script': return '⚡';
      case 'phone': return '📞';
      case 'email': return '📧';
      default: return null;
    }
  };

  return (
    <div className="p-2 relative">
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="w-5 h-5 bg-indigo-100 rounded flex items-center justify-center">
          <MousePointerClick size={12} className="text-indigo-600" />
        </div>
        <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide">Botão</span>
      </div>
      
      <div
        className="relative"
        style={{ 
          width: style.width === 'auto' ? 'fit-content' : '100%',
          marginLeft: style.alignment === 'center' ? 'auto' : style.alignment === 'right' ? 'auto' : '0',
          marginRight: style.alignment === 'center' ? 'auto' : style.alignment === 'left' ? 'auto' : '0'
        }}
      >
        <button
          style={buttonStyles}
          className="transition-all duration-200 hover:opacity-90"
          onMouseEnter={(e) => {
            if (style.hoverBackgroundColor) {
              e.target.style.backgroundColor = style.hoverBackgroundColor;
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = style.backgroundColor || '#7c3aed';
          }}
        >
          <span>{element.text || 'Clique aqui'}</span>
          {getActionIcon() && <span>{getActionIcon()}</span>}
        </button>
        
        {/* Handle for next-node action */}
        {showHandle && (
          <Handle
            type="source"
            position={Position.Right}
            id={handleId}
            className={
              isConnected
                ? '!bg-indigo-500 !w-2.5 !h-2.5 !right-[-5px] !border !border-white'
                : '!bg-white !border-2 !border-indigo-400 !w-2.5 !h-2.5 !right-[-5px]'
            }
            title="Conecte ao próximo node"
          />
        )}
      </div>
    </div>
  );
}

function ElementRenderer({ element, nodeId }) {
  switch (element.type) {
    case 'text':
      return <TextElement element={element} nodeId={nodeId} />;
    case 'button':
      return <ButtonElement element={element} nodeId={nodeId} />;
    case 'video':
    case 'audio':
    case 'image':
      return <MediaElement element={element} nodeId={nodeId} />;
    case 'carousel':
      return (
        <div className="px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            {(element.slides || []).length > 0 ? (
              (element.slides || []).slice(0, 4).map((_, i) => (
                <div key={i} className="w-6 h-6 bg-orange-100 rounded border border-orange-200 flex items-center justify-center">
                  <LayoutGrid size={10} className="text-orange-400" />
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-400">Sem imagens</span>
            )}
            {(element.slides || []).length > 4 && (
              <span className="text-xs text-gray-400">+{element.slides.length - 4}</span>
            )}
          </div>
          <span className="text-xs text-gray-500">{(element.slides || []).length} slides</span>
        </div>
      );
    case 'question-single':
    case 'question-multiple':
      return <QuestionElement element={element} nodeId={nodeId} />;
    case 'question-icons':
      return <IconQuestionElement element={element} nodeId={nodeId} />;
    case 'question-open':
      return <OpenQuestionElement element={element} nodeId={nodeId} />;
    case 'question-rating':
      return <RatingElement element={element} nodeId={nodeId} />;
    case 'lead-form':
      return <LeadFormElement element={element} nodeId={nodeId} />;
    case 'script':
      return <ScriptElement element={element} nodeId={nodeId} />;
    case 'spin-wheel':
      return <SpinWheelPreview element={element} />;
    case 'scratch-card':
      return <ScratchCardPreview element={element} />;
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
  const updateNodeInternals = useUpdateNodeInternals();

  const elements = data.elements || [];

  // Compute a fingerprint of all handle IDs so RF recalculates positions
  // whenever options are added/removed/reordered
  const handleFingerprint = useMemo(() => {
    return elements
      .map((el) => {
        if (el.options) return `${el.id}:${el.options.length}`;
        return el.id;
      })
      .join('|');
  }, [elements]);

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, handleFingerprint, updateNodeInternals]);

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
