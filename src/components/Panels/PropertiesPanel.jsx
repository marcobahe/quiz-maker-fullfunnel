'use client';

import { useState, useRef, useEffect } from 'react';
import {
  X, Plus, Trash2, GripVertical, ChevronDown, ChevronRight,
  CircleDot, CheckSquare, Video, Music, Image, LayoutGrid,
  Type, FileText, UserPlus, PanelRightClose, Disc, Gift, MessageSquare,
  Star, Info,
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
  'question-icons':  { label: 'Escolha Visual',  icon: LayoutGrid,  color: 'purple' },
  'question-open':   { label: 'Pergunta Aberta', icon: MessageSquare, color: 'purple' },
  'question-rating': { label: 'Nota / Avaliação', icon: Star, color: 'amber' },
  'lead-form':       { label: 'Formulário Lead', icon: UserPlus,    color: 'blue' },
  script:            { label: 'Script',          icon: FileText,    color: 'teal' },
  'spin-wheel':      { label: 'Roleta',          icon: Disc,        color: 'orange' },
  'scratch-card':    { label: 'Raspadinha',       icon: Gift,        color: 'orange' },
};

const ELEMENT_TYPES = [
  { type: 'text',              label: 'Texto' },
  { type: 'video',             label: 'Vídeo' },
  { type: 'audio',             label: 'Áudio' },
  { type: 'image',             label: 'Imagem' },
  { type: 'carousel',          label: 'Carrossel' },
  { type: 'question-single',   label: 'Escolha Única' },
  { type: 'question-multiple',  label: 'Múltipla Escolha' },
  { type: 'question-icons',    label: 'Escolha Visual' },
  { type: 'question-open',     label: 'Pergunta Aberta' },
  { type: 'question-rating',   label: 'Nota / Avaliação' },
  { type: 'lead-form',         label: 'Formulário Lead' },
  { type: 'script',            label: 'Script' },
  { type: 'spin-wheel',        label: 'Roleta' },
  { type: 'scratch-card',      label: 'Raspadinha' },
];

const COLOR_CLASSES = {
  teal:   'bg-teal-100 text-teal-600',
  orange: 'bg-orange-100 text-orange-600',
  purple: 'bg-accent/10 text-accent',
  blue:   'bg-blue-100 text-blue-600',
  amber:  'bg-amber-100 text-amber-600',
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

function CarouselElementEditor({ element, nodeId }) {
  const updateNodeElement = useQuizStore((s) => s.updateNodeElement);
  const slides = element.slides || [];

  const addSlide = () => {
    const newSlides = [...slides, { url: '', caption: '' }];
    updateNodeElement(nodeId, element.id, { slides: newSlides });
  };
  const updateSlide = (index, field, value) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    updateNodeElement(nodeId, element.id, { slides: newSlides });
  };
  const removeSlide = (index) => {
    const newSlides = slides.filter((_, i) => i !== index);
    updateNodeElement(nodeId, element.id, { slides: newSlides });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
        <input
          type="text"
          value={element.title || ''}
          onChange={(e) => updateNodeElement(nodeId, element.id, { title: e.target.value })}
          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
          placeholder="Título do carrossel..."
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Imagens ({slides.length})
          </label>
          <button
            onClick={addSlide}
            className="text-accent hover:text-accent-hover text-sm font-medium flex items-center gap-1"
          >
            <Plus size={16} /> Adicionar
          </button>
        </div>
        <div className="space-y-2">
          {slides.map((slide, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Slide {index + 1}</span>
                <button
                  onClick={() => removeSlide(index)}
                  className="text-gray-400 hover:text-red-500 p-0.5"
                >
                  <X size={14} />
                </button>
              </div>
              <input
                type="text"
                value={slide.url || ''}
                onChange={(e) => updateSlide(index, 'url', e.target.value)}
                className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:border-transparent"
                placeholder="URL da imagem..."
              />
              <input
                type="text"
                value={slide.caption || ''}
                onChange={(e) => updateSlide(index, 'caption', e.target.value)}
                className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:border-transparent"
                placeholder="Legenda (opcional)..."
              />
              {slide.url && (
                <img
                  src={slide.url}
                  alt={slide.caption || `Slide ${index + 1}`}
                  className="w-full h-20 object-cover rounded border border-gray-200"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </div>
          ))}
          {slides.length === 0 && (
            <div className="text-center py-4 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
              Nenhuma imagem adicionada
            </div>
          )}
        </div>
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

// ── Emoji Picker ─────────────────────────────────────────────────

const EMOJI_CATEGORIES = {
  'Pessoas': ['😀','😃','😄','😁','😅','😂','🤣','😊','😇','🙂','😉','😍','🥰','😘','😋','😛','😜','🤪','😎','🤩','🥳','😏','😒','😞','😢','😭','😤','🤯','😱','🤔','🤫','🤭','🙄','😴','🤮','🤑','😈','👻','💀','👽','🤖','💩','🙈','🙉','🙊'],
  'Gestos': ['👍','👎','👏','🙌','🤝','✌️','🤞','🤟','🤘','👊','✊','👋','🖐️','✋','👆','👇','👈','👉','🫵','☝️','💪','🙏','🤲','👐'],
  'Pessoas 2': ['🙎🏻','🙎🏻‍♀️','🧑','👨','👩','👶','👴','👵','🧔','👱','👱‍♀️','🤴','👸','🦸','🦹','🧙','🧑‍💼','👨‍💻','👩‍💻','🧑‍🎓'],
  'Símbolos': ['✅','❌','⭐','🌟','💫','✨','❤️','🧡','💛','💚','💙','💜','🖤','🤍','💯','🔥','💥','💢','💤','💬','👁️','🎯','🏆','🎖️','🥇','🥈','🥉','🏅'],
  'Objetos': ['📱','💻','⌨️','🖥️','📧','📞','📸','🎥','🎬','🎵','🎶','🎮','🕹️','🎲','🃏','💰','💵','💳','📊','📈','📉','🔑','🔒','🔔','📌','📎','✏️','📝'],
  'Natureza': ['☀️','🌙','⭐','🌈','☁️','⛈️','❄️','🔥','💧','🌊','🌸','🌺','🌻','🍀','🌿','🌲','🍎','🍊','🍋','🍇','🍕','🍔','☕','🍺'],
  'Transporte': ['🚗','🚕','🚙','🏎️','🚌','🚎','🏍️','✈️','🚀','🛸','🚁','⛵','🚢','🚂','🏠','🏢','🏥','🏫','🏪','🏭'],
};

function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('Pessoas');
  const pickerRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-2xl text-center hover:border-accent/40 focus:ring-1 focus:ring-accent transition-colors cursor-pointer"
        title="Escolher emoji"
      >
        {value || '⭐'}
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-64 -translate-x-1/4">
          {/* Category tabs */}
          <div className="flex gap-0.5 p-1.5 border-b border-gray-100 overflow-x-auto">
            {Object.keys(EMOJI_CATEGORIES).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-[10px] px-1.5 py-1 rounded whitespace-nowrap transition-colors ${
                  category === cat ? 'bg-accent text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Emoji grid */}
          <div className="grid grid-cols-8 gap-0.5 p-2 max-h-40 overflow-y-auto">
            {EMOJI_CATEGORIES[category].map((emoji) => (
              <button
                key={emoji}
                onClick={() => { onChange(emoji); setOpen(false); }}
                className="w-7 h-7 flex items-center justify-center text-lg hover:bg-accent/10 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function IconQuestionElementEditor({ element, nodeId }) {
  const updateNodeElement = useQuizStore((s) => s.updateNodeElement);

  const handleOptionChange = (index, field, value) => {
    const opts = [...(element.options || [])];
    opts[index] = { ...opts[index], [field]: value };
    updateNodeElement(nodeId, element.id, { options: opts });
  };

  const addOption = () => {
    const opts = [
      ...(element.options || []),
      { text: `Opção ${(element.options?.length || 0) + 1}`, icon: '⭐', image: '', score: 0 },
    ];
    updateNodeElement(nodeId, element.id, { options: opts });
  };

  const removeOption = (index) => {
    const opts = (element.options || []).filter((_, i) => i !== index);
    updateNodeElement(nodeId, element.id, { options: opts });
  };

  const columns = element.columns || 2;
  const optionStyle = element.optionStyle || 'emoji';

  return (
    <div className="space-y-4">
      {/* Question */}
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

      {/* Columns selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Colunas</label>
        <div className="flex gap-1">
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => updateNodeElement(nodeId, element.id, { columns: n })}
              className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                columns === n
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-accent/40'
              }`}
            >
              {n} cols
            </button>
          ))}
        </div>
      </div>

      {/* Option style selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Estilo das Opções</label>
        <div className="flex gap-1">
          {[
            { value: 'emoji', label: '😀 Emoji' },
            { value: 'image', label: '🖼️ Imagem' },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => updateNodeElement(nodeId, element.id, { optionStyle: s.value })}
              className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                optionStyle === s.value
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-accent/40'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
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
        <div className="space-y-3">
          {(element.options || []).map((option, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                {/* Icon/Image preview */}
                <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0">
                  {optionStyle === 'image' && option.image ? (
                    <img src={option.image} alt="" className="w-10 h-10 object-cover rounded" />
                  ) : (
                    <span className="text-2xl">{option.icon || '⭐'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  {optionStyle === 'emoji' ? (
                    <EmojiPicker
                      value={option.icon}
                      onChange={(emoji) => handleOptionChange(index, 'icon', emoji)}
                    />
                  ) : (
                    <input
                      type="text"
                      value={option.image || ''}
                      onChange={(e) => handleOptionChange(index, 'image', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-accent focus:border-transparent"
                      placeholder="URL da imagem..."
                    />
                  )}
                  <input
                    type="text"
                    value={option.text || ''}
                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-accent focus:border-transparent"
                    placeholder="Texto da opção..."
                  />
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <input
                    type="number"
                    value={option.score || 0}
                    onChange={(e) => handleOptionChange(index, 'score', parseInt(e.target.value) || 0)}
                    className="w-14 bg-white border border-gray-200 rounded px-1.5 py-1 text-sm text-center focus:ring-1 focus:ring-accent focus:border-transparent"
                    title="Pontuação"
                  />
                  <button onClick={() => removeOption(index)} className="text-gray-400 hover:text-red-500 p-0.5">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OpenQuestionElementEditor({ element, nodeId }) {
  const updateNodeElement = useQuizStore((s) => s.updateNodeElement);
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Placeholder</label>
        <input
          type="text"
          value={element.placeholder || ''}
          onChange={(e) => updateNodeElement(nodeId, element.id, { placeholder: e.target.value })}
          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
          placeholder="Texto de exemplo no campo..."
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Obrigatório</p>
          <p className="text-xs text-gray-400">Exigir resposta para continuar</p>
        </div>
        <button
          onClick={() => updateNodeElement(nodeId, element.id, { required: !element.required })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            element.required ? 'bg-accent' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              element.required ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Multilinha</p>
          <p className="text-xs text-gray-400">Textarea vs input simples</p>
        </div>
        <button
          onClick={() => updateNodeElement(nodeId, element.id, { multiline: !element.multiline })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            element.multiline ? 'bg-accent' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              element.multiline ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Máx. caracteres</label>
        <input
          type="number"
          value={element.maxLength || 500}
          onChange={(e) => updateNodeElement(nodeId, element.id, { maxLength: parseInt(e.target.value) || 500 })}
          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
          min="1"
          max="5000"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Pontuação (por responder)</label>
        <input
          type="number"
          value={element.score || 0}
          onChange={(e) => updateNodeElement(nodeId, element.id, { score: parseInt(e.target.value) || 0 })}
          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
        />
      </div>
    </div>
  );
}

function RatingElementEditor({ element, nodeId }) {
  const updateNodeElement = useQuizStore((s) => s.updateNodeElement);
  const ratingType = element.ratingType || 'number';
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="space-y-4">
      {/* Question */}
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

      {/* Rating type selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de nota</label>
        <select
          value={ratingType}
          onChange={(e) => updateNodeElement(nodeId, element.id, { ratingType: e.target.value })}
          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm bg-white"
        >
          <option value="stars">⭐ Estrelas</option>
          <option value="number">🔢 Número</option>
          <option value="slider">🎚️ Slider</option>
        </select>
      </div>

      {/* Stars options */}
      {ratingType === 'stars' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade de estrelas</label>
            <select
              value={element.maxStars || 5}
              onChange={(e) => updateNodeElement(nodeId, element.id, { maxStars: parseInt(e.target.value) })}
              className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm bg-white"
            >
              <option value={3}>3 estrelas</option>
              <option value={5}>5 estrelas</option>
              <option value={7}>7 estrelas</option>
              <option value={10}>10 estrelas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Label mínimo</label>
            <input
              type="text"
              value={element.labelMin || ''}
              onChange={(e) => updateNodeElement(nodeId, element.id, { labelMin: e.target.value })}
              className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
              placeholder="Péssimo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Label máximo</label>
            <input
              type="text"
              value={element.labelMax || ''}
              onChange={(e) => updateNodeElement(nodeId, element.id, { labelMax: e.target.value })}
              className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
              placeholder="Excelente"
            />
          </div>
        </>
      )}

      {/* Number options */}
      {ratingType === 'number' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor mínimo</label>
              <input
                type="number"
                value={element.minValue ?? 0}
                onChange={(e) => updateNodeElement(nodeId, element.id, { minValue: parseInt(e.target.value) || 0 })}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor máximo</label>
              <input
                type="number"
                value={element.maxValue ?? 10}
                onChange={(e) => updateNodeElement(nodeId, element.id, { maxValue: parseInt(e.target.value) || 10 })}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Label mínimo</label>
            <input
              type="text"
              value={element.labelMin || ''}
              onChange={(e) => updateNodeElement(nodeId, element.id, { labelMin: e.target.value })}
              className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
              placeholder="Nada provável"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Label máximo</label>
            <input
              type="text"
              value={element.labelMax || ''}
              onChange={(e) => updateNodeElement(nodeId, element.id, { labelMax: e.target.value })}
              className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
              placeholder="Muito provável"
            />
          </div>
        </>
      )}

      {/* Slider options */}
      {ratingType === 'slider' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor mínimo</label>
              <input
                type="number"
                value={element.sliderMin ?? 0}
                onChange={(e) => updateNodeElement(nodeId, element.id, { sliderMin: parseInt(e.target.value) || 0 })}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor máximo</label>
              <input
                type="number"
                value={element.sliderMax ?? 100}
                onChange={(e) => updateNodeElement(nodeId, element.id, { sliderMax: parseInt(e.target.value) || 100 })}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Step</label>
              <input
                type="number"
                value={element.sliderStep ?? 1}
                onChange={(e) => updateNodeElement(nodeId, element.id, { sliderStep: parseInt(e.target.value) || 1 })}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unidade</label>
              <input
                type="text"
                value={element.sliderUnit || ''}
                onChange={(e) => updateNodeElement(nodeId, element.id, { sliderUnit: e.target.value })}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
                placeholder="anos, %, R$"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Label mínimo</label>
            <input
              type="text"
              value={element.labelMin || ''}
              onChange={(e) => updateNodeElement(nodeId, element.id, { labelMin: e.target.value })}
              className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
              placeholder="Mínimo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Label máximo</label>
            <input
              type="text"
              value={element.labelMax || ''}
              onChange={(e) => updateNodeElement(nodeId, element.id, { labelMax: e.target.value })}
              className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
              placeholder="Máximo"
            />
          </div>
        </>
      )}

      {/* Required toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Obrigatório</p>
          <p className="text-xs text-gray-400">Exigir resposta para continuar</p>
        </div>
        <button
          onClick={() => updateNodeElement(nodeId, element.id, { required: !element.required })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            element.required ? 'bg-accent' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              element.required ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Score multiplier */}
      <div className="relative">
        <div className="flex items-center gap-1 mb-2">
          <label className="text-sm font-medium text-gray-700">Multiplicador de score</label>
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Info size={14} />
          </button>
          {showTooltip && (
            <div className="absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 z-50 whitespace-nowrap shadow-lg">
              O valor selecionado × multiplicador = pontuação
            </div>
          )}
        </div>
        <input
          type="number"
          value={element.scoreMultiplier ?? 1}
          onChange={(e) => updateNodeElement(nodeId, element.id, { scoreMultiplier: parseFloat(e.target.value) || 1 })}
          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
          step="0.1"
          min="0"
        />
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

const SEGMENT_COLORS = [
  '#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#6b7280',
  '#ef4444', '#3b82f6', '#8b5cf6', '#14b8a6', '#f97316',
];

function SpinWheelElementEditor({ element, nodeId }) {
  const updateNodeElement = useQuizStore((s) => s.updateNodeElement);
  const segments = element.segments || [];
  const totalProb = segments.reduce((s, seg) => s + (seg.probability || 0), 0);

  const handleSegmentChange = (index, field, value) => {
    const segs = [...segments];
    segs[index] = { ...segs[index], [field]: field === 'probability' ? (parseInt(value) || 0) : value };
    updateNodeElement(nodeId, element.id, { segments: segs });
  };

  const addSegment = () => {
    const segs = [
      ...segments,
      { text: `Prêmio ${segments.length + 1}`, color: SEGMENT_COLORS[segments.length % SEGMENT_COLORS.length], probability: 10 },
    ];
    updateNodeElement(nodeId, element.id, { segments: segs });
  };

  const removeSegment = (index) => {
    const segs = segments.filter((_, i) => i !== index);
    updateNodeElement(nodeId, element.id, { segments: segs });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
        <input
          type="text"
          value={element.title || ''}
          onChange={(e) => updateNodeElement(nodeId, element.id, { title: e.target.value })}
          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
          placeholder="Título da roleta..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Texto do Botão</label>
        <input
          type="text"
          value={element.buttonText || ''}
          onChange={(e) => updateNodeElement(nodeId, element.id, { buttonText: e.target.value })}
          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
          placeholder="GIRAR!"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Pontuação (por girar)</label>
        <input
          type="number"
          value={element.score || 0}
          onChange={(e) => updateNodeElement(nodeId, element.id, { score: parseInt(e.target.value) || 0 })}
          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Segmentos</label>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${totalProb === 100 ? 'text-green-600' : 'text-red-500'}`}>
              Total: {totalProb}%{totalProb !== 100 && ' ⚠️'}
            </span>
            <button
              onClick={addSegment}
              className="text-accent hover:text-accent-hover text-sm font-medium flex items-center gap-1"
            >
              <Plus size={14} /> Adicionar
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {segments.map((seg, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-2.5 space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-full shrink-0 border border-gray-200 cursor-pointer"
                  style={{ backgroundColor: seg.color }}
                  title="Cor do segmento"
                />
                <input
                  type="text"
                  value={seg.text}
                  onChange={(e) => handleSegmentChange(index, 'text', e.target.value)}
                  className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-accent focus:border-transparent"
                  placeholder="Texto do prêmio..."
                />
                <button onClick={() => removeSegment(index)} className="text-gray-400 hover:text-red-500 p-0.5">
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={seg.color}
                  onChange={(e) => handleSegmentChange(index, 'color', e.target.value)}
                  className="w-8 h-6 rounded border border-gray-200 cursor-pointer"
                />
                <div className="flex items-center gap-1 flex-1">
                  <input
                    type="number"
                    value={seg.probability || 0}
                    onChange={(e) => handleSegmentChange(index, 'probability', e.target.value)}
                    className="w-16 bg-white border border-gray-200 rounded px-2 py-1 text-sm text-center focus:ring-1 focus:ring-accent focus:border-transparent"
                    min="0"
                    max="100"
                  />
                  <span className="text-xs text-gray-400">%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScratchCardElementEditor({ element, nodeId }) {
  const updateNodeElement = useQuizStore((s) => s.updateNodeElement);
  const patterns = [
    { value: 'solid', label: 'Sólido' },
    { value: 'dots', label: 'Pontos' },
    { value: 'stars', label: 'Estrelas' },
  ];

  return (
    <div className="space-y-4">
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Instrução</label>
        <input
          type="text"
          value={element.instruction || ''}
          onChange={(e) => updateNodeElement(nodeId, element.id, { instruction: e.target.value })}
          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
          placeholder="Passe o dedo para revelar..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Texto Revelado</label>
        <textarea
          value={element.revealText || ''}
          onChange={(e) => updateNodeElement(nodeId, element.id, { revealText: e.target.value })}
          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm resize-none"
          rows={2}
          placeholder="🎉 Seu prêmio aqui!"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cor da Cobertura</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={element.coverColor || '#7c3aed'}
            onChange={(e) => updateNodeElement(nodeId, element.id, { coverColor: e.target.value })}
            className="w-10 h-8 rounded border border-gray-200 cursor-pointer"
          />
          <span className="text-sm text-gray-500">{element.coverColor || '#7c3aed'}</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Padrão da Cobertura</label>
        <div className="flex gap-1">
          {patterns.map((p) => (
            <button
              key={p.value}
              onClick={() => updateNodeElement(nodeId, element.id, { coverPattern: p.value })}
              className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                (element.coverPattern || 'dots') === p.value
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-accent/40'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Pontuação</label>
        <input
          type="number"
          value={element.score || 0}
          onChange={(e) => updateNodeElement(nodeId, element.id, { score: parseInt(e.target.value) || 0 })}
          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
        />
      </div>
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
      return <MediaElementEditor element={element} nodeId={nodeId} />;
    case 'carousel':
      return <CarouselElementEditor element={element} nodeId={nodeId} />;
    case 'question-single':
    case 'question-multiple':
      return <QuestionElementEditor element={element} nodeId={nodeId} />;
    case 'question-icons':
      return <IconQuestionElementEditor element={element} nodeId={nodeId} />;
    case 'question-open':
      return <OpenQuestionElementEditor element={element} nodeId={nodeId} />;
    case 'question-rating':
      return <RatingElementEditor element={element} nodeId={nodeId} />;
    case 'lead-form':
      return <LeadFormElementEditor element={element} nodeId={nodeId} />;
    case 'script':
      return <ScriptElementEditor element={element} nodeId={nodeId} />;
    case 'spin-wheel':
      return <SpinWheelElementEditor element={element} nodeId={nodeId} />;
    case 'scratch-card':
      return <ScratchCardElementEditor element={element} nodeId={nodeId} />;
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
              (el) => el.type === 'question-single' || el.type === 'question-multiple' || el.type === 'question-icons' || el.type === 'question-rating',
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
