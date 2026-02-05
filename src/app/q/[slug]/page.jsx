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
  primaryColor: '#7c3aed',
  secondaryColor: '#5b21b6',
  backgroundColor: '#1e1b4b',
  backgroundType: 'gradient',
  backgroundGradient: 'from-purple-900 via-purple-800 to-indigo-900',
  textColor: '#ffffff',
  buttonStyle: 'rounded',
  fontFamily: 'Inter',
};

const DEFAULT_BRANDING = {
  logoUrl: '',
  faviconUrl: '',
  showBranding: true,
};

// ── Gradient CSS map ─────────────────────────────────────────
const GRADIENT_CSS = {
  'from-purple-900 via-purple-800 to-indigo-900': 'linear-gradient(135deg, #581c87, #6b21a8, #312e81)',
  'from-blue-900 via-blue-800 to-cyan-900': 'linear-gradient(135deg, #1e3a5f, #1e40af, #164e63)',
  'from-emerald-900 via-green-800 to-teal-900': 'linear-gradient(135deg, #064e3b, #166534, #134e4a)',
  'from-orange-900 via-red-800 to-pink-900': 'linear-gradient(135deg, #7c2d12, #991b1b, #831843)',
  'from-gray-900 via-slate-800 to-zinc-900': 'linear-gradient(135deg, #111827, #1e293b, #18181b)',
  'from-rose-900 via-pink-800 to-fuchsia-900': 'linear-gradient(135deg, #881337, #9d174d, #701a75)',
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
  if (!fontFamily || fontFamily === 'Inter') return null;
  const fontName = fontFamily.replace(/ /g, '+');
  return (
    // eslint-disable-next-line @next/next/no-page-custom-font
    <link
      rel="stylesheet"
      href={`https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700&display=swap`}
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
    <div className="mb-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {rv(element.question || 'Dê sua nota')}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </h2>
      <div className="flex flex-col items-center gap-3">
        {(element.labelMin || element.labelMax) && (
          <div className="flex justify-between w-full text-xs text-gray-400 px-1">
            <span>{element.labelMin}</span>
            <span>{element.labelMax}</span>
          </div>
        )}
        <div className="flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
          {Array.from({ length: maxStars }).map((_, i) => {
            const starNum = i + 1;
            const isFilled = starNum <= (hovered ?? selected ?? 0);
            return (
              <button
                key={i}
                onMouseEnter={() => setHovered(starNum)}
                onClick={() => handleSelect(starNum)}
                className="transition-all duration-150 focus:outline-none"
                style={{
                  transform: hovered === starNum ? 'scale(1.2)' : 'scale(1)',
                  cursor: 'pointer',
                }}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill={isFilled ? '#f59e0b' : 'none'}
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
          <span className="text-sm text-gray-500 font-medium">{selected} de {maxStars}</span>
        )}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full text-white py-3 font-medium flex items-center justify-center gap-2 transition-all mt-4"
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

function NumberRatingPlayer({ element, theme, btnRadius, rv, onSubmit }) {
  const [selected, setSelected] = useState(null);
  const minVal = element.minValue ?? 0;
  const maxVal = element.maxValue ?? 10;
  const isRequired = element.required !== false;
  const canSubmit = !isRequired || selected !== null;
  const isNps = minVal === 0 && maxVal === 10;

  const getColor = (val) => {
    if (isNps) {
      if (val <= 6) return { bg: '#fecaca', border: '#f87171', text: '#dc2626', selectedBg: '#ef4444' };
      if (val <= 8) return { bg: '#fef3c7', border: '#fbbf24', text: '#d97706', selectedBg: '#f59e0b' };
      return { bg: '#d1fae5', border: '#34d399', text: '#059669', selectedBg: '#10b981' };
    }
    return { bg: `${theme.primaryColor}15`, border: `${theme.primaryColor}40`, text: theme.primaryColor, selectedBg: theme.primaryColor };
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const scoreVal = selected * (element.scoreMultiplier || 1);
    onSubmit({ answer: String(selected), score: scoreVal, rawValue: selected });
  };

  const numbers = [];
  for (let i = minVal; i <= maxVal; i++) numbers.push(i);

  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {rv(element.question || 'Dê sua nota')}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </h2>
      {(element.labelMin || element.labelMax) && (
        <div className="flex justify-between w-full text-xs text-gray-400 mb-2 px-1">
          <span>{element.labelMin}</span>
          <span>{element.labelMax}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2 justify-center">
        {numbers.map((num) => {
          const colors = getColor(num);
          const isSel = selected === num;
          return (
            <button
              key={num}
              onClick={() => setSelected(num)}
              className="w-11 h-11 rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-150 border-2"
              style={{
                backgroundColor: isSel ? colors.selectedBg : colors.bg,
                borderColor: isSel ? colors.selectedBg : colors.border,
                color: isSel ? '#ffffff' : colors.text,
                transform: isSel ? 'scale(1.1)' : 'scale(1)',
                boxShadow: isSel ? `0 4px 12px ${colors.selectedBg}40` : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isSel) {
                  e.currentTarget.style.transform = 'scale(1.08)';
                  e.currentTarget.style.boxShadow = `0 2px 8px ${colors.selectedBg}20`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSel) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {num}
            </button>
          );
        })}
      </div>
      {isNps && (
        <div className="flex justify-between text-[10px] text-gray-300 mt-2 px-1">
          <span>Detratores</span>
          <span>Neutros</span>
          <span>Promotores</span>
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full text-white py-3 font-medium flex items-center justify-center gap-2 transition-all mt-4"
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
    <div className="mb-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {rv(element.question || 'Dê sua nota')}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </h2>
      <div className="flex flex-col items-center gap-2">
        {/* Value badge */}
        <div
          className="text-white px-4 py-1.5 rounded-full text-lg font-bold shadow-md"
          style={{ backgroundColor: theme.primaryColor }}
        >
          {value}{unit ? ` ${unit}` : ''}
        </div>

        {/* Slider */}
        <div className="w-full relative mt-2">
          <div className="relative">
            {/* Background track with fill */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 rounded-full bg-gray-200 pointer-events-none" />
            <div
              className="absolute top-1/2 -translate-y-1/2 left-0 h-2 rounded-full pointer-events-none"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})`,
              }}
            />
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              step={sliderStep}
              value={value}
              onChange={(e) => { setValue(parseInt(e.target.value)); setTouched(true); }}
              className="quiz-slider relative z-10 w-full"
              style={{ '--slider-color': theme.primaryColor }}
            />
          </div>
        </div>

        {/* Labels */}
        <div className="flex justify-between w-full text-xs text-gray-400 px-1">
          <span>{element.labelMin || sliderMin}</span>
          <span>{element.labelMax || sliderMax}</span>
        </div>
      </div>
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full text-white py-3 font-medium flex items-center justify-center gap-2 transition-all mt-4"
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
  const maxLen = element.maxLength || 500;
  const isRequired = element.required !== false;
  const canSubmit = !isRequired || text.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(text.trim());
  };

  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {rv(element.question || 'Pergunta')}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </h2>
      {element.multiline ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxLen))}
          placeholder={element.placeholder || 'Digite sua resposta...'}
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 focus:border-transparent outline-none resize-none text-gray-800 text-sm transition-all"
          style={{
            borderRadius: btnRadius,
            '--tw-ring-color': theme.primaryColor,
          }}
          onFocus={(e) => { e.target.style.borderColor = theme.primaryColor; e.target.style.boxShadow = `0 0 0 3px ${theme.primaryColor}20`; }}
          onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
          maxLength={maxLen}
        />
      ) : (
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxLen))}
          placeholder={element.placeholder || 'Digite sua resposta...'}
          className="w-full px-4 py-3 border-2 border-gray-200 focus:border-transparent outline-none text-gray-800 text-sm transition-all"
          style={{
            borderRadius: btnRadius,
            '--tw-ring-color': theme.primaryColor,
          }}
          onFocus={(e) => { e.target.style.borderColor = theme.primaryColor; e.target.style.boxShadow = `0 0 0 3px ${theme.primaryColor}20`; }}
          onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
          maxLength={maxLen}
          onKeyDown={(e) => { if (e.key === 'Enter' && canSubmit) handleSubmit(); }}
        />
      )}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">
          {text.length}/{maxLen}
        </span>
        {isRequired && text.trim().length === 0 && (
          <span className="text-xs text-red-400">Resposta obrigatória</span>
        )}
      </div>
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
  const { playSound } = SoundSystem({ level: gamificationConfig?.soundLevel || 'medium' });

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

  // ── Gamification: Confetti on result ─────────────────────────
  useEffect(() => {
    if (showResult && gamificationConfig?.confetti !== false) {
      setShowConfetti(true);
      if (gamificationConfig?.sounds) {
        setTimeout(() => playSound('complete'), 300);
      }
    }
  }, [showResult, gamificationConfig, playSound]);

  // ── Gamification: Timer activation ───────────────────────────
  useEffect(() => {
    // Compute currentNode locally to avoid hoisting issues
    const node = nodes.find((n) => n.id === currentNodeId);
    if (node && gamificationConfig?.timer) {
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
  }, [nodes, currentNodeId, gamificationConfig, selectedOption]);

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
    if (!gamificationConfig) return optionScore;
    
    let finalScore = optionScore;
    
    setQuestionsAnswered(prev => prev + 1);
    
    // Process streak and sounds
    if (isCorrect || optionScore > 0) {
      setCorrectAnswers(prev => prev + 1);
      
      if (gamificationConfig.streak) {
        setCurrentStreak(prev => {
          const newStreak = prev + 1;
          
          // Apply streak multiplier if enabled and threshold reached
          if (newStreak >= (gamificationConfig.streakAfter || 3)) {
            const multiplier = gamificationConfig.streakMultiplier || 2;
            finalScore = Math.floor(optionScore * multiplier);
          }
          
          return newStreak;
        });
        
        if (gamificationConfig.sounds) {
          playSound('streak');
        }
      } else if (gamificationConfig.sounds) {
        playSound('correct');
      }
    } else {
      // Wrong answer
      setCurrentStreak(0);
      
      if (gamificationConfig.sounds) {
        playSound('incorrect');
      }
      
      // Process lives system
      if (gamificationConfig.lives && lives > 0) {
        setLives(prev => {
          const newLives = prev - 1;
          
          if (newLives === 0) {
            // Handle lives depleted
            setTimeout(() => {
              if (gamificationConfig.livesAction === 'email') {
                setShowLeadForm(true);
              } else if (gamificationConfig.livesAction === 'partial') {
                setShowResult(true);
              } else if (gamificationConfig.livesAction === 'redirect' && gamificationConfig.livesRedirectUrl) {
                window.location.href = gamificationConfig.livesRedirectUrl;
              }
            }, 1000);
          }
          
          return newLives;
        });
      }
    }
    
    return finalScore;
  }, [gamificationConfig, lives, playSound]);
  
  // Timer timeout state - navigation handled in separate effect
  const [timerExpired, setTimerExpired] = useState(false);
  
  const handleTimerTimeout = useCallback(() => {
    if (!gamificationConfig?.timer) return;
    
    // Treat timeout as wrong answer for gamification purposes
    processGamificationAnswer(0, false);
    
    if (gamificationConfig.sounds) {
      playSound('timer');
    }
    
    // Set timer expired flag - actual navigation handled in effect below
    setTimeout(() => {
      setTimerActive(false);
      setTimerExpired(true);
    }, 500);
  }, [gamificationConfig, processGamificationAnswer, playSound]);
  
  const handleSpeedBonus = useCallback((bonusLevel) => {
    if (!gamificationConfig?.timer || speedBonusAwarded) return;
    
    const bonusMultipliers = {
      low: 1.1, // +10%
      medium: 1.25, // +25%
      high: 1.5, // +50%
    };
    
    const multiplier = bonusMultipliers[bonusLevel] || 1;
    const bonus = Math.floor(10 * multiplier); // Base 10 points + bonus
    
    setScore(prev => prev + bonus);
    setSpeedBonusAwarded(true);
    
    if (gamificationConfig.sounds) {
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
  }, [gamificationConfig, speedBonusAwarded, playSound]);

  // ── Derived styles ──────────────────────────────────────────

  const btnRadius = getButtonRadius(theme.buttonStyle);

  // Page background styles (novo sistema)
  const pageBgStyle = useMemo(() => {
    const pb = theme.pageBackground || {};
    
    // Se não houver configuração de page background, usar bgStyle antigo como fallback
    if (!pb.type) {
      if (theme.backgroundType === 'gradient' && GRADIENT_CSS[theme.backgroundGradient]) {
        return { background: GRADIENT_CSS[theme.backgroundGradient] };
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
      const res = await fetch(`/api/quizzes/${params.slug}/public${previewParam}`);
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
            if (settings.theme) setTheme((prev) => ({ ...prev, ...settings.theme }));
            if (settings.branding) setBranding((prev) => ({ ...prev, ...settings.branding }));
            if (settings.aiResultConfig) setAiConfig(settings.aiResultConfig);
            if (settings.tracking) setTrackingConfig(settings.tracking);
            if (settings.gamification) {
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
      <div className={`${embedClass} flex items-center justify-center`} style={pageBgStyle}>
        <Loader2 className="animate-spin" size={48} style={{ color: theme.textColor }} />
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
        {/* Header (hidden in embed mode for cleaner look) */}
        {!isEmbed && (
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt="Logo"
                  className="w-8 h-8 rounded-lg object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <span className="text-sm font-bold" style={{ color: theme.textColor }}>Q</span>
                </div>
              )}
              <span className="text-sm font-medium" style={{ color: theme.textColor, opacity: 0.8 }}>
                {quiz?.name}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {!showResult && (
                <span className="text-sm" style={{ color: theme.textColor, opacity: 0.6 }}>
                  {answeredCount}/{totalQuestions}
                </span>
              )}
              
              {/* Gamification Header Elements */}
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

        {/* Progress Bar */}
        {!showResult && (
          <div className={isEmbed ? 'px-2 mb-4' : 'px-4 mb-6'}>
            {gamificationConfig?.progressBar ? (
              <GamifiedProgressBar 
                current={questionsAnswered}
                total={totalQuestions}
                style={gamificationConfig.progressStyle || 'simple'}
                primaryColor={theme.primaryColor}
              />
            ) : (
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, backgroundColor: theme.textColor }}
                />
              </div>
            )}
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
                  <div className="rounded-2xl shadow-xl p-8 text-center" style={{ ...cardBgStyle, fontFamily: theme.fontFamily, color: theme.textColor }}>
                    {matchedRange?.image ? (
                      <img
                        src={matchedRange.image}
                        alt={matchedRange.title}
                        className="w-full h-48 object-cover rounded-xl mb-6"
                      />
                    ) : (
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
                      >
                        <Trophy className="text-white" size={40} />
                      </div>
                    )}

                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      {rv(matchedRange?.title || currentNode?.data?.title || 'Seu Resultado')}
                    </h1>

                    {matchedRange?.description ? (
                      <div className="text-gray-600 mb-6 text-left space-y-3">
                        {rv(matchedRange.description).split('\n\n').map((paragraph, i) => (
                          <p key={i} className="leading-relaxed">{paragraph.trim()}</p>
                        ))}
                      </div>
                    ) : (
                      <div className="text-6xl mb-4">
                        {getResultEmoji(getResultCategory(score))}
                      </div>
                    )}

                    <div
                      className="rounded-xl p-6 mb-6"
                      style={{ backgroundColor: `${theme.primaryColor}10` }}
                    >
                      <p className="text-sm text-gray-500 mb-1">Sua pontuação</p>
                      <p className="text-4xl font-bold" style={{ color: theme.primaryColor }}>{score} pts</p>
                      {!matchedRange && (
                        <p className="text-lg font-medium mt-2" style={{ color: theme.secondaryColor }}>
                          {getResultCategory(score)}
                        </p>
                      )}
                    </div>

                    {/* Respostas detalhadas ficam ocultas — foco no diagnóstico */}

                    {!showAi && _rMode === 'button' && _rUrl ? (
                      <a
                        href={_rUrl}
                        target={_rNewTab ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 text-white py-3 font-medium transition-opacity hover:opacity-90 mb-3 text-center"
                        style={{ backgroundColor: theme.primaryColor, borderRadius: btnRadius }}
                        onClick={() => trackRedirectEvent(_rUrl, _rResultTitle)}
                      >
                        {_rBtnText}
                        <ExternalLink size={16} />
                      </a>
                    ) : null}

                    {!showAi && (
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
            <div className="rounded-2xl shadow-xl p-8" style={{ ...cardBgStyle, fontFamily: theme.fontFamily, color: theme.textColor }}>
              {leadSaved ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto mb-4" size={48} style={{ color: '#10b981' }} />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Obrigado!
                  </h2>
                  <p className="text-gray-500">
                    Seus dados foram salvos. Carregando resultado…
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {rv(currentNode?.data?.title ||
                      (isComposite
                        ? (currentNode?.data?.elements || []).find(
                            (el) => el.type === 'lead-form',
                          )?.title
                        : null) ||
                      'Quase lá!')}
                  </h2>
                  <p className="text-gray-500 mb-6">
                    Preencha seus dados para ver o resultado
                  </p>
                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <User size={16} className="inline mr-1" /> Nome
                      </label>
                      <input
                        type="text"
                        value={leadForm.name}
                        onChange={(e) =>
                          setLeadForm((p) => ({ ...p, name: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:border-transparent outline-none"
                        style={{ borderRadius: btnRadius, '--tw-ring-color': theme.primaryColor }}
                        placeholder="Seu nome"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Mail size={16} className="inline mr-1" /> Email
                      </label>
                      <input
                        type="email"
                        value={leadForm.email}
                        onChange={(e) =>
                          setLeadForm((p) => ({ ...p, email: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:border-transparent outline-none"
                        style={{ borderRadius: btnRadius }}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Phone size={16} className="inline mr-1" /> Telefone
                      </label>
                      <input
                        type="tel"
                        value={leadForm.phone}
                        onChange={(e) =>
                          setLeadForm((p) => ({ ...p, phone: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:border-transparent outline-none"
                        style={{ borderRadius: btnRadius }}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full text-white py-3 font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                      style={{ backgroundColor: theme.primaryColor, borderRadius: btnRadius }}
                    >
                      Ver Meu Resultado
                      <ChevronRight size={20} />
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* ── Legacy Question Node ──────────────────────── */}
          {!showLeadForm && !showResult && isLegacyQuestion && (
            <div className="rounded-2xl shadow-xl p-8" style={{ ...cardBgStyle, fontFamily: theme.fontFamily, color: theme.textColor }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  {history.length > 0 && (
                    <button
                      onClick={handleGoBack}
                      className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-sm transition-colors"
                    >
                      <ArrowLeft size={16} /> Voltar
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
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {rv(currentNode.data.question || 'Pergunta')}
              </h2>
              <div className="space-y-3">
                {(currentNode.data.options || []).map((option, index) => (
                  <button
                    key={index}
                    onClick={(e) => handleOptionSelect(index, e)}
                    disabled={selectedOption !== null}
                    className="w-full text-left p-4 border-2 transition-all flex items-center gap-3"
                    style={{
                      borderRadius: btnRadius,
                      borderColor:
                        selectedOption === index
                          ? theme.primaryColor
                          : selectedOption !== null
                            ? '#e5e7eb'
                            : '#e5e7eb',
                      backgroundColor:
                        selectedOption === index ? `${theme.primaryColor}10` : 'transparent',
                      opacity: selectedOption !== null && selectedOption !== index ? 0.5 : 1,
                      boxShadow:
                        selectedOption === index
                          ? `0 0 0 3px ${theme.primaryColor}20`
                          : 'none',
                    }}
                  >
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
                      style={{
                        backgroundColor:
                          selectedOption === index ? theme.primaryColor : '#f3f4f6',
                        color:
                          selectedOption === index ? '#ffffff' : '#6b7280',
                      }}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <div className="flex items-center gap-2 flex-1">
                      {option.emoji && (
                        <span style={{ fontSize: '1.4em', lineHeight: 1 }}>
                          {option.emoji}
                        </span>
                      )}
                      <span className="font-medium text-gray-800">
                        {option.text}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Composite Node ────────────────────────────── */}
          {!showLeadForm && !showResult && isComposite && currentNode && (
            <div className="rounded-2xl shadow-xl p-8" style={{ ...cardBgStyle, fontFamily: theme.fontFamily, color: theme.textColor }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  {history.length > 0 && (
                    <button
                      onClick={handleGoBack}
                      className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-sm transition-colors"
                    >
                      <ArrowLeft size={16} /> Voltar
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

                if (['video', 'audio', 'image', 'carousel'].includes(el.type)) {
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
                  return (
                    <div
                      key={el.id}
                      className="mb-4 bg-gray-100 rounded-xl p-6 flex flex-col items-center gap-2"
                    >
                      {el.url && el.type === 'image' ? (
                        <img
                          src={el.url}
                          alt={el.title || ''}
                          className="rounded-lg max-h-64 object-cover"
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
                      <h2 className="text-xl font-bold text-gray-800 mb-4">
                        {rv(el.question || 'Pergunta')}
                      </h2>
                      <div
                        className="grid gap-3"
                        style={{ gridTemplateColumns: `repeat(${iconCols}, 1fr)` }}
                      >
                        {(el.options || []).map((opt, idx) => {
                          const selKey = `${el.id}-${idx}`;
                          const isSelected = selectedOption === selKey;
                          return (
                            <button
                              key={idx}
                              onClick={(e) =>
                                handleCompositeOptionSelect(el, idx, e)
                              }
                              disabled={selectedOption !== null}
                              className="flex flex-col items-center justify-center p-4 border-2 transition-all"
                              style={{
                                borderRadius: btnRadius,
                                borderColor: isSelected ? theme.primaryColor : '#e5e7eb',
                                backgroundColor: isSelected ? `${theme.primaryColor}10` : 'transparent',
                                opacity: selectedOption !== null && !isSelected ? 0.5 : 1,
                                boxShadow: isSelected ? `0 0 0 3px ${theme.primaryColor}20` : 'none',
                                transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                                aspectRatio: '1 / 1',
                              }}
                              onMouseEnter={(e) => {
                                if (selectedOption === null) {
                                  e.currentTarget.style.borderColor = theme.primaryColor;
                                  e.currentTarget.style.transform = 'scale(1.05)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected && selectedOption === null) {
                                  e.currentTarget.style.borderColor = '#e5e7eb';
                                  e.currentTarget.style.transform = 'scale(1)';
                                }
                              }}
                            >
                              {el.optionStyle === 'image' && opt.image ? (
                                <img
                                  src={opt.image}
                                  alt={opt.text}
                                  className="w-16 h-16 object-cover rounded-lg mb-2"
                                />
                              ) : (
                                <span className="text-5xl mb-2 leading-none">{opt.icon || '⭐'}</span>
                              )}
                              <span className="text-sm font-medium text-gray-700 text-center">
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

                if (el.type.startsWith('question-') && el.type !== 'question-open' && el.type !== 'question-rating' && el.type !== 'question-icons' && el.type !== 'question-swipe') {
                  return (
                    <div key={el.id} className="mb-4">
                      <h2 className="text-xl font-bold text-gray-800 mb-4">
                        {rv(el.question || 'Pergunta')}
                      </h2>
                      <div className="space-y-3">
                        {(el.options || []).map((opt, idx) => {
                          const selKey = `${el.id}-${idx}`;
                          return (
                            <button
                              key={idx}
                              onClick={(e) =>
                                handleCompositeOptionSelect(el, idx, e)
                              }
                              disabled={selectedOption !== null}
                              className="w-full text-left p-4 border-2 transition-all flex items-center gap-3"
                              style={{
                                borderRadius: btnRadius,
                                borderColor:
                                  selectedOption === selKey
                                    ? theme.primaryColor
                                    : '#e5e7eb',
                                backgroundColor:
                                  selectedOption === selKey
                                    ? `${theme.primaryColor}10`
                                    : 'transparent',
                                opacity:
                                  selectedOption !== null && selectedOption !== selKey ? 0.5 : 1,
                                boxShadow:
                                  selectedOption === selKey
                                    ? `0 0 0 3px ${theme.primaryColor}20`
                                    : 'none',
                              }}
                            >
                              <span
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
                                style={{
                                  backgroundColor:
                                    selectedOption === selKey
                                      ? theme.primaryColor
                                      : '#f3f4f6',
                                  color:
                                    selectedOption === selKey
                                      ? '#ffffff'
                                      : '#6b7280',
                                }}
                              >
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <div className="flex items-center gap-2 flex-1">
                                {opt.emoji && (
                                  <span style={{ fontSize: '1.4em', lineHeight: 1 }}>
                                    {opt.emoji}
                                  </span>
                                )}
                                <span className="font-medium text-gray-800">
                                  {opt.text}
                                </span>
                              </div>
                            </button>
                          );
                        })}
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
                  className="w-full text-white py-3 font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90 mt-2"
                  style={{ backgroundColor: theme.primaryColor, borderRadius: btnRadius }}
                >
                  Continuar <ChevronRight size={20} />
                </button>
              )}
            </div>
          )}

          {/* ── Content / Media legacy nodes ──────────────── */}
          {!showLeadForm && !showResult && isContentOrMedia && (
            <div className="rounded-2xl shadow-xl p-8 text-center" style={{ ...cardBgStyle, fontFamily: theme.fontFamily, color: theme.textColor }}>
              <p className="text-gray-800 font-medium mb-4">
                {currentNode.data?.contentType ||
                  currentNode.data?.mediaType ||
                  'Conteúdo'}
              </p>
              <button
                onClick={() =>
                  advanceToNode(getNextNode(currentNodeId))
                }
                className="text-white px-6 py-3 font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: theme.primaryColor, borderRadius: btnRadius }}
              >
                Continuar
              </button>
            </div>
          )}

          {/* ── Start node ────────────────────────────────── */}
          {!showLeadForm && !showResult && isStart && (
            <div className="rounded-2xl shadow-xl p-8 text-center" style={{ ...cardBgStyle, fontFamily: theme.fontFamily, color: theme.textColor }}>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
              >
                {branding.logoUrl ? (
                  <img
                    src={branding.logoUrl}
                    alt="Logo"
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => { e.target.outerHTML = '<span class="text-white text-2xl font-bold">Q</span>'; }}
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">Q</span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {quiz?.name}
              </h2>
              <p className="text-gray-500 mb-6">
                {quiz?.description || 'Teste seus conhecimentos!'}
              </p>
              <button
                onClick={() =>
                  advanceToNode(getNextNode(currentNodeId))
                }
                className="text-white px-8 py-3 font-medium flex items-center gap-2 mx-auto transition-opacity hover:opacity-90"
                style={{ backgroundColor: theme.primaryColor, borderRadius: btnRadius }}
              >
                Começar <ChevronRight size={20} />
              </button>
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
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
          <Loader2 className="animate-spin text-white" size={48} />
        </div>
      }
    >
      <QuizPlayer />
    </Suspense>
  );
}
