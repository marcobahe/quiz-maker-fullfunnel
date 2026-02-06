'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Palette,
  Type,
  RectangleHorizontal,
  Image as ImageIcon,
  Eye,
  Sparkles,
  ChevronRight,
  Lock,
  Globe,
  Settings,
  Shuffle,
  Timer,
  Info,
  Monitor,
  Upload,
  MessageCircle,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
} from 'lucide-react';
import useQuizStore from '@/store/quizStore';
import { canUseWhiteLabel } from '@/lib/plans';
import { PATTERN_META, getPatternStyle } from '@/lib/patterns';

// ── Gradient Presets ─────────────────────────────────────────
const GRADIENT_PRESETS = [
  {
    name: 'Purple Night',
    value: 'from-purple-900 via-purple-800 to-indigo-900',
    colors: ['#581c87', '#6b21a8', '#312e81'],
  },
  {
    name: 'Ocean Blue',
    value: 'from-blue-900 via-blue-800 to-cyan-900',
    colors: ['#1e3a5f', '#1e40af', '#164e63'],
  },
  {
    name: 'Forest Green',
    value: 'from-emerald-900 via-green-800 to-teal-900',
    colors: ['#064e3b', '#166534', '#134e4a'],
  },
  {
    name: 'Sunset',
    value: 'from-orange-900 via-red-800 to-pink-900',
    colors: ['#7c2d12', '#991b1b', '#831843'],
  },
  {
    name: 'Midnight',
    value: 'from-gray-900 via-slate-800 to-zinc-900',
    colors: ['#111827', '#1e293b', '#18181b'],
  },
  {
    name: 'Rose Gold',
    value: 'from-rose-900 via-pink-800 to-fuchsia-900',
    colors: ['#881337', '#9d174d', '#701a75'],
  },
];

// ── Font Options ─────────────────────────────────────────────
const FONT_OPTIONS = [
  { name: 'Inter', value: 'Inter' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Montserrat', value: 'Montserrat' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Playfair Display', value: 'Playfair Display' },
];

// ── Button Style Options ─────────────────────────────────────
const BUTTON_STYLES = [
  { name: 'Arredondado', value: 'rounded', radius: '0.75rem' },
  { name: 'Quadrado', value: 'square', radius: '0.25rem' },
  { name: 'Pill', value: 'pill', radius: '9999px' },
];

// ── Color Input Component ────────────────────────────────────
function ColorPicker({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer appearance-none bg-transparent p-0"
          style={{ WebkitAppearance: 'none' }}
        />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1 border border-gray-200 w-24 mt-0.5 font-mono"
        />
      </div>
    </div>
  );
}

// ── Plan Gate Badge ──────────────────────────────────────────
function PlanGate({ children, isLocked, planName = 'Business' }) {
  if (!isLocked) return children;
  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-gray-800/90 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
          <Lock size={12} />
          <span>Disponível no plano {planName}</span>
        </div>
      </div>
    </div>
  );
}

// ── Mini Preview ─────────────────────────────────────────────
function MiniPreview({ theme, branding }) {
  const gradientMap = {};
  GRADIENT_PRESETS.forEach((g) => {
    gradientMap[g.value] = `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]}, ${g.colors[2]})`;
  });

  // Page background styles
  const getPageBgStyle = () => {
    const pb = theme.pageBackground || {};
    
    switch (pb.type) {
      case 'gradient':
        return gradientMap[pb.gradient] 
          ? { background: gradientMap[pb.gradient] }
          : { backgroundColor: pb.color || theme.backgroundColor };
      
      case 'image':
        if (pb.imageUrl) {
          const fitMap = {
            cover: 'cover',
            contain: 'contain', 
            repeat: 'repeat'
          };
          return {
            backgroundImage: `url(${pb.imageUrl})`,
            backgroundSize: fitMap[pb.imageFit] || 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: pb.imageFit === 'repeat' ? 'repeat' : 'no-repeat',
          };
        }
        return { backgroundColor: pb.color || theme.backgroundColor };
      
      case 'pattern':
        const patternStyle = getPatternStyle(pb.pattern || 'dots', pb.color || theme.primaryColor);
        return {
          backgroundColor: pb.color || theme.backgroundColor,
          ...patternStyle,
        };
      
      default: // 'color'
        return { backgroundColor: pb.color || theme.backgroundColor };
    }
  };

  // Quiz card background (original bgStyle)
  const cardBgStyle =
    theme.backgroundType === 'gradient' && gradientMap[theme.backgroundGradient]
      ? { background: gradientMap[theme.backgroundGradient] }
      : { backgroundColor: theme.backgroundColor };

  const btnRadius =
    theme.buttonStyle === 'pill'
      ? '9999px'
      : theme.buttonStyle === 'square'
        ? '0.25rem'
        : '0.75rem';

  const pageStyle = getPageBgStyle();

  return (
    <div
      className="rounded-xl overflow-hidden border border-gray-200 shadow-sm relative"
      style={{
        ...pageStyle,
        minHeight: 240,
        padding: '16px',
      }}
    >
      {/* Image overlay if using image background */}
      {theme.pageBackground?.type === 'image' && theme.pageBackground?.imageUrl && theme.pageBackground?.imageOverlay > 0 && (
        <div 
          className="absolute inset-0 rounded-xl"
          style={{
            backgroundColor: 'rgba(0, 0, 0, ' + (theme.pageBackground.imageOverlay || 0.5) + ')',
          }}
        />
      )}
      
      {/* Quiz Card */}
      <div
        className="relative rounded-lg overflow-hidden shadow-md"
        style={{
          ...cardBgStyle,
          color: theme.textColor,
          fontFamily: theme.fontFamily,
        }}
      >
        {/* Mini header */}
        <div className="p-3 flex items-center gap-2">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt="Logo"
              className="w-6 h-6 rounded object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              Q
            </div>
          )}
          <span className="text-xs opacity-80">Meu Quiz</span>
        </div>

        {/* Progress bar */}
        <div className="px-3 mb-3">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: '60%', backgroundColor: theme.textColor }}
            />
          </div>
        </div>

        {/* Card content */}
        <div className="mx-3 mb-3 bg-white rounded-lg p-3">
          <p className="text-xs font-bold text-gray-800 mb-2" style={{ fontFamily: theme.fontFamily }}>
            Qual é a sua pergunta?
          </p>
          <div className="space-y-1.5">
            {['Opção A', 'Opção B'].map((opt, i) => (
              <div
                key={i}
                className={`text-xs px-2 py-1.5 border flex items-center gap-2 ${i === 0 ? 'border-current' : 'border-gray-200'}`}
                style={{
                  borderRadius: btnRadius,
                  color: i === 0 ? theme.primaryColor : '#6b7280',
                  borderColor: i === 0 ? theme.primaryColor : '#e5e7eb',
                  backgroundColor: i === 0 ? `${theme.primaryColor}10` : 'transparent',
                }}
              >
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                  style={{
                    backgroundColor: i === 0 ? theme.primaryColor : '#f3f4f6',
                    color: i === 0 ? '#fff' : '#6b7280',
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </div>
            ))}
          </div>

          <button
            className="w-full mt-2 text-white text-xs py-1.5 font-medium flex items-center justify-center gap-1"
            style={{
              backgroundColor: theme.primaryColor,
              borderRadius: btnRadius,
            }}
          >
            Continuar <ChevronRight size={12} />
          </button>
        </div>

        {/* Footer */}
        {branding.showBranding && (
          <div className="px-3 pb-2 text-center">
            <span className="text-[9px] opacity-40">Feito com QuizMeBaby</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ThemeEditor ─────────────────────────────────────────
export default function ThemeEditor() {
  const { data: session } = useSession();
  const userPlan = session?.user?.plan || 'free';
  const isWhiteLabelAllowed = canUseWhiteLabel(userPlan);

  const theme = useQuizStore((s) => s.quizSettings.theme);
  const branding = useQuizStore((s) => s.quizSettings.branding);
  const preloadMessage = useQuizStore((s) => s.quizSettings.preloadMessage || {
    text: '👀 Antes de começar… Esse quiz foi criado pra revelar coisas que muita gente só percebe tarde demais.',
    fontSize: '1.25rem',
    fontFamily: 'Outfit',
    color: '#475569',
    textAlign: 'center',
    fontWeight: 'medium',
  });
  const behavior = useQuizStore((s) => s.quizSettings.behavior || { shuffleQuestions: false, questionTimer: null });
  const updateTheme = useQuizStore((s) => s.updateTheme);
  const updateBranding = useQuizStore((s) => s.updateBranding);
  const updatePreloadMessage = useQuizStore((s) => s.updatePreloadMessage);
  const updateBehavior = useQuizStore((s) => s.updateBehavior);

  const [expandedSection, setExpandedSection] = useState('colors');

  const toggleSection = (section) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Eye size={16} /> Preview
        </h3>
        <MiniPreview theme={theme} branding={branding} />
      </div>

      {/* ── Colors Section ────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('colors')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2 font-medium text-gray-800">
            <Palette size={18} className="text-accent" /> Cores
          </span>
          <ChevronRight
            size={18}
            className={`text-gray-400 transition-transform ${expandedSection === 'colors' ? 'rotate-90' : ''}`}
          />
        </button>

        {expandedSection === 'colors' && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
            <ColorPicker
              label="Cor Primária"
              value={theme.primaryColor}
              onChange={(v) => updateTheme({ primaryColor: v })}
            />
            <ColorPicker
              label="Cor Secundária"
              value={theme.secondaryColor}
              onChange={(v) => updateTheme({ secondaryColor: v })}
            />
            <ColorPicker
              label="Cor do Texto"
              value={theme.textColor}
              onChange={(v) => updateTheme({ textColor: v })}
            />
            <ColorPicker
              label="Cor de Fundo"
              value={theme.backgroundColor}
              onChange={(v) => updateTheme({ backgroundColor: v })}
            />
          </div>
        )}
      </div>

      {/* ── Page Background Section ────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('pageBackground')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2 font-medium text-gray-800">
            <Monitor size={18} className="text-accent" /> Fundo da Página
          </span>
          <ChevronRight
            size={18}
            className={`text-gray-400 transition-transform ${expandedSection === 'pageBackground' ? 'rotate-90' : ''}`}
          />
        </button>

        {expandedSection === 'pageBackground' && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
            {/* Page Background Type */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Tipo de Fundo da Página</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Cor Sólida', value: 'color' },
                  { label: 'Gradiente', value: 'gradient' },
                  { label: 'Imagem', value: 'image' },
                  { label: 'Padrão', value: 'pattern' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateTheme({ pageBackground: { ...(theme.pageBackground || {}), type: opt.value } })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      (theme.pageBackground?.type || 'color') === opt.value
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker for color type */}
            {(!theme.pageBackground?.type || theme.pageBackground?.type === 'color') && (
              <ColorPicker
                label="Cor do Fundo"
                value={theme.pageBackground?.color || theme.backgroundColor}
                onChange={(color) => updateTheme({ 
                  pageBackground: { ...(theme.pageBackground || {}), color }
                })}
              />
            )}

            {/* Gradient presets for gradient type */}
            {theme.pageBackground?.type === 'gradient' && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Gradiente</p>
                <div className="grid grid-cols-3 gap-2">
                  {GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => updateTheme({ 
                        pageBackground: { ...(theme.pageBackground || {}), gradient: preset.value }
                      })}
                      className={`relative rounded-lg overflow-hidden h-16 transition-all ${
                        (theme.pageBackground?.gradient || theme.backgroundGradient) === preset.value
                          ? 'ring-2 ring-accent ring-offset-2'
                          : 'ring-1 ring-gray-200 hover:ring-gray-300'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]}, ${preset.colors[2]})`,
                      }}
                    >
                      <span className="absolute bottom-1 left-1 right-1 text-[9px] text-white font-medium text-center bg-black/30 rounded px-1 py-0.5">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Image configuration */}
            {theme.pageBackground?.type === 'image' && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">URL da Imagem</p>
                  <input
                    type="url"
                    value={theme.pageBackground?.imageUrl || ''}
                    onChange={(e) => updateTheme({ 
                      pageBackground: { ...(theme.pageBackground || {}), imageUrl: e.target.value }
                    })}
                    placeholder="Cole a URL da imagem"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Ajuste da Imagem</p>
                  <select
                    value={theme.pageBackground?.imageFit || 'cover'}
                    onChange={(e) => updateTheme({ 
                      pageBackground: { ...(theme.pageBackground || {}), imageFit: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                  >
                    <option value="cover">Cobrir</option>
                    <option value="contain">Conter</option>
                    <option value="repeat">Repetir</option>
                  </select>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Overlay Escuro ({Math.round((theme.pageBackground?.imageOverlay || 0.5) * 100)}%)
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={theme.pageBackground?.imageOverlay || 0.5}
                    onChange={(e) => updateTheme({ 
                      pageBackground: { ...(theme.pageBackground || {}), imageOverlay: parseFloat(e.target.value) }
                    })}
                    className="w-full accent-accent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Aumenta a legibilidade adicionando uma camada escura sobre a imagem
                  </p>
                </div>

                {theme.pageBackground?.imageUrl && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Preview</p>
                    <img
                      src={theme.pageBackground.imageUrl}
                      alt="Preview"
                      className="w-full h-20 object-cover rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Pattern selection */}
            {theme.pageBackground?.type === 'pattern' && (
              <div className="space-y-3">
                <ColorPicker
                  label="Cor Base do Padrão"
                  value={theme.pageBackground?.color || theme.primaryColor}
                  onChange={(color) => updateTheme({ 
                    pageBackground: { ...(theme.pageBackground || {}), color }
                  })}
                />

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Padrão</p>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(PATTERN_META).map(([key, meta]) => {
                      const isSelected = (theme.pageBackground?.pattern || 'dots') === key;
                      const patternStyle = getPatternStyle(key, theme.pageBackground?.color || theme.primaryColor);
                      
                      return (
                        <button
                          key={key}
                          onClick={() => updateTheme({ 
                            pageBackground: { ...(theme.pageBackground || {}), pattern: key }
                          })}
                          className={`relative rounded-lg h-16 transition-all border-2 ${
                            isSelected
                              ? 'border-accent shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{
                            backgroundColor: theme.pageBackground?.color || theme.primaryColor,
                            ...patternStyle,
                          }}
                        >
                          <span className="absolute bottom-1 left-1 right-1 text-[9px] text-white font-medium text-center bg-black/60 rounded px-1 py-0.5">
                            {meta.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Quiz Background Section ────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('quizBackground')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2 font-medium text-gray-800">
            <Sparkles size={18} className="text-accent" /> Fundo do Quiz
          </span>
          <ChevronRight
            size={18}
            className={`text-gray-400 transition-transform ${expandedSection === 'quizBackground' ? 'rotate-90' : ''}`}
          />
        </button>

        {expandedSection === 'quizBackground' && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
            {/* Background Type */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Tipo de Fundo do Quiz</p>
              <div className="flex gap-2">
                {[
                  { label: 'Cor Sólida', value: 'solid' },
                  { label: 'Gradiente', value: 'gradient' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateTheme({ backgroundType: opt.value })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      theme.backgroundType === opt.value
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gradient Presets */}
            {theme.backgroundType === 'gradient' && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Gradiente</p>
                <div className="grid grid-cols-3 gap-2">
                  {GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => updateTheme({ backgroundGradient: preset.value })}
                      className={`relative rounded-lg overflow-hidden h-16 transition-all ${
                        theme.backgroundGradient === preset.value
                          ? 'ring-2 ring-accent ring-offset-2'
                          : 'ring-1 ring-gray-200 hover:ring-gray-300'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]}, ${preset.colors[2]})`,
                      }}
                    >
                      <span className="absolute bottom-1 left-1 right-1 text-[9px] text-white font-medium text-center bg-black/30 rounded px-1 py-0.5">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Typography Section ────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('typography')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2 font-medium text-gray-800">
            <Type size={18} className="text-accent" /> Tipografia
          </span>
          <ChevronRight
            size={18}
            className={`text-gray-400 transition-transform ${expandedSection === 'typography' ? 'rotate-90' : ''}`}
          />
        </button>

        {expandedSection === 'typography' && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Fonte</p>
            <select
              value={theme.fontFamily}
              onChange={(e) => updateTheme({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.name}
                </option>
              ))}
            </select>

            {/* Font preview */}
            <div
              className="mt-3 p-3 bg-gray-50 rounded-lg text-center"
              style={{ fontFamily: theme.fontFamily }}
            >
              <p className="text-lg font-bold text-gray-800">Aa Bb Cc 123</p>
              <p className="text-sm text-gray-500">
                {theme.fontFamily}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Button Style Section ──────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('buttons')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2 font-medium text-gray-800">
            <RectangleHorizontal size={18} className="text-accent" /> Botões
          </span>
          <ChevronRight
            size={18}
            className={`text-gray-400 transition-transform ${expandedSection === 'buttons' ? 'rotate-90' : ''}`}
          />
        </button>

        {expandedSection === 'buttons' && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Estilo do Botão</p>
            <div className="flex gap-3">
              {BUTTON_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => updateTheme({ buttonStyle: style.value })}
                  className={`flex-1 py-2 text-sm font-medium transition-all border-2 ${
                    theme.buttonStyle === style.value
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                  style={{ borderRadius: style.radius }}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Branding Section ──────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('branding')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2 font-medium text-gray-800">
            <ImageIcon size={18} className="text-accent" /> Marca
          </span>
          <ChevronRight
            size={18}
            className={`text-gray-400 transition-transform ${expandedSection === 'branding' ? 'rotate-90' : ''}`}
          />
        </button>

        {expandedSection === 'branding' && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
            {/* Logo URL — available to all plans */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">URL do Logo</p>
              <input
                type="url"
                value={branding.logoUrl}
                onChange={(e) => updateBranding({ logoUrl: e.target.value })}
                placeholder="https://exemplo.com/logo.png"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
              />
              {branding.logoUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={branding.logoUrl}
                    alt="Logo preview"
                    className="w-8 h-8 rounded object-cover border border-gray-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <span className="text-xs text-gray-500">Preview do logo</span>
                </div>
              )}
            </div>

            {/* ── White-Label Features (Business only) ──── */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe size={16} className="text-accent" />
                <p className="text-sm font-semibold text-gray-700">White-Label</p>
                {!isWhiteLabelAllowed && (
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Lock size={10} /> Business
                  </span>
                )}
              </div>

              {/* Favicon URL */}
              <PlanGate isLocked={!isWhiteLabelAllowed}>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">URL do Favicon</p>
                  <input
                    type="url"
                    value={branding.faviconUrl || ''}
                    onChange={(e) => updateBranding({ faviconUrl: e.target.value })}
                    placeholder="https://exemplo.com/favicon.ico"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Aparece na aba do navegador quando alguém abre seu quiz
                  </p>
                  {branding.faviconUrl && (
                    <div className="mt-2 flex items-center gap-2">
                      <img
                        src={branding.faviconUrl}
                        alt="Favicon preview"
                        className="w-5 h-5 rounded object-cover border border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <span className="text-xs text-gray-500">Preview do favicon</span>
                    </div>
                  )}
                </div>
              </PlanGate>

              {/* Show Branding Toggle */}
              <PlanGate isLocked={!isWhiteLabelAllowed}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Mostrar &quot;Feito com QuizMeBaby&quot;
                    </p>
                    <p className="text-xs text-gray-500">
                      Exibe um selo no rodapé do quiz
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      updateBranding({ showBranding: !branding.showBranding })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      branding.showBranding ? 'bg-accent' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        branding.showBranding ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </PlanGate>
            </div>
          </div>
        )}
      </div>

      {/* ── Preload Message Section ──────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('preloadMessage')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2 font-medium text-gray-800">
            <MessageCircle size={18} className="text-accent" /> Mensagem de Pré-load
          </span>
          <ChevronRight
            size={18}
            className={`text-gray-400 transition-transform ${expandedSection === 'preloadMessage' ? 'rotate-90' : ''}`}
          />
        </button>

        {expandedSection === 'preloadMessage' && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
            {/* Preview */}
            <div 
              className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-6 border border-gray-200"
            >
              <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">Preview</p>
              <div 
                className="text-center"
                style={{
                  fontFamily: preloadMessage.fontFamily || 'Outfit',
                  fontSize: preloadMessage.fontSize || '1.25rem',
                  color: preloadMessage.color || '#475569',
                  textAlign: preloadMessage.textAlign || 'center',
                  fontWeight: preloadMessage.fontWeight === 'bold' ? '700' : preloadMessage.fontWeight === 'medium' ? '500' : '400',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {preloadMessage.text || '👀 Antes de começar…'}
              </div>
            </div>

            {/* Text */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Texto da Mensagem</p>
              <textarea
                value={preloadMessage.text}
                onChange={(e) => updatePreloadMessage({ text: e.target.value })}
                placeholder="👀 Antes de começar… Esse quiz foi criado pra revelar coisas que muita gente só percebe tarde demais."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Use emojis para deixar mais atrativo! 🚀
              </p>
            </div>

            {/* Font Family */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Fonte</p>
              <select
                value={preloadMessage.fontFamily || 'Outfit'}
                onChange={(e) => updatePreloadMessage({ fontFamily: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
              >
                <option value="Outfit">Outfit</option>
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Poppins">Poppins</option>
                <option value="Montserrat">Montserrat</option>
              </select>
            </div>

            {/* Font Size */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Tamanho da Fonte</p>
              <div className="flex gap-2">
                {[
                  { label: 'Pequeno', value: '1rem' },
                  { label: 'Médio', value: '1.25rem' },
                  { label: 'Grande', value: '1.5rem' },
                  { label: 'Extra', value: '1.75rem' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updatePreloadMessage({ fontSize: opt.value })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      (preloadMessage.fontSize || '1.25rem') === opt.value
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <ColorPicker
              label="Cor do Texto"
              value={preloadMessage.color || '#475569'}
              onChange={(color) => updatePreloadMessage({ color })}
            />

            {/* Text Align */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Alinhamento</p>
              <div className="flex gap-2">
                {[
                  { label: <AlignLeft size={18} />, value: 'left' },
                  { label: <AlignCenter size={18} />, value: 'center' },
                  { label: <AlignRight size={18} />, value: 'right' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updatePreloadMessage({ textAlign: opt.value })}
                    className={`flex-1 px-3 py-2.5 rounded-lg flex items-center justify-center transition-colors ${
                      (preloadMessage.textAlign || 'center') === opt.value
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Weight */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Peso da Fonte</p>
              <div className="flex gap-2">
                {[
                  { label: 'Normal', value: 'normal' },
                  { label: 'Médio', value: 'medium' },
                  { label: 'Negrito', value: 'bold' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updatePreloadMessage({ fontWeight: opt.value })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      (preloadMessage.fontWeight || 'medium') === opt.value
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={{ fontWeight: opt.value === 'bold' ? 700 : opt.value === 'medium' ? 500 : 400 }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex gap-2">
                <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Dica:</p>
                  <p className="text-blue-600">
                    Esta mensagem aparece enquanto o quiz está carregando. Use para criar expectativa ou preparar o usuário para o conteúdo!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Behavior Section ──────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('behavior')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2 font-medium text-gray-800">
            <Settings size={18} className="text-accent" /> Comportamento
          </span>
          <ChevronRight
            size={18}
            className={`text-gray-400 transition-transform ${expandedSection === 'behavior' ? 'rotate-90' : ''}`}
          />
        </button>

        {expandedSection === 'behavior' && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
            {/* Shuffle Questions */}
            <div className="flex items-start justify-between">
              <div className="flex-1 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <Shuffle size={16} className="text-accent" />
                  <p className="text-sm font-medium text-gray-700">
                    Randomizar ordem das perguntas
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  As perguntas serão exibidas em ordem aleatória para cada respondente. Útil para quizzes de conhecimento.
                </p>
              </div>
              <button
                onClick={() => updateBehavior({ shuffleQuestions: !behavior.shuffleQuestions })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  behavior.shuffleQuestions ? 'bg-accent' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    behavior.shuffleQuestions ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Question Timer */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Timer size={16} className="text-accent" />
                    <p className="text-sm font-medium text-gray-700">
                      Timer por pergunta
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Adiciona um contador regressivo em cada pergunta. Quando o tempo acaba, avança automaticamente.
                  </p>
                </div>
                <button
                  onClick={() => updateBehavior({ questionTimer: behavior.questionTimer ? null : 30 })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    behavior.questionTimer ? 'bg-accent' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      behavior.questionTimer ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Timer Configuration */}
              {behavior.questionTimer && (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Segundos por pergunta</p>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="5"
                        max="300"
                        value={behavior.questionTimer || 30}
                        onChange={(e) => updateBehavior({ questionTimer: parseInt(e.target.value) })}
                        className="flex-1 accent-accent"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="5"
                          max="300"
                          value={behavior.questionTimer || 30}
                          onChange={(e) => updateBehavior({ questionTimer: Math.max(5, Math.min(300, parseInt(e.target.value) || 30)) })}
                          className="w-16 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-center"
                        />
                        <span className="text-sm text-gray-500">seg</span>
                      </div>
                    </div>
                  </div>

                  {/* Timer Preview */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1">
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full transition-all duration-1000"
                            style={{ width: '60%' }}
                          />
                        </div>
                      </div>
                      <div className="text-sm font-bold text-accent">
                        {behavior.questionTimer}s
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">Preview do timer</p>
                  </div>
                </div>
              )}
            </div>

            {/* Information Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex gap-2">
                <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Dicas importantes:</p>
                  <ul className="space-y-1 text-blue-600">
                    <li>• A randomização mantém o início e resultado no lugar</li>
                    <li>• O timer não funciona em quizzes com lógica de branches avançados</li>
                    <li>• Leads forms não são afetados pela randomização</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Notifications Section ──────────────────────── */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => toggleSection('notifications')}
          className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22M18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5S10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Notificações por Email</h3>
              <p className="text-sm text-gray-500">Configure alertas automáticos para novos leads</p>
            </div>
          </div>
          <ChevronRight
            size={18}
            className={`text-gray-400 transition-transform ${expandedSection === 'notifications' ? 'rotate-90' : ''}`}
          />
        </button>

        {expandedSection === 'notifications' && (
          <div className="p-4 border-t border-gray-100">
            
            {/* Email Notifications Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Ativar notificações por email
                </p>
                <p className="text-xs text-gray-500">
                  Receba alertas quando novos leads respondem seu quiz
                </p>
              </div>
              <button
                onClick={() => {
                  const newNotifications = {
                    ...quizSettings.notifications,
                    emailNotifications: !quizSettings.notifications.emailNotifications,
                  };
                  setQuizSettings({ 
                    ...quizSettings, 
                    notifications: newNotifications 
                  });
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  quizSettings.notifications.emailNotifications ? 'bg-accent' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    quizSettings.notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Notification Mode */}
            {quizSettings.notifications.emailNotifications && (
              <>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Modo de notificação</p>
                  <select
                    value={quizSettings.notifications.notificationMode || 'instant-hot'}
                    onChange={(e) => {
                      const newNotifications = {
                        ...quizSettings.notifications,
                        notificationMode: e.target.value,
                      };
                      setQuizSettings({ 
                        ...quizSettings, 
                        notifications: newNotifications 
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none bg-white"
                  >
                    <option value="instant-hot">Só leads quentes (instantâneo)</option>
                    <option value="daily">Resumo diário</option>
                    <option value="weekly">Resumo semanal</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {quizSettings.notifications.notificationMode === 'instant-hot' && "Envia email imediatamente quando um lead atinge a maior faixa de pontuação"}
                    {quizSettings.notifications.notificationMode === 'daily' && "Envia um resumo diário com todos os leads (em desenvolvimento)"}
                    {quizSettings.notifications.notificationMode === 'weekly' && "Envia um resumo semanal com todos os leads (em desenvolvimento)"}
                  </p>
                </div>

                {/* Notification Email */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Email para receber notificações</p>
                  <input
                    type="email"
                    value={quizSettings.notifications.notificationEmail || ''}
                    onChange={(e) => {
                      const newNotifications = {
                        ...quizSettings.notifications,
                        notificationEmail: e.target.value,
                      };
                      setQuizSettings({ 
                        ...quizSettings, 
                        notifications: newNotifications 
                      });
                    }}
                    placeholder={session?.user?.email || 'seu@email.com'}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deixe vazio para usar seu email de cadastro ({session?.user?.email || 'não encontrado'})
                  </p>
                </div>

                {/* Information Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium mb-1">Como funciona:</p>
                      <ul className="space-y-1 text-blue-600">
                        <li>• <strong>Leads quentes:</strong> Notificação instantânea quando alguém atinge a faixa de pontuação mais alta</li>
                        <li>• <strong>Resumo diário/semanal:</strong> Em desenvolvimento - será adicionado em breve</li>
                        <li>• Configure suas faixas de pontuação na seção "Faixas de Resultado" para definir quais leads são considerados "quentes"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
