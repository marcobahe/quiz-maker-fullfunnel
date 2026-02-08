'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * Interactive Mystery Box component for the Quiz Player.
 * Premium 3D design with shake animation, golden glow, and sparkle effects.
 * 
 * Design System v2.0 - QuizMeBaby
 */

export default function MysteryBox({ element, theme, btnRadius, onComplete, onSound }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [sparkles, setSparkles] = useState([]);

  const bgColor = element.bgColor || 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)';
  const boxColor = element.boxColor || theme?.primaryColor || '#6366f1';

  // Generate sparkles on hover
  useEffect(() => {
    if (!isRevealed && !isOpening) {
      const interval = setInterval(() => {
        setSparkles(prev => {
          const newSparkle = {
            id: Date.now(),
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 4 + Math.random() * 8,
            duration: 1 + Math.random() * 1.5,
          };
          const filtered = prev.filter(s => Date.now() - s.id < 2000);
          return [...filtered, newSparkle].slice(-10);
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isRevealed, isOpening]);

  const handleClick = useCallback(() => {
    if (isRevealed || isOpening) return;

    // Start shake animation with rattle sound
    setIsShaking(true);
    onSound?.('boxShake');
    
    // After shake, start opening
    setTimeout(() => {
      setIsShaking(false);
      setIsOpening(true);
      
      // Reveal after opening animation with magical open sound
      setTimeout(() => {
        setIsRevealed(true);
        setIsOpening(false);
        onSound?.('boxOpen');
        
        // Auto-advance after reveal
        setTimeout(() => {
          onComplete?.();
        }, 2500);
      }, 1000);
    }, 1200);
  }, [isRevealed, isOpening, onComplete, onSound]);

  return (
    <div className="mb-6">
      {/* Title with icon */}
      <div className="flex items-center gap-4 mb-6">
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ 
            background: `linear-gradient(135deg, ${boxColor}, ${darkenColor(boxColor, 15)})`,
            boxShadow: `0 8px 24px ${boxColor}40`,
          }}
        >
          <span className="text-2xl">📦</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 font-display">
            {element.title || 'Abra a caixa misteriosa!'}
          </h3>
          <p className="text-sm text-gray-500">Toque para descobrir sua surpresa</p>
        </div>
      </div>

      {/* Mystery Box Container */}
      <div
        className="relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300"
        style={{ 
          background: bgColor,
          minHeight: '320px',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.4)',
        }}
        onClick={handleClick}
      >
        {/* Animated stars background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              <span 
                className="text-yellow-300 opacity-60"
                style={{ fontSize: `${8 + Math.random() * 12}px` }}
              >
                ✨
              </span>
            </div>
          ))}
        </div>

        {/* Floating icons */}
        <div className="absolute top-6 left-6 animate-float opacity-70">
          <span className="text-5xl">🚀</span>
        </div>
        <div className="absolute top-12 right-8 animate-float opacity-60" style={{ animationDelay: '1s' }}>
          <span className="text-4xl">⭐</span>
        </div>
        <div className="absolute bottom-16 left-8 animate-float opacity-50" style={{ animationDelay: '0.5s' }}>
          <span className="text-4xl">🌟</span>
        </div>
        <div className="absolute bottom-20 right-10 animate-float opacity-40" style={{ animationDelay: '1.5s' }}>
          <span className="text-3xl">💫</span>
        </div>

        {/* Content */}
        <div className="relative flex flex-col items-center justify-center min-h-[280px] p-8 z-10">
          {!isRevealed ? (
            <>
              {/* Mystery Box 3D */}
              <div
                className={`relative transition-all duration-500 ${isShaking ? 'animate-shake' : ''}`}
                style={{
                  transform: isOpening ? 'scale(1.3) rotateY(360deg)' : 'scale(1)',
                  opacity: isOpening ? 0 : 1,
                }}
              >
                {/* Golden glow effect */}
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `radial-gradient(circle, ${lightenColor(boxColor, 30)}60 0%, transparent 70%)`,
                    transform: 'scale(2)',
                    animation: isShaking ? 'glow-pulse 0.5s ease-in-out infinite' : 'glow-pulse 2s ease-in-out infinite',
                  }}
                />

                {/* Box Body */}
                <div
                  className="w-28 h-28 rounded-2xl relative overflow-hidden"
                  style={{
                    background: `linear-gradient(145deg, ${lightenColor(boxColor, 15)}, ${boxColor}, ${darkenColor(boxColor, 20)})`,
                    transform: 'perspective(400px) rotateX(10deg)',
                    boxShadow: `
                      0 25px 50px ${boxColor}50,
                      inset 0 -8px 20px rgba(0,0,0,0.3),
                      inset 0 8px 20px rgba(255,255,255,0.2)
                    `,
                  }}
                >
                  {/* Ribbon vertical */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 w-5 h-full"
                    style={{ 
                      background: 'linear-gradient(180deg, #fcd34d 0%, #f59e0b 50%, #d97706 100%)',
                      boxShadow: 'inset 0 0 8px rgba(0,0,0,0.2)',
                    }}
                  />
                  {/* Ribbon horizontal */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-full h-5"
                    style={{ 
                      background: 'linear-gradient(90deg, #fcd34d 0%, #f59e0b 50%, #d97706 100%)',
                      boxShadow: 'inset 0 0 8px rgba(0,0,0,0.2)',
                    }}
                  />
                  {/* Bow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="text-3xl drop-shadow-lg">🎀</span>
                  </div>

                  {/* Shine effect */}
                  <div
                    className="absolute top-3 left-3 w-4 h-8 bg-white/40 rounded-full blur-sm"
                    style={{ transform: 'rotate(-45deg)' }}
                  />

                  {/* Question marks floating */}
                  <div 
                    className="absolute -top-3 -right-3 text-white text-2xl font-bold"
                    style={{ animation: 'bounce-soft 1.5s ease-in-out infinite' }}
                  >
                    ?
                  </div>
                  <div 
                    className="absolute -bottom-2 -left-2 text-white text-xl font-bold opacity-70"
                    style={{ animation: 'bounce-soft 1.5s ease-in-out infinite', animationDelay: '0.3s' }}
                  >
                    ?
                  </div>
                </div>

                {/* Sparkles */}
                {sparkles.map(sparkle => (
                  <div
                    key={sparkle.id}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${sparkle.x}%`,
                      top: `${sparkle.y}%`,
                      width: sparkle.size,
                      height: sparkle.size,
                      background: '#fcd34d',
                      borderRadius: '50%',
                      animation: `sparkle ${sparkle.duration}s ease-out forwards`,
                      boxShadow: `0 0 ${sparkle.size * 2}px #fcd34d`,
                    }}
                  />
                ))}
              </div>

              {/* Opening animation */}
              {isOpening && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl" style={{ animation: 'scaleIn 0.6s ease-out' }}>
                    ✨🎁✨
                  </div>
                </div>
              )}

              {/* Instruction text */}
              <p className="text-white/80 text-base mt-8 font-medium text-center">
                {isShaking ? (
                  <span className="animate-pulse">✨ Abrindo sua surpresa...</span>
                ) : isOpening ? (
                  <span>🎉 Revelando!</span>
                ) : (
                  <span>👆 Toque na caixa para abrir</span>
                )}
              </p>
            </>
          ) : (
            /* Revealed content */
            <div className="text-center" style={{ animation: 'scaleIn 0.5s ease-out' }}>
              {/* Celebration */}
              <div className="text-5xl mb-4" style={{ animation: 'float 2s ease-in-out infinite' }}>
                ✨🎉✨
              </div>
              
              {/* Revealed card */}
              <div
                className="bg-white/95 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-2xl"
                style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ 
                    background: `linear-gradient(135deg, ${boxColor}, ${darkenColor(boxColor, 15)})`,
                    boxShadow: `0 4px 12px ${boxColor}40`,
                  }}
                >
                  <span className="text-2xl">🎁</span>
                </div>
                <p className="text-xl font-bold text-gray-900 leading-relaxed font-display">
                  {element.revealText || 'Parabéns! Você ganhou! 🎊'}
                </p>
              </div>
              
              {/* Continue hint */}
              <p className="text-white/60 text-sm mt-6">
                Continuando automaticamente...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes sparkle {
          0% { 
            transform: scale(0) rotate(0deg);
            opacity: 1;
          }
          100% { 
            transform: scale(1.5) rotate(180deg);
            opacity: 0;
          }
        }
        
        @keyframes scaleIn {
          0% { transform: scale(0.3); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
}

// Color utility functions
function lightenColor(hex, percent) {
  if (!hex) return '#8b5cf6';
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function darkenColor(hex, percent) {
  if (!hex) return '#6d28d9';
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}
