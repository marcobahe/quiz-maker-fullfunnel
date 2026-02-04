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
} from 'lucide-react';
import useQuizStore from '@/store/quizStore';
import { canUseWhiteLabel } from '@/lib/plans';

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

  const bgStyle =
    theme.backgroundType === 'gradient' && gradientMap[theme.backgroundGradient]
      ? { background: gradientMap[theme.backgroundGradient] }
      : { backgroundColor: theme.backgroundColor };

  const btnRadius =
    theme.buttonStyle === 'pill'
      ? '9999px'
      : theme.buttonStyle === 'square'
        ? '0.25rem'
        : '0.75rem';

  return (
    <div
      className="rounded-xl overflow-hidden border border-gray-200 shadow-sm"
      style={{
        ...bgStyle,
        color: theme.textColor,
        fontFamily: theme.fontFamily,
        minHeight: 200,
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

      {/* Card */}
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
  );
}

// ── Main ThemeEditor ─────────────────────────────────────────
export default function ThemeEditor() {
  const { data: session } = useSession();
  const userPlan = session?.user?.plan || 'free';
  const isWhiteLabelAllowed = canUseWhiteLabel(userPlan);

  const theme = useQuizStore((s) => s.quizSettings.theme);
  const branding = useQuizStore((s) => s.quizSettings.branding);
  const updateTheme = useQuizStore((s) => s.updateTheme);
  const updateBranding = useQuizStore((s) => s.updateBranding);

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

      {/* ── Background Section ────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('background')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2 font-medium text-gray-800">
            <Sparkles size={18} className="text-accent" /> Fundo
          </span>
          <ChevronRight
            size={18}
            className={`text-gray-400 transition-transform ${expandedSection === 'background' ? 'rotate-90' : ''}`}
          />
        </button>

        {expandedSection === 'background' && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
            {/* Background Type */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Tipo de Fundo</p>
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
    </div>
  );
}
