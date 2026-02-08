'use client';

import { useEffect, useState, useCallback, useMemo, Suspense, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Trophy, ChevronRight, ArrowLeft, User, Mail, Phone, Loader2, CheckCircle, Play, Video, Music, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { replaceVariables, buildAnswersMap } from '@/lib/dynamicVariables';
import { initTracking, trackEvent } from '@/lib/tracking';
import { getPatternStyle } from '@/lib/patterns';
import { extractYouTubeId, youtubeEmbedUrl } from '@/lib/youtube';
import SpinWheel from '@/components/Player/SpinWheel';
import ScratchCard from '@/components/Player/ScratchCard';
import PhoneCallScreen from '@/components/Player/PhoneCallScreen';
import MysteryBox from '@/components/Player/MysteryBox';
import CardFlipScreen from '@/components/Player/CardFlipScreen';
import SlotMachineScreen from '@/components/Player/SlotMachineScreen';
import SwipeQuestion from '@/components/QuizPlayer/elements/SwipeQuestion';
import QuestionTimer from '@/components/Quiz/QuestionTimer';
import {
  GamifiedProgressBar,
  StreakCounter,
  QuestionTimer as GamifiedTimer,
  LivesDisplay,
  ConfettiEffect,
  SoundSystem,
  ShareChallengeButton,
} from '@/components/Player/GamificationComponents';

// ── Default theme (matches store defaults) ───────────────────
const DEFAULT_THEME = {
  primaryColor: '#3B82F6',
  secondaryColor: '#6366f1',
  backgroundColor: '#EEF2FF',
  backgroundType: 'gradient',
  backgroundGradient: 'from-violet-600 via-purple-600 to-indigo-700',
  textColor: '#1e293b',
  buttonStyle: 'pill',
  fontFamily: 'Outfit',
};

const DEFAULT_BRANDING = {
  logoUrl: '',
  faviconUrl: '',
  showBranding: true,
};

// ── Gradient CSS map (vibrant, modern gradients - Stich style) ─────────────
const GRADIENT_CSS = {
  'from-purple-900 via-purple-800 to-indigo-900': 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 35%, #6366f1 100%)',
  'from-violet-600 via-purple-600 to-indigo-700': 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 25%, #FFF1F2 50%, #F0FDF4 75%, #F0F9FF 100%)',
  'from-blue-900 via-blue-800 to-cyan-900': 'radial-gradient(circle at 10% 20%, rgb(0, 107, 241) 0%, rgb(0, 52, 117) 90%)',
  'from-emerald-900 via-green-800 to-teal-900': 'linear-gradient(135deg, #059669 0%, #10b981 35%, #14b8a6 100%)',
  'from-orange-900 via-red-800 to-pink-900': 'linear-gradient(135deg, #ea580c 0%, #f43f5e 50%, #ec4899 100%)',
  'from-gray-900 via-slate-800 to-zinc-900': 'linear-gradient(135deg, #1e293b 0%, #334155 35%, #3f3f46 100%)',
  'from-rose-900 via-pink-800 to-fuchsia-900': 'linear-gradient(135deg, #e11d48 0%, #ec4899 50%, #d946ef 100%)',
  // Stich vibrant options
  'from-sky-500 via-blue-500 to-indigo-600': 'radial-gradient(circle at center, #3b52ff 0%, #151931 100%)',
  'from-amber-500 via-orange-500 to-red-500': 'linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)',
  'from-teal-500 via-emerald-500 to-green-600': 'linear-gradient(135deg, #14b8a6 0%, #10b981 50%, #16a34a 100%)',
  // New pastel rainbow (Stich light theme)
  'pastel-rainbow': 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 25%, #FFF1F2 50%, #F0FDF4 75%, #F0F9FF 100%)',
  // Space blue gradient
  'space-blue': 'radial-gradient(circle at 10% 20%, rgb(0, 107, 241) 0%, rgb(0, 52, 117) 90%)',
  // Deep space
  'deep-space': 'radial-gradient(circle at center, #3b52ff 0%, #151931 100%)',
};

// ── Redirect utilities ───────────────────────────────────────
function performRedirect(url, isEmbed) {
  if (isEmbed) {
    try {
      window.top.location.href = url;
    } catch (_e) {
      // Cross-origin iframe — use postMessage + fallback
      window.parent.postMessage({ type: 'quiz-redirect', url }, '*');
      window.open(url, '_blank');
    }
  } else {
    window.location.href = url;
  }
}

function trackRedirectEvent(url, resultTitle) {
  try {
    // Facebook Pixel
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'InitiateCheckout', { content_name: resultTitle });
    }
    // GTM dataLayer
    if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: 'quiz_redirect', redirectUrl: url, resultTitle });
    }
    // GA4
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'quiz_redirect', { destination: url, result_title: resultTitle });
    }
    // Note: This is standalone redirect tracking (not part of quiz event flow)
  } catch (_e) {
    // Silently ignore tracking errors
  }
}

// ── Google Fonts loader ──────────────────────────────────────
function GoogleFontLink({ fontFamily }) {
  // Always load Outfit as base font, plus any custom font
  const fonts = ['Outfit'];
  if (fontFamily && fontFamily !== 'Inter' && fontFamily !== 'Outfit') {
    fonts.push(fontFamily);
  }
  const fontParams = fonts.map(f => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700;800`).join('&');
  return (
    // eslint-disable-next-line @next/next/no-page-custom-font
    <link
      rel="stylesheet"
      href={`https://fonts.googleapis.com/css2?${fontParams}&display=swap`}
    />
  );
}

// ── Button radius helper ─────────────────────────────────────
function getButtonRadius(style) {
  switch (style) {
    case 'pill': return '9999px';
    case 'square': return '0.25rem';
    default: return '0.75rem';
  }
}

// Wrap in Suspense because useSearchParams requires it in Next 14
// ── A/B Testing cookie helpers ───────────────────────────────
function getAbCookie(quizId) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`qm_ab_${quizId}=([^;]+)`));
  return match ? match[1] : null;
}

function setAbCookie(quizId, variantSlug) {
  if (typeof document === 'undefined') return;
  // Cookie lasts 30 days
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `qm_ab_${quizId}=${variantSlug};path=/;expires=${expires};SameSite=Lax`;
}

// ── Rating Player Components ─────────────────────────────────

function StarsRatingPlayer({ element, theme, btnRadius, rv, onSubmit }) {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const maxStars = element.maxStars || 5;
  const isRequired = element.required !== false;
  const canSubmit = !isRequired || selected !== null;

  const handleSelect = (starIdx) => {
    setSelected(starIdx);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const val = selected;
    const scoreVal = val * (element.scoreMultiplier || 1);
    onSubmit({
      answer: `${val} de ${maxStars}`,
      score: scoreVal,
      rawValue: val,
    });
  };

  return (
    <div className="mb-6">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-8 leading-tight tracking-tight">
        {rv(element.question || 'Dê sua nota')}
        {isRequired && <span className="text-rose-500 ml-1">*</span>}
      </h2>
      <div className="flex flex-col items-center gap-4 bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.08)' }}>
        {(element.labelMin || element.labelMax) && (
          <div className="flex justify-between w-full text-sm text-gray-500 px-2 font-medium">
            <span>{element.labelMin}</span>
            <span>{element.labelMax}</span>
          </div>
        )}
        <div className="flex items-center gap-2" onMouseLeave={() => setHovered(null)}>
          {Array.from({ length: maxStars }).map((_, i) => {
            const starNum = i + 1;
            const isFilled = starNum <= (hovered ?? selected ?? 0);
            return (
              <button
                key={i}
                onMouseEnter={() => setHovered(starNum)}
                onClick={() => handleSelect(starNum)}
                className="transition-all duration-200 focus:outline-none hover:scale-110"
                style={{
                  transform: hovered === starNum ? 'scale(1.25)' : selected === starNum ? 'scale(1.1)' : 'scale(1)',
                  cursor: 'pointer',
                  filter: isFilled ? 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4))' : 'none',
                }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill={isFilled ? '#fbbf24' : 'none'}
                  stroke={isFilled ? '#f59e0b' : '#d1d5db'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <span className="text-base text-gray-600 font-semibold bg-amber-50 px-4 py-1.5 rounded-full">
            {selected} de {maxStars} ⭐
          </span>
        )}
      </div>
      {/* Botão 3D Táctil - Stich Style */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full text-white py-5 font-extrabold text-xl uppercase tracking-wider flex items-center justify-center gap-3 mt-6 transition-all active:translate-y-1"
        style={{
          background: canSubmit ? theme.primaryColor : '#d1d5db',
          borderRadius: '9999px',
          boxShadow: canSubmit 
            ? `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`
            : '0 4px 0 #9ca3af',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
        }}
        onMouseDown={(e) => {
          if (canSubmit) {
            e.currentTarget.style.transform = 'translateY(4px)';
            e.currentTarget.style.boxShadow = `0 2px 0 ${theme.secondaryColor || '#2563EB'}, 0 5px 10px -2px ${theme.primaryColor}60`;
          }
        }}
        onMouseUp={(e) => {
          if (canSubmit) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`;
          }
        }}
        onMouseLeave={(e) => {
          if (canSubmit) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`;
          }
        }}
      >
        Continuar <ChevronRight size={24} />
      </button>
    </div>
  );
}

function NumberRatingPlayer({ element, theme, btnRadius, rv, onSubmit }) {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const minVal = element.minValue ?? 0;
  const maxVal = element.maxValue ?? 10;
  const isRequired = element.required !== false;
  const canSubmit = !isRequired || selected !== null;
  const isNps = minVal === 0 && maxVal === 10;
  const totalNumbers = maxVal - minVal + 1;

  // Vibrant NPS colors
  const getNpsColor = (val) => {
    if (val <= 6) {
      return {
        bg: 'linear-gradient(135deg, #fff5f5, #ffe4e4)',
        border: '#fca5a5',
        selectedBg: 'linear-gradient(135deg, #ef4444, #dc2626)',
        hoverBg: '#fee2e2',
        textSelected: '#ffffff',
      };
    } else if (val <= 8) {
      return {
        bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
        border: '#fcd34d',
        selectedBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
        hoverBg: '#fef3c7',
        textSelected: '#ffffff',
      };
    } else {
      return {
        bg: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
        border: '#6ee7b7',
        selectedBg: 'linear-gradient(135deg, #10b981, #059669)',
        hoverBg: '#d1fae5',
        textSelected: '#ffffff',
      };
    }
  };

  const getColor = (val) => {
    if (isNps) return getNpsColor(val);
    return {
      bg: '#f8fafc',
      border: '#e2e8f0',
      selectedBg: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})`,
      hoverBg: '#f1f5f9',
      textSelected: '#ffffff',
    };
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const scoreVal = selected * (element.scoreMultiplier || 1);
    onSubmit({ answer: String(selected), score: scoreVal, rawValue: selected });
  };

  const numbers = [];
  for (let i = minVal; i <= maxVal; i++) numbers.push(i);

  return (
    <div className="mb-6">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-8 text-center leading-tight tracking-tight">
        {rv(element.question || 'Dê sua nota')}
        {isRequired && <span className="text-rose-500 ml-1">*</span>}
      </h2>
      
      {/* Scale Container - Stich Style */}
      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.08)' }}>
        {/* Min/Max Labels */}
        <div className="flex justify-between text-sm text-gray-600 mb-4 px-1 font-medium">
          <span>{element.labelMin || (isNps ? '😞 Nada provável' : '')}</span>
          <span>{element.labelMax || (isNps ? 'Muito provável 😍' : '')}</span>
        </div>

        {/* Numbers Grid */}
        <div 
          className="grid gap-2 sm:gap-3"
          style={{ 
            gridTemplateColumns: `repeat(${Math.min(totalNumbers, 11)}, minmax(0, 1fr))`,
          }}
        >
          {numbers.map((num) => {
            const colors = getColor(num);
            const isSel = selected === num;
            const isHov = hovered === num && !isSel;
            
            return (
              <button
                key={num}
                onClick={() => setSelected(num)}
                onMouseEnter={() => setHovered(num)}
                onMouseLeave={() => setHovered(null)}
                className="aspect-square rounded-xl flex items-center justify-center font-bold transition-all duration-200"
                style={{
                  background: isSel ? colors.selectedBg : isHov ? colors.hoverBg : colors.bg,
                  border: `2px solid ${isSel ? 'transparent' : colors.border}`,
                  color: isSel ? colors.textSelected : '#1e293b',
                  fontSize: totalNumbers > 10 ? '0.9rem' : '1rem',
                  transform: isSel ? 'scale(1.1)' : isHov ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isSel ? '0 8px 20px rgba(0,0,0,0.15)' : isHov ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* NPS Category Labels */}
        {isNps && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-sm"></div>
                <span className="font-semibold text-gray-700">0-6 Detratores</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm"></div>
                <span className="font-semibold text-gray-700">7-8 Neutros</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm"></div>
                <span className="font-semibold text-gray-700">9-10 Promotores</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Value Badge */}
      {selected !== null && (
        <div className="flex justify-center mt-5">
          <div 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-base font-semibold text-white shadow-lg"
            style={{ background: getColor(selected).selectedBg }}
          >
            <span>Nota: {selected}</span>
            {isNps && (
              <span className="opacity-90 text-sm ml-1">
                {selected <= 6 ? '• Detrator' : selected <= 8 ? '• Neutro' : '• Promotor 🎉'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Submit Button - 3D Tactile Stich Style */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full text-white py-5 font-extrabold text-xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all mt-6 active:translate-y-1"
        style={{
          background: canSubmit ? theme.primaryColor : '#9ca3af',
          borderRadius: '9999px',
          boxShadow: canSubmit 
            ? `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`
            : '0 4px 0 #6b7280',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
        }}
        onMouseDown={(e) => {
          if (canSubmit) {
            e.currentTarget.style.transform = 'translateY(4px)';
            e.currentTarget.style.boxShadow = `0 2px 0 ${theme.secondaryColor || '#2563EB'}, 0 5px 10px -2px ${theme.primaryColor}60`;
          }
        }}
        onMouseUp={(e) => {
          if (canSubmit) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`;
          }
        }}
        onMouseLeave={(e) => {
          if (canSubmit) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`;
          }
        }}
      >
        Continuar <ChevronRight size={24} />
      </button>
    </div>
  );
}

function SliderRatingPlayer({ element, theme, btnRadius, rv, onSubmit }) {
  const sliderMin = element.sliderMin ?? 0;
  const sliderMax = element.sliderMax ?? 100;
  const sliderStep = element.sliderStep ?? 1;
  const unit = element.sliderUnit || '';
  const isRequired = element.required !== false;
  const midpoint = Math.round((sliderMin + sliderMax) / 2);
  const [value, setValue] = useState(midpoint);
  const [touched, setTouched] = useState(false);
  const canSubmit = !isRequired || touched;

  const pct = ((value - sliderMin) / (sliderMax - sliderMin)) * 100;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const scoreVal = value * (element.scoreMultiplier || 1);
    onSubmit({ answer: String(value), score: scoreVal, rawValue: value });
  };

  return (
    <div className="mb-6">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-8 leading-tight tracking-tight">
        {rv(element.question || 'Dê sua nota')}
        {isRequired && <span className="text-rose-500 ml-1">*</span>}
      </h2>
      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.08)' }}>
        <div className="flex flex-col items-center gap-4">
          {/* Value badge - larger and more prominent */}
          <div
            className="text-white px-6 py-3 rounded-2xl text-2xl font-bold shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})`,
              boxShadow: `0 8px 24px ${theme.primaryColor}40`,
            }}
          >
            {value}{unit ? ` ${unit}` : ''}
          </div>

          {/* Slider */}
          <div className="w-full relative mt-4">
            <div className="relative h-3">
              {/* Background track */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-3 rounded-full bg-gray-200 shadow-inner" />
              {/* Fill track */}
              <div
                className="absolute top-1/2 -translate-y-1/2 left-0 h-3 rounded-full transition-all duration-100"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})`,
                  boxShadow: `0 2px 8px ${theme.primaryColor}50`,
                }}
              />
              <input
                type="range"
                min={sliderMin}
                max={sliderMax}
                step={sliderStep}
                value={value}
                onChange={(e) => { setValue(parseInt(e.target.value)); setTouched(true); }}
                className="quiz-slider relative z-10 w-full h-3 appearance-none bg-transparent cursor-pointer"
                style={{ '--slider-color': theme.primaryColor }}
              />
            </div>
          </div>

          {/* Labels */}
          <div className="flex justify-between w-full text-sm text-gray-600 px-1 font-medium">
            <span>{element.labelMin || sliderMin}</span>
            <span>{element.labelMax || sliderMax}</span>
          </div>
        </div>
      </div>
      {/* Botão 3D Táctil - Stich Style */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full text-white py-5 font-extrabold text-xl uppercase tracking-wider flex items-center justify-center gap-3 mt-6 transition-all active:translate-y-1"
        style={{
          background: canSubmit ? theme.primaryColor : '#d1d5db',
          borderRadius: '9999px',
          boxShadow: canSubmit 
            ? `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`
            : '0 4px 0 #9ca3af',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
        }}
        onMouseDown={(e) => {
          if (canSubmit) {
            e.currentTarget.style.transform = 'translateY(4px)';
            e.currentTarget.style.boxShadow = `0 2px 0 ${theme.secondaryColor || '#2563EB'}, 0 5px 10px -2px ${theme.primaryColor}60`;
          }
        }}
        onMouseUp={(e) => {
          if (canSubmit) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`;
          }
        }}
        onMouseLeave={(e) => {
          if (canSubmit) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`;
          }
        }}
      >
        Continuar <ChevronRight size={24} />
      </button>
    </div>
  );
}

function RatingPlayer({ element, nodeId, theme, btnRadius, rv, onSubmit }) {
  const ratingType = element.ratingType || 'number';

  const handleResult = (result) => {
    onSubmit(result);
  };

  if (ratingType === 'stars') {
    return <StarsRatingPlayer element={element} theme={theme} btnRadius={btnRadius} rv={rv} onSubmit={handleResult} />;
  }
  if (ratingType === 'slider') {
    return <SliderRatingPlayer element={element} theme={theme} btnRadius={btnRadius} rv={rv} onSubmit={handleResult} />;
  }
  return <NumberRatingPlayer element={element} theme={theme} btnRadius={btnRadius} rv={rv} onSubmit={handleResult} />;
}

// ── Rating Question Player Component ─────────────────────────
function RatingQuestionPlayer({ element, nodeId, theme, btnRadius, rv, onSubmit }) {
  const [value, setValue] = useState(null);
  const isRequired = element.required !== false;
  const canSubmit = !isRequired || value !== null;

  const ratingType = element.ratingType || 'number';
  const maxStars = element.maxStars || 5;
  const minValue = element.minValue ?? 0;
  const maxValue = element.maxValue ?? 10;
  const sliderMin = element.sliderMin ?? 0;
  const sliderMax = element.sliderMax ?? 100;
  const sliderStep = element.sliderStep || 1;
  const sliderUnit = element.sliderUnit || '';

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(value);
  };

  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {rv(element.question || 'Dê sua nota')}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </h2>

      {ratingType === 'stars' && (
        <div className="flex items-center justify-center gap-2 mb-4">
          {Array.from({ length: maxStars }, (_, i) => (
            <button
              key={i}
              onClick={() => setValue(i + 1)}
              className="transition-transform hover:scale-110"
              style={{ fontSize: '2.5rem', lineHeight: 1 }}
            >
              <span style={{ color: value !== null && i < value ? '#f59e0b' : '#d1d5db' }}>★</span>
            </button>
          ))}
          {value !== null && (
            <span className="text-sm text-gray-500 ml-2">{value}/{maxStars}</span>
          )}
        </div>
      )}

      {ratingType === 'number' && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          {Array.from({ length: maxValue - minValue + 1 }, (_, i) => {
            const num = minValue + i;
            const isSelected = value === num;
            return (
              <button
                key={num}
                onClick={() => setValue(num)}
                className="w-10 h-10 rounded-full border-2 text-sm font-bold transition-all"
                style={{
                  borderColor: isSelected ? theme.primaryColor : '#e5e7eb',
                  backgroundColor: isSelected ? theme.primaryColor : 'transparent',
                  color: isSelected ? '#ffffff' : '#374151',
                  transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                {num}
              </button>
            );
          })}
          <div className="w-full flex justify-between text-xs text-gray-400 mt-1 px-1">
            {element.labelMin && <span>{element.labelMin}</span>}
            {element.labelMax && <span className="ml-auto">{element.labelMax}</span>}
          </div>
        </div>
      )}

      {ratingType === 'slider' && (
        <div className="mb-4 px-2">
          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={sliderStep}
            value={value ?? Math.round((sliderMin + sliderMax) / 2)}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full accent-current"
            style={{ accentColor: theme.primaryColor }}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">{element.labelMin || sliderMin}</span>
            <span className="text-lg font-bold" style={{ color: theme.primaryColor }}>
              {value !== null ? `${value}${sliderUnit}` : '—'}
            </span>
            <span className="text-xs text-gray-400">{element.labelMax || sliderMax}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full text-white py-3 font-medium flex items-center justify-center gap-2 transition-all mt-3"
        style={{
          backgroundColor: canSubmit ? theme.primaryColor : '#d1d5db',
          borderRadius: btnRadius,
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          opacity: canSubmit ? 1 : 0.7,
        }}
      >
        Continuar <ChevronRight size={20} />
      </button>
    </div>
  );
}

// ── Open Question Player Component ───────────────────────────
function OpenQuestionPlayer({ element, nodeId, theme, btnRadius, rv, onSubmit }) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const maxLen = element.maxLength || 500;
  const isRequired = element.required !== false;
  const canSubmit = !isRequired || text.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(text.trim());
  };

  return (
    <div className="mb-6">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-8 leading-tight tracking-tight">
        {rv(element.question || 'Pergunta')}
        {isRequired && <span className="text-rose-500 ml-1">*</span>}
      </h2>
      <div 
        className="bg-white backdrop-blur-sm transition-all duration-200"
        style={{
          borderRadius: '1.5rem',
          border: isFocused ? `2px solid ${theme.primaryColor}` : '2px solid #e2e8f0',
          boxShadow: isFocused 
            ? `0 0 0 4px ${theme.primaryColor}15, 0 8px 24px rgba(0,0,0,0.08)` 
            : '0 4px 15px -3px rgba(0, 0, 0, 0.08)',
        }}
      >
        {element.multiline ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxLen))}
            placeholder={element.placeholder || 'Digite sua resposta...'}
            rows={5}
            className="w-full bg-transparent outline-none resize-none text-gray-800 text-lg leading-relaxed placeholder:text-gray-400"
            style={{ 
              borderRadius: '1.5rem',
              padding: '1.25rem 1.5rem',
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            maxLength={maxLen}
          />
        ) : (
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxLen))}
            placeholder={element.placeholder || 'Digite sua resposta...'}
            className="w-full bg-transparent outline-none text-gray-800 text-lg placeholder:text-gray-400"
            style={{ 
              borderRadius: '1.5rem',
              padding: '1.25rem 1.5rem',
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            maxLength={maxLen}
            onKeyDown={(e) => { if (e.key === 'Enter' && canSubmit) handleSubmit(); }}
          />
        )}
      </div>
      <div className="flex items-center justify-between mt-4 px-1">
        <span className={`text-sm font-semibold transition-colors ${text.length > maxLen * 0.8 ? 'text-amber-500' : 'text-gray-400'}`}>
          {text.length}/{maxLen} caracteres
        </span>
        {isRequired && text.trim().length === 0 && (
          <span className="text-sm text-rose-500 font-semibold flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Obrigatório
          </span>
        )}
      </div>
      {/* Botão 3D Táctil - Stich Style */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full text-white py-5 font-extrabold text-xl uppercase tracking-wider flex items-center justify-center gap-3 mt-6 transition-all active:translate-y-1"
        style={{
          background: canSubmit ? theme.primaryColor : '#d1d5db',
          borderRadius: '9999px',
          boxShadow: canSubmit 
            ? `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`
            : '0 4px 0 #9ca3af',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
        }}
        onMouseDown={(e) => {
          if (canSubmit) {
            e.currentTarget.style.transform = 'translateY(4px)';
            e.currentTarget.style.boxShadow = `0 2px 0 ${theme.secondaryColor || '#2563EB'}, 0 5px 10px -2px ${theme.primaryColor}60`;
          }
        }}
        onMouseUp={(e) => {
          if (canSubmit) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`;
          }
        }}
        onMouseLeave={(e) => {
          if (canSubmit) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`;
          }
        }}
      >
        Continuar <ChevronRight size={24} />
      </button>
    </div>
  );
}

// ── Carousel Player Component ────────────────────────────────

function CarouselPlayer({ element, theme }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slides = element.slides || [];
  
  if (slides.length === 0) {
    return (
      <div className="mb-4 bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center" style={{ boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.08)' }}>
        <ImageIcon size={48} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">Nenhuma imagem no carrossel</p>
      </div>
    );
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="mb-4">
      {/* Title */}
      {element.title && (
        <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">{element.title}</h3>
      )}
      
      {/* Carousel Container */}
      <div 
        className="relative bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)' }}
      >
        {/* Main Image */}
        <div className="relative aspect-[4/3] w-full">
          <img
            src={currentSlide.url}
            alt={currentSlide.caption || `Slide ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-300"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f3f4f6" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%239ca3af" font-size="14">Imagem</text></svg>';
            }}
          />
          
          {/* Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white hover:scale-110 active:scale-95"
                style={{ 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  color: theme.primaryColor 
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white hover:scale-110 active:scale-95"
                style={{ 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  color: theme.primaryColor 
                }}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
          
          {/* Slide Counter Badge */}
          <div 
            className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold text-white"
            style={{ 
              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            {currentIndex + 1} / {slides.length}
          </div>
        </div>
        
        {/* Caption */}
        {currentSlide.caption && (
          <div className="px-5 py-4 bg-white/80 backdrop-blur-sm border-t border-gray-100">
            <p className="text-gray-700 text-center font-medium">{currentSlide.caption}</p>
          </div>
        )}
        
        {/* Dot Indicators */}
        {slides.length > 1 && (
          <div className="flex items-center justify-center gap-2 py-4 bg-white/60">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className="transition-all duration-200"
                style={{
                  width: idx === currentIndex ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: idx === currentIndex 
                    ? `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})`
                    : '#d1d5db',
                  boxShadow: idx === currentIndex ? `0 2px 8px ${theme.primaryColor}40` : 'none',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Redirect Components ──────────────────────────────────────

function RedirectCountdown({ url, delay, accentColor, secondaryColor, isEmbed, resultTitle }) {
  const [remaining, setRemaining] = useState(delay);
  const [cancelled, setCancelled] = useState(false);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (cancelled || hasRedirected.current) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const left = Math.max(0, delay - elapsed);
      setRemaining(left);
      if (left <= 0) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, [cancelled, delay]);

  useEffect(() => {
    if (remaining <= 0 && !cancelled && !hasRedirected.current) {
      hasRedirected.current = true;
      trackRedirectEvent(url, resultTitle);
      performRedirect(url, isEmbed);
    }
  }, [remaining, cancelled, url, isEmbed, resultTitle]);

  if (cancelled) return null;

  const secondsLeft = Math.ceil(remaining);
  const progress = delay > 0 ? (remaining / delay) * 100 : 0;

  return (
    <div
      className="rounded-2xl shadow-lg p-5 text-center overflow-hidden"
      style={{ borderTop: `3px solid ${accentColor}`, backgroundColor: '#ffffff' }}
    >
      <div className="flex items-center justify-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: accentColor, animation: 'pulse 1.5s ease-in-out infinite' }}
        >
          {secondsLeft}
        </div>
        <p className="text-sm text-gray-500">
          Redirecionando em{' '}
          <span className="font-semibold" style={{ color: accentColor }}>
            {secondsLeft}
          </span>{' '}
          segundo{secondsLeft !== 1 ? 's' : ''}...
        </p>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${accentColor}, ${secondaryColor || accentColor})`,
            transition: 'width 0.05s linear',
          }}
        />
      </div>
      <button
        onClick={() => setCancelled(true)}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        Cancelar redirecionamento
      </button>
    </div>
  );
}

function ImmediateRedirect({ url, isEmbed, resultTitle, accentColor }) {
  useEffect(() => {
    trackRedirectEvent(url, resultTitle);
    const timer = setTimeout(() => performRedirect(url, isEmbed), 800);
    return () => clearTimeout(timer);
  }, [url, isEmbed, resultTitle]);

  return (
    <div className="rounded-2xl shadow-xl p-8 text-center" style={{ backgroundColor: '#ffffff' }}>
      <Loader2 className="animate-spin mx-auto mb-4" size={32} style={{ color: accentColor }} />
      <p className="text-gray-600 font-medium">Redirecionando...</p>
    </div>
  );
}

// ── Fisher-Yates shuffle algorithm ──────────────────────────
function fisherYatesShuffle(array, seed) {
  // Deterministic shuffle based on session
  let sessionSeed = seed || Date.now();
  const random = () => {
    sessionSeed = (sessionSeed * 9301 + 49297) % 233280;
    return sessionSeed / 233280;
  };
  
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ── Apply question shuffling ─────────────────────────────────
function applyQuestionShuffle(nodes, edges) {
  // Identificar nós que podem ser embaralhados (perguntas)
  const questionNodes = nodes.filter(node => {
    if (node.type === 'start' || node.type === 'result') return false;
    if (node.type === 'lead-form') return false;
    
    // Embaralhar nós de pergunta padrão
    if (node.type === 'single-choice' || node.type === 'multiple-choice') return true;
    
    // Embaralhar composite que contém perguntas
    if (node.type === 'composite') {
      const hasQuestions = (node.data.elements || []).some(el => 
        el.type.startsWith('question-')
      );
      const hasLeadForm = (node.data.elements || []).some(el => 
        el.type === 'lead-form'
      );
      return hasQuestions && !hasLeadForm;
    }
    
    return false;
  });

  // Verificar se há branching condicional (edges com sourceHandle específico)
  const hasBranching = edges.some(edge => 
    edge.sourceHandle && 
    edge.sourceHandle !== 'general' &&
    !edge.sourceHandle.endsWith('-general')
  );

  // Se há branching, não embaralhar para evitar quebrar a lógica
  if (hasBranching) {
    console.log('Quiz has branching logic - shuffling disabled');
    return nodes;
  }

  if (questionNodes.length === 0) {
    return nodes;
  }

  // Use quiz ID + today's date como seed para ser determinístico
  const today = new Date().toDateString();
  const seedStr = (nodes.find(n => n.type === 'start')?.id || 'quiz') + today;
  const seed = seedStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const shuffledQuestions = fisherYatesShuffle(questionNodes, seed);

  // Reconstruir array de nós com perguntas embaralhadas
  const result = [];
  let questionIndex = 0;

  for (const node of nodes) {
    if (questionNodes.includes(node)) {
      result.push(shuffledQuestions[questionIndex]);
      questionIndex++;
    } else {
      result.push(node);
    }
  }

  return result;
}

function QuizPlayer() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isPreview = searchParams.get('preview') === 'true';
  const isEmbedParam = searchParams.get('embed') === 'true';
  const abHandledRef = useRef(false);

  // Detect if running inside an iframe (embed mode)
  const [isEmbed, setIsEmbed] = useState(false);
  useEffect(() => {
    try {
      setIsEmbed(isEmbedParam || window.self !== window.top);
    } catch (_) {
      setIsEmbed(true); // cross-origin iframe blocks access → we are embedded
    }
  }, [isEmbedParam]);

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Theme settings
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  
  // Preload message settings
  const [preloadMessage, setPreloadMessage] = useState({
    title: '👀 Antes de começar…',
    titleFontSize: '2rem',
    titleFontFamily: 'Outfit',
    titleColor: '#1e293b',
    titleFontWeight: 'bold',
    text: 'Esse quiz foi criado pra revelar coisas que muita gente só percebe tarde demais.',
    textFontSize: '1.25rem',
    textFontFamily: 'Outfit',
    textColor: '#475569',
    textFontWeight: 'medium',
    textAlign: 'center',
  });
  const [showPreload, setShowPreload] = useState(true); // Show preload message after data loads

  // Player state
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState([]);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '' });
  const [leadSaved, setLeadSaved] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [multipleSelections, setMultipleSelections] = useState([]); // For question-multiple
  const [pointsBalloons, setPointsBalloons] = useState([]);

  // AI Analysis state
  const [aiConfig, setAiConfig] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);

  // Tracking state
  const [trackingConfig, setTrackingConfig] = useState(null);
  const trackingInitRef = useRef(false);
  const quizStartTrackedRef = useRef(false);
  
  // Attribution tracking state
  const [attribution, setAttribution] = useState(null);
  
  // Gamification state
  const [gamificationConfig, setGamificationConfig] = useState(null);
  const gamificationConfigRef = useRef(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [lives, setLives] = useState(3);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [speedBonusAwarded, setSpeedBonusAwarded] = useState(false);

  // Canvas data
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [scoreRanges, setScoreRanges] = useState([]);
  
  // Quiz behavior settings
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(null);
  const [shuffledNodes, setShuffledNodes] = useState([]); // nós embaralhados
  const [questionOrder, setQuestionOrder] = useState([]); // ordem das perguntas para variáveis
  
  // Sound system
  // Keep ref in sync so callbacks always see latest value
  gamificationConfigRef.current = gamificationConfig;
  
  const { playSound } = SoundSystem({ level: gamificationConfig?.soundLevel || 'medium' });

  // Helper: play sound only if gamification sounds are enabled
  const playSoundIfEnabled = useCallback((type) => {
    if (gamificationConfigRef.current?.sounds) {
      playSound(type);
    }
  }, [playSound]);

  // ── Custom favicon ───────────────────────────────────────────
  useEffect(() => {
    if (!branding.faviconUrl) return;
    // Remove existing favicons
    const existing = document.querySelectorAll("link[rel*='icon']");
    existing.forEach((el) => el.remove());
    // Add custom favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = branding.faviconUrl;
    link.type = branding.faviconUrl.endsWith('.ico') ? 'image/x-icon' : 'image/png';
    document.head.appendChild(link);
    return () => {
      try { document.head.removeChild(link); } catch (_) {}
    };
  }, [branding.faviconUrl]);

  // ── Tracking: initialize pixel scripts ───────────────────────
  useEffect(() => {
    if (!trackingConfig || trackingInitRef.current) return;
    trackingInitRef.current = true;
    initTracking(trackingConfig);
  }, [trackingConfig]);

  // ── Attribution: capture UTMs and campaign data ──────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const attributionData = {
      url: window.location.href,
      utmSource: params.get('utm_source') || '',
      utmMedium: params.get('utm_medium') || '',
      utmContent: params.get('utm_content') || '',
      utmTerm: params.get('utm_term') || '',
      campaign: params.get('utm_campaign') || '',
      fbclid: params.get('fbclid') || '',
      gclid: params.get('gclid') || '',
      referrer: document.referrer || '',
    };
    
    setAttribution(attributionData);
  }, []);

  // ── Preload: hide after delay when quiz is loaded ───────────
  useEffect(() => {
    if (!loading && quiz && showPreload) {
      // Show preload message for 2.5 seconds after data loads
      const timer = setTimeout(() => {
        setShowPreload(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [loading, quiz, showPreload]);

  // ── Gamification: Confetti on result ─────────────────────────
  useEffect(() => {
    const gc = gamificationConfigRef.current;
    if (showResult && gc?.confetti !== false) {
      setShowConfetti(true);
      if (gc?.sounds) {
        setTimeout(() => playSound('complete'), 300);
      }
    }
  }, [showResult, playSound]);

  // ── Gamification: Timer activation ───────────────────────────
  useEffect(() => {
    // Compute currentNode locally to avoid hoisting issues
    const node = nodes.find((n) => n.id === currentNodeId);
    if (node && gamificationConfigRef.current?.timer) {
      const isQuestion = node.type === 'single-choice' || 
                        node.type === 'multiple-choice' ||
                        (node.type === 'composite' && 
                         (node.data.elements || []).some(el => el.type.startsWith('question-')));
                         
      if (isQuestion && !selectedOption) {
        setTimerActive(true);
        setSpeedBonusAwarded(false);
      } else {
        setTimerActive(false);
      }
    }
  }, [nodes, currentNodeId, selectedOption]);

  // ── Embed: auto-resize via postMessage ───────────────────────
  useEffect(() => {
    if (!isEmbed) return;
    const send = () => {
      const h = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'quizmaker:resize', height: h }, '*');
    };
    send();
    const obs = new ResizeObserver(send);
    obs.observe(document.body);
    return () => obs.disconnect();
  }, [isEmbed, currentNodeId, showResult, showLeadForm]);

  // ── Gamification Helper Functions ───────────────────────────
  
  const processGamificationAnswer = useCallback((optionScore, isCorrect = false) => {
    const gc = gamificationConfigRef.current;
    console.log('[SOUND DEBUG] processGamificationAnswer called', { optionScore, isCorrect, gc: JSON.stringify(gc) });
    if (!gc) return optionScore;
    
    let finalScore = optionScore;
    
    setQuestionsAnswered(prev => prev + 1);
    
    // Process streak and sounds
    if (isCorrect || optionScore > 0) {
      setCorrectAnswers(prev => prev + 1);
      
      if (gc.streak) {
        setCurrentStreak(prev => {
          const newStreak = prev + 1;
          
          // Apply streak multiplier if enabled and threshold reached
          if (newStreak >= (gc.streakAfter || 3)) {
            const multiplier = gc.streakMultiplier || 2;
            finalScore = Math.floor(optionScore * multiplier);
          }
          
          return newStreak;
        });
        
        if (gc.sounds) {
          playSound('streak');
        }
      } else if (gc.sounds) {
        playSound('correct');
      }
    } else {
      // Wrong answer
      setCurrentStreak(0);
      
      if (gc.sounds) {
        playSound('incorrect');
      }
      
      // Process lives system
      if (gc.lives && lives > 0) {
        setLives(prev => {
          const newLives = prev - 1;
          
          if (newLives === 0) {
            // Handle lives depleted
            setTimeout(() => {
              if (gc.livesAction === 'email') {
                setShowLeadForm(true);
              } else if (gc.livesAction === 'partial') {
                setShowResult(true);
              } else if (gc.livesAction === 'redirect' && gc.livesRedirectUrl) {
                window.location.href = gc.livesRedirectUrl;
              }
            }, 1000);
          }
          
          return newLives;
        });
      }
    }
    
    return finalScore;
  }, [lives, playSound]);
  
  // Timer timeout state - navigation handled in separate effect
  const [timerExpired, setTimerExpired] = useState(false);
  
  const handleTimerTimeout = useCallback(() => {
    const gc = gamificationConfigRef.current;
    if (!gc?.timer) return;
    
    // Treat timeout as wrong answer for gamification purposes
    processGamificationAnswer(0, false);
    
    if (gc.sounds) {
      playSound('timer');
    }
    
    // Set timer expired flag - actual navigation handled in effect below
    setTimeout(() => {
      setTimerActive(false);
      setTimerExpired(true);
    }, 500);
  }, [processGamificationAnswer, playSound]);
  
  const handleSpeedBonus = useCallback((bonusLevel) => {
    const gc = gamificationConfigRef.current;
    if (!gc?.timer || speedBonusAwarded) return;
    
    const bonusMultipliers = {
      low: 1.1, // +10%
      medium: 1.25, // +25%
      high: 1.5, // +50%
    };
    
    const multiplier = bonusMultipliers[bonusLevel] || 1;
    const bonus = Math.floor(10 * multiplier); // Base 10 points + bonus
    
    setScore(prev => prev + bonus);
    setSpeedBonusAwarded(true);
    
    if (gc.sounds) {
      playSound('streak');
    }
    
    // Show visual feedback - inline balloon logic to avoid hoisting issues
    if (bonus > 0) {
      const id = Date.now();
      const x = window.innerWidth / 2;
      const y = window.innerHeight / 2;
      setPointsBalloons((prev) => [...prev, { id, points: bonus, x, y, text: 'Bônus de Velocidade!' }]);
      setTimeout(() => {
        setPointsBalloons((prev) => prev.filter((b) => b.id !== id));
      }, 1500);
    }
  }, [speedBonusAwarded, playSound]);

  // ── Derived styles ──────────────────────────────────────────

  const btnRadius = getButtonRadius(theme.buttonStyle);

  // Page background styles (novo sistema)
  const pageBgStyle = useMemo(() => {
    const pb = theme.pageBackground || {};
    
    // Se não houver configuração de page background, usar gradiente vibrante como padrão
    if (!pb.type) {
      // Prioriza gradiente se disponível
      if (theme.backgroundType === 'gradient' && GRADIENT_CSS[theme.backgroundGradient]) {
        return { background: GRADIENT_CSS[theme.backgroundGradient] };
      }
      // Fallback: gradiente padrão (pastel rainbow do Stich)
      if (!theme.backgroundColor || theme.backgroundColor === '#EEF2FF') {
        return { background: GRADIENT_CSS['from-violet-600 via-purple-600 to-indigo-700'] };
      }
      return { backgroundColor: theme.backgroundColor };
    }

    switch (pb.type) {
      case 'gradient':
        return GRADIENT_CSS[pb.gradient] 
          ? { background: GRADIENT_CSS[pb.gradient] }
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
  }, [theme.pageBackground, theme.backgroundType, theme.backgroundGradient, theme.backgroundColor, theme.primaryColor]);

  // Quiz card background styles (sistema antigo, para os cards do quiz)
  const cardBgStyle = useMemo(() => {
    if (theme.backgroundType === 'gradient' && GRADIENT_CSS[theme.backgroundGradient]) {
      return { background: GRADIENT_CSS[theme.backgroundGradient] };
    }
    return { backgroundColor: theme.backgroundColor };
  }, [theme.backgroundType, theme.backgroundGradient, theme.backgroundColor]);

  // ── Dynamic Variables context ───────────────────────────────

  const totalQuestions = useMemo(() => {
    let count = 0;
    for (const n of nodes) {
      if (n.type === 'single-choice' || n.type === 'multiple-choice') count++;
      if (n.type === 'composite') {
        count += (n.data.elements || []).filter((el) =>
          el.type.startsWith('question-'),
        ).length;
      }
    }
    return count;
  }, [nodes]);

  const variableValues = useMemo(() => {
    // Build base variables
    const baseVars = {
      nome: leadForm.name || '',
      email: leadForm.email || '',
      score: String(score),
      total_perguntas: String(totalQuestions),
    };

    // Build answer variables (q1, q2, q1_score, q2_score, etc.)
    const answersMap = buildAnswersMap(answers, questionOrder);

    return { ...baseVars, ...answersMap };
  }, [leadForm.name, leadForm.email, score, totalQuestions, answers, questionOrder]);

  /** Replace dynamic variables in text */
  const rv = useCallback(
    (text) => replaceVariables(text, variableValues),
    [variableValues],
  );

  // ── Fetch quiz ──────────────────────────────────────────────

  useEffect(() => {
    fetchQuiz();
  }, [params.slug]);

  const fetchQuiz = async () => {
    try {
      const previewParam = isPreview ? '?preview=true' : '';
      // Always fetch fresh data to ensure updated quiz content
      const res = await fetch(`/api/quizzes/${params.slug}/public${previewParam}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        setError('Quiz não encontrado');
        setLoading(false);
        return;
      }

      const data = await res.json();

      // ── A/B Testing: client-side split with cookie ──────────
      if (data.abTest && !isPreview && !abHandledRef.current) {
        abHandledRef.current = true;
        const { originalId, originalSlug, originalSplit, variants } = data.abTest;

        if (variants && variants.length > 0) {
          const variant = variants[0]; // Support single variant for now

          // Check cookie for existing assignment
          const existing = getAbCookie(originalId);

          if (existing && existing !== originalSlug) {
            // User was previously assigned to variant — redirect
            const embedParam = isEmbedParam ? '&embed=true' : '';
            router.replace(`/q/${existing}?${previewParam}${embedParam}`);
            return;
          }

          if (!existing) {
            // New visitor — do random split
            const rand = Math.random() * 100;
            const assignedSlug = rand < (originalSplit || 50) ? originalSlug : variant.slug;

            // Set cookie for consistency
            setAbCookie(originalId, assignedSlug);

            if (assignedSlug !== originalSlug) {
              // Redirect to variant
              const embedParam = isEmbedParam ? '&embed=true' : '';
              router.replace(`/q/${assignedSlug}?${previewParam}${embedParam}`);
              return;
            }
            // else: stay on original, continue loading
          }
          // Cookie matches original — continue loading
        }
      }

      setQuiz(data);
      console.log('[SOUND DEBUG] quiz loaded, data.settings exists:', !!data.settings, 'type:', typeof data.settings);

      // Load behavior settings from quiz object
      setShuffleQuestions(data.shuffleQuestions || false);
      setQuestionTimer(data.questionTimer || null);

      // Load settings (theme & branding)
      if (data.settings) {
        try {
          const settings = typeof data.settings === 'string'
            ? JSON.parse(data.settings)
            : data.settings;
          if (settings && typeof settings === 'object') {
            if (settings.theme) {
              // Garante gradiente vibrante como padrão se não houver configuração específica
              const mergedTheme = { ...prev, ...settings.theme };
              // Se não tiver backgroundType ou pageBackground definido, usar gradiente padrão
              if (!settings.theme.backgroundType && !settings.theme.pageBackground) {
                mergedTheme.backgroundType = 'gradient';
                mergedTheme.backgroundGradient = 'from-violet-600 via-purple-600 to-indigo-700';
              }
              setTheme(mergedTheme);
            }
            if (settings.branding) setBranding((prev) => ({ ...prev, ...settings.branding }));
            if (settings.preloadMessage) setPreloadMessage((prev) => ({ ...prev, ...settings.preloadMessage }));
            if (settings.aiResultConfig) setAiConfig(settings.aiResultConfig);
            if (settings.tracking) setTrackingConfig(settings.tracking);
            console.log('[SOUND DEBUG] settings.gamification =', JSON.stringify(settings.gamification), 'settings keys =', Object.keys(settings));
            if (settings.gamification) {
              console.log('[SOUND DEBUG] calling setGamificationConfig with', JSON.stringify(settings.gamification));
              setGamificationConfig(settings.gamification);
              if (settings.gamification.lives && settings.gamification.livesCount) {
                setLives(settings.gamification.livesCount);
              }
            }
            
            // Override with behavior settings from settings object if present
            if (settings.behavior) {
              setShuffleQuestions(settings.behavior.shuffleQuestions || data.shuffleQuestions || false);
              setQuestionTimer(settings.behavior.questionTimer || data.questionTimer || null);
            }
          }
        } catch (_e) { /* ignore */ }
      }

      // Load score ranges
      if (data.scoreRanges) {
        const ranges = typeof data.scoreRanges === 'string'
          ? JSON.parse(data.scoreRanges)
          : data.scoreRanges;
        if (Array.isArray(ranges) && ranges.length > 0) {
          setScoreRanges(ranges);
        }
      }

      const canvasData =
        typeof data.canvasData === 'string'
          ? JSON.parse(data.canvasData)
          : data.canvasData;

      if (canvasData?.nodes) {
        const allNodes = canvasData.nodes;
        const allEdges = canvasData.edges || [];
        
        setNodes(allNodes);
        setEdges(allEdges);

        // Apply shuffling if enabled (shuffleQuestions state was already set above)
        if (data.shuffleQuestions && !isPreview) {
          const shuffled = applyQuestionShuffle(allNodes, allEdges);
          setShuffledNodes(shuffled);
        } else {
          setShuffledNodes(allNodes);
        }

        // Find start → jump to first connected node
        const startNode = allNodes.find((n) => n.type === 'start');
        if (startNode) {
          const startEdge = allEdges.find(
            (e) => e.source === startNode.id,
          );
          if (startEdge) {
            setCurrentNodeId(startEdge.target);
          } else {
            setCurrentNodeId(startNode.id);
          }
        }
      }

      // Track view
      if (data.id) {
        fetch(`/api/quizzes/${data.id}/analytics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'quiz_started' }),
        }).catch(() => {});
      }
    } catch (_err) {
      setError('Erro ao carregar quiz');
    } finally {
      setLoading(false);
    }
  };

  // ── Navigation helpers (Enhanced Skip Logic) ────────────────

  const getNextNode = useCallback(
    (fromNodeId, optionIndex = null, elementId = null) => {
      const nodeEdges = edges.filter((e) => e.source === fromNodeId);

      if (optionIndex !== null) {
        // 1. Try specific option edge (composite element handle)
        if (elementId) {
          const compEdge = nodeEdges.find(
            (e) => e.sourceHandle === `${elementId}-option-${optionIndex}`,
          );
          if (compEdge) return compEdge.target;
        }

        // 2. Try specific option edge (legacy handle)
        const legacyEdge = nodeEdges.find(
          (e) => e.sourceHandle === `option-${optionIndex}`,
        );
        if (legacyEdge) return legacyEdge.target;

        // 3. Try any matching option edge (fuzzy)
        const anyOptionEdge = nodeEdges.find(
          (e) =>
            e.sourceHandle &&
            e.sourceHandle.endsWith(`-option-${optionIndex}`),
        );
        if (anyOptionEdge) return anyOptionEdge.target;

        // 4. Fallback: try "general" handle edge (composite)
        if (elementId) {
          const compGeneral = nodeEdges.find(
            (e) => e.sourceHandle === `${elementId}-general`,
          );
          if (compGeneral) return compGeneral.target;
        }

        // 5. Fallback: try "general" handle edge (legacy)
        const legacyGeneral = nodeEdges.find(
          (e) => e.sourceHandle === 'general',
        );
        if (legacyGeneral) return legacyGeneral.target;

        // 6. Try any general handle
        const anyGeneral = nodeEdges.find(
          (e) => e.sourceHandle && e.sourceHandle.endsWith('-general'),
        );
        if (anyGeneral) return anyGeneral.target;
      }

      // 7. Try default source handle (bottom handle, no sourceHandle id)
      const defaultEdge = nodeEdges.find(
        (e) => !e.sourceHandle,
      );
      if (defaultEdge) return defaultEdge.target;

      // 8. Any remaining edge
      if (nodeEdges.length > 0) return nodeEdges[0].target;

      // 9. No edges at all → try sequential navigation by Y position
      const currentNode = nodes.find((n) => n.id === fromNodeId);
      if (currentNode) {
        const sortedNodes = [...nodes]
          .filter((n) => n.type !== 'start' && n.id !== fromNodeId)
          .sort((a, b) => (a.position?.y || 0) - (b.position?.y || 0));

        const currentY = currentNode.position?.y || 0;
        const nextByPosition = sortedNodes.find(
          (n) => (n.position?.y || 0) > currentY,
        );
        if (nextByPosition) return nextByPosition.id;
      }

      return null;
    },
    [edges, nodes],
  );

  // Derived: current node (must be before advanceToNode which uses it)
  const currentNode = nodes.find((n) => n.id === currentNodeId);

  const advanceToNode = useCallback(
    (nextId) => {
      if (!nextId) {
        setShowResult(true);
        // Track quizCompleted
        if (trackingConfig) {
          trackEvent(trackingConfig, 'quizCompleted', {
            quizTitle: quiz?.name || '',
            score,
          });
        }
        return;
      }
      const nextNode = nodes.find((n) => n.id === nextId);

      // Track quizStart on first advance from start node
      if (!quizStartTrackedRef.current && currentNode?.type === 'start') {
        quizStartTrackedRef.current = true;
        if (trackingConfig) {
          trackEvent(trackingConfig, 'quizStart', {
            quizTitle: quiz?.name || '',
          });
        }
      }

      // Track question order for answer piping variables
      if (currentNode && (
        currentNode.type === 'single-choice' || 
        currentNode.type === 'multiple-choice' ||
        (currentNode.type === 'composite' && 
         (currentNode.data.elements || []).some(el => el.type.startsWith('question-')))
      )) {
        setQuestionOrder(prev => {
          if (!prev.includes(currentNodeId)) {
            return [...prev, currentNodeId];
          }
          return prev;
        });
      }

      const isLeadForm =
        nextNode?.type === 'lead-form' ||
        (nextNode?.type === 'composite' &&
          (nextNode.data.elements || []).some((el) => el.type === 'lead-form') &&
          !(nextNode.data.elements || []).some((el) => el.type.startsWith('question-')));

      const isResult = nextNode?.type === 'result';

      setHistory((prev) => [...prev, currentNodeId]);
      setCurrentNodeId(nextId);

      if (isLeadForm) setShowLeadForm(true);
      if (isResult) {
        setShowResult(true);
        setTimerActive(false); // Desativar timer no resultado
        // Track quizCompleted when reaching result node
        if (trackingConfig) {
          trackEvent(trackingConfig, 'quizCompleted', {
            quizTitle: quiz?.name || '',
            score,
          });
        }
      } else if (questionTimer && !isLeadForm) {
        // Ativar timer para perguntas (mas não lead forms)
        const isQuestion = nextNode?.type === 'single-choice' || 
                          nextNode?.type === 'multiple-choice' ||
                          (nextNode?.type === 'composite' && 
                           (nextNode.data.elements || []).some(el => el.type.startsWith('question-')));
        
        setTimerActive(isQuestion);
      }
    },
    [nodes, currentNodeId, trackingConfig, quiz?.name, score],
  );

  // ── Auto-forward: advance after delay if enabled ────────────
  useEffect(() => {
    if (!currentNode?.data?.autoForward) return;
    if (showResult || showLeadForm) return; // Don't auto-forward on result/lead
    
    const delay = (currentNode.data.autoForwardDelay || 5) * 1000;
    
    const timer = setTimeout(() => {
      // Find the next node and advance
      const outEdges = edges.filter((e) => e.source === currentNodeId);
      if (outEdges.length > 0) {
        const nextId = outEdges[0].target;
        const nextNode = nodes.find((n) => n.id === nextId);
        
        if (nextNode) {
          setHistory((prev) => [...prev, currentNodeId]);
          setCurrentNodeId(nextId);
          
          if (nextNode.type === 'lead-form' || 
              (nextNode.type === 'composite' && 
               (nextNode.data.elements || []).some((el) => el.type === 'lead-form'))) {
            setShowLeadForm(true);
          }
          if (nextNode.type === 'result') {
            setShowResult(true);
          }
        }
      }
    }, delay);
    
    return () => clearTimeout(timer);
  }, [currentNodeId, currentNode, edges, nodes, showResult, showLeadForm]);

  // ── Timer expired: navigate to next question ────────────────
  useEffect(() => {
    if (!timerExpired) return;
    
    // Reset the flag
    setTimerExpired(false);
    
    // Navigate to next node
    const nextId = getNextNode(currentNodeId);
    if (nextId) {
      advanceToNode(nextId);
    } else {
      setShowResult(true);
    }
  }, [timerExpired, currentNodeId, getNextNode, advanceToNode]);

  const answeredCount = Object.keys(answers).length;
  const progress =
    totalQuestions > 0
      ? Math.round((answeredCount / totalQuestions) * 100)
      : 0;

  const maxPossibleScore = useMemo(() => {
    let total = 0;
    for (const n of nodes) {
      const opts =
        n.type === 'single-choice' || n.type === 'multiple-choice'
          ? n.data.options || []
          : [];
      if (opts.length)
        total += Math.max(...opts.map((o) => o.score || 0));

      if (n.type === 'composite') {
        for (const el of n.data.elements || []) {
          if (el.type.startsWith('question-') && el.options?.length) {
            total += Math.max(...el.options.map((o) => o.score || 0));
          }
        }
      }
    }
    return total;
  }, [nodes]);

  // ── Embed: notify parent on quiz completion ─────────────────
  useEffect(() => {
    if (!isEmbed || !showResult) return;
    window.parent.postMessage({
      type: 'quizmaker:complete',
      slug: params.slug,
      score,
      category: getResultCategory(score),
    }, '*');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEmbed, showResult]);

  // ── AI Analysis on result screen ───────────────────────────
  useEffect(() => {
    if (!showResult || !aiConfig?.enabled || !quiz?.id) return;
    if (aiAnalysis || aiLoading) return; // Already loaded or loading

    const fetchAiAnalysis = async () => {
      setAiLoading(true);
      setAiError(false);
      try {
        const matchedRange = getMatchingRange(score);
        const res = await fetch(`/api/quizzes/${quiz.id}/ai-analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers: Object.values(answers),
            score,
            maxScore: maxPossibleScore,
            leadName: leadForm.name || '',
            leadEmail: leadForm.email || '',
            resultTitle: matchedRange?.title || getResultCategory(score),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setAiAnalysis(data.analysis);
        } else {
          setAiError(true);
        }
      } catch (_err) {
        setAiError(true);
      } finally {
        setAiLoading(false);
      }
    };

    fetchAiAnalysis();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResult, aiConfig?.enabled, quiz?.id]);

  // ── Handlers ────────────────────────────────────────────────

  const showPointsBalloon = (points, event, customText = null) => {
    if (points <= 0) return;
    const id = Date.now();
    const rect = event?.currentTarget?.getBoundingClientRect?.();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top : window.innerHeight / 2;
    setPointsBalloons((prev) => [...prev, { id, points, x, y, text: customText }]);
    setTimeout(() => {
      setPointsBalloons((prev) => prev.filter((b) => b.id !== id));
    }, 1500);
  };

  const handleOptionSelect = (optionIndex, event) => {
    if (!currentNode) return;
    setSelectedOption(optionIndex);
    setTimerActive(false); // Desativar timer quando resposta for selecionada

    const option = currentNode.data.options?.[optionIndex];
    const optionScore = option?.score || 0;

    // Process gamification
    const finalScore = processGamificationAnswer(optionScore, optionScore > 0);
    
    if (finalScore > 0 && event) showPointsBalloon(finalScore, event);

    setScore((prev) => prev + finalScore);
    setAnswers((prev) => ({
      ...prev,
      [currentNodeId]: {
        question: currentNode.data.question,
        answer: option?.text,
        score: finalScore,
        optionIndex,
      },
    }));

    // Track questionAnswered
    if (trackingConfig) {
      trackEvent(trackingConfig, 'questionAnswered', {
        quizTitle: quiz?.name || '',
        questionNumber: answeredCount + 1,
        questionTotal: totalQuestions,
      });
    }

    setTimeout(() => {
      setSelectedOption(null);
      setSpeedBonusAwarded(false); // Reset speed bonus for next question
      advanceToNode(getNextNode(currentNodeId, optionIndex));
    }, 500);
  };

  const handleCompositeOptionSelect = (element, optionIndex, event) => {
    if (!currentNode) return;
    setSelectedOption(`${element.id}-${optionIndex}`);
    setTimerActive(false); // Desativar timer quando resposta for selecionada

    const option = element.options?.[optionIndex];
    const optionScore = option?.score || 0;

    // Process gamification
    const finalScore = processGamificationAnswer(optionScore, optionScore > 0);
    
    if (finalScore > 0 && event) showPointsBalloon(finalScore, event);

    setScore((prev) => prev + finalScore);
    setAnswers((prev) => ({
      ...prev,
      [`${currentNodeId}__${element.id}`]: {
        question: element.question,
        answer: option?.text,
        score: finalScore,
        optionIndex,
        elementId: element.id,
      },
    }));

    // Track questionAnswered
    if (trackingConfig) {
      trackEvent(trackingConfig, 'questionAnswered', {
        quizTitle: quiz?.name || '',
        questionNumber: answeredCount + 1,
        questionTotal: totalQuestions,
      });
    }

    setTimeout(() => {
      setSelectedOption(null);
      advanceToNode(
        getNextNode(currentNodeId, optionIndex, element.id),
      );
    }, 500);
  };

  // Handler for multiple choice toggle (question-multiple)
  const handleMultipleOptionToggle = (element, optionIndex, event) => {
    if (!currentNode) return;
    
    const selKey = `${element.id}-${optionIndex}`;
    const maxSelect = element.maxSelect || element.options?.length || 999;
    const wasSelected = multipleSelections.includes(selKey);
    
    // Calculate the new selections count
    let newSelectionsCount = multipleSelections.length;
    if (wasSelected) {
      newSelectionsCount--;
    } else if (multipleSelections.length < maxSelect) {
      newSelectionsCount++;
    }
    
    setMultipleSelections((prev) => {
      if (prev.includes(selKey)) {
        // Deselect
        return prev.filter((k) => k !== selKey);
      } else {
        // Select (if under max)
        if (prev.length < maxSelect) {
          return [...prev, selKey];
        }
        return prev;
      }
    });
    
    // Show animated points balloon when SELECTING (not deselecting)
    if (!wasSelected) {
      const option = element.options?.[optionIndex];
      const optionScore = option?.score || 0;
      if (optionScore > 0 && event) {
        showPointsBalloon(optionScore, event);
      }
    }
    
    // Auto-advance when max selections reached (if enabled)
    if (element.autoAdvanceOnMax && !wasSelected && newSelectionsCount === maxSelect) {
      setTimeout(() => {
        handleMultipleConfirm(element, event);
      }, 300);
    }
  };

  // Handler for confirming multiple choice selection
  const handleMultipleConfirm = (element, event) => {
    if (!currentNode) return;
    
    const minSelect = element.minSelect || 1;
    const maxSelect = element.maxSelect || element.options?.length || 999;
    
    // Validate selection count
    if (multipleSelections.length < minSelect) {
      return; // Don't proceed if under minimum
    }
    
    setTimerActive(false);
    
    // Calculate total score from selected options
    const selectedIndices = multipleSelections
      .filter((k) => k.startsWith(`${element.id}-`))
      .map((k) => parseInt(k.split('-').pop(), 10));
    
    const selectedOptions = selectedIndices.map((idx) => element.options?.[idx]).filter(Boolean);
    const totalScore = selectedOptions.reduce((acc, opt) => acc + (opt?.score || 0), 0);
    const selectedTexts = selectedOptions.map((opt) => opt?.text).join(', ');
    
    // Process gamification
    const finalScore = processGamificationAnswer(totalScore, totalScore > 0);
    
    if (finalScore > 0 && event) showPointsBalloon(finalScore, event);
    
    setScore((prev) => prev + finalScore);
    setAnswers((prev) => ({
      ...prev,
      [`${currentNodeId}__${element.id}`]: {
        question: element.question,
        answer: selectedTexts,
        score: finalScore,
        selectedIndices,
        elementId: element.id,
        isMultiple: true,
      },
    }));
    
    // Track questionAnswered
    if (trackingConfig) {
      trackEvent(trackingConfig, 'questionAnswered', {
        quizTitle: quiz?.name || '',
        questionNumber: answeredCount + 1,
        questionTotal: totalQuestions,
      });
    }
    
    // Clear selections and advance
    setTimeout(() => {
      setMultipleSelections([]);
      advanceToNode(getNextNode(currentNodeId, null, element.id));
    }, 300);
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`/api/quizzes/${quiz.id}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadForm,
          answers,
          score,
          resultCategory: getResultCategory(score),
          attribution,
        }),
      });
      setLeadSaved(true);

      // Track leadCaptured
      if (trackingConfig) {
        trackEvent(trackingConfig, 'leadCaptured', {
          quizTitle: quiz?.name || '',
        });
      }

      const nextId = getNextNode(currentNodeId);
      setTimeout(() => {
        setShowLeadForm(false);
        if (nextId) {
          setHistory((prev) => [...prev, currentNodeId]);
          setCurrentNodeId(nextId);
          const nextNode = nodes.find((n) => n.id === nextId);
          if (nextNode?.type === 'result') setShowResult(true);
        } else {
          setShowResult(true);
        }
      }, 1000);
    } catch (err) {
      console.error('Failed to save lead:', err);
    }
  };

  const handleGoBack = () => {
    if (history.length === 0) return;
    const prevId = history[history.length - 1];
    
    // Remove current node from question order if it was a question
    setQuestionOrder(prev => prev.filter(id => id !== currentNodeId));
    
    setHistory((prev) => prev.slice(0, -1));
    setCurrentNodeId(prevId);
    setShowLeadForm(false);
    setShowResult(false);
    setTimerActive(false); // Desativar timer ao voltar
    setMultipleSelections([]); // Reset multiple selections when going back

    const keysToRemove = Object.keys(answers).filter(
      (k) => k === currentNodeId || k.startsWith(`${currentNodeId}__`),
    );
    if (keysToRemove.length) {
      const removedScore = keysToRemove.reduce(
        (s, k) => s + (answers[k]?.score || 0),
        0,
      );
      setScore((prev) => prev - removedScore);
      setAnswers((prev) => {
        const next = { ...prev };
        keysToRemove.forEach((k) => delete next[k]);
        return next;
      });
    }
  };

  const getMatchingRange = (finalScore) => {
    if (!scoreRanges || scoreRanges.length === 0) return null;
    const sorted = [...scoreRanges].sort((a, b) => a.min - b.min);
    return sorted.find((r) => finalScore >= r.min && finalScore <= r.max) || null;
  };

  const getResultCategory = (finalScore) => {
    const matchedRange = getMatchingRange(finalScore);
    if (matchedRange) return matchedRange.title;

    const percentage =
      maxPossibleScore > 0 ? (finalScore / maxPossibleScore) * 100 : 0;
    if (percentage >= 80) return 'Excelente';
    if (percentage >= 60) return 'Bom';
    if (percentage >= 40) return 'Regular';
    return 'Iniciante';
  };

  const getResultEmoji = (cat) =>
    ({ Excelente: '🏆', Bom: '⭐', Regular: '👍', Iniciante: '📚' })[cat] ||
    '🎯';

  const compositeQuestionEl = useMemo(() => {
    if (currentNode?.type !== 'composite') return null;
    return (currentNode.data.elements || []).find((el) =>
      el.type.startsWith('question-'),
    );
  }, [currentNode]);

  const compositeHasLeadForm = useMemo(() => {
    if (currentNode?.type !== 'composite') return false;
    return (currentNode.data.elements || []).some(
      (el) => el.type === 'lead-form',
    );
  }, [currentNode]);

  const compositeHasGamification = useMemo(() => {
    if (currentNode?.type !== 'composite') return false;
    return (currentNode.data.elements || []).some(
      (el) => el.type === 'spin-wheel' || el.type === 'scratch-card' || el.type === 'phone-call' || el.type === 'mystery-box' || el.type === 'card-flip' || el.type === 'slot-machine',
    );
  }, [currentNode]);

  // ── Render ──────────────────────────────────────────────────

  const embedClass = isEmbed ? 'min-h-0 h-full' : 'min-h-screen';

  if (loading) {
    return (
      <div 
        className={`${embedClass} flex items-center justify-center`} 
        style={{ 
          background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 25%, #FFF1F2 50%, #F0FDF4 75%, #F0F9FF 100%)',
          fontFamily: 'Outfit, system-ui, sans-serif',
        }}
      >
        {/* Minimal loading spinner - real preload message comes after data loads */}
        <div className="flex flex-col items-center gap-4">
          <Loader2 
            className="animate-spin" 
            size={40} 
            style={{ color: '#6366f1' }}
          />
          <p className="text-slate-500 text-sm font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${embedClass} flex items-center justify-center p-4`} style={pageBgStyle}>
        <div className="rounded-2xl p-8 max-w-md text-center" style={{ backgroundColor: '#ffffff' }}>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  // Show personalized preload message after data loads
  if (showPreload && quiz) {
    const fontWeightMap = {
      normal: '400',
      medium: '500',
      bold: '700',
    };
    
    return (
      <div 
        className={`${embedClass} flex items-center justify-center`} 
        style={{ 
          background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 25%, #FFF1F2 50%, #F0FDF4 75%, #F0F9FF 100%)',
          fontFamily: preloadMessage.titleFontFamily || 'Outfit, system-ui, sans-serif',
        }}
      >
        <div className="text-center px-4 animate-fade-in">
          {/* Logo/Icon pulsando */}
          <div 
            className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse"
            style={{ 
              background: `linear-gradient(135deg, ${theme.primaryColor || '#6366f1'}, ${theme.secondaryColor || '#8b5cf6'})`,
              boxShadow: `0 16px 40px -8px ${theme.primaryColor || '#6366f1'}66`,
            }}
          >
            <span className="text-white text-4xl font-extrabold">Q</span>
          </div>
          
          {/* Título + Texto personalizados */}
          <div 
            className="mb-8 max-w-md mx-auto"
            style={{
              textAlign: preloadMessage.textAlign || 'center',
            }}
          >
            {/* Título */}
            <p 
              className="mb-3 tracking-tight"
              style={{
                fontSize: preloadMessage.titleFontSize || '2rem',
                color: preloadMessage.titleColor || '#1e293b',
                fontWeight: fontWeightMap[preloadMessage.titleFontWeight] || '700',
                fontFamily: preloadMessage.titleFontFamily || 'Outfit',
              }}
            >
              {preloadMessage.title || '👀 Antes de começar…'}
            </p>
            {/* Texto/Subtítulo */}
            <p 
              className="leading-relaxed whitespace-pre-wrap"
              style={{
                fontSize: preloadMessage.textFontSize || '1.25rem',
                color: preloadMessage.textColor || '#475569',
                fontWeight: fontWeightMap[preloadMessage.textFontWeight] || '500',
                fontFamily: preloadMessage.textFontFamily || 'Outfit',
              }}
            >
              {preloadMessage.text || 'Esse quiz foi criado pra revelar coisas que muita gente só percebe tarde demais.'}
            </p>
          </div>
          
          {/* Dots animados */}
          <div className="flex justify-center gap-2">
            <div 
              className="w-3 h-3 rounded-full animate-bounce"
              style={{ 
                backgroundColor: theme.primaryColor || '#6366f1',
                animationDelay: '0ms',
                animationDuration: '0.6s',
              }}
            />
            <div 
              className="w-3 h-3 rounded-full animate-bounce"
              style={{ 
                backgroundColor: theme.secondaryColor || '#8b5cf6',
                animationDelay: '150ms',
                animationDuration: '0.6s',
              }}
            />
            <div 
              className="w-3 h-3 rounded-full animate-bounce"
              style={{ 
                backgroundColor: theme.primaryColor || '#a855f7',
                animationDelay: '300ms',
                animationDuration: '0.6s',
              }}
            />
          </div>
          
          {/* Botão para pular (opcional) */}
          <button
            onClick={() => setShowPreload(false)}
            className="mt-8 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Começar quiz →
          </button>
        </div>
      </div>
    );
  }

  // Determine what to render
  const nodeType = currentNode?.type;
  const isLegacyQuestion =
    nodeType === 'single-choice' || nodeType === 'multiple-choice';
  const isComposite = nodeType === 'composite';
  const isLegacyLeadForm = nodeType === 'lead-form';
  const isResult = nodeType === 'result';
  const isStart = nodeType === 'start';
  const isContentOrMedia =
    !isLegacyQuestion &&
    !isComposite &&
    !isLegacyLeadForm &&
    !isResult &&
    !isStart &&
    !!currentNode;

  return (
    <div
      className={`${embedClass} flex flex-col`}
      style={{ ...pageBgStyle, fontFamily: theme.fontFamily }}
    >
      {/* Image overlay if using image background */}
      {theme.pageBackground?.type === 'image' && theme.pageBackground?.imageUrl && theme.pageBackground?.imageOverlay > 0 && (
        <div 
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${theme.pageBackground.imageOverlay || 0.5})`,
          }}
        />
      )}

      {/* Google Font */}
      <GoogleFontLink fontFamily={theme.fontFamily} />

      {/* Preview badge */}
      {isPreview && !isEmbed && (
        <div className="bg-amber-500 text-white text-center text-xs py-1 font-medium">
          ⚡ Modo Preview — as respostas não serão salvas
        </div>
      )}

      <div className="relative z-10 flex flex-col min-h-full">
        {/* Compact Header - Quiz name + Progress in same row */}
        {!isEmbed && !showResult && (
          <div className="px-4 py-2 flex items-center gap-3">
            {/* Logo + Name */}
            <div className="flex items-center gap-2 shrink-0">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt="Logo"
                  className="w-6 h-6 rounded-md object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <span className="text-xs font-bold" style={{ color: theme.textColor }}>Q</span>
                </div>
              )}
              <span className="text-xs font-medium truncate max-w-[120px]" style={{ color: theme.textColor, opacity: 0.8 }}>
                {quiz?.name}
              </span>
            </div>
            
            {/* Progress Bar - inline, compact */}
            <div className="flex-1 flex items-center gap-2">
              {gamificationConfig?.progressBar ? (
                <div className="flex-1">
                  <GamifiedProgressBar 
                    current={questionsAnswered}
                    total={totalQuestions}
                    style={gamificationConfig.progressStyle || 'simple'}
                    primaryColor={theme.primaryColor}
                  />
                </div>
              ) : (
                <>
                  <div 
                    className="flex-1 overflow-hidden"
                    style={{ 
                      height: '6px',
                      background: 'rgba(255,255,255,0.3)',
                      borderRadius: '9999px',
                    }}
                  >
                    <div
                      className="h-full transition-all duration-500"
                      style={{ 
                        width: `${progress}%`, 
                        background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
                        borderRadius: '9999px',
                        boxShadow: '0 0 8px rgba(99, 102, 241, 0.4)',
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold shrink-0" style={{ color: theme.textColor, opacity: 0.7 }}>
                    {answeredCount}/{totalQuestions}
                  </span>
                </>
              )}
            </div>
            
            {/* Gamification Header Elements */}
            <div className="flex items-center gap-2 shrink-0">
              {gamificationConfig?.lives && (
                <LivesDisplay 
                  current={lives}
                  total={gamificationConfig.livesCount || 3}
                  primaryColor={theme.primaryColor}
                  showAnimation={false}
                />
              )}
              
              {currentStreak > 0 && gamificationConfig?.streak && (
                <StreakCounter 
                  streak={currentStreak}
                  multiplier={gamificationConfig.streakMultiplier || 2}
                  effect={gamificationConfig.streakEffect || 'fire'}
                  primaryColor={theme.primaryColor}
                  isActive={false}
                />
              )}
            </div>
          </div>
        )}
        
        {/* Timer (shown when active) */}
        {timerActive && gamificationConfig?.timer && (
          <div className={isEmbed ? 'px-2 mb-4' : 'px-4 mb-6'}>
            <GamifiedTimer 
              seconds={gamificationConfig.timerSeconds || 30}
              onTimeout={handleTimerTimeout}
              onSpeedBonus={handleSpeedBonus}
              speedBonus={gamificationConfig.speedBonus || 'none'}
              isActive={timerActive}
              primaryColor={theme.primaryColor}
            />
          </div>
        )}

        {/* Content */}
        <div className={`flex-1 flex items-center justify-center ${isEmbed ? 'p-2' : 'p-4'}`}>
          <div className={`w-full ${isEmbed ? 'max-w-lg' : 'max-w-2xl'}`}>
            {/* Quiz Card Container */}
            <div
              className={`${isEmbed ? '' : 'lg:rounded-2xl lg:shadow-xl lg:max-w-lg lg:mx-auto'}`}
              style={isEmbed ? {} : cardBgStyle}
            >
              <div 
                className={`${isEmbed ? '' : 'lg:p-6'}`}
                style={{ 
                  color: theme.textColor,
                  fontFamily: theme.fontFamily 
                }}
              >
          {/* ── Result Screen ─────────────────────────────── */}
          {showResult && (() => {
            const matchedRange = getMatchingRange(score);
            const showStatic = !aiConfig?.enabled || aiConfig?.combineWithStatic !== false;
            const showAi = aiConfig?.enabled;

            // ── Redirect configuration ──────────────────────
            const _rMode = matchedRange?.redirectMode || (matchedRange?.ctaUrl && matchedRange?.ctaText ? 'button' : 'none');
            const _rUrl = matchedRange?.redirectUrl || matchedRange?.ctaUrl || '';
            const _rDelay = matchedRange?.redirectDelay ?? 5;
            const _rShowBefore = matchedRange?.showResultBeforeRedirect !== false;
            const _rBtnText = matchedRange?.redirectButtonText || matchedRange?.ctaText || 'Continuar →';
            const _rNewTab = matchedRange?.redirectMode
              ? (matchedRange?.redirectOpenNewTab ?? false)
              : !!matchedRange?.ctaUrl; // backward compat: old ctaUrl → new tab
            const _rResultTitle = matchedRange?.title || getResultCategory(score);

            // Immediate redirect (auto mode, skip result display)
            if (_rMode === 'auto' && !_rShowBefore && _rUrl) {
              return (
                <ImmediateRedirect
                  url={_rUrl}
                  isEmbed={isEmbed}
                  resultTitle={_rResultTitle}
                  accentColor={theme.primaryColor}
                />
              );
            }

            return (
              <div className="space-y-6">
                {showStatic && (
                  <div 
                    className="text-center relative overflow-hidden" 
                    style={{ 
                      fontFamily: theme.fontFamily,
                      background: 'white',
                      borderRadius: '2.5rem',
                      padding: '2.5rem',
                      boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    {/* Decorative background circles */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-50 rounded-full -ml-12 -mb-12 opacity-50"></div>
                    
                    {matchedRange?.image ? (
                      <img
                        src={matchedRange.image}
                        alt={matchedRange.title}
                        className="w-full h-56 object-cover mb-8 relative z-10"
                        style={{ borderRadius: '1.5rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                      />
                    ) : (
                      <div
                        className="w-28 h-28 flex items-center justify-center mx-auto mb-8 relative z-10"
                        style={{ 
                          background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})`,
                          borderRadius: '2rem',
                          boxShadow: `0 12px 24px -4px ${theme.primaryColor}50`,
                        }}
                      >
                        <Trophy className="text-white" size={52} />
                      </div>
                    )}

                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 leading-tight relative z-10 tracking-tight">
                      {rv(matchedRange?.title || currentNode?.data?.title || 'Seu Resultado')}
                    </h1>

                    {matchedRange?.description ? (
                      <div className="text-gray-600 mb-8 text-left space-y-4 text-lg leading-relaxed">
                        {rv(matchedRange.description).split('\n\n').map((paragraph, i) => (
                          <p key={i}>{paragraph.trim()}</p>
                        ))}
                      </div>
                    ) : (
                      <div className="text-7xl mb-6">
                        {getResultEmoji(getResultCategory(score))}
                      </div>
                    )}

                    {/* Score Card - Premium Design */}
                    <div
                      className="rounded-2xl p-8 mb-8 relative overflow-hidden"
                      style={{ 
                        background: `linear-gradient(135deg, ${theme.primaryColor}10, ${theme.primaryColor}05)`,
                        border: `2px solid ${theme.primaryColor}20`,
                      }}
                    >
                      {/* Decorative circles */}
                      <div 
                        className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10"
                        style={{ background: theme.primaryColor }}
                      />
                      <div 
                        className="absolute -bottom-2 -left-2 w-16 h-16 rounded-full opacity-10"
                        style={{ background: theme.primaryColor }}
                      />
                      
                      <p className="text-base text-gray-500 mb-2 font-medium relative z-10">Sua pontuação</p>
                      <p className="text-5xl sm:text-6xl font-bold relative z-10" style={{ color: theme.primaryColor }}>
                        {score} <span className="text-2xl font-semibold">pts</span>
                      </p>
                      {!matchedRange && (
                        <div 
                          className="inline-block mt-4 px-4 py-2 rounded-full text-white font-semibold text-base relative z-10"
                          style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})` }}
                        >
                          {getResultCategory(score)}
                        </div>
                      )}
                    </div>

                    {/* CTA Buttons - 3D Tactile Style */}
                    {!showAi && _rMode === 'button' && _rUrl ? (
                      <a
                        href={_rUrl}
                        target={_rNewTab ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-3 text-white py-5 font-extrabold text-xl uppercase tracking-wider mb-4 transition-all active:translate-y-1"
                        style={{ 
                          background: theme.primaryColor,
                          borderRadius: '9999px',
                          boxShadow: `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`,
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = 'translateY(4px)';
                          e.currentTarget.style.boxShadow = `0 2px 0 ${theme.secondaryColor || '#2563EB'}, 0 5px 10px -2px ${theme.primaryColor}60`;
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`;
                        }}
                        onClick={() => trackRedirectEvent(_rUrl, _rResultTitle)}
                      >
                        {_rBtnText}
                        <ExternalLink size={22} />
                      </a>
                    ) : null}

                    {!showAi && (
                      <button
                        onClick={() => window.location.reload()}
                        className="w-full py-5 font-extrabold text-xl uppercase tracking-wider transition-all active:translate-y-1"
                        style={{
                          background: (_rMode === 'button' && _rUrl) ? 'white' : theme.primaryColor,
                          color: (_rMode === 'button' && _rUrl) ? '#64748b' : '#ffffff',
                          borderRadius: '9999px',
                          boxShadow: (_rMode === 'button' && _rUrl) 
                            ? '0 6px 0 #cbd5e1, 0 10px 20px rgba(0, 0, 0, 0.1)' 
                            : `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`,
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = 'translateY(4px)';
                          e.currentTarget.style.boxShadow = (_rMode === 'button' && _rUrl) 
                            ? '0 2px 0 #cbd5e1, 0 4px 10px rgba(0, 0, 0, 0.05)' 
                            : `0 2px 0 ${theme.secondaryColor || '#2563EB'}, 0 5px 10px -2px ${theme.primaryColor}60`;
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = (_rMode === 'button' && _rUrl) 
                            ? '0 6px 0 #cbd5e1, 0 10px 20px rgba(0, 0, 0, 0.1)' 
                            : `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = (_rMode === 'button' && _rUrl) 
                            ? '0 6px 0 #cbd5e1, 0 10px 20px rgba(0, 0, 0, 0.1)' 
                            : `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`;
                        }}
                      >
                        🔄 Refazer Quiz
                      </button>
                    )}
                  </div>
                )}

                {/* ── AI Analysis Section ──────────────────── */}
                {showAi && (
                  <div
                    className="rounded-2xl shadow-xl overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #f5f3ff, #eef2ff, #faf5ff)',
                      border: '1px solid #e9d5ff',
                      fontFamily: theme.fontFamily,
                    }}
                  >
                    <div
                      className="px-6 py-4 flex items-center gap-2"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primaryColor}15, ${theme.secondaryColor || theme.primaryColor}10)`,
                        borderBottom: '1px solid #e9d5ff',
                      }}
                    >
                      <span className="text-xl">✨</span>
                      <h3 className="text-lg font-bold text-gray-800">Análise Personalizada</h3>
                    </div>

                    <div className="p-6">
                      {aiLoading && (
                        <div className="space-y-4 animate-pulse">
                          <div className="flex items-center gap-3 mb-4">
                            <Loader2 className="animate-spin" size={20} style={{ color: theme.primaryColor }} />
                            <span className="text-sm font-medium text-gray-600">
                              Analisando suas respostas com IA...
                            </span>
                          </div>
                          <div className="space-y-3">
                            <div className="h-4 bg-purple-100 rounded-full w-full" />
                            <div className="h-4 bg-purple-100 rounded-full w-11/12" />
                            <div className="h-4 bg-purple-100 rounded-full w-10/12" />
                            <div className="h-4 bg-purple-100 rounded-full w-0" style={{ width: '0%' }} />
                            <div className="h-4 bg-purple-50 rounded-full w-full" />
                            <div className="h-4 bg-purple-50 rounded-full w-9/12" />
                            <div className="h-4 bg-purple-50 rounded-full w-11/12" />
                            <div className="h-4 bg-purple-50 rounded-full w-0" style={{ width: '0%' }} />
                            <div className="h-4 bg-purple-50/50 rounded-full w-full" />
                            <div className="h-4 bg-purple-50/50 rounded-full w-8/12" />
                          </div>
                        </div>
                      )}

                      {aiAnalysis && !aiLoading && (
                        <div
                          className="text-gray-700 text-[15px] leading-relaxed"
                          style={{
                            animation: 'fadeInUp 0.6s ease-out',
                          }}
                        >
                          {aiAnalysis.split('\n').map((paragraph, i) => {
                            if (!paragraph.trim()) return null;
                            // Basic markdown bold support
                            const formatted = paragraph.replace(
                              /\*\*(.*?)\*\*/g,
                              '<strong class="text-gray-900">$1</strong>'
                            );
                            return (
                              <p
                                key={i}
                                className="mb-3 last:mb-0"
                                dangerouslySetInnerHTML={{ __html: formatted }}
                              />
                            );
                          })}
                        </div>
                      )}

                      {aiError && !aiLoading && (
                        <p className="text-gray-400 text-sm text-center py-4">
                          Análise indisponível no momento
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA and Refazer buttons (always at bottom) */}
                {showAi && (
                  <div className="rounded-2xl shadow-xl p-6 space-y-3" style={{ ...cardBgStyle, fontFamily: theme.fontFamily, color: theme.textColor }}>
                    {_rMode === 'button' && _rUrl ? (
                      <a
                        href={_rUrl}
                        target={_rNewTab ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 text-white py-3 font-medium transition-opacity hover:opacity-90 text-center"
                        style={{ backgroundColor: theme.primaryColor, borderRadius: btnRadius }}
                        onClick={() => trackRedirectEvent(_rUrl, _rResultTitle)}
                      >
                        {_rBtnText}
                        <ExternalLink size={16} />
                      </a>
                    ) : null}
                    <button
                      onClick={() => window.location.reload()}
                      className={`w-full py-3 font-medium transition-opacity hover:opacity-90`}
                      style={{
                        backgroundColor: (_rMode === 'button' && _rUrl) ? '#f3f4f6' : theme.primaryColor,
                        color: (_rMode === 'button' && _rUrl) ? '#374151' : '#ffffff',
                        borderRadius: btnRadius,
                      }}
                    >
                      Refazer Quiz
                    </button>
                  </div>
                )}

                {/* Auto redirect countdown */}
                {_rMode === 'auto' && _rUrl && (
                  <RedirectCountdown
                    url={_rUrl}
                    delay={_rDelay}
                    accentColor={theme.primaryColor}
                    secondaryColor={theme.secondaryColor}
                    isEmbed={isEmbed}
                    resultTitle={_rResultTitle}
                  />
                )}
              </div>
            );
          })()}

          {/* ── Lead Form ─────────────────────────────────── */}
          {showLeadForm && !showResult && (
            <div 
              className="relative overflow-hidden" 
              style={{ 
                fontFamily: theme.fontFamily,
                background: 'white',
                borderRadius: '2.5rem',
                padding: '2.5rem',
                boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
              }}
            >
              {/* Decorative background circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-50 rounded-full -ml-12 -mb-12 opacity-50"></div>
              {leadSaved ? (
                <div className="text-center py-10">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    <CheckCircle className="text-white" size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Obrigado! 🎉
                  </h2>
                  <p className="text-lg text-gray-500">
                    Seus dados foram salvos. Carregando resultado…
                  </p>
                </div>
              ) : (
                <>
                  {/* Header with icon */}
                  <div className="text-center mb-8">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})` }}
                    >
                      <span className="text-3xl">📝</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {rv(currentNode?.data?.title ||
                        (isComposite
                          ? (currentNode?.data?.elements || []).find(
                              (el) => el.type === 'lead-form',
                            )?.title
                          : null) ||
                        'Quase lá!')}
                    </h2>
                    <p className="text-lg text-gray-500">
                      Preencha seus dados para ver o resultado
                    </p>
                  </div>
                  <form onSubmit={handleLeadSubmit} className="space-y-5">
                    <div>
                      <label className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-2">
                        <User size={18} style={{ color: theme.primaryColor }} /> Nome
                      </label>
                      <input
                        type="text"
                        value={leadForm.name}
                        onChange={(e) =>
                          setLeadForm((p) => ({ ...p, name: e.target.value }))
                        }
                        className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 focus:border-transparent outline-none text-lg transition-all duration-200 placeholder:text-gray-400"
                        style={{ 
                          borderRadius: '1rem',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                        }}
                        onFocus={(e) => { 
                          e.target.style.borderColor = theme.primaryColor; 
                          e.target.style.boxShadow = `0 0 0 4px ${theme.primaryColor}15`; 
                          e.target.style.backgroundColor = 'white';
                        }}
                        onBlur={(e) => { 
                          e.target.style.borderColor = '#e5e7eb'; 
                          e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; 
                          e.target.style.backgroundColor = '#f9fafb';
                        }}
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-2">
                        <Mail size={18} style={{ color: theme.primaryColor }} /> Email
                      </label>
                      <input
                        type="email"
                        value={leadForm.email}
                        onChange={(e) =>
                          setLeadForm((p) => ({ ...p, email: e.target.value }))
                        }
                        className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 focus:border-transparent outline-none text-lg transition-all duration-200 placeholder:text-gray-400"
                        style={{ 
                          borderRadius: '1rem',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                        }}
                        onFocus={(e) => { 
                          e.target.style.borderColor = theme.primaryColor; 
                          e.target.style.boxShadow = `0 0 0 4px ${theme.primaryColor}15`; 
                          e.target.style.backgroundColor = 'white';
                        }}
                        onBlur={(e) => { 
                          e.target.style.borderColor = '#e5e7eb'; 
                          e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; 
                          e.target.style.backgroundColor = '#f9fafb';
                        }}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-2">
                        <Phone size={18} style={{ color: theme.primaryColor }} /> Telefone
                      </label>
                      <input
                        type="tel"
                        value={leadForm.phone}
                        onChange={(e) =>
                          setLeadForm((p) => ({ ...p, phone: e.target.value }))
                        }
                        className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 focus:border-transparent outline-none text-lg transition-all duration-200 placeholder:text-gray-400"
                        style={{ 
                          borderRadius: '1rem',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                        }}
                        onFocus={(e) => { 
                          e.target.style.borderColor = theme.primaryColor; 
                          e.target.style.boxShadow = `0 0 0 4px ${theme.primaryColor}15`; 
                          e.target.style.backgroundColor = 'white';
                        }}
                        onBlur={(e) => { 
                          e.target.style.borderColor = '#e5e7eb'; 
                          e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; 
                          e.target.style.backgroundColor = '#f9fafb';
                        }}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full text-white py-5 font-extrabold text-xl uppercase tracking-wider flex items-center justify-center gap-3 mt-8 transition-all active:translate-y-1 relative z-10"
                      style={{ 
                        background: theme.primaryColor,
                        borderRadius: '9999px',
                        boxShadow: `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`,
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'translateY(4px)';
                        e.currentTarget.style.boxShadow = `0 2px 0 ${theme.secondaryColor || '#2563EB'}, 0 5px 10px -2px ${theme.primaryColor}60`;
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`;
                      }}
                    >
                      Ver Meu Resultado
                      <ChevronRight size={24} />
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* ── Legacy Question Node ──────────────────────── */}
          {!showLeadForm && !showResult && isLegacyQuestion && (
            <div 
              className="relative overflow-hidden" 
              style={{ 
                fontFamily: theme.fontFamily,
                background: 'white',
                borderRadius: '2.5rem',
                padding: '2.5rem',
                boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
              }}
            >
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-50 rounded-full -ml-12 -mb-12 opacity-50"></div>
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                  {history.length > 0 && (
                    <button
                      onClick={handleGoBack}
                      className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-base font-semibold transition-all hover:bg-slate-100 px-4 py-2 rounded-xl -ml-3"
                    >
                      <ArrowLeft size={20} /> Voltar
                    </button>
                  )}
                </div>
                {questionTimer && timerActive && (
                  <QuestionTimer
                    seconds={questionTimer}
                    onTimeout={handleTimerTimeout}
                    isActive={timerActive}
                    size={60}
                    className="flex-shrink-0"
                  />
                )}
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-10 leading-tight relative z-10 tracking-tight">
                {rv(currentNode.data.question || 'Pergunta')}
              </h2>
              <div className="space-y-4 relative z-10">
                {(currentNode.data.options || []).map((option, index) => {
                  // Check if option text starts with emoji (first char is emoji)
                  const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u;
                  const textMatch = (option.text || '').match(emojiRegex);
                  const leadingEmoji = textMatch ? textMatch[0] : null;
                  // If there's a leading emoji in text, use it and strip from text
                  const displayEmoji = option.emoji || leadingEmoji;
                  const displayText = leadingEmoji 
                    ? option.text.slice(leadingEmoji.length).trim() 
                    : option.text;
                  
                  const isSelected = selectedOption === index;
                  const isOther = selectedOption !== null && !isSelected;
                  
                  return (
                    <button
                      key={index}
                      onClick={(e) => handleOptionSelect(index, e)}
                      disabled={selectedOption !== null}
                      className="w-full text-left p-6 transition-all duration-200 flex items-center gap-5 group"
                      style={{
                        borderRadius: '1.5rem',
                        border: isSelected ? `4px solid ${theme.primaryColor}` : '4px solid transparent',
                        background: 'white',
                        opacity: isOther ? 0.5 : 1,
                        boxShadow: isSelected
                          ? `0 10px 25px -5px ${theme.primaryColor}30`
                          : '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedOption === null) {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.border = `4px solid ${theme.primaryColor}`;
                          e.currentTarget.style.boxShadow = `0 15px 35px -5px ${theme.primaryColor}25`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected && selectedOption === null) {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.border = '4px solid transparent';
                          e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.05)';
                        }
                      }}
                    >
                      <span
                        className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200"
                        style={{
                          background: isSelected 
                            ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})` 
                            : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                          color: isSelected ? '#ffffff' : '#64748b',
                          fontSize: displayEmoji ? '2rem' : '1.25rem',
                          fontWeight: displayEmoji ? 'normal' : '700',
                          boxShadow: isSelected ? `0 6px 16px ${theme.primaryColor}40` : '0 4px 12px rgba(0,0,0,0.06)',
                          filter: displayEmoji ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' : 'none',
                        }}
                      >
                        {displayEmoji || String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-xl font-bold flex-1" style={{ color: isSelected ? theme.primaryColor : '#1e293b' }}>
                        {displayText}
                      </span>
                      {isSelected && (
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ 
                            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})`,
                            boxShadow: `0 4px 12px ${theme.primaryColor}50`,
                          }}
                        >
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Composite Node ────────────────────────────── */}
          {!showLeadForm && !showResult && isComposite && currentNode && (
            <div 
              className="relative overflow-hidden" 
              style={{ 
                fontFamily: theme.fontFamily,
                background: 'white',
                borderRadius: '2.5rem',
                padding: '2.5rem',
                boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
              }}
            >
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-50 rounded-full -ml-12 -mb-12 opacity-50"></div>
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                  {history.length > 0 && (
                    <button
                      onClick={handleGoBack}
                      className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-base font-semibold transition-all hover:bg-slate-100 px-4 py-2 rounded-xl -ml-3"
                    >
                      <ArrowLeft size={20} /> Voltar
                    </button>
                  )}
                </div>
                {questionTimer && timerActive && compositeQuestionEl && (
                  <QuestionTimer
                    seconds={questionTimer}
                    onTimeout={handleTimerTimeout}
                    isActive={timerActive}
                    size={60}
                    className="flex-shrink-0"
                  />
                )}
              </div>

              {(currentNode.data.elements || []).map((el) => {
                if (el.type === 'text') {
                  const style = el.style || {};
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

                  return (
                    <p
                      key={el.id}
                      className="mb-4 whitespace-pre-wrap"
                      style={textStyles}
                    >
                      {rv(el.content)}
                    </p>
                  );
                }

                if (el.type === 'button') {
                  const style = el.style || {};
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
                    marginLeft: style.alignment === 'center' && style.width === 'auto' ? 'auto' : style.alignment === 'right' && style.width === 'auto' ? 'auto' : '0',
                    marginRight: style.alignment === 'center' && style.width === 'auto' ? 'auto' : style.alignment === 'left' && style.width === 'auto' ? 'auto' : '0',
                  };

                  const handleButtonClick = () => {
                    switch (el.action) {
                      case 'next-node':
                        advanceToNode(getNextNode(currentNodeId, null, el.id));
                        break;
                      case 'url':
                        if (el.actionValue) {
                          if (el.openInNewTab !== false) {
                            window.open(el.actionValue, '_blank', 'noopener,noreferrer');
                          } else {
                            window.location.href = el.actionValue;
                          }
                        }
                        break;
                      case 'script':
                        if (el.actionValue) {
                          try {
                            eval(el.actionValue);
                          } catch (error) {
                            console.error('Script execution error:', error);
                          }
                        }
                        break;
                      case 'phone':
                        if (el.actionValue) {
                          window.location.href = `tel:${el.actionValue}`;
                        }
                        break;
                      case 'email':
                        if (el.actionValue) {
                          window.location.href = `mailto:${el.actionValue}`;
                        }
                        break;
                    }
                  };

                  return (
                    <div key={el.id} className="mb-4" style={{ 
                      textAlign: style.alignment || 'center',
                      width: '100%'
                    }}>
                      <button
                        onClick={handleButtonClick}
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
                        <span>{el.text || 'Clique aqui'}</span>
                        {el.action === 'url' && <span>🔗</span>}
                        {el.action === 'script' && <span>⚡</span>}
                        {el.action === 'phone' && <span>📞</span>}
                        {el.action === 'email' && <span>📧</span>}
                      </button>
                    </div>
                  );
                }

                // ── Carousel element ───────────────────────────────────
                if (el.type === 'carousel') {
                  return <CarouselPlayer key={el.id} element={el} theme={theme} />;
                }

                if (['video', 'audio', 'image'].includes(el.type)) {
                  const MediaIcon =
                    el.type === 'video'
                      ? Video
                      : el.type === 'audio'
                        ? Music
                        : ImageIcon;
                  const ytId = el.type === 'video' ? extractYouTubeId(el.url) : null;
                  const vOri = el.videoOrientation || 'auto';
                  // For 'auto', default to horizontal (16:9); native <video> will
                  // auto-detect via its intrinsic aspect ratio thanks to object-fit.
                  const isVertical = vOri === 'vertical';
                  
                  // Image dimensions
                  const imgWidth = el.imageWidth ? `${el.imageWidth}${el.imageWidthUnit || 'px'}` : undefined;
                  const imgHeight = el.imageHeight 
                    ? (el.imageHeightUnit === 'auto' ? 'auto' : `${el.imageHeight}${el.imageHeightUnit || 'px'}`)
                    : undefined;
                  const keepAspect = el.imageKeepAspectRatio !== false;
                  
                  return (
                    <div
                      key={el.id}
                      className="mb-4 bg-gray-100 rounded-xl p-6 flex flex-col items-center gap-2"
                    >
                      {el.url && el.type === 'image' ? (
                        <img
                          src={el.url}
                          alt={el.title || ''}
                          className="rounded-lg"
                          style={{
                            width: imgWidth || 'auto',
                            height: imgHeight || 'auto',
                            maxWidth: '100%',
                            maxHeight: imgWidth || imgHeight ? undefined : '16rem',
                            objectFit: keepAspect ? 'contain' : 'cover',
                          }}
                        />
                      ) : el.url && el.type === 'video' && ytId ? (
                        /* YouTube embed — orientation-aware */
                        <div
                          className="rounded-lg overflow-hidden"
                          style={isVertical
                            ? { width: '100%', maxWidth: 360, aspectRatio: '9/16', margin: '0 auto', position: 'relative' }
                            : { width: '100%', aspectRatio: '16/9', position: 'relative' }
                          }
                        >
                          <iframe
                            src={youtubeEmbedUrl(ytId)}
                            title={el.title || 'YouTube video'}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                          />
                        </div>
                      ) : el.url && el.type === 'video' ? (
                        /* Native <video> — orientation-aware */
                        <div
                          className="rounded-lg overflow-hidden"
                          style={isVertical
                            ? { width: '100%', maxWidth: 360, margin: '0 auto' }
                            : { width: '100%' }
                          }
                        >
                          <video
                            src={el.url}
                            controls
                            autoPlay={el.autoplay || false}
                            muted={el.autoplay || false}
                            playsInline
                            preload="metadata"
                            className="w-full rounded-lg"
                            style={isVertical
                              ? { aspectRatio: '9/16', objectFit: 'cover' }
                              : vOri === 'horizontal'
                                ? { aspectRatio: '16/9', objectFit: 'contain', backgroundColor: '#000' }
                                : { maxHeight: 480 }
                            }
                          />
                        </div>
                      ) : el.url && el.type === 'audio' ? (
                        <div className="w-full">
                          {el.title && (
                            <p className="text-sm font-medium text-gray-700 mb-2 text-center">{el.title}</p>
                          )}
                          <audio
                            src={el.url}
                            controls
                            autoPlay={el.autoplay || false}
                            className="w-full"
                            preload="metadata"
                          />
                        </div>
                      ) : (
                        <>
                          <MediaIcon
                            size={32}
                            className="text-gray-400"
                          />
                          <span className="text-sm text-gray-500">
                            {el.title || el.type}
                          </span>
                        </>
                      )}
                    </div>
                  );
                }

                if (el.type === 'question-icons') {
                  const iconCols = el.columns || 2;
                  return (
                    <div key={el.id} className="mb-4">
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-8 text-center leading-tight tracking-tight">
                        {rv(el.question || 'Pergunta')}
                      </h2>
                      <div
                        className="grid gap-3 sm:gap-4"
                        style={{ gridTemplateColumns: `repeat(${iconCols}, 1fr)` }}
                      >
                        {(el.options || []).map((opt, idx) => {
                          const selKey = `${el.id}-${idx}`;
                          const isSelected = selectedOption === selKey;
                          const isDisabled = selectedOption !== null && !isSelected;
                          
                          return (
                            <button
                              key={idx}
                              onClick={(e) =>
                                handleCompositeOptionSelect(el, idx, e)
                              }
                              disabled={selectedOption !== null}
                              className="group relative flex flex-col items-center justify-center p-4 sm:p-6 transition-all duration-300 overflow-hidden"
                              style={{
                                borderRadius: '1rem',
                                border: isSelected 
                                  ? `3px solid ${theme.primaryColor}` 
                                  : '2px solid transparent',
                                background: isSelected 
                                  ? `linear-gradient(135deg, ${theme.primaryColor}20, ${theme.primaryColor}10)` 
                                  : 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
                                opacity: isDisabled ? 0.4 : 1,
                                boxShadow: isSelected 
                                  ? `0 8px 32px ${theme.primaryColor}25, 0 4px 12px rgba(0,0,0,0.08)` 
                                  : '0 4px 20px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
                                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                minHeight: '120px',
                              }}
                              onMouseEnter={(e) => {
                                if (selectedOption === null) {
                                  e.currentTarget.style.transform = 'scale(1.03) translateY(-4px)';
                                  e.currentTarget.style.boxShadow = `0 12px 40px ${theme.primaryColor}20, 0 6px 16px rgba(0,0,0,0.1)`;
                                  e.currentTarget.style.border = `2px solid ${theme.primaryColor}50`;
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected && selectedOption === null) {
                                  e.currentTarget.style.transform = 'scale(1)';
                                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)';
                                  e.currentTarget.style.border = '2px solid transparent';
                                }
                              }}
                            >
                              {/* Selection indicator */}
                              {isSelected && (
                                <div 
                                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: theme.primaryColor }}
                                >
                                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                              
                              {/* Icon/Image */}
                              {el.optionStyle === 'image' && opt.image ? (
                                <div className="relative mb-3">
                                  <img
                                    src={opt.image}
                                    alt={opt.text}
                                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl"
                                    style={{
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    }}
                                  />
                                </div>
                              ) : (
                                <div 
                                  className="mb-2 sm:mb-3 transition-transform duration-300"
                                  style={{
                                    fontSize: iconCols >= 3 ? '2.5rem' : '3.5rem',
                                    lineHeight: 1,
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                                  }}
                                >
                                  {opt.icon || '⭐'}
                                </div>
                              )}
                              
                              {/* Text */}
                              <span 
                                className="text-sm sm:text-base font-semibold text-center leading-tight px-1"
                                style={{ 
                                  color: isSelected ? theme.primaryColor : '#374151',
                                  maxWidth: '100%',
                                }}
                              >
                                {opt.text}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                if (el.type === 'question-rating') {
                  return (
                    <RatingPlayer
                      key={el.id}
                      element={el}
                      nodeId={currentNodeId}
                      theme={theme}
                      btnRadius={btnRadius}
                      rv={rv}
                      onSubmit={(result) => {
                        const elScore = result.score || 0;
                        playSoundIfEnabled(elScore > 0 ? 'correct' : 'incorrect');
                        if (elScore > 0) setScore((prev) => prev + elScore);
                        setAnswers((prev) => ({
                          ...prev,
                          [`${currentNodeId}__${el.id}`]: {
                            question: el.question,
                            answer: result.answer,
                            score: elScore,
                            elementId: el.id,
                          },
                        }));
                        advanceToNode(getNextNode(currentNodeId, null, el.id));
                      }}
                    />
                  );
                }

                if (el.type === 'question-swipe') {
                  return (
                    <SwipeQuestion
                      key={el.id}
                      element={el}
                      themeColors={{ text: theme.primaryColor }}
                      onAnswer={(result) => {
                        const elScore = result.score || 0;
                        playSoundIfEnabled(elScore > 0 ? 'correct' : 'incorrect');
                        if (elScore > 0) setScore((prev) => prev + elScore);
                        setAnswers((prev) => ({
                          ...prev,
                          [`${currentNodeId}__${el.id}`]: {
                            question: el.question,
                            answer: result.answerLabel,
                            score: elScore,
                            elementId: el.id,
                          },
                        }));
                        advanceToNode(getNextNode(currentNodeId, null, el.id));
                      }}
                    />
                  );
                }

                {/* Question Single - single selection with auto-advance */}
                if (el.type === 'question-single') {
                  return (
                    <div key={el.id} className="mb-6">
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-8 leading-tight tracking-tight">
                        {rv(el.question || 'Pergunta')}
                      </h2>
                      <div className="space-y-4">
                        {(el.options || []).map((opt, idx) => {
                          const selKey = `${el.id}-${idx}`;
                          const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u;
                          const textMatch = (opt.text || '').match(emojiRegex);
                          const leadingEmoji = textMatch ? textMatch[0] : null;
                          const displayEmoji = opt.emoji || leadingEmoji;
                          const displayText = leadingEmoji 
                            ? opt.text.slice(leadingEmoji.length).trim() 
                            : opt.text;
                          
                          const isSelected = selectedOption === selKey;
                          const isOther = selectedOption !== null && !isSelected;
                          
                          return (
                            <button
                              key={idx}
                              onClick={(e) => handleCompositeOptionSelect(el, idx, e)}
                              disabled={selectedOption !== null}
                              className="w-full text-left p-6 transition-all duration-200 flex items-center gap-5 group"
                              style={{
                                borderRadius: '1.5rem',
                                border: isSelected ? `4px solid ${theme.primaryColor}` : '4px solid transparent',
                                background: 'white',
                                opacity: isOther ? 0.5 : 1,
                                boxShadow: isSelected
                                  ? `0 10px 25px -5px ${theme.primaryColor}30`
                                  : '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                              }}
                              onMouseEnter={(e) => {
                                if (selectedOption === null) {
                                  e.currentTarget.style.transform = 'scale(1.05)';
                                  e.currentTarget.style.border = `4px solid ${theme.primaryColor}`;
                                  e.currentTarget.style.boxShadow = `0 15px 35px -5px ${theme.primaryColor}25`;
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected && selectedOption === null) {
                                  e.currentTarget.style.transform = 'scale(1)';
                                  e.currentTarget.style.border = '4px solid transparent';
                                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.05)';
                                }
                              }}
                            >
                              <span
                                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200"
                                style={{
                                  background: isSelected 
                                    ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})` 
                                    : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                                  color: isSelected ? '#ffffff' : '#64748b',
                                  fontSize: displayEmoji ? '2rem' : '1.25rem',
                                  fontWeight: displayEmoji ? 'normal' : '700',
                                  boxShadow: isSelected ? `0 6px 16px ${theme.primaryColor}40` : '0 4px 12px rgba(0,0,0,0.06)',
                                  filter: displayEmoji ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' : 'none',
                                }}
                              >
                                {displayEmoji || String.fromCharCode(65 + idx)}
                              </span>
                              <span className="text-xl font-bold flex-1" style={{ color: isSelected ? theme.primaryColor : '#1e293b' }}>
                                {displayText}
                              </span>
                              {isSelected && (
                                <div 
                                  className="w-10 h-10 rounded-full flex items-center justify-center"
                                  style={{ 
                                    background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})`,
                                    boxShadow: `0 4px 12px ${theme.primaryColor}50`,
                                  }}
                                >
                                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                {/* Question Multiple - allows selecting multiple options with confirm button */}
                if (el.type === 'question-multiple') {
                  const minSelect = el.minSelect || 1;
                  const maxSelect = el.maxSelect || el.options?.length || 999;
                  const currentSelections = multipleSelections.filter((k) => k.startsWith(`${el.id}-`));
                  const canConfirm = currentSelections.length >= minSelect && currentSelections.length <= maxSelect;
                  
                  return (
                    <div key={el.id} className="mb-6">
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight">
                        {rv(el.question || 'Pergunta')}
                      </h2>
                      <p className="text-sm text-slate-500 mb-6">
                        {minSelect === maxSelect 
                          ? `Selecione ${minSelect} ${minSelect === 1 ? 'opção' : 'opções'}`
                          : maxSelect >= (el.options?.length || 999)
                            ? `Selecione pelo menos ${minSelect} ${minSelect === 1 ? 'opção' : 'opções'}`
                            : `Selecione de ${minSelect} a ${maxSelect} opções`
                        }
                        {currentSelections.length > 0 && ` (${currentSelections.length} selecionada${currentSelections.length > 1 ? 's' : ''})`}
                      </p>
                      <div className="space-y-4">
                        {(el.options || []).map((opt, idx) => {
                          const selKey = `${el.id}-${idx}`;
                          const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u;
                          const textMatch = (opt.text || '').match(emojiRegex);
                          const leadingEmoji = textMatch ? textMatch[0] : null;
                          const displayEmoji = opt.emoji || leadingEmoji;
                          const displayText = leadingEmoji 
                            ? opt.text.slice(leadingEmoji.length).trim() 
                            : opt.text;
                          
                          const isSelected = multipleSelections.includes(selKey);
                          const isMaxReached = currentSelections.length >= maxSelect && !isSelected;
                          
                          return (
                            <button
                              key={idx}
                              onClick={(e) => handleMultipleOptionToggle(el, idx, e)}
                              disabled={isMaxReached}
                              className="w-full text-left p-6 transition-all duration-200 flex items-center gap-5 group"
                              style={{
                                borderRadius: '1.5rem',
                                border: isSelected ? `4px solid ${theme.primaryColor}` : '4px solid transparent',
                                background: 'white',
                                opacity: isMaxReached ? 0.5 : 1,
                                boxShadow: isSelected
                                  ? `0 10px 25px -5px ${theme.primaryColor}30`
                                  : '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                              }}
                              onMouseEnter={(e) => {
                                if (!isMaxReached) {
                                  e.currentTarget.style.transform = 'scale(1.02)';
                                  e.currentTarget.style.border = `4px solid ${theme.primaryColor}80`;
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.transform = 'scale(1)';
                                  e.currentTarget.style.border = '4px solid transparent';
                                }
                              }}
                            >
                              {/* Checkbox indicator */}
                              <span
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 border-2"
                                style={{
                                  background: isSelected 
                                    ? theme.primaryColor
                                    : 'white',
                                  borderColor: isSelected ? theme.primaryColor : '#d1d5db',
                                }}
                              >
                                {isSelected && (
                                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </span>
                              <span
                                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200"
                                style={{
                                  background: isSelected 
                                    ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})` 
                                    : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                                  color: isSelected ? '#ffffff' : '#64748b',
                                  fontSize: displayEmoji ? '1.75rem' : '1.1rem',
                                  fontWeight: displayEmoji ? 'normal' : '700',
                                  boxShadow: isSelected ? `0 6px 16px ${theme.primaryColor}40` : '0 4px 12px rgba(0,0,0,0.06)',
                                }}
                              >
                                {displayEmoji || String.fromCharCode(65 + idx)}
                              </span>
                              <span className="text-xl font-bold flex-1" style={{ color: isSelected ? theme.primaryColor : '#1e293b' }}>
                                {displayText}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Confirm button */}
                      <div className="mt-8 flex justify-center">
                        <button
                          onClick={(e) => handleMultipleConfirm(el, e)}
                          disabled={!canConfirm}
                          className="px-10 py-4 text-lg font-bold text-white transition-all duration-200 flex items-center gap-3"
                          style={{
                            background: canConfirm 
                              ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})`
                              : '#d1d5db',
                            borderRadius: btnRadius,
                            boxShadow: canConfirm ? `0 8px 24px ${theme.primaryColor}40` : 'none',
                            cursor: canConfirm ? 'pointer' : 'not-allowed',
                            transform: 'scale(1)',
                          }}
                          onMouseEnter={(e) => {
                            if (canConfirm) {
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          Confirmar
                          <ChevronRight size={24} />
                        </button>
                      </div>
                    </div>
                  );
                }

                if (el.type === 'spin-wheel') {
                  return (
                    <div key={el.id} className="mb-4">
                      <SpinWheel
                        element={el}
                        theme={theme}
                        btnRadius={btnRadius}
                        onSound={playSoundIfEnabled}
                        onComplete={(result) => {
                          // Add score if defined
                          if (el.score > 0) {
                            setScore((prev) => prev + el.score);
                          }
                          // Auto-advance to next node
                          advanceToNode(getNextNode(currentNodeId));
                        }}
                      />
                    </div>
                  );
                }

                if (el.type === 'scratch-card') {
                  return (
                    <div key={el.id} className="mb-4">
                      <ScratchCard
                        element={el}
                        theme={theme}
                        btnRadius={btnRadius}
                        onSound={playSoundIfEnabled}
                        onComplete={(result) => {
                          if (el.score > 0) {
                            setScore((prev) => prev + el.score);
                          }
                          advanceToNode(getNextNode(currentNodeId));
                        }}
                      />
                    </div>
                  );
                }

                if (el.type === 'phone-call') {
                  return (
                    <div key={el.id} className="mb-4">
                      <PhoneCallScreen
                        element={el}
                        theme={theme}
                        onComplete={() => {
                          if (el.score > 0) {
                            setScore((prev) => prev + el.score);
                          }
                          advanceToNode(getNextNode(currentNodeId));
                        }}
                      />
                    </div>
                  );
                }

                if (el.type === 'mystery-box') {
                  return (
                    <div key={el.id} className="mb-4">
                      <MysteryBox
                        element={el}
                        theme={theme}
                        btnRadius={btnRadius}
                        onSound={playSoundIfEnabled}
                        onComplete={() => {
                          if (el.score > 0) {
                            setScore((prev) => prev + el.score);
                          }
                          advanceToNode(getNextNode(currentNodeId));
                        }}
                      />
                    </div>
                  );
                }

                if (el.type === 'card-flip') {
                  return (
                    <div key={el.id} className="mb-4">
                      <CardFlipScreen
                        element={el}
                        theme={theme}
                        onSound={playSoundIfEnabled}
                        onComplete={() => {
                          if (el.score > 0) {
                            setScore((prev) => prev + el.score);
                          }
                          advanceToNode(getNextNode(currentNodeId));
                        }}
                      />
                    </div>
                  );
                }

                if (el.type === 'slot-machine') {
                  return (
                    <div key={el.id} className="mb-4">
                      <SlotMachineScreen
                        element={el}
                        theme={theme}
                        onSound={playSoundIfEnabled}
                        onNext={() => {
                          if (el.score > 0) {
                            setScore((prev) => prev + el.score);
                          }
                          advanceToNode(getNextNode(currentNodeId));
                        }}
                      />
                    </div>
                  );
                }

                if (el.type === 'question-open') {
                  return (
                    <OpenQuestionPlayer
                      key={el.id}
                      element={el}
                      nodeId={currentNodeId}
                      theme={theme}
                      btnRadius={btnRadius}
                      rv={rv}
                      onSubmit={(text) => {
                        const elScore = el.score || 0;
                        playSoundIfEnabled(elScore > 0 ? 'correct' : 'incorrect');
                        if (elScore > 0) setScore((prev) => prev + elScore);
                        setAnswers((prev) => ({
                          ...prev,
                          [`${currentNodeId}__${el.id}`]: {
                            question: el.question,
                            answer: text,
                            score: elScore,
                            elementId: el.id,
                          },
                        }));
                        advanceToNode(getNextNode(currentNodeId, null, el.id));
                      }}
                    />
                  );
                }

                if (el.type === 'question-rating') {
                  return (
                    <RatingQuestionPlayer
                      key={el.id}
                      element={el}
                      nodeId={currentNodeId}
                      theme={theme}
                      btnRadius={btnRadius}
                      rv={rv}
                      onSubmit={(ratingValue) => {
                        const multiplier = el.scoreMultiplier || 1;
                        const elScore = Math.round(ratingValue * multiplier);
                        playSoundIfEnabled(elScore > 0 ? 'correct' : 'incorrect');
                        if (elScore > 0) setScore((prev) => prev + elScore);

                        const ratingType = el.ratingType || 'number';
                        const maxVal = ratingType === 'stars' ? (el.maxStars || 5) : ratingType === 'slider' ? (el.sliderMax || 100) : (el.maxValue || 10);
                        setAnswers((prev) => ({
                          ...prev,
                          [`${currentNodeId}__${el.id}`]: {
                            question: el.question,
                            answer: `${ratingValue}/${maxVal}`,
                            score: elScore,
                            elementId: el.id,
                            ratingValue,
                            ratingMax: maxVal,
                          },
                        }));
                        advanceToNode(getNextNode(currentNodeId, null, el.id));
                      }}
                    />
                  );
                }

                if (el.type === 'question-swipe') {
                  return (
                    <SwipeQuestion
                      key={el.id}
                      element={el}
                      themeColors={{ text: theme.primaryColor }}
                      onAnswer={(result) => {
                        const elScore = result.score || 0;
                        playSoundIfEnabled(elScore > 0 ? 'correct' : 'incorrect');
                        if (elScore > 0) setScore((prev) => prev + elScore);
                        setAnswers((prev) => ({
                          ...prev,
                          [`${currentNodeId}__${el.id}`]: {
                            question: el.question,
                            answer: result.answerLabel,
                            score: elScore,
                            elementId: el.id,
                          },
                        }));
                        advanceToNode(getNextNode(currentNodeId, null, el.id));
                      }}
                    />
                  );
                }

                return null;
              })}

              {!compositeQuestionEl && !compositeHasLeadForm && !compositeHasGamification && (
                <button
                  onClick={() =>
                    advanceToNode(getNextNode(currentNodeId))
                  }
                  className="w-full text-white py-5 font-extrabold text-xl uppercase tracking-wider flex items-center justify-center gap-3 mt-4 transition-all active:translate-y-1"
                  style={{ 
                    background: theme.primaryColor, 
                    borderRadius: '9999px',
                    boxShadow: `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`,
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translateY(4px)';
                    e.currentTarget.style.boxShadow = `0 2px 0 ${theme.secondaryColor || '#2563EB'}, 0 5px 10px -2px ${theme.primaryColor}60`;
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`;
                  }}
                >
                  Continuar <ChevronRight size={24} />
                </button>
              )}
            </div>
          )}

          {/* ── Content / Media legacy nodes ──────────────── */}
          {!showLeadForm && !showResult && isContentOrMedia && (
            <div 
              className="text-center relative overflow-hidden" 
              style={{ 
                fontFamily: theme.fontFamily,
                background: 'white',
                borderRadius: '2.5rem',
                padding: '2.5rem',
                boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
              }}
            >
              <p className="text-slate-800 font-bold text-xl mb-8 relative z-10">
                {currentNode.data?.contentType ||
                  currentNode.data?.mediaType ||
                  'Conteúdo'}
              </p>
              <button
                onClick={() =>
                  advanceToNode(getNextNode(currentNodeId))
                }
                className="text-white px-12 py-5 font-extrabold text-xl uppercase tracking-wider transition-all active:translate-y-1 relative z-10"
                style={{ 
                  background: theme.primaryColor,
                  borderRadius: '9999px',
                  boxShadow: `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`,
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(4px)';
                  e.currentTarget.style.boxShadow = `0 2px 0 ${theme.secondaryColor || '#2563EB'}, 0 5px 10px -2px ${theme.primaryColor}60`;
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`;
                }}
              >
                Continuar <ChevronRight size={24} className="inline ml-2" />
              </button>
            </div>
          )}

          {/* ── Start node ────────────────────────────────── */}
          {!showLeadForm && !showResult && isStart && (
            <div 
              className="text-center relative overflow-hidden" 
              style={{ 
                fontFamily: theme.fontFamily,
                background: 'white',
                borderRadius: '2.5rem',
                padding: '3rem 2.5rem',
                boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
              }}
            >
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-50 rounded-full -ml-12 -mb-12 opacity-50"></div>
              
              {/* Logo/Brand */}
              <div
                className="w-28 h-28 flex items-center justify-center mx-auto mb-10 relative z-10"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})`,
                  borderRadius: '2rem',
                  boxShadow: `0 12px 28px -4px ${theme.primaryColor}50`,
                }}
              >
                {branding.logoUrl ? (
                  <img
                    src={branding.logoUrl}
                    alt="Logo"
                    className="w-20 h-20 object-cover"
                    style={{ borderRadius: '1.5rem' }}
                    onError={(e) => { e.target.outerHTML = '<span class="text-white text-5xl font-extrabold">Q</span>'; }}
                  />
                ) : (
                  <span className="text-white text-5xl font-extrabold">Q</span>
                )}
              </div>
              
              {/* Badge */}
              <div className="inline-block px-6 py-2.5 bg-white/60 backdrop-blur-sm rounded-full mb-6 border border-white/50 shadow-sm relative z-10">
                <span className="text-slate-800 font-extrabold text-lg tracking-tight">Let's Play 🚀</span>
              </div>
              
              {/* Title */}
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-5 leading-tight relative z-10 tracking-tight">
                {quiz?.name}
              </h2>
              
              {/* Description */}
              <p className="text-xl text-slate-500 mb-12 max-w-lg mx-auto leading-relaxed relative z-10 font-medium">
                {quiz?.description || 'Teste seus conhecimentos!'}
              </p>
              
              {/* Start Button - 3D Tactile */}
              <button
                onClick={() =>
                  advanceToNode(getNextNode(currentNodeId))
                }
                className="text-white px-14 py-6 font-extrabold text-2xl uppercase tracking-wider flex items-center gap-4 mx-auto transition-all active:translate-y-1 relative z-10"
                style={{ 
                  background: theme.primaryColor,
                  borderRadius: '9999px',
                  boxShadow: `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`,
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(4px)';
                  e.currentTarget.style.boxShadow = `0 2px 0 ${theme.secondaryColor || '#2563EB'}, 0 5px 10px -2px ${theme.primaryColor}60`;
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 6px 0 ${theme.secondaryColor || '#2563EB'}, 0 10px 20px -5px ${theme.primaryColor}80`;
                }}
              >
                Começar <ChevronRight size={28} />
              </button>
              
              {/* Optional: small hint */}
              <p className="text-sm text-slate-400 mt-8 font-bold uppercase tracking-widest relative z-10">
                ⏱ Leva apenas alguns minutos
              </p>
            </div>
          )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Points Balloons */}
      {pointsBalloons.map((b) => (
        <div
          key={b.id}
          className="fixed pointer-events-none z-50"
          style={{ left: b.x - 40, top: b.y - 20 }}
        >
          <div
            className="animate-balloon text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg flex items-center gap-1"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <span>{b.text || `+${b.points}`}</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07 3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      ))}
      
      {/* Confetti Effect */}
      <ConfettiEffect trigger={showConfetti} />
      
      {/* Share Challenge Button - only show on result */}
      {showResult && gamificationConfig?.challenge && (
        <div className="fixed bottom-6 right-6 z-40">
          <ShareChallengeButton 
            text={gamificationConfig.challengeText || 'Acabei de fazer este quiz e consegui {{score}} pontos! Será que você consegue superar? 🔥'}
            score={score}
            quizUrl={typeof window !== 'undefined' ? window.location.href.replace(/[?&]preview=true/, '') : ''}
            primaryColor={theme.primaryColor}
          />
        </div>
      )}

      {/* Footer */}
      {branding.showBranding && !isEmbed && (
        <div className="p-4 text-center relative z-10">
          <span className="text-xs" style={{ color: theme.textColor, opacity: 0.4 }}>
            Feito com QuizMeBaby
          </span>
        </div>
      )}
    </div>
  );
}

// Wrap with Suspense for useSearchParams (Next.js 14 requirement)
export default function QuizPlayerPage() {
  return (
    <Suspense
      fallback={
        <div 
          className="min-h-screen flex items-center justify-center"
          style={{ 
            background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 25%, #FFF1F2 50%, #F0FDF4 75%, #F0F9FF 100%)',
            fontFamily: 'Outfit, system-ui, sans-serif',
          }}
        >
          {/* Minimal loading spinner - real preload message comes after data loads */}
          <div className="flex flex-col items-center gap-4">
            <Loader2 
              className="animate-spin" 
              size={40} 
              style={{ color: '#6366f1' }}
            />
            <p className="text-slate-500 text-sm font-medium">Carregando...</p>
          </div>
        </div>
      }
    >
      <QuizPlayer />
    </Suspense>
  );
}
