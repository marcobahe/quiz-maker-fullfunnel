'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, PhoneOff, User } from 'lucide-react';

// ── Ringtone generator (Web Audio API) ─────────────────────────
function useRingtone() {
  const ctxRef = useRef(null);
  const intervalRef = useRef(null);

  const start = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      ctxRef.current = ctx;

      const playTone = () => {
        // Classic phone ring: two tones alternating
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.frequency.value = 440;
        osc2.frequency.value = 480;
        osc1.type = 'sine';
        osc2.type = 'sine';

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + 0.5);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.52);

        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.55);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.55);
      };

      playTone();
      intervalRef.current = setInterval(playTone, 2000);
    } catch (e) {
      console.debug('Ringtone failed:', e);
    }
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { start, stop };
}

// ── Call Timer ──────────────────────────────────────────────────
function CallTimer({ isActive }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setSeconds(0);
      return;
    }
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return (
    <span className="font-mono text-lg tracking-wider" style={{ color: 'rgba(255,255,255,0.8)' }}>
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  );
}

// ── Waveform Bars ───────────────────────────────────────────────
function WaveformBars() {
  return (
    <div className="flex items-center justify-center gap-1" style={{ height: 40 }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: 3,
            backgroundColor: '#22c55e',
            animation: `waveform-bar 0.${4 + (i % 5)}s ease-in-out ${i * 0.05}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

// ── Slide to Answer (mobile-style) ──────────────────────────────
function SlideToAnswer({ onAnswer }) {
  const [dragging, setDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const trackRef = useRef(null);
  const startXRef = useRef(0);
  const threshold = 200;

  const handleStart = (clientX) => {
    setDragging(true);
    startXRef.current = clientX;
  };

  const handleMove = (clientX) => {
    if (!dragging) return;
    const dx = Math.max(0, clientX - startXRef.current);
    setOffsetX(Math.min(dx, threshold));
  };

  const handleEnd = () => {
    if (offsetX >= threshold * 0.8) {
      onAnswer();
    }
    setDragging(false);
    setOffsetX(0);
  };

  return (
    <div
      ref={trackRef}
      className="relative w-64 h-14 rounded-full overflow-hidden mx-auto select-none"
      style={{ backgroundColor: 'rgba(34,197,94,0.2)', border: '2px solid rgba(34,197,94,0.3)' }}
    >
      {/* Background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className="text-sm font-medium tracking-wide"
          style={{ color: 'rgba(34,197,94,0.6)', opacity: 1 - offsetX / threshold }}
        >
          Deslize para atender →
        </span>
      </div>

      {/* Draggable button */}
      <div
        className="absolute top-1 left-1 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg shadow-green-500/40 transition-shadow"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: dragging ? 'none' : 'transform 0.3s ease',
        }}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        <Phone size={20} className="text-white" />
      </div>
    </div>
  );
}

// ── Pulse Ring Animation ────────────────────────────────────────
function PulseRings({ color = '#22c55e' }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 120 + i * 40,
            height: 120 + i * 40,
            border: `2px solid ${color}`,
            opacity: 0,
            animation: `pulse-ring 2s ease-out ${i * 0.5}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ── Main PhoneCallScreen ────────────────────────────────────────
export default function PhoneCallScreen({ element, theme, onComplete }) {
  const [phase, setPhase] = useState('ringing'); // ringing → answered → ended
  const audioRef = useRef(null);
  const ringtone = useRingtone();

  const callerName = element.callerName || 'Chamada recebida';
  const callerPhoto = element.callerPhoto || '';
  const audioUrl = element.audioUrl || '';
  const autoAdvance = element.autoAdvance !== false;

  // Start ringtone when entering ringing phase
  useEffect(() => {
    if (phase === 'ringing') {
      // Small delay for UX
      const timeout = setTimeout(() => ringtone.start(), 300);
      return () => {
        clearTimeout(timeout);
        ringtone.stop();
      };
    }
  }, [phase, ringtone]);

  // Handle answer
  const handleAnswer = useCallback(() => {
    ringtone.stop();
    setPhase('answered');

    // Play audio
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [audioUrl, ringtone]);

  // Handle hangup
  const handleHangup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    ringtone.stop();
    setPhase('ended');

    // Auto-advance after 1.5s
    if (autoAdvance) {
      setTimeout(() => onComplete?.(), 1500);
    }
  }, [autoAdvance, onComplete, ringtone]);

  // Audio ended → transition to ended phase
  const handleAudioEnd = useCallback(() => {
    setPhase('ended');
    if (autoAdvance) {
      setTimeout(() => onComplete?.(), 1500);
    }
  }, [autoAdvance, onComplete]);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Inline styles for animations */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        @keyframes waveform-bar {
          0% { height: 4px; }
          100% { height: 28px; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>

      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleAudioEnd}
          preload="auto"
        />
      )}

      {/* Phone screen container */}
      <div
        className="rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
          minHeight: 400,
        }}
      >
        {/* ── RINGING PHASE ─────────────────────────────── */}
        {phase === 'ringing' && (
          <div className="flex flex-col items-center justify-between py-10 px-6" style={{ minHeight: 400 }}>
            {/* Top: Caller info */}
            <div className="text-center animate-fade-in-up">
              <p className="text-gray-400 text-sm mb-1 tracking-wide">Chamada recebida</p>
            </div>

            {/* Center: Avatar with pulse */}
            <div className="relative flex items-center justify-center my-8">
              <PulseRings />
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden z-10"
                style={{
                  backgroundColor: callerPhoto ? 'transparent' : 'rgba(34,197,94,0.15)',
                  border: '3px solid rgba(34,197,94,0.5)',
                }}
              >
                {callerPhoto ? (
                  <img
                    src={callerPhoto}
                    alt={callerName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="w-full h-full items-center justify-center"
                  style={{ display: callerPhoto ? 'none' : 'flex' }}
                >
                  <User size={40} className="text-green-400" />
                </div>
              </div>
            </div>

            {/* Caller name */}
            <h3 className="text-white text-2xl font-semibold mb-2">{callerName}</h3>
            <p className="text-gray-400 text-sm mb-8">📱 Celular</p>

            {/* Bottom: Slide to answer */}
            <div className="w-full space-y-4">
              <SlideToAnswer onAnswer={handleAnswer} />
              
              {/* Desktop fallback: click button */}
              <button
                onClick={handleAnswer}
                className="w-full py-3 rounded-full bg-green-500 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-green-600 transition-colors md:hidden sm:flex"
                style={{ display: 'none' }}
              >
                <Phone size={18} /> Atender
              </button>
              
              {/* Desktop click button (visible on larger screens) */}
              <button
                onClick={handleAnswer}
                className="hidden md:flex w-full py-3 rounded-full bg-green-500 text-white font-medium text-sm items-center justify-center gap-2 hover:bg-green-600 transition-colors"
              >
                <Phone size={18} /> Atender Chamada
              </button>
            </div>
          </div>
        )}

        {/* ── ANSWERED PHASE ────────────────────────────── */}
        {phase === 'answered' && (
          <div className="flex flex-col items-center justify-between py-10 px-6" style={{ minHeight: 400 }}>
            {/* Top: Status */}
            <div className="text-center animate-fade-in-up">
              <p className="text-green-400 text-sm mb-1 tracking-wide">Em chamada</p>
              <CallTimer isActive={true} />
            </div>

            {/* Center: Avatar + Waveform */}
            <div className="flex flex-col items-center gap-6 my-8">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  backgroundColor: callerPhoto ? 'transparent' : 'rgba(34,197,94,0.15)',
                  border: '3px solid rgba(34,197,94,0.5)',
                }}
              >
                {callerPhoto ? (
                  <img
                    src={callerPhoto}
                    alt={callerName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={32} className="text-green-400" />
                )}
              </div>
              <h3 className="text-white text-xl font-semibold">{callerName}</h3>
              <WaveformBars />
            </div>

            {/* Bottom: Hangup button */}
            <button
              onClick={handleHangup}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/40 hover:bg-red-600 transition-colors"
            >
              <PhoneOff size={24} className="text-white" />
            </button>
          </div>
        )}

        {/* ── ENDED PHASE ───────────────────────────────── */}
        {phase === 'ended' && (
          <div className="flex flex-col items-center justify-center py-10 px-6" style={{ minHeight: 400 }}>
            <div className="animate-fade-in-up text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}
              >
                <PhoneOff size={32} className="text-red-400" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Chamada encerrada</h3>
              <p className="text-gray-400 text-sm">{callerName}</p>
              
              {!autoAdvance && (
                <button
                  onClick={() => onComplete?.()}
                  className="mt-8 px-8 py-3 rounded-full text-white font-medium text-sm transition-colors hover:opacity-90"
                  style={{ backgroundColor: theme?.primaryColor || '#7c3aed' }}
                >
                  Continuar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
