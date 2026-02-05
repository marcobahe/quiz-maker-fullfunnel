'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Interactive Spin Wheel (Fortune Wheel) component for the Quiz Player.
 * Premium 3D tactile design with gradients, metallic border, and smooth animations.
 * 
 * Design System v2.0 - QuizMeBaby
 */

// Vibrant gradient color pairs for segments
const GRADIENT_COLORS = [
  { start: '#6366f1', end: '#4f46e5' },  // Indigo (Primary)
  { start: '#ec4899', end: '#db2777' },  // Pink
  { start: '#f59e0b', end: '#d97706' },  // Amber (Gold)
  { start: '#10b981', end: '#059669' },  // Emerald
  { start: '#3b82f6', end: '#2563eb' },  // Blue
  { start: '#f97316', end: '#ea580c' },  // Orange
  { start: '#8b5cf6', end: '#7c3aed' },  // Violet
  { start: '#14b8a6', end: '#0d9488' },  // Teal
];

export default function SpinWheel({ element, theme, btnRadius, onComplete }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [canvasSize, setCanvasSize] = useState(320);
  const currentAngleRef = useRef(0);
  const animFrameRef = useRef(null);

  const segments = element.segments || [];
  const totalProb = segments.reduce((s, seg) => s + (seg.probability || 0), 0) || 1;
  const allowRetry = element.allowRetry === true;

  // Responsive sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setCanvasSize(Math.min(w - 16, 360));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Draw premium wheel with 3D effects
  const drawWheel = useCallback((angle = 0) => {
    const canvas = canvasRef.current;
    if (!canvas || segments.length === 0) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = canvasSize;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 20;

    ctx.clearRect(0, 0, size, size);

    // Outer shadow (3D depth)
    ctx.beginPath();
    ctx.arc(cx, cy + 6, radius + 12, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fill();

    // Outer metallic ring (gold/bronze gradient)
    const outerRing = ctx.createLinearGradient(0, 0, size, size);
    outerRing.addColorStop(0, '#fcd34d');
    outerRing.addColorStop(0.3, '#f59e0b');
    outerRing.addColorStop(0.5, '#fbbf24');
    outerRing.addColorStop(0.7, '#d97706');
    outerRing.addColorStop(1, '#b45309');
    
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 12, 0, Math.PI * 2);
    ctx.fillStyle = outerRing;
    ctx.fill();
    
    // Inner border of outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw segments with gradients
    let startAngle = angle;
    segments.forEach((seg, i) => {
      const sweepAngle = ((seg.probability || 0) / totalProb) * Math.PI * 2;
      
      // Create radial gradient for segment
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      const colors = GRADIENT_COLORS[i % GRADIENT_COLORS.length];
      const baseColor = seg.color || colors.start;
      gradient.addColorStop(0, lightenColor(baseColor, 40));
      gradient.addColorStop(0.4, lightenColor(baseColor, 15));
      gradient.addColorStop(0.8, baseColor);
      gradient.addColorStop(1, darkenColor(baseColor, 15));
      
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sweepAngle);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Segment border (subtle white line for 3D effect)
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Shine effect on segment
      const shineGradient = ctx.createLinearGradient(
        cx + Math.cos(startAngle + sweepAngle / 2) * radius * 0.3,
        cy + Math.sin(startAngle + sweepAngle / 2) * radius * 0.3,
        cx + Math.cos(startAngle + sweepAngle / 2) * radius,
        cy + Math.sin(startAngle + sweepAngle / 2) * radius
      );
      shineGradient.addColorStop(0, 'rgba(255,255,255,0.15)');
      shineGradient.addColorStop(1, 'rgba(255,255,255,0)');

      // Text with premium styling
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + sweepAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(12, Math.min(16, radius / 8))}px "Outfit", system-ui, sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      const text = seg.text || '';
      const maxWidth = radius - 40;
      let displayText = text;
      if (ctx.measureText(text).width > maxWidth) {
        while (displayText.length > 3 && ctx.measureText(displayText + '…').width > maxWidth) {
          displayText = displayText.slice(0, -1);
        }
        displayText += '…';
      }
      ctx.fillText(displayText, radius - 25, 5);
      ctx.restore();

      startAngle += sweepAngle;
    });

    // Inner decorative ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.18, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,215,0,0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center hub shadow
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 30, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fill();

    // Center hub (premium metallic)
    const hubGradient = ctx.createRadialGradient(cx - 8, cy - 8, 0, cx, cy, 30);
    hubGradient.addColorStop(0, '#ffffff');
    hubGradient.addColorStop(0.2, '#f8fafc');
    hubGradient.addColorStop(0.5, '#e2e8f0');
    hubGradient.addColorStop(0.8, '#cbd5e1');
    hubGradient.addColorStop(1, '#94a3b8');
    
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fillStyle = hubGradient;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center gem/button
    const gemGradient = ctx.createRadialGradient(cx - 3, cy - 3, 0, cx, cy, 14);
    const primaryColor = theme?.primaryColor || '#6366f1';
    gemGradient.addColorStop(0, lightenColor(primaryColor, 20));
    gemGradient.addColorStop(0.5, primaryColor);
    gemGradient.addColorStop(1, darkenColor(primaryColor, 30));
    
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = gemGradient;
    ctx.fill();
    
    // Gem highlight
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 3, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();

    // Pointer (premium triangle with 3D shadow)
    const pointerHeight = 32;
    const pointerWidth = 26;
    
    // Pointer shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    
    ctx.beginPath();
    ctx.moveTo(cx, 4);
    ctx.lineTo(cx - pointerWidth / 2, pointerHeight + 4);
    ctx.lineTo(cx + pointerWidth / 2, pointerHeight + 4);
    ctx.closePath();
    
    // Pointer gradient (gold metallic)
    const pointerGradient = ctx.createLinearGradient(cx - pointerWidth/2, 4, cx + pointerWidth/2, pointerHeight + 4);
    pointerGradient.addColorStop(0, '#fcd34d');
    pointerGradient.addColorStop(0.3, '#f59e0b');
    pointerGradient.addColorStop(0.5, '#fbbf24');
    pointerGradient.addColorStop(1, '#d97706');
    ctx.fillStyle = pointerGradient;
    ctx.fill();
    
    // Pointer border
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

  }, [canvasSize, segments, totalProb, theme]);

  useEffect(() => {
    drawWheel(currentAngleRef.current);
  }, [drawWheel]);

  // Weighted random selection
  const pickSegment = () => {
    const rand = Math.random() * totalProb;
    let cum = 0;
    for (let i = 0; i < segments.length; i++) {
      cum += segments[i].probability || 0;
      if (rand <= cum) return i;
    }
    return segments.length - 1;
  };

  // Spin animation with smooth easing
  const spin = () => {
    if (spinning || segments.length === 0) return;
    if (hasSpun && !allowRetry) return;
    
    setSpinning(true);
    setResult(null);
    setHasSpun(true);

    const winIndex = pickSegment();

    // Calculate target angle
    let segStart = 0;
    for (let i = 0; i < winIndex; i++) {
      segStart += (segments[i].probability || 0) / totalProb;
    }
    const segMid = segStart + ((segments[winIndex].probability || 0) / totalProb) / 2;
    const fullSpins = 5 + Math.random() * 3;
    const targetAngle = -(Math.PI / 2) - segMid * Math.PI * 2 - fullSpins * Math.PI * 2;

    const startAngle = currentAngleRef.current;
    const totalRotation = targetAngle - startAngle;
    const duration = 4500 + Math.random() * 1000;
    const startTime = performance.now();

    // Smooth easing for dramatic effect
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const currentAngle = startAngle + totalRotation * eased;
      currentAngleRef.current = currentAngle;
      drawWheel(currentAngle);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setResult(segments[winIndex]);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const handleRetry = () => {
    setResult(null);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const canSpin = !spinning && (!hasSpun || allowRetry || !result);

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full">
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center font-display">
        {element.title || 'Gire a roleta!'}
      </h2>

      {/* Wheel container with glow */}
      <div 
        className="relative mb-8 cursor-pointer group"
        onClick={canSpin ? spin : undefined}
        style={{ cursor: canSpin ? 'pointer' : 'default' }}
      >
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-full transition-all duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${theme?.primaryColor || '#6366f1'}40 0%, transparent 60%)`,
            opacity: canSpin && !spinning ? 0.6 : 0,
            transform: 'scale(1.15)',
            filter: 'blur(20px)',
          }}
        />
        
        {/* Canvas */}
        <canvas 
          ref={canvasRef} 
          className="block transition-all duration-300"
          style={{
            filter: spinning 
              ? 'drop-shadow(0 12px 32px rgba(0,0,0,0.25))' 
              : (canSpin 
                  ? 'drop-shadow(0 8px 24px rgba(0,0,0,0.2))' 
                  : 'grayscale(0.3) drop-shadow(0 4px 12px rgba(0,0,0,0.15))'
                ),
          }}
        />
        
        {/* Hover hint */}
        {canSpin && !spinning && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            <div className="bg-black/70 backdrop-blur-sm text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg">
              ✨ Clique para girar!
            </div>
          </div>
        )}
      </div>

      {/* 3D Spin Button */}
      {!result && (
        <button
          onClick={spin}
          disabled={!canSpin}
          className="w-full max-w-xs text-white py-4 font-bold text-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wide font-display"
          style={{
            background: canSpin 
              ? `linear-gradient(135deg, ${theme?.primaryColor || '#6366f1'}, ${darkenColor(theme?.primaryColor || '#6366f1', 10)})` 
              : '#9ca3af',
            borderRadius: '1rem',
            boxShadow: canSpin 
              ? `0 6px 0 ${darkenColor(theme?.primaryColor || '#6366f1', 25)}, 0 12px 24px ${theme?.primaryColor || '#6366f1'}40`
              : 'none',
            transform: spinning ? 'translateY(4px)' : 'translateY(0)',
            cursor: canSpin ? 'pointer' : 'not-allowed',
          }}
        >
          {spinning ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Girando...
            </>
          ) : (
            <>
              <span className="text-xl">🎰</span>
              {element.buttonText || 'GIRAR!'}
            </>
          )}
        </button>
      )}

      {/* Result modal */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div 
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
            style={{ animation: 'scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
          >
            {/* Celebration */}
            <div className="text-6xl mb-4" style={{ animation: 'float 2s ease-in-out infinite' }}>
              🎉
            </div>
            
            <h3 className="text-3xl font-bold text-gray-900 mb-2 font-display">Parabéns!</h3>
            <p className="text-lg text-gray-500 mb-4">Você ganhou:</p>
            
            {/* Prize display */}
            <div
              className="text-2xl font-bold py-5 px-8 rounded-2xl inline-block mb-8"
              style={{
                background: `linear-gradient(135deg, ${result.color || theme?.primaryColor}20, ${result.color || theme?.primaryColor}10)`,
                color: result.color || theme?.primaryColor,
                border: `3px solid ${result.color || theme?.primaryColor}40`,
                boxShadow: `0 8px 24px ${result.color || theme?.primaryColor}20`,
              }}
            >
              ✨ {result.text}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => onComplete && onComplete(result)}
                className="w-full text-white py-4 font-bold text-lg transition-all hover:-translate-y-0.5 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${theme?.primaryColor || '#6366f1'}, ${darkenColor(theme?.primaryColor || '#6366f1', 10)})`,
                  borderRadius: '1rem',
                  boxShadow: `0 6px 0 ${darkenColor(theme?.primaryColor || '#6366f1', 25)}, 0 10px 20px ${theme?.primaryColor || '#6366f1'}30`,
                }}
              >
                Continuar →
              </button>
              
              {allowRetry && (
                <button
                  onClick={handleRetry}
                  className="w-full py-3 font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
                >
                  🔄 Tentar novamente
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scaleIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

// Color utility functions
function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function darkenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}
