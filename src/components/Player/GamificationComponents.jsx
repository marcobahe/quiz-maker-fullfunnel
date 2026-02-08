'use client';

import { useState, useEffect, useCallback } from 'react';
import { Timer, Heart, Star, Zap, Trophy, Flame } from 'lucide-react';

// ── Progress Bar Gamificada ───────────────────────────────────────

export function GamifiedProgressBar({ current, total, style = 'simple', primaryColor = '#8b5cf6' }) {
  const progress = Math.min(100, (current / Math.max(1, total)) * 100);

  if (style === 'milestones') {
    const milestones = Array.from({ length: Math.min(10, total) }, (_, i) => i + 1);
    
    return (
      <div className="flex items-center gap-2.5 w-full px-4">
        {milestones.map((milestone) => {
          const isActive = current >= milestone;
          const isCurrent = current === milestone;
          return (
            <div
              key={milestone}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                isActive
                  ? 'text-white shadow-lg scale-105'
                  : 'bg-white/80 text-gray-400 border border-gray-200'
              } ${isCurrent ? 'animate-pulse ring-4 ring-offset-2' : ''}`}
              style={isActive ? { 
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
                boxShadow: `0 4px 16px ${primaryColor}40`,
              } : {}}
            >
              {isActive ? '✓' : milestone}
            </div>
          );
        })}
      </div>
    );
  }

  if (style === 'xp') {
    const level = Math.floor(current / 2) + 1;
    const xpInLevel = ((current - 1) % 2) + 1;
    const xpToNext = 2;
    
    return (
      <div className="flex items-center gap-4 w-full px-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
          >
            <Trophy size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl" style={{ color: primaryColor }}>
            Nível {level}
          </span>
        </div>
        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${(xpInLevel / xpToNext) * 100}%`,
              background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}cc)`,
              boxShadow: `0 0 12px ${primaryColor}50`,
            }}
          />
        </div>
        <span className="text-base font-semibold text-gray-600 min-w-fit">
          {xpInLevel}/{xpToNext} XP
        </span>
      </div>
    );
  }

  // Simple (default)
  return (
    <div className="w-full px-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-base font-semibold text-white/90">
          Progresso
        </span>
        <span className="text-base font-bold text-white bg-white/20 px-3 py-1 rounded-full">
          {current}/{total}
        </span>
      </div>
      <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #ffffff, #ffffffcc)',
            boxShadow: progress > 0 ? '0 0 16px rgba(255,255,255,0.6)' : 'none'
          }}
        />
      </div>
    </div>
  );
}

// ── Streak/Combo Counter ──────────────────────────────────────────

export function StreakCounter({ 
  streak, 
  multiplier = 2, 
  effect = 'fire',
  primaryColor = '#7c3aed',
  isActive = false 
}) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isActive && streak > 0) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [streak, isActive]);

  if (streak === 0) return null;

  const getStreakIcon = () => {
    switch (effect) {
      case 'stars': return <Star size={20} className="text-yellow-400" />;
      case 'lightning': return <Zap size={20} className="text-blue-400" />;
      default: return <Flame size={20} className="text-orange-400" />;
    }
  };

  const getStreakEmoji = () => {
    switch (effect) {
      case 'stars': return '⭐';
      case 'lightning': return '⚡';
      default: return '🔥';
    }
  };

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg border-2 transition-all duration-300 ${
      showAnimation ? 'scale-110 animate-pulse' : ''
    }`} style={{ borderColor: primaryColor }}>
      {getStreakIcon()}
      <span className="font-bold text-lg" style={{ color: primaryColor }}>
        {streak} {getStreakEmoji()}
      </span>
      {streak >= 3 && (
        <span className="text-sm font-medium px-2 py-1 rounded-full text-white"
              style={{ backgroundColor: primaryColor }}>
          {multiplier}x
        </span>
      )}
    </div>
  );
}

// ── Question Timer ────────────────────────────────────────────────

export function QuestionTimer({ 
  seconds, 
  onTimeout, 
  onSpeedBonus,
  speedBonus = 'none',
  isActive = false,
  primaryColor = '#7c3aed'
}) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [bonusAwarded, setBonusAwarded] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(seconds);
      setBonusAwarded(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, seconds, onTimeout]);

  // Speed bonus logic
  useEffect(() => {
    if (!isActive || bonusAwarded || speedBonus === 'none') return;

    const thresholds = {
      high: 0.8, // 80% do tempo restante
      medium: 0.6, // 60% do tempo restante  
      low: 0.4, // 40% do tempo restante
    };

    const threshold = thresholds[speedBonus];
    if (threshold && timeLeft > seconds * threshold) {
      setBonusAwarded(true);
      onSpeedBonus?.(speedBonus);
    }
  }, [timeLeft, seconds, speedBonus, bonusAwarded, isActive, onSpeedBonus]);

  if (!isActive) return null;

  const progress = (timeLeft / seconds) * 100;
  const isUrgent = timeLeft <= 5;

  return (
    <div className={`flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-lg border-2 transition-all ${
      isUrgent ? 'animate-pulse border-red-400' : ''
    }`} style={{ borderColor: isUrgent ? '#ef4444' : primaryColor }}>
      <Timer size={20} style={{ color: isUrgent ? '#ef4444' : primaryColor }} />
      <div className="flex-1">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="font-medium" style={{ color: isUrgent ? '#ef4444' : primaryColor }}>
            Tempo
          </span>
          <span className={`font-bold ${isUrgent ? 'text-red-500' : ''}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-1000 rounded-full"
            style={{ 
              width: `${progress}%`,
              backgroundColor: isUrgent ? '#ef4444' : primaryColor 
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Lives/Hearts System ───────────────────────────────────────────

export function LivesDisplay({ 
  current, 
  total, 
  primaryColor = '#7c3aed',
  showAnimation = false 
}) {
  const [animatingHearts, setAnimatingHearts] = useState(new Set());

  useEffect(() => {
    if (showAnimation) {
      // Animate the last lost heart
      const lostHeart = current;
      setAnimatingHearts(new Set([lostHeart]));
      const timer = setTimeout(() => {
        setAnimatingHearts(new Set());
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [current, showAnimation]);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }, (_, i) => {
        const isActive = i < current;
        const isAnimating = animatingHearts.has(i);
        
        return (
          <Heart
            key={i}
            size={24}
            className={`transition-all duration-300 ${
              isActive ? 'text-red-500' : 'text-gray-300'
            } ${isAnimating ? 'animate-bounce scale-150' : ''}`}
            fill={isActive ? 'currentColor' : 'none'}
          />
        );
      })}
    </div>
  );
}

// ── Confetti Effect ───────────────────────────────────────────────

export function ConfettiEffect({ trigger, duration = 3000 }) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsActive(true);
      const timer = setTimeout(() => setIsActive(false), duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  if (!isActive) return null;

  // Simple CSS confetti - multiple particles
  const particles = Array.from({ length: 50 }, (_, i) => (
    <div
      key={i}
      className="absolute animate-ping"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${2 + Math.random() * 2}s`,
      }}
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: [
            '#fbbf24', '#f59e0b', '#d97706', // yellow/orange
            '#ec4899', '#db2777', '#be185d', // pink
            '#8b5cf6', '#7c3aed', '#6d28d9', // purple
            '#06b6d4', '#0891b2', '#0e7490', // cyan
            '#10b981', '#059669', '#047857', // emerald
          ][Math.floor(Math.random() * 15)]
        }}
      />
    </div>
  ));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles}
    </div>
  );
}

// ── Sound System v2.0 — Unique immersive sounds per gamification element ──

const SAMPLE_RATE = 22050;

// Write WAV header into a DataView
function writeWavHeader(view, numSamples) {
  const writeString = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);
}

function createWavBlob(numSamples) {
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  writeWavHeader(view, numSamples);
  return { buffer, view };
}

function finalizeBlobUrl(buffer) {
  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

// Basic oscillator waveforms
function oscSine(phase) { return Math.sin(phase); }
function oscTriangle(phase) { return 2 * Math.abs(2 * (phase / (2 * Math.PI) - Math.floor(phase / (2 * Math.PI) + 0.5))) - 1; }
function oscSawtooth(phase) { const p = phase / (2 * Math.PI); return 2 * (p - Math.floor(p + 0.5)); }
function oscSquare(phase) { return Math.sin(phase) >= 0 ? 1 : -1; }

// Envelope shapes
function envLinearDecay(t, dur) { return Math.max(0, 1 - t / dur); }
function envPercussive(t, dur, attack = 0.005) {
  if (t < attack) return t / attack;
  return Math.max(0, Math.exp(-6 * (t - attack) / dur));
}
function envADSR(t, dur, a = 0.01, d = 0.05, s = 0.6, r = 0.1) {
  if (t < a) return t / a;
  if (t < a + d) return 1 - (1 - s) * ((t - a) / d);
  if (t < dur - r) return s;
  return s * Math.max(0, (dur - t) / r);
}

// Generate a simple tone with advanced options
function generateToneDataUrl(frequency, duration, volume = 0.5, waveType = 'sine') {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const { buffer, view } = createWavBlob(numSamples);
  const oscFn = waveType === 'triangle' ? oscTriangle : waveType === 'sawtooth' ? oscSawtooth : waveType === 'square' ? oscSquare : oscSine;
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = envLinearDecay(t, duration) * volume;
    const phase = 2 * Math.PI * frequency * t;
    const sample = oscFn(phase) * env;
    view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, sample * 32767)), true);
  }
  return finalizeBlobUrl(buffer);
}

// Generate multi-tone WAV with per-note waveType + envelope options
// notes: [{frequency, startTime, duration, wave?, envelope?, freqEnd?}]
function generateMultiToneDataUrl(notes, volume = 0.5) {
  const totalDuration = Math.max(...notes.map(n => n.startTime + n.duration));
  const numSamples = Math.floor(SAMPLE_RATE * totalDuration);
  const { buffer, view } = createWavBlob(numSamples);
  const noteCount = notes.length || 1;
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let sample = 0;
    for (const note of notes) {
      if (t >= note.startTime && t < note.startTime + note.duration) {
        const localT = t - note.startTime;
        const progress = localT / note.duration;
        
        // Frequency sweep support
        const freq = note.freqEnd ? note.frequency + (note.freqEnd - note.frequency) * progress : note.frequency;
        
        // Envelope
        let env;
        if (note.envelope === 'percussive') env = envPercussive(localT, note.duration);
        else if (note.envelope === 'adsr') env = envADSR(localT, note.duration);
        else env = envLinearDecay(localT, note.duration);
        env *= (volume / Math.max(1, noteCount * 0.6));
        
        // Waveform
        const phase = 2 * Math.PI * freq * localT;
        const oscFn = note.wave === 'triangle' ? oscTriangle : note.wave === 'sawtooth' ? oscSawtooth : note.wave === 'square' ? oscSquare : oscSine;
        sample += oscFn(phase) * env;
      }
    }
    sample = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, sample * 32767)), true);
  }
  return finalizeBlobUrl(buffer);
}

// Generate white noise burst (for scratch/whoosh sounds)
function generateNoiseDataUrl(duration, volume = 0.5, filterFreq = 0) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const { buffer, view } = createWavBlob(numSamples);
  let lastSample = 0;
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = envPercussive(t, duration, 0.002) * volume;
    let sample = (Math.random() * 2 - 1) * env;
    // Simple low-pass filter if filterFreq > 0
    if (filterFreq > 0) {
      const rc = 1 / (2 * Math.PI * filterFreq);
      const dt = 1 / SAMPLE_RATE;
      const alpha = dt / (rc + dt);
      sample = lastSample + alpha * (sample - lastSample);
      lastSample = sample;
    }
    view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, sample * 32767)), true);
  }
  return finalizeBlobUrl(buffer);
}

// Generate frequency sweep (for card flip "fwip", whoosh effects)
function generateSweepDataUrl(freqStart, freqEnd, duration, volume = 0.5, waveType = 'sine') {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const { buffer, view } = createWavBlob(numSamples);
  const oscFn = waveType === 'triangle' ? oscTriangle : waveType === 'sawtooth' ? oscSawtooth : oscSine;
  let phase = 0;
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / duration;
    const freq = freqStart + (freqEnd - freqStart) * progress;
    const env = envPercussive(t, duration, 0.003) * volume;
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const sample = oscFn(phase) * env;
    view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, sample * 32767)), true);
  }
  return finalizeBlobUrl(buffer);
}

// Generate mixed tone + noise (for scratch, mechanical sounds)
function generateMixedDataUrl(toneFreq, toneWave, noiseMix, duration, volume = 0.5) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const { buffer, view } = createWavBlob(numSamples);
  const oscFn = toneWave === 'triangle' ? oscTriangle : toneWave === 'sawtooth' ? oscSawtooth : oscSine;
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = envPercussive(t, duration, 0.002) * volume;
    const tone = oscFn(2 * Math.PI * toneFreq * t) * (1 - noiseMix);
    const noise = (Math.random() * 2 - 1) * noiseMix;
    const sample = (tone + noise) * env;
    view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, sample * 32767)), true);
  }
  return finalizeBlobUrl(buffer);
}

// ── Sound Cache: every gamification element gets unique sounds ──

let soundCache = null;
function getSoundUrls(volume) {
  if (soundCache && soundCache._vol === volume) return soundCache;
  
  const v = volume;
  
  soundCache = {
    _vol: v,
    
    // ═══════════════════════════════════════════════════════
    // ANSWER FEEDBACK SOUNDS
    // ═══════════════════════════════════════════════════════
    
    // correct — cheerful "ding ding!" — 2 ascending bell-like tones
    correct: generateMultiToneDataUrl([
      { frequency: 880, startTime: 0, duration: 0.12, wave: 'sine', envelope: 'percussive' },
      { frequency: 1175, startTime: 0.07, duration: 0.15, wave: 'sine', envelope: 'percussive' },
      // Soft harmonic overtone for richness
      { frequency: 1760, startTime: 0, duration: 0.08, wave: 'sine', envelope: 'percussive' },
      { frequency: 2350, startTime: 0.07, duration: 0.1, wave: 'sine', envelope: 'percussive' },
    ], v),
    
    // incorrect — short grave buzzer "brrr"
    incorrect: generateMultiToneDataUrl([
      { frequency: 150, startTime: 0, duration: 0.25, wave: 'triangle', envelope: 'percussive' },
      { frequency: 120, startTime: 0.05, duration: 0.2, wave: 'sawtooth', envelope: 'percussive' },
      { frequency: 90, startTime: 0.1, duration: 0.18, wave: 'triangle', envelope: 'percussive' },
    ], v * 0.7),
    
    // streak — video game power-up: 3 ascending bright notes
    streak: generateMultiToneDataUrl([
      { frequency: 784, startTime: 0, duration: 0.1, wave: 'square', envelope: 'percussive' },    // G5
      { frequency: 988, startTime: 0.08, duration: 0.1, wave: 'square', envelope: 'percussive' },  // B5
      { frequency: 1319, startTime: 0.16, duration: 0.18, wave: 'square', envelope: 'percussive' }, // E6
      // Harmonics
      { frequency: 1568, startTime: 0, duration: 0.06, wave: 'sine', envelope: 'percussive' },
      { frequency: 1976, startTime: 0.08, duration: 0.06, wave: 'sine', envelope: 'percussive' },
      { frequency: 2637, startTime: 0.16, duration: 0.1, wave: 'sine', envelope: 'percussive' },
    ], v * 0.7),
    
    // pop — tiny bubble burst (60ms)
    pop: generateMultiToneDataUrl([
      { frequency: 1800, startTime: 0, duration: 0.03, wave: 'sine', envelope: 'percussive', freqEnd: 800 },
      { frequency: 2400, startTime: 0, duration: 0.02, wave: 'sine', envelope: 'percussive', freqEnd: 1000 },
    ], v * 0.4),
    
    // ═══════════════════════════════════════════════════════
    // SPIN WHEEL SOUNDS
    // ═══════════════════════════════════════════════════════
    
    // spinTick — very short dry tick (~30ms), like wheel pointer clicking
    spinTick: generateMultiToneDataUrl([
      { frequency: 2200, startTime: 0, duration: 0.025, wave: 'sine', envelope: 'percussive' },
      { frequency: 1100, startTime: 0.005, duration: 0.02, wave: 'triangle', envelope: 'percussive' },
    ], v * 0.35),
    
    // spinSlow — deeper, slower tick as wheel decelerates
    spinSlow: generateMultiToneDataUrl([
      { frequency: 1200, startTime: 0, duration: 0.06, wave: 'sine', envelope: 'percussive' },
      { frequency: 600, startTime: 0.01, duration: 0.05, wave: 'triangle', envelope: 'percussive' },
    ], v * 0.45),
    
    // spinWin — jackpot fanfare: 5 ascending notes with bright timbre (different from correct!)
    spinWin: generateMultiToneDataUrl([
      { frequency: 523, startTime: 0, duration: 0.15, wave: 'sawtooth', envelope: 'percussive' },     // C5
      { frequency: 659, startTime: 0.1, duration: 0.15, wave: 'sawtooth', envelope: 'percussive' },    // E5
      { frequency: 784, startTime: 0.2, duration: 0.15, wave: 'sawtooth', envelope: 'percussive' },    // G5
      { frequency: 1047, startTime: 0.3, duration: 0.15, wave: 'sawtooth', envelope: 'percussive' },   // C6
      { frequency: 1319, startTime: 0.4, duration: 0.3, wave: 'sawtooth', envelope: 'percussive' },    // E6
      // Chord bloom at end
      { frequency: 1047, startTime: 0.4, duration: 0.3, wave: 'sine', envelope: 'adsr' },
      { frequency: 784, startTime: 0.4, duration: 0.3, wave: 'sine', envelope: 'adsr' },
    ], v),
    
    // ═══════════════════════════════════════════════════════
    // SCRATCH CARD SOUNDS
    // ═══════════════════════════════════════════════════════
    
    // scratchLoop — scratchy noise + high tone (100ms), meant to repeat
    scratchLoop: generateMixedDataUrl(3200, 'sawtooth', 0.7, 0.08, v * 0.2),
    
    // scratchReveal — "ta-da!" rich chord, like opening a gift
    scratchReveal: generateMultiToneDataUrl([
      // Grace note
      { frequency: 392, startTime: 0, duration: 0.06, wave: 'sine', envelope: 'percussive' },
      // Main chord (C major + sparkle)
      { frequency: 523, startTime: 0.06, duration: 0.4, wave: 'sine', envelope: 'adsr' },    // C5
      { frequency: 659, startTime: 0.06, duration: 0.4, wave: 'sine', envelope: 'adsr' },    // E5
      { frequency: 784, startTime: 0.06, duration: 0.4, wave: 'sine', envelope: 'adsr' },    // G5
      // High sparkle
      { frequency: 1568, startTime: 0.1, duration: 0.25, wave: 'sine', envelope: 'percussive' },
      { frequency: 2093, startTime: 0.15, duration: 0.2, wave: 'sine', envelope: 'percussive' },
    ], v),
    
    // ═══════════════════════════════════════════════════════
    // MYSTERY BOX SOUNDS
    // ═══════════════════════════════════════════════════════
    
    // boxShake — rattle effect: rapid alternating high/low tones
    boxShake: generateMultiToneDataUrl([
      { frequency: 600, startTime: 0, duration: 0.06, wave: 'triangle', envelope: 'percussive' },
      { frequency: 1200, startTime: 0.07, duration: 0.06, wave: 'triangle', envelope: 'percussive' },
      { frequency: 500, startTime: 0.14, duration: 0.06, wave: 'triangle', envelope: 'percussive' },
      { frequency: 1100, startTime: 0.21, duration: 0.06, wave: 'triangle', envelope: 'percussive' },
      { frequency: 550, startTime: 0.28, duration: 0.06, wave: 'triangle', envelope: 'percussive' },
      { frequency: 1300, startTime: 0.35, duration: 0.08, wave: 'triangle', envelope: 'percussive' },
      // Noise rattle layer
      { frequency: 2000, startTime: 0, duration: 0.04, wave: 'sawtooth', envelope: 'percussive' },
      { frequency: 2500, startTime: 0.07, duration: 0.04, wave: 'sawtooth', envelope: 'percussive' },
      { frequency: 1800, startTime: 0.14, duration: 0.04, wave: 'sawtooth', envelope: 'percussive' },
      { frequency: 2200, startTime: 0.21, duration: 0.04, wave: 'sawtooth', envelope: 'percussive' },
    ], v * 0.6),
    
    // boxOpen — whoosh sweep + magical chord (RPG treasure chest)
    boxOpen: (() => {
      // We'll combine a sweep and a chord manually
      const dur = 0.8;
      const numSamples = Math.floor(SAMPLE_RATE * dur);
      const { buffer, view } = createWavBlob(numSamples);
      
      for (let i = 0; i < numSamples; i++) {
        const t = i / SAMPLE_RATE;
        let sample = 0;
        
        // Whoosh: noise sweep (first 0.3s)
        if (t < 0.3) {
          const whooshEnv = envPercussive(t, 0.3, 0.01) * 0.3;
          sample += (Math.random() * 2 - 1) * whooshEnv;
          // Rising sweep tone
          const sweepFreq = 200 + (1200 * (t / 0.3));
          sample += oscSine(2 * Math.PI * sweepFreq * t) * whooshEnv * 0.5;
        }
        
        // Magical chord (starts at 0.15s)
        if (t >= 0.15) {
          const lt = t - 0.15;
          const chordEnv = envADSR(lt, 0.65, 0.02, 0.08, 0.7, 0.3) * 0.25;
          // E major chord with shimmer
          sample += oscSine(2 * Math.PI * 659 * lt) * chordEnv;  // E5
          sample += oscSine(2 * Math.PI * 831 * lt) * chordEnv;  // G#5
          sample += oscSine(2 * Math.PI * 988 * lt) * chordEnv;  // B5
          // Sparkle overtone
          sample += oscSine(2 * Math.PI * 1319 * lt) * chordEnv * 0.4 * Math.sin(lt * 20);
          sample += oscSine(2 * Math.PI * 1976 * lt) * chordEnv * 0.2;
        }
        
        sample = Math.max(-1, Math.min(1, sample * v));
        view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, sample * 32767)), true);
      }
      return finalizeBlobUrl(buffer);
    })(),
    
    // ═══════════════════════════════════════════════════════
    // CARD FLIP SOUNDS
    // ═══════════════════════════════════════════════════════
    
    // cardFlip — "fwip" — fast descending frequency sweep (100ms)
    cardFlip: generateSweepDataUrl(3000, 300, 0.1, v * 0.4, 'sawtooth'),
    
    // cardReveal — soft revelation chord: "aaah!" 3 notes in harmony
    cardReveal: generateMultiToneDataUrl([
      { frequency: 440, startTime: 0, duration: 0.5, wave: 'sine', envelope: 'adsr' },     // A4
      { frequency: 554, startTime: 0.03, duration: 0.47, wave: 'sine', envelope: 'adsr' },  // C#5
      { frequency: 659, startTime: 0.06, duration: 0.44, wave: 'sine', envelope: 'adsr' },  // E5
      // Gentle shimmer
      { frequency: 880, startTime: 0.1, duration: 0.3, wave: 'sine', envelope: 'percussive' },
    ], v * 0.7),
    
    // ═══════════════════════════════════════════════════════
    // SLOT MACHINE SOUNDS
    // ═══════════════════════════════════════════════════════
    
    // slotSpin — fast mechanical tick-tock-tick
    slotSpin: generateMultiToneDataUrl([
      { frequency: 1600, startTime: 0, duration: 0.025, wave: 'square', envelope: 'percussive' },
      { frequency: 1000, startTime: 0.04, duration: 0.025, wave: 'square', envelope: 'percussive' },
      { frequency: 1600, startTime: 0.08, duration: 0.025, wave: 'square', envelope: 'percussive' },
      { frequency: 1000, startTime: 0.12, duration: 0.025, wave: 'square', envelope: 'percussive' },
      { frequency: 1600, startTime: 0.16, duration: 0.025, wave: 'square', envelope: 'percussive' },
    ], v * 0.3),
    
    // slotStop — heavy "clunk" + tone (reel stopping)
    slotStop: generateMultiToneDataUrl([
      // Impact thud
      { frequency: 80, startTime: 0, duration: 0.12, wave: 'triangle', envelope: 'percussive' },
      { frequency: 120, startTime: 0, duration: 0.08, wave: 'square', envelope: 'percussive' },
      // Metallic ring after impact
      { frequency: 800, startTime: 0.03, duration: 0.15, wave: 'sine', envelope: 'percussive' },
      { frequency: 1200, startTime: 0.03, duration: 0.1, wave: 'sine', envelope: 'percussive' },
    ], v * 0.6),
    
    // slotJackpot — full casino victory fanfare: 6 ascending bright notes
    slotJackpot: generateMultiToneDataUrl([
      { frequency: 523, startTime: 0, duration: 0.12, wave: 'sawtooth', envelope: 'percussive' },      // C5
      { frequency: 659, startTime: 0.08, duration: 0.12, wave: 'sawtooth', envelope: 'percussive' },    // E5
      { frequency: 784, startTime: 0.16, duration: 0.12, wave: 'sawtooth', envelope: 'percussive' },    // G5
      { frequency: 1047, startTime: 0.24, duration: 0.12, wave: 'sawtooth', envelope: 'percussive' },   // C6
      { frequency: 1319, startTime: 0.32, duration: 0.12, wave: 'sawtooth', envelope: 'percussive' },   // E6
      { frequency: 1568, startTime: 0.40, duration: 0.35, wave: 'sawtooth', envelope: 'percussive' },   // G6
      // Full chord bloom at the end
      { frequency: 1047, startTime: 0.40, duration: 0.4, wave: 'sine', envelope: 'adsr' },
      { frequency: 1319, startTime: 0.40, duration: 0.4, wave: 'sine', envelope: 'adsr' },
      { frequency: 1568, startTime: 0.40, duration: 0.4, wave: 'sine', envelope: 'adsr' },
      // Sparkle top
      { frequency: 2093, startTime: 0.45, duration: 0.3, wave: 'sine', envelope: 'percussive' },
      { frequency: 2637, startTime: 0.50, duration: 0.25, wave: 'sine', envelope: 'percussive' },
    ], v * 0.8),
    
    // slotLose — "wah wah wah" descending trombone effect
    slotLose: generateMultiToneDataUrl([
      { frequency: 440, startTime: 0, duration: 0.25, wave: 'triangle', envelope: 'adsr', freqEnd: 415 },
      { frequency: 370, startTime: 0.25, duration: 0.25, wave: 'triangle', envelope: 'adsr', freqEnd: 349 },
      { frequency: 311, startTime: 0.5, duration: 0.4, wave: 'triangle', envelope: 'adsr', freqEnd: 262 },
    ], v * 0.6),
    
    // ═══════════════════════════════════════════════════════
    // GENERAL / LEGACY SOUNDS
    // ═══════════════════════════════════════════════════════
    
    // timer — urgent beep (kept simple)
    timer: generateToneDataUrl(1200, 0.1, v * 0.7),
    
    // complete — elaborate final fanfare: 6 notes ascending to triumphant chord
    complete: generateMultiToneDataUrl([
      { frequency: 523, startTime: 0, duration: 0.15, wave: 'sine', envelope: 'percussive' },       // C5
      { frequency: 587, startTime: 0.08, duration: 0.15, wave: 'sine', envelope: 'percussive' },    // D5
      { frequency: 659, startTime: 0.16, duration: 0.15, wave: 'sine', envelope: 'percussive' },    // E5
      { frequency: 784, startTime: 0.24, duration: 0.15, wave: 'sine', envelope: 'percussive' },    // G5
      { frequency: 1047, startTime: 0.32, duration: 0.15, wave: 'sine', envelope: 'percussive' },   // C6
      { frequency: 1319, startTime: 0.40, duration: 0.15, wave: 'sine', envelope: 'percussive' },   // E6
      // Final sustained chord
      { frequency: 1047, startTime: 0.48, duration: 0.5, wave: 'sine', envelope: 'adsr' },
      { frequency: 1319, startTime: 0.48, duration: 0.5, wave: 'sine', envelope: 'adsr' },
      { frequency: 1568, startTime: 0.48, duration: 0.5, wave: 'sine', envelope: 'adsr' },
    ], v),
    
    // submit — cheerful confirmation for open-ended/rating answers (no right/wrong)
    submit: generateMultiToneDataUrl([
      { frequency: 880, startTime: 0, duration: 0.08, wave: 'sine', envelope: 'percussive' },
      { frequency: 1175, startTime: 0.06, duration: 0.12, wave: 'sine', envelope: 'percussive' },
    ], v * 0.5),
    
    // navigate — soft "whoosh" for Continue/Next buttons
    navigate: generateSweepDataUrl(400, 1200, 0.12, v * 0.3, 'sine'),
    
    // Legacy aliases — keep backward compat with page.jsx calls
    spin: generateMultiToneDataUrl([
      { frequency: 400, startTime: 0, duration: 0.1, wave: 'sine', envelope: 'percussive' },
      { frequency: 500, startTime: 0.06, duration: 0.1, wave: 'sine', envelope: 'percussive' },
      { frequency: 600, startTime: 0.12, duration: 0.1, wave: 'sine', envelope: 'percussive' },
      { frequency: 750, startTime: 0.18, duration: 0.1, wave: 'sine', envelope: 'percussive' },
      { frequency: 900, startTime: 0.24, duration: 0.12, wave: 'sine', envelope: 'percussive' },
    ], v),
    reveal: generateMultiToneDataUrl([
      { frequency: 523, startTime: 0, duration: 0.35, wave: 'sine', envelope: 'adsr' },
      { frequency: 659, startTime: 0.08, duration: 0.35, wave: 'sine', envelope: 'adsr' },
      { frequency: 784, startTime: 0.16, duration: 0.35, wave: 'sine', envelope: 'adsr' },
    ], v),
    win: generateMultiToneDataUrl([
      { frequency: 523, startTime: 0, duration: 0.3, wave: 'sine', envelope: 'percussive' },
      { frequency: 659, startTime: 0.12, duration: 0.3, wave: 'sine', envelope: 'percussive' },
      { frequency: 784, startTime: 0.24, duration: 0.3, wave: 'sine', envelope: 'percussive' },
      { frequency: 1047, startTime: 0.36, duration: 0.4, wave: 'sine', envelope: 'percussive' },
    ], v),
  };
  return soundCache;
}

// Unlock audio on iOS/mobile: play a silent buffer via <audio> on first interaction
let audioUnlocked = false;
if (typeof window !== 'undefined') {
  const unlock = () => {
    if (audioUnlocked) return;
    try {
      const silentWav = generateToneDataUrl(1, 0.01, 0);
      const audio = new Audio(silentWav);
      audio.volume = 0.01;
      audio.play().then(() => {
        audioUnlocked = true;
        audio.pause();
        URL.revokeObjectURL(silentWav);
      }).catch(() => {});
    } catch (_e) { /* ignore */ }
  };
  ['click', 'touchstart', 'touchend', 'keydown'].forEach(event => {
    document.addEventListener(event, unlock, { once: false, passive: true, capture: true });
  });
}

export function SoundSystem({ level = 'medium' }) {
  const volumes = {
    subtle: 0.3,
    medium: 0.6,
    high: 0.9,
  };

  const baseVolume = volumes[level] || 0.6;

  const playSound = useCallback((type) => {
    try {
      if (typeof window === 'undefined') return;
      
      const urls = getSoundUrls(baseVolume);
      const url = urls[type] || urls.correct;
      
      const audio = new Audio(url);
      audio.volume = Math.min(1, baseVolume);
      audio.play().catch((err) => {
        console.debug('Sound play failed:', err.message);
      });
    } catch (error) {
      console.debug('Sound playback failed:', error);
    }
  }, [baseVolume]);

  return { playSound };
}

// ── Share Challenge Button ────────────────────────────────────────

export function ShareChallengeButton({ 
  text, 
  score, 
  quizUrl, 
  primaryColor = '#7c3aed' 
}) {
  const handleShare = async () => {
    const shareText = text.replace('{{score}}', score);
    const fullText = `${shareText}\n\n${quizUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Desafio de Quiz',
          text: shareText,
          url: quizUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.debug('Share cancelled:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(fullText);
        alert('Link copiado! Cole em suas redes sociais.');
      } catch (err) {
        // Fallback to prompt
        prompt('Copie o link:', fullText);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-6 py-3 text-white font-medium rounded-lg transition-all hover:scale-105 hover:shadow-lg"
      style={{ backgroundColor: primaryColor }}
    >
      <span>⚔️</span>
      Desafie um Amigo
    </button>
  );
}