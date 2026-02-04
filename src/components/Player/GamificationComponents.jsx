'use client';

import { useState, useEffect, useCallback } from 'react';
import { Timer, Heart, Star, Zap, Trophy, Flame } from 'lucide-react';

// ── Progress Bar Gamificada ───────────────────────────────────────

export function GamifiedProgressBar({ current, total, style = 'simple', primaryColor = '#7c3aed' }) {
  const progress = Math.min(100, (current / Math.max(1, total)) * 100);

  if (style === 'milestones') {
    const milestones = Array.from({ length: Math.min(10, total) }, (_, i) => i + 1);
    
    return (
      <div className="flex items-center gap-2 w-full px-4">
        {milestones.map((milestone) => {
          const isActive = current >= milestone;
          const isCurrent = current === milestone;
          return (
            <div
              key={milestone}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isActive
                  ? 'text-white shadow-lg scale-110'
                  : 'bg-gray-200 text-gray-400'
              } ${isCurrent ? 'animate-pulse' : ''}`}
              style={isActive ? { backgroundColor: primaryColor } : {}}
            >
              {milestone}
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
      <div className="flex items-center gap-3 w-full px-4">
        <div className="flex items-center gap-2">
          <Trophy size={20} style={{ color: primaryColor }} />
          <span className="font-bold text-lg" style={{ color: primaryColor }}>
            Nível {level}
          </span>
        </div>
        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-purple-500"
            style={{ width: `${(xpInLevel / xpToNext) * 100}%` }}
          />
        </div>
        <span className="text-sm text-gray-600">
          {xpInLevel}/{xpToNext} XP
        </span>
      </div>
    );
  }

  // Simple (default)
  return (
    <div className="w-full px-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">
          Progresso
        </span>
        <span className="text-sm font-medium text-gray-700">
          {current}/{total}
        </span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${progress}%`,
            backgroundColor: primaryColor,
            boxShadow: progress > 0 ? `0 0 10px ${primaryColor}40` : 'none'
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
      default: return <Fire size={20} className="text-orange-400" />;
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

export function SoundSystem({ level = 'medium' }) {
  const volumes = {
    subtle: 0.3,
    medium: 0.6,
    high: 0.9,
  };

  const baseVolume = volumes[level] || 0.6;

  const playSound = useCallback((type) => {
    try {
      // Generate simple tones using Web Audio API
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      // Different sounds for different events
      const sounds = {
        correct: { frequency: 800, duration: 0.2 },
        incorrect: { frequency: 300, duration: 0.3 },
        streak: { frequency: 1000, duration: 0.15 },
        complete: { frequency: 600, duration: 0.5 },
        timer: { frequency: 1200, duration: 0.1 },
      };

      const sound = sounds[type] || sounds.correct;
      
      oscillator.frequency.setValueAtTime(sound.frequency, context.currentTime);
      oscillator.type = type === 'incorrect' ? 'triangle' : 'sine';
      
      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(baseVolume, context.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + sound.duration);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + sound.duration);

    } catch (error) {
      // Silent fail if Web Audio API is not supported
      console.debug('Sound playback failed:', error);
    }
  }, [baseVolume]);

  // Return the play function to be used by parent components
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