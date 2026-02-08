'use client';

import { useState, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';

// ── Pattern SVGs for card back ─────────────────────────────────
function PatternSvg({ pattern, color }) {
  const patternColor = color || '#7c3aed';
  const lighterColor = patternColor + '40'; // 25% opacity
  
  if (pattern === 'dots') {
    return (
      <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="3" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots-pattern)" />
      </svg>
    );
  }
  
  if (pattern === 'stripes') {
    return (
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="stripes-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="10" stroke="white" strokeWidth="4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#stripes-pattern)" />
      </svg>
    );
  }
  
  // Default: geometric
  return (
    <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="geo-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 20 L20 0 L40 20 L20 40 Z" fill="none" stroke="white" strokeWidth="1" />
          <circle cx="20" cy="20" r="5" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#geo-pattern)" />
    </svg>
  );
}

// ── Card Flip Screen Component ─────────────────────────────────
export default function CardFlipScreen({ element, theme, onComplete, onSound }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);

  const title = element.title || 'Toque para virar';
  const revealText = element.revealText || 'Parabéns! Você revelou o segredo.';
  const frontColor = element.frontColor || '#ffffff';
  const backColor = element.backColor || theme?.primaryColor || '#7c3aed';
  const backPattern = element.backPattern || 'geometric';
  const autoAdvance = element.autoAdvance !== false;

  // Delay before auto-advance (in seconds), default 3
  const delayBeforeAdvance = element.delayBeforeAdvance ?? 3;

  const handleFlip = useCallback(() => {
    if (!isFlipped) {
      setIsFlipped(true);
      setHasRevealed(true);
      // Play card flip "fwip" sound immediately
      onSound?.('cardFlip');
      // Play reveal chord after the flip animation completes
      setTimeout(() => {
        onSound?.('cardReveal');
      }, 400);
      
      if (autoAdvance) {
        // Wait for flip animation + configurable reading time, then advance
        // Add 500ms for flip animation + user-defined delay
        setTimeout(() => {
          onComplete?.();
        }, 500 + (delayBeforeAdvance * 1000));
      }
    }
  }, [isFlipped, autoAdvance, onComplete, delayBeforeAdvance, onSound]);

  const handleContinue = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Instructions */}
      <p className="text-gray-500 text-sm mb-4 animate-pulse">
        👆 Toque na carta para revelar
      </p>

      {/* Card Container with 3D perspective */}
      <div 
        className="relative cursor-pointer select-none"
        style={{
          width: '280px',
          height: '380px',
          perspective: '1000px',
        }}
        onClick={handleFlip}
      >
        {/* Card Inner - handles the flip */}
        <div
          className="relative w-full h-full transition-transform duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front Face (initially visible - the "back" of the card visually) */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden flex flex-col items-center justify-center"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              backgroundColor: backColor,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 8px 20px rgba(0,0,0,0.2)',
            }}
          >
            {/* Pattern overlay */}
            <PatternSvg pattern={backPattern} color={backColor} />
            
            {/* Content */}
            <div className="relative z-10 text-center px-6">
              <div 
                className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4"
                style={{ animation: 'pulse 2s infinite' }}
              >
                <RotateCcw size={32} className="text-white" />
              </div>
              <p className="text-white text-xl font-bold mb-2">{title}</p>
              <p className="text-white/70 text-sm">Toque para virar</p>
            </div>

            {/* Shine effect */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, transparent 100%)',
              }}
            />
          </div>

          {/* Back Face (revealed content - the "front" of the card visually) */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden flex flex-col items-center justify-center p-8"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              backgroundColor: frontColor,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 8px 20px rgba(0,0,0,0.2)',
              border: `3px solid ${backColor}`,
            }}
          >
            {/* Revealed content */}
            <div className="text-center">
              {/* Celebration icon */}
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ 
                  backgroundColor: backColor + '20',
                  border: `2px solid ${backColor}`,
                }}
              >
                <span className="text-4xl">🎉</span>
              </div>
              
              {/* Reveal text */}
              <p 
                className="text-lg font-semibold leading-relaxed"
                style={{ color: backColor }}
              >
                {revealText}
              </p>
            </div>

            {/* Decorative corner elements */}
            <div 
              className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 rounded-tl-lg"
              style={{ borderColor: backColor + '40' }}
            />
            <div 
              className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 rounded-tr-lg"
              style={{ borderColor: backColor + '40' }}
            />
            <div 
              className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 rounded-bl-lg"
              style={{ borderColor: backColor + '40' }}
            />
            <div 
              className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 rounded-br-lg"
              style={{ borderColor: backColor + '40' }}
            />
          </div>
        </div>
      </div>

      {/* Manual continue button (if auto-advance is off) */}
      {!autoAdvance && hasRevealed && (
        <button
          onClick={handleContinue}
          className="mt-8 px-8 py-3 rounded-full text-white font-semibold transition-all hover:scale-105 active:scale-95"
          style={{
            background: `linear-gradient(180deg, ${theme?.primaryColor || backColor} 0%, ${theme?.secondaryColor || backColor} 100%)`,
            boxShadow: `0 4px 20px ${(theme?.primaryColor || backColor)}40`,
          }}
        >
          Continuar
        </button>
      )}

      {/* CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
