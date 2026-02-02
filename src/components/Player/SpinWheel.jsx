'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Interactive Spin Wheel (Fortune Wheel) component for the Quiz Player.
 * Uses HTML5 Canvas for rendering and animation.
 */
export default function SpinWheel({ element, theme, btnRadius, onComplete }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [canvasSize, setCanvasSize] = useState(300);
  const currentAngleRef = useRef(0);
  const animFrameRef = useRef(null);

  const segments = element.segments || [];
  const totalProb = segments.reduce((s, seg) => s + (seg.probability || 0), 0) || 1;

  // Responsive sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setCanvasSize(Math.min(w - 20, 340));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Draw wheel
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
    const radius = size / 2 - 10;

    ctx.clearRect(0, 0, size, size);

    // Draw segments
    let startAngle = angle;
    segments.forEach((seg) => {
      const sweepAngle = ((seg.probability || 0) / totalProb) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sweepAngle);
      ctx.closePath();
      ctx.fillStyle = seg.color || '#ccc';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + sweepAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(10, Math.min(14, radius / 10))}px Inter, sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 3;
      
      const text = seg.text || '';
      const maxWidth = radius - 30;
      let displayText = text;
      if (ctx.measureText(text).width > maxWidth) {
        while (displayText.length > 3 && ctx.measureText(displayText + '…').width > maxWidth) {
          displayText = displayText.slice(0, -1);
        }
        displayText += '…';
      }
      ctx.fillText(displayText, radius - 15, 5);
      ctx.shadowBlur = 0;
      ctx.restore();

      startAngle += sweepAngle;
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = theme?.primaryColor || '#7c3aed';
    ctx.fill();

    // Pointer (triangle at top)
    const pointerSize = 16;
    ctx.beginPath();
    ctx.moveTo(cx, 2);
    ctx.lineTo(cx - pointerSize / 2, pointerSize + 4);
    ctx.lineTo(cx + pointerSize / 2, pointerSize + 4);
    ctx.closePath();
    ctx.fillStyle = theme?.primaryColor || '#7c3aed';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
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
    setSpinning(true);
    setResult(null);

    const winIndex = pickSegment();

    // Calculate target angle so the winning segment lands at the top (pointer)
    let segStart = 0;
    for (let i = 0; i < winIndex; i++) {
      segStart += (segments[i].probability || 0) / totalProb;
    }
    const segMid = segStart + ((segments[winIndex].probability || 0) / totalProb) / 2;

    // Target: the segment midpoint should be at the top (angle = -PI/2 = 3PI/2)
    // Canvas draws from the right (0 rad), pointer is at top (-PI/2)
    // We need: currentAngle + segMid * 2PI = -PI/2 + n*2PI
    // So: targetAngle = -PI/2 - segMid * 2PI + n*2PI
    const fullSpins = 5 + Math.random() * 3; // 5-8 full rotations
    const targetAngle = -(Math.PI / 2) - segMid * Math.PI * 2 - fullSpins * Math.PI * 2;

    const startAngle = currentAngleRef.current;
    const totalRotation = targetAngle - startAngle;
    const duration = 4000 + Math.random() * 1000; // 4-5 seconds
    const startTime = performance.now();

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const currentAngle = startAngle + totalRotation * eased;
      currentAngleRef.current = currentAngle;
      drawWheel(currentAngle);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Done spinning
        setSpinning(false);
        setResult(segments[winIndex]);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        {element.title || 'Gire a roleta!'}
      </h2>

      <div className="relative mb-6">
        <canvas ref={canvasRef} className="block" />
      </div>

      {!result && (
        <button
          onClick={spin}
          disabled={spinning}
          className="w-full max-w-xs text-white py-3.5 font-bold text-lg transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          style={{
            backgroundColor: theme?.primaryColor || '#7c3aed',
            borderRadius: btnRadius || '0.75rem',
            transform: spinning ? 'scale(0.97)' : 'scale(1)',
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-bounceIn">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Parabéns!</h3>
            <p className="text-lg text-gray-600 mb-2">Você ganhou:</p>
            <div
              className="text-2xl font-bold py-3 px-6 rounded-xl inline-block mb-6"
              style={{
                backgroundColor: `${result.color}15`,
                color: result.color,
              }}
            >
              {result.text}
            </div>
            <button
              onClick={() => onComplete && onComplete(result)}
              className="w-full text-white py-3 font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: theme?.primaryColor || '#7c3aed',
                borderRadius: btnRadius || '0.75rem',
              }}
            >
              Continuar →
            </button>
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
        .animate-bounceIn { animation: bounceIn 0.5s ease; }
      `}</style>
    </div>
  );
}
