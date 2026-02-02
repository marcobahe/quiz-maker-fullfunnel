'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Interactive Scratch Card component for the Quiz Player.
 * Uses HTML5 Canvas with globalCompositeOperation for scratch effect.
 */
export default function ScratchCard({ element, theme, btnRadius, onComplete }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [cardSize, setCardSize] = useState({ w: 300, h: 200 });
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef(null);
  const scratchedRef = useRef(0);
  const totalPixelsRef = useRef(0);
  const revealTriggeredRef = useRef(false);

  const coverColor = element.coverColor || '#7c3aed';
  const coverPattern = element.coverPattern || 'dots';
  const revealText = element.revealText || '🎉 Prêmio!';

  // Responsive sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const w = Math.min(containerRef.current.offsetWidth - 16, 360);
        setCardSize({ w, h: Math.round(w * 0.6) });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Draw the cover layer
  const drawCover = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cardSize.w * dpr;
    canvas.height = cardSize.h * dpr;
    canvas.style.width = cardSize.w + 'px';
    canvas.style.height = cardSize.h + 'px';
    ctx.scale(dpr, dpr);

    totalPixelsRef.current = cardSize.w * cardSize.h;
    scratchedRef.current = 0;
    revealTriggeredRef.current = false;

    // Base cover color
    ctx.fillStyle = coverColor;
    ctx.fillRect(0, 0, cardSize.w, cardSize.h);

    // Pattern overlay
    if (coverPattern === 'dots') {
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      for (let x = 0; x < cardSize.w; x += 20) {
        for (let y = 0; y < cardSize.h; y += 20) {
          ctx.beginPath();
          ctx.arc(x + 10, y + 10, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (coverPattern === 'stars') {
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.font = '16px sans-serif';
      const stars = ['⭐', '✨', '💫', '⭐', '✨'];
      let si = 0;
      for (let x = 10; x < cardSize.w; x += 35) {
        for (let y = 20; y < cardSize.h; y += 30) {
          ctx.fillText(stars[si % stars.length], x, y);
          si++;
        }
      }
    }

    // "Raspe aqui" text
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = `bold ${Math.max(16, cardSize.w / 16)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Raspe aqui ✨', cardSize.w / 2, cardSize.h / 2);
  }, [cardSize, coverColor, coverPattern]);

  useEffect(() => {
    if (!revealed) drawCover();
  }, [drawCover, revealed]);

  // Get position from mouse or touch event
  const getPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Scratch at position
  const scratch = (pos) => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Draw stroke from last position for smooth lines
    if (lastPosRef.current) {
      ctx.lineWidth = 44;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    ctx.restore();

    lastPosRef.current = pos;

    // Track scratched area (approximate)
    scratchedRef.current += 44 * 44;
    const scratchPercent = scratchedRef.current / totalPixelsRef.current;
    
    if (scratchPercent > 0.6 && !revealTriggeredRef.current) {
      revealTriggeredRef.current = true;
      // Auto-reveal with fade
      setTimeout(() => {
        setRevealed(true);
        setTimeout(() => setShowCelebration(true), 200);
      }, 300);
    }
  };

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
  const onTouchEnd = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  // Confetti-like particles
  const particles = showCelebration ? Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1.5,
    size: 6 + Math.random() * 10,
    color: ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'][i % 5],
  })) : [];

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
        {element.title || 'Raspe e descubra!'}
      </h2>
      <p className="text-sm text-gray-500 mb-4 text-center">
        {element.instruction || 'Passe o dedo para revelar seu prêmio'}
      </p>

      <div
        className="relative rounded-2xl overflow-hidden shadow-lg mb-6 select-none"
        style={{ width: cardSize.w, height: cardSize.h }}
      >
        {/* Reveal layer (underneath) */}
        <div
          className="absolute inset-0 flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100"
        >
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800 leading-snug break-words">
              {revealText}
            </p>
          </div>
        </div>

        {/* Scratch canvas (on top) */}
        {!revealed && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-crosshair touch-none"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
        )}

        {/* Fade-out overlay when auto-revealing */}
        {revealed && (
          <div className="absolute inset-0 pointer-events-none animate-coverFade" style={{ backgroundColor: coverColor }} />
        )}

        {/* Celebration particles */}
        {showCelebration && particles.map((p) => (
          <div
            key={p.id}
            className="absolute animate-confetti pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: '-10%',
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
          />
        ))}
      </div>

      {/* Continue button after reveal */}
      {showCelebration && (
        <div className="w-full max-w-xs animate-slideUp">
          <div className="text-center mb-4">
            <span className="text-4xl">🎊</span>
            <p className="text-lg font-bold text-gray-800 mt-1">Revelado!</p>
          </div>
          <button
            onClick={() => onComplete && onComplete({ text: revealText })}
            className="w-full text-white py-3 font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: theme?.primaryColor || '#7c3aed',
              borderRadius: btnRadius || '0.75rem',
            }}
          >
            Continuar →
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes coverFade {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(300px) rotate(720deg); opacity: 0; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-coverFade { animation: coverFade 0.6s ease forwards; }
        .animate-confetti { animation: confetti 2s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.5s ease 0.3s both; }
      `}</style>
    </div>
  );
}
