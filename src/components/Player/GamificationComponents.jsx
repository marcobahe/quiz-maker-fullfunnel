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

// ── Sound System ──────────────────────────────────────────────────

// Generate a WAV data URL from oscillator parameters (works offline, no files needed)
function generateToneDataUrl(frequency, duration, volume = 0.5, waveType = 'sine') {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);
  
  // Generate samples
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.max(0, 1 - t / duration) * volume;
    let sample;
    if (waveType === 'triangle') {
      sample = (2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1) * envelope;
    } else {
      sample = Math.sin(2 * Math.PI * frequency * t) * envelope;
    }
    view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, sample * 32767)), true);
  }
  
  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

// Generate a multi-tone WAV (chord/sequence)
function generateMultiToneDataUrl(notes, volume = 0.5) {
  // notes: [{frequency, startTime, duration}]
  const sampleRate = 22050;
  const totalDuration = Math.max(...notes.map(n => n.startTime + n.duration));
  const numSamples = Math.floor(sampleRate * totalDuration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  
  const writeString = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    for (const note of notes) {
      if (t >= note.startTime && t < note.startTime + note.duration) {
        const localT = t - note.startTime;
        const envelope = Math.max(0, 1 - localT / note.duration) * (volume / notes.length);
        sample += Math.sin(2 * Math.PI * note.frequency * localT) * envelope;
      }
    }
    sample = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, sample * 32767)), true);
  }
  
  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

// Pre-generate all sound data URLs (lazy, cached)
let soundCache = null;
function getSoundUrls(volume) {
  if (soundCache && soundCache._vol === volume) return soundCache;
  
  soundCache = {
    _vol: volume,
    correct: generateMultiToneDataUrl([
      { frequency: 600, startTime: 0, duration: 0.12 },
      { frequency: 800, startTime: 0.08, duration: 0.15 },
    ], volume),
    incorrect: generateToneDataUrl(300, 0.3, volume, 'triangle'),
    streak: generateMultiToneDataUrl([
      { frequency: 800, startTime: 0, duration: 0.1 },
      { frequency: 1000, startTime: 0.06, duration: 0.1 },
      { frequency: 1200, startTime: 0.12, duration: 0.12 },
    ], volume),
    complete: generateMultiToneDataUrl([
      { frequency: 523, startTime: 0, duration: 0.4 },
      { frequency: 659, startTime: 0.1, duration: 0.35 },
      { frequency: 784, startTime: 0.2, duration: 0.3 },
      { frequency: 1047, startTime: 0.3, duration: 0.35 },
    ], volume),
    timer: generateToneDataUrl(1200, 0.1, volume * 0.7),
    spin: generateMultiToneDataUrl([
      { frequency: 400, startTime: 0, duration: 0.1 },
      { frequency: 500, startTime: 0.06, duration: 0.1 },
      { frequency: 600, startTime: 0.12, duration: 0.1 },
      { frequency: 750, startTime: 0.18, duration: 0.1 },
      { frequency: 900, startTime: 0.24, duration: 0.12 },
    ], volume),
    reveal: generateMultiToneDataUrl([
      { frequency: 523, startTime: 0, duration: 0.35 },
      { frequency: 659, startTime: 0.08, duration: 0.35 },
      { frequency: 784, startTime: 0.16, duration: 0.35 },
    ], volume),
    win: generateMultiToneDataUrl([
      { frequency: 523, startTime: 0, duration: 0.3 },
      { frequency: 659, startTime: 0.12, duration: 0.3 },
      { frequency: 784, startTime: 0.24, duration: 0.3 },
      { frequency: 1047, startTime: 0.36, duration: 0.4 },
    ], volume),
  };
  return soundCache;
}

// Unlock audio on iOS/mobile: play a silent buffer via <audio> on first interaction
let audioUnlocked = false;
if (typeof window !== 'undefined') {
  const unlock = () => {
    if (audioUnlocked) return;
    // Create a tiny silent WAV and play it — this unlocks Audio on iOS
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