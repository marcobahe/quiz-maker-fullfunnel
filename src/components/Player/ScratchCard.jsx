'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Interactive Scratch Card component for the Quiz Player.
 * Premium design with 3D golden coin, tactile scratch texture, and celebration effects.
 * 
 * Design System v2.0 - QuizMeBaby
 */
export default function ScratchCard({ element, theme, btnRadius, onComplete, onSound }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [cardSize, setCardSize] = useState({ w: 320, h: 200 });
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef(null);
  const scratchedRef = useRef(0);
  const totalPixelsRef = useRef(0);
  const revealTriggeredRef = useRef(false);
  const dprRef = useRef(1);
  const lastScratchSoundRef = useRef(0);

  const coverColor = element.coverColor || '#6366f1';
  const coverPattern = element.coverPattern || 'dots';
  const originalRevealText = element.revealText || '🎉 Você ganhou!';
  // Percentage of area that needs to be scratched before revealing (default: 60%)
  const revealThreshold = element.revealThreshold ?? 60;
  
  // Win probability check (done once on mount)
  const winResultRef = useRef(null);
  if (winResultRef.current === null) {
    const winProb = element.winProbability ?? 100;
    winResultRef.current = Math.random() * 100 < winProb;
  }
  const isWin = winResultRef.current;
  const revealText = isWin ? originalRevealText : (element.loseText || '😢 Tente novamente!');

  // Responsive sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const w = Math.min(containerRef.current.offsetWidth - 16, 380);
        setCardSize({ w, h: Math.round(w * 0.55) });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Draw the cover layer with premium texture
  const drawCover = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    
    canvas.width = cardSize.w * dpr;
    canvas.height = cardSize.h * dpr;
    canvas.style.width = cardSize.w + 'px';
    canvas.style.height = cardSize.h + 'px';

    totalPixelsRef.current = cardSize.w * cardSize.h;
    scratchedRef.current = 0;
    revealTriggeredRef.current = false;
    setScratchProgress(0);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Gradient background for more depth
    const gradient = ctx.createLinearGradient(0, 0, cardSize.w, cardSize.h);
    gradient.addColorStop(0, lightenColor(coverColor, 15));
    gradient.addColorStop(0.5, coverColor);
    gradient.addColorStop(1, darkenColor(coverColor, 10));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, cardSize.w, cardSize.h);

    // Scratch texture pattern
    if (coverPattern === 'dots') {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      for (let x = 0; x < cardSize.w; x += 16) {
        for (let y = 0; y < cardSize.h; y += 16) {
          ctx.beginPath();
          ctx.arc(x + 8, y + 8, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (coverPattern === 'stars') {
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.font = '14px sans-serif';
      const stars = ['⭐', '✨', '💫', '⭐', '✨'];
      let si = 0;
      for (let x = 10; x < cardSize.w; x += 40) {
        for (let y = 20; y < cardSize.h; y += 35) {
          ctx.fillText(stars[si % stars.length], x, y);
          si++;
        }
      }
    }

    // Metallic shine effect at top
    const shineGradient = ctx.createLinearGradient(0, 0, 0, cardSize.h * 0.4);
    shineGradient.addColorStop(0, 'rgba(255,255,255,0.25)');
    shineGradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shineGradient;
    ctx.fillRect(0, 0, cardSize.w, cardSize.h * 0.4);

    // "Raspe aqui" text with shadow
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `bold ${Math.max(18, cardSize.w / 14)}px "Outfit", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ Raspe aqui ✨', cardSize.w / 2, cardSize.h / 2);
    ctx.shadowBlur = 0;
  }, [cardSize, coverColor, coverPattern]);

  useEffect(() => {
    if (!revealed) drawCover();
  }, [drawCover, revealed]);

  // Get position from mouse or touch event
  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const scaleX = cardSize.w / rect.width;
    const scaleY = cardSize.h / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, [cardSize]);

  // Scratch at position
  const scratch = useCallback((pos) => {
    if (!pos) return;
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const ctx = canvas.getContext('2d');
    const dpr = dprRef.current;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'destination-out';
    
    const brushSize = 28;
    
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushSize, 0, Math.PI * 2);
    ctx.fill();

    if (lastPosRef.current) {
      ctx.lineWidth = brushSize * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    
    ctx.globalCompositeOperation = 'source-over';
    lastPosRef.current = pos;

    // Play scratch sound with debounce (~120ms between sounds)
    const now = Date.now();
    if (now - lastScratchSoundRef.current > 120) {
      lastScratchSoundRef.current = now;
      onSound?.('scratchLoop');
    }

    // Track progress
    scratchedRef.current += brushSize * brushSize * 4;
    const progress = Math.min(100, (scratchedRef.current / totalPixelsRef.current) * 100);
    setScratchProgress(Math.round(progress));
    
    // Use configurable threshold (default 60%)
    if (progress > revealThreshold && !revealTriggeredRef.current) {
      revealTriggeredRef.current = true;
      onSound?.('scratchReveal');
      setTimeout(() => {
        setRevealed(true);
        setTimeout(() => setShowCelebration(true), 200);
      }, 300);
    }
  }, [revealed, revealThreshold, onSound]);

  // Mouse events
  const onMouseDown = (e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    lastPosRef.current = null;
    scratch(getPos(e));
  };
  
  const onMouseMove = (e) => {
    if (!isDrawingRef.current) return;
    scratch(getPos(e));
  };
  
  const onMouseUp = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  // Touch events
  const onTouchStart = (e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    lastPosRef.current = null;
    scratch(getPos(e));
  };
  
  const onTouchMove = (e) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    scratch(getPos(e));
  };
  
  const onTouchEnd = (e) => {
    e.preventDefault();
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  // Celebration confetti particles
  const particles = showCelebration ? Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1.5,
    size: 8 + Math.random() * 12,
    color: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][i % 6],
    rotation: Math.random() * 360,
  })) : [];

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 w-full">
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ 
            background: `linear-gradient(135deg, ${coverColor}, ${darkenColor(coverColor, 15)})`,
            boxShadow: `0 8px 24px ${coverColor}40`,
          }}
        >
          <span className="text-2xl">🎫</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-display">
            {element.title || 'Raspe e descubra!'}
          </h2>
          <p className="text-sm text-gray-500">
            {element.instruction || 'Use o dedo para raspar'}
          </p>
        </div>
      </div>

      {/* Scratch Card */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl mb-6 select-none"
        style={{ 
          width: cardSize.w, 
          height: cardSize.h,
          boxShadow: `
            0 20px 50px -12px rgba(0, 0, 0, 0.25),
            0 10px 20px -5px rgba(0, 0, 0, 0.1),
            inset 0 1px 1px rgba(255, 255, 255, 0.1)
          `,
        }}
      >
        {/* Reveal layer (underneath) */}
        <div
          className="absolute inset-0 flex items-center justify-center p-6"
          style={{ 
            background: `linear-gradient(135deg, 
              ${lightenColor(coverColor, 50)} 0%, 
              ${lightenColor(coverColor, 40)} 50%, 
              ${lightenColor(coverColor, 45)} 100%
            )`,
          }}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🎁</div>
            <p className="text-2xl font-bold text-gray-800 leading-snug break-words font-display">
              {revealText}
            </p>
          </div>
        </div>

        {/* Scratch canvas (on top) */}
        {!revealed && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-crosshair"
            style={{ touchAction: 'none' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
        )}

        {/* Golden coin cursor hint */}
        {!revealed && !isDrawingRef.current && (
          <div 
            className="absolute bottom-4 right-4 pointer-events-none"
            style={{ animation: 'bounce-soft 2s ease-in-out infinite' }}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #fcd34d 0%, #f59e0b 50%, #d97706 100%)',
                boxShadow: `
                  0 6px 16px rgba(245, 158, 11, 0.4),
                  inset 0 -3px 6px rgba(0,0,0,0.2),
                  inset 0 3px 6px rgba(255,255,255,0.4)
                `,
                border: '3px solid #fef3c7',
              }}
            >
              <span className="text-white text-lg font-bold">⭐</span>
            </div>
          </div>
        )}

        {/* Fade-out overlay when auto-revealing */}
        {revealed && (
          <div 
            className="absolute inset-0 pointer-events-none" 
            style={{ 
              backgroundColor: coverColor,
              animation: 'fadeOut 0.6s ease forwards',
            }} 
          />
        )}

        {/* Celebration particles */}
        {showCelebration && particles.map((p) => (
          <div
            key={p.id}
            className="absolute pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: '-10%',
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '3px',
              animation: `confetti-fall ${p.duration}s ease-out forwards`,
              animationDelay: `${p.delay}s`,
              transform: `rotate(${p.rotation}deg)`,
            }}
          />
        ))}
      </div>

      {/* Progress indicator */}
      {!revealed && scratchProgress > 0 && (
        <div className="w-full max-w-xs mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Progresso</span>
            <span>{scratchProgress}%</span>
          </div>
          <div 
            className="h-2 bg-gray-200 rounded-full overflow-hidden"
            style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
          >
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                width: `${scratchProgress}%`,
                background: `linear-gradient(90deg, ${coverColor}, ${lightenColor(coverColor, 15)})`,
              }}
            />
          </div>
        </div>
      )}

      {/* Continue button after reveal */}
      {showCelebration && (
        <div className="w-full max-w-xs" style={{ animation: 'slideUp 0.5s ease-out' }}>
          <div className="text-center mb-5">
            <span className="text-5xl" style={{ animation: 'bounce-soft 1s ease-in-out infinite' }}>🎊</span>
            <p className="text-xl font-bold text-gray-900 mt-2 font-display">Revelado!</p>
          </div>
          <button
            onClick={() => onComplete && onComplete({ text: revealText })}
            className="w-full text-white py-4 font-bold text-lg transition-all hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${theme?.primaryColor || coverColor}, ${darkenColor(theme?.primaryColor || coverColor, 10)})`,
              borderRadius: '1rem',
              boxShadow: `0 6px 0 ${darkenColor(theme?.primaryColor || coverColor, 25)}, 0 10px 24px ${theme?.primaryColor || coverColor}40`,
            }}
          >
            Continuar →
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(350px) rotate(720deg); opacity: 0; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

// Color utility functions
function lightenColor(hex, percent) {
  if (!hex) return '#a5b4fc';
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function darkenColor(hex, percent) {
  if (!hex) return '#4f46e5';
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}
