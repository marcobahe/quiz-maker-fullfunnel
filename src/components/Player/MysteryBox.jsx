'use client';

import { useState, useCallback } from 'react';
import { Package, Sparkles } from 'lucide-react';

export default function MysteryBox({ element, theme, btnRadius, onComplete }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const bgColor = element.bgColor || '#1e1b4b';
  const boxColor = element.boxColor || theme.primaryColor || '#7c3aed';

  const handleClick = useCallback(() => {
    if (isRevealed || isOpening) return;

    // Start shake animation
    setIsShaking(true);
    
    // After shake, start opening
    setTimeout(() => {
      setIsShaking(false);
      setIsOpening(true);
      
      // Reveal after opening animation
      setTimeout(() => {
        setIsRevealed(true);
        setIsOpening(false);
        
        // Auto-advance after reveal
        setTimeout(() => {
          onComplete?.();
        }, 2000);
      }, 800);
    }, 1000);
  }, [isRevealed, isOpening, onComplete]);

  return (
    <div className="mb-4">
      {/* Title */}
      <div className="flex items-center gap-2 mb-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${boxColor}20` }}
        >
          <Package size={18} style={{ color: boxColor }} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">
          {element.title || 'Abra a caixa misteriosa!'}
        </h3>
      </div>

      {/* Mystery Box Container */}
      <div
        className="relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
        style={{ 
          backgroundColor: bgColor,
          minHeight: '200px',
        }}
        onClick={handleClick}
      >
        {/* Stars background decoration */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute text-yellow-300"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${8 + Math.random() * 12}px`,
                animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              ✨
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="relative flex flex-col items-center justify-center min-h-[200px] p-6">
          {!isRevealed ? (
            <>
              {/* Mystery Box 3D */}
              <div
                className={`relative transition-all duration-300 ${isShaking ? 'animate-shake' : ''} ${isOpening ? 'animate-open' : ''}`}
                style={{
                  transform: isOpening ? 'scale(1.2) rotateY(360deg)' : 'none',
                }}
              >
                {/* Box Body */}
                <div
                  className="w-24 h-24 rounded-lg relative overflow-hidden shadow-2xl"
                  style={{
                    backgroundColor: boxColor,
                    transform: 'perspective(300px) rotateX(15deg)',
                    boxShadow: `
                      0 20px 40px ${boxColor}40,
                      inset 0 -5px 15px rgba(0,0,0,0.3),
                      inset 0 5px 15px rgba(255,255,255,0.2)
                    `,
                  }}
                >
                  {/* Ribbon vertical */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 w-4 h-full"
                    style={{ backgroundColor: '#fbbf24' }}
                  />
                  {/* Ribbon horizontal */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-full h-4"
                    style={{ backgroundColor: '#fbbf24' }}
                  />
                  {/* Bow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">
                    🎀
                  </div>

                  {/* Shine effect */}
                  <div
                    className="absolute top-2 left-2 w-3 h-6 bg-white/30 rounded-full"
                    style={{ transform: 'rotate(-45deg)' }}
                  />

                  {/* Question marks floating */}
                  <div className="absolute -top-2 -right-2 text-white text-xl animate-bounce">?</div>
                  <div className="absolute -bottom-1 -left-1 text-white text-lg animate-bounce" style={{ animationDelay: '0.3s' }}>?</div>
                </div>

                {/* Glow effect */}
                {!isOpening && (
                  <div
                    className="absolute inset-0 rounded-lg animate-pulse"
                    style={{
                      boxShadow: `0 0 30px ${boxColor}60, 0 0 60px ${boxColor}30`,
                    }}
                  />
                )}
              </div>

              {/* Instruction text */}
              <p className="text-white/80 text-sm mt-6 font-medium">
                {isShaking ? '✨ Abrindo...' : isOpening ? '🎉 Surpresa!' : '👆 Toque para abrir'}
              </p>
            </>
          ) : (
            /* Revealed content */
            <div className="text-center animate-fadeIn">
              {/* Sparkles */}
              <div className="text-4xl mb-4 animate-bounce">
                ✨🎉✨
              </div>
              
              {/* Revealed text */}
              <div
                className="bg-white/95 rounded-xl px-6 py-4 shadow-lg"
                style={{
                  animation: 'scaleIn 0.5s ease-out',
                }}
              >
                <Sparkles className="mx-auto mb-2" size={24} style={{ color: boxColor }} />
                <p className="text-lg font-bold text-gray-800">
                  {element.revealText || 'Parabéns! 🎊'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px) rotate(-2deg); }
          20%, 40%, 60%, 80% { transform: translateX(5px) rotate(2deg); }
        }
        
        @keyframes open {
          0% { transform: scale(1) rotateY(0deg); }
          50% { transform: scale(1.3) rotateY(180deg); }
          100% { transform: scale(1.2) rotateY(360deg); opacity: 0; }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out infinite;
        }
        
        .animate-open {
          animation: open 0.8s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
