'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Interactive Spin Wheel (Fortune Wheel) component for the Quiz Player.
 * Premium design with gradients, metallic border, and 3D effects.
 */

// Vibrant gradient color pairs for segments
const GRADIENT_COLORS = [
  { start: '#FF6B6B', end: '#FF3366' },  // Red
  { start: '#4ECDC4', end: '#2BAB9F' },  // Teal
  { start: '#FFE66D', end: '#FFD93D' },  // Yellow
  { start: '#95E1D3', end: '#5DC0A6' },  // Mint
  { start: '#A66CFF', end: '#8B5CF6' },  // Purple
  { start: '#FF9F43', end: '#FF6B35' },  // Orange
  { start: '#54A0FF', end: '#3B82F6' },  // Blue
  { start: '#FF78C4', end: '#F472B6' },  // Pink
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

  // Draw premium wheel
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
    const radius = size / 2 - 16;

    ctx.clearRect(0, 0, size, size);

    // Outer metallic ring (gold/bronze gradient)
    const outerRing = ctx.createLinearGradient(0, 0, size, size);
    outerRing.addColorStop(0, '#FFD700');
    outerRing.addColorStop(0.3, '#FFA500');
    outerRing.addColorStop(0.5, '#FFE55C');
    outerRing.addColorStop(0.7, '#DAA520');
    outerRing.addColorStop(1, '#B8860B');
    
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 10, 0, Math.PI * 2);
    ctx.fillStyle = outerRing;
    ctx.fill();
    
    // Inner shadow for 3D effect
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw segments with gradients
    let startAngle = angle;
    segments.forEach((seg, i) => {
      const sweepAngle = ((seg.probability || 0) / totalProb) * Math.PI * 2;
      
      // Create radial gradient for segment
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      const colors = GRADIENT_COLORS[i % GRADIENT_COLORS.length];
      const baseColor = seg.color || colors.start;
      gradient.addColorStop(0, lightenColor(baseColor, 30));
      gradient.addColorStop(0.5, baseColor);
      gradient.addColorStop(1, darkenColor(baseColor, 15));
      
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sweepAngle);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Segment border (subtle white line)
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text with better styling
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + sweepAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(11, Math.min(15, radius / 9))}px Inter, system-ui, sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      const text = seg.text || '';
      const maxWidth = radius - 35;
      let displayText = text;
      if (ctx.measureText(text).width > maxWidth) {
        while (displayText.length > 3 && ctx.measureText(displayText + '…').width > maxWidth) {
          displayText = displayText.slice(0, -1);
        }
        displayText += '…';
      }
      ctx.fillText(displayText, radius - 20, 5);
      ctx.restore();

      startAngle += sweepAngle;
    });

    // Inner decorative ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.15, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,215,0,0.6)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center hub (premium metallic)
    const hubGradient = ctx.createRadialGradient(cx - 5, cy - 5, 0, cx, cy, 28);
    hubGradient.addColorStop(0, '#ffffff');
    hubGradient.addColorStop(0.3, '#f8f8f8');
    hubGradient.addColorStop(0.7, '#e0e0e0');
    hubGradient.addColorStop(1, '#c0c0c0');
    
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.fillStyle = hubGradient;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center gem/button
    const gemGradient = ctx.createRadialGradient(cx - 2, cy - 2, 0, cx, cy, 10);
    gemGradient.addColorStop(0, theme?.primaryColor || '#8B5CF6');
    gemGradient.addColorStop(0.7, darkenColor(theme?.primaryColor || '#8B5CF6', 20));
    gemGradient.addColorStop(1, darkenColor(theme?.primaryColor || '#8B5CF6', 40));
    
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fillStyle = gemGradient;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Pointer (premium triangle with shadow)
    const pointerHeight = 28;
    const pointerWidth = 22;
    
    // Pointer shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    
    ctx.beginPath();
    ctx.moveTo(cx, 6);
    ctx.lineTo(cx - pointerWidth / 2, pointerHeight + 6);
    ctx.lineTo(cx + pointerWidth / 2, pointerHeight + 6);
    ctx.closePath();
    
    const pointerGradient = ctx.createLinearGradient(cx, 6, cx, pointerHeight + 6);
    pointerGradient.addColorStop(0, '#FFD700');
    pointerGradient.addColorStop(0.5, '#FFA500');
    pointerGradient.addColorStop(1, '#DAA520');
    ctx.fillStyle = pointerGradient;
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
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

  // Spin animation
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

    // More dramatic easing
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
    // Don't reset hasSpun - we track if user ever spun
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Helper to check if we can spin
  const canSpin = !spinning && (!hasSpun || allowRetry || !result);

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        {element.title || 'Gire a roleta!'}
      </h2>

      {/* Clickable wheel container */}
      <div 
        className="relative mb-5 cursor-pointer group"
        onClick={canSpin ? spin : undefined}
        style={{ cursor: canSpin ? 'pointer' : 'default' }}
      >
        {/* Glow effect on hover */}
        <div 
          className="absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${theme?.primaryColor || '#8B5CF6'}30 0%, transparent 70%)`,
            opacity: canSpin && !spinning ? 0.5 : 0,
            transform: 'scale(1.1)',
          }}
        />
        
        <canvas 
          ref={canvasRef} 
          className="block transition-transform duration-200"
          style={{
            filter: spinning ? 'none' : (canSpin ? 'drop-shadow(0 8px 24px rgba(0,0,0,0.2))' : 'grayscale(0.3) drop-shadow(0 4px 12px rgba(0,0,0,0.15))'),
          }}
        />
        
        {/* Click hint overlay */}
        {canSpin && !spinning && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full">
              Clique para girar!
            </div>
          </div>
        )}
      </div>

      {/* Spin button (alternative to clicking wheel) */}
      {!result && (
        <button
          onClick={spin}
          disabled={!canSpin}
          className="w-full max-w-xs text-white py-3.5 font-bold text-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          style={{
            backgroundColor: theme?.primaryColor || '#7c3aed',
            borderRadius: btnRadius || '0.75rem',
            transform: spinning ? 'scale(0.97)' : 'scale(1)',
            boxShadow: canSpin ? `0 4px 20px ${theme?.primaryColor || '#7c3aed'}40` : 'none',
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
            element.buttonText || 'GIRAR!'
          )}
        </button>
      )}

      {/* Result modal */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-bounceIn">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Parabéns!</h3>
            <p className="text-lg text-gray-500 mb-3">Você ganhou:</p>
            <div
              className="text-2xl font-bold py-4 px-6 rounded-xl inline-block mb-6"
              style={{
                backgroundColor: `${result.color}15`,
                color: result.color,
                border: `2px solid ${result.color}30`,
              }}
            >
              {result.text}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => onComplete && onComplete(result)}
                className="w-full text-white py-3 font-semibold transition-all hover:opacity-90 shadow-md"
                style={{
                  backgroundColor: theme?.primaryColor || '#7c3aed',
                  borderRadius: btnRadius || '0.75rem',
                }}
              >
                Continuar →
              </button>
              
              {/* Retry button - only if allowRetry is true */}
              {allowRetry && (
                <button
                  onClick={handleRetry}
                  className="w-full py-3 font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  🔄 Tentar novamente
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease; }
        .animate-bounceIn { animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
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
