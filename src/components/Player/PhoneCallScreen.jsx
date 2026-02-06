'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, PhoneOff, X } from 'lucide-react';

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
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.02);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + 0.5);
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
    <span className="font-light text-lg tracking-wide text-white/70">
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  );
}

// ── iOS-style Slide to Answer ───────────────────────────────────
function IOSSlideToAnswer({ onAnswer }) {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef(null);
  const startXRef = useRef(0);
  const animationRef = useRef(null);
  
  const trackWidth = 270;
  const buttonSize = 62;
  const maxOffset = trackWidth - buttonSize - 8;

  const handleStart = (clientX) => {
    setIsDragging(true);
    startXRef.current = clientX - offsetX;
  };

  const handleMove = (clientX) => {
    if (!isDragging) return;
    const newOffset = Math.max(0, Math.min(clientX - startXRef.current, maxOffset));
    setOffsetX(newOffset);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (offsetX >= maxOffset * 0.7) {
      // Successfully answered
      setOffsetX(maxOffset);
      setTimeout(() => onAnswer(), 150);
    } else {
      // Snap back
      setOffsetX(0);
    }
  };

  // Shimmer animation
  useEffect(() => {
    if (isDragging || offsetX > 0) return;
    
    let shimmerOffset = 0;
    const animate = () => {
      shimmerOffset = (shimmerOffset + 2) % 300;
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDragging, offsetX]);

  const progress = offsetX / maxOffset;

  return (
    <div
      ref={trackRef}
      className="relative mx-auto select-none touch-none"
      style={{
        width: trackWidth,
        height: buttonSize + 8,
        borderRadius: (buttonSize + 8) / 2,
        backgroundColor: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Track fill (green gradient as you slide) */}
      <div
        className="absolute inset-y-1 left-1 rounded-full transition-all duration-75"
        style={{
          width: offsetX + buttonSize,
          background: `linear-gradient(90deg, rgba(52,199,89,0.3) 0%, rgba(52,199,89,${0.3 + progress * 0.4}) 100%)`,
          opacity: progress > 0 ? 1 : 0,
        }}
      />

      {/* Text hint */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: 1 - progress }}
      >
        <span className="text-white/50 text-[15px] font-light tracking-wide pl-12">
          deslize para atender
        </span>
      </div>

      {/* Chevrons animation */}
      <div 
        className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none"
        style={{ opacity: (1 - progress) * 0.5 }}
      >
        {[0, 1, 2].map((i) => (
          <svg
            key={i}
            width="8"
            height="14"
            viewBox="0 0 8 14"
            fill="none"
            className="animate-pulse"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <path
              d="M1 1L7 7L1 13"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.4 + i * 0.2}
            />
          </svg>
        ))}
      </div>

      {/* Draggable button */}
      <div
        className="absolute top-1 left-1 flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          background: 'linear-gradient(180deg, #34C759 0%, #30B350 100%)',
          boxShadow: '0 4px 20px rgba(52,199,89,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          handleStart(e.clientX);
        }}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      >
        <Phone size={26} className="text-white" strokeWidth={2.5} />
      </div>

      {/* Global mouse/touch move handlers */}
      {isDragging && (
        <div
          className="fixed inset-0 z-50"
          onMouseMove={(e) => handleMove(e.clientX)}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchMove={(e) => handleMove(e.touches[0].clientX)}
          onTouchEnd={handleEnd}
        />
      )}
    </div>
  );
}

// ── Main PhoneCallScreen (iOS Fullscreen Style) ─────────────────
export default function PhoneCallScreen({ element, theme, onComplete }) {
  const [phase, setPhase] = useState('ringing'); // ringing → answered → ended
  const audioRef = useRef(null);
  const ringtone = useRingtone();

  const callerName = element.callerName || 'Chamada recebida';
  const callerPhoto = element.callerPhoto || '';
  const callerLabel = element.callerLabel || 'iPhone';
  const audioUrl = element.audioUrl || '';
  const autoAdvance = element.autoAdvance !== false;

  // Start ringtone
  useEffect(() => {
    if (phase === 'ringing') {
      const timeout = setTimeout(() => ringtone.start(), 300);
      return () => {
        clearTimeout(timeout);
        ringtone.stop();
      };
    }
  }, [phase, ringtone]);

  // Lock body scroll when visible
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleAnswer = useCallback(() => {
    ringtone.stop();
    setPhase('answered');

    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [audioUrl, ringtone]);

  const handleDecline = useCallback(() => {
    ringtone.stop();
    audioRef.current?.pause();
    setPhase('ended');
    
    if (autoAdvance) {
      setTimeout(() => onComplete?.(), 1200);
    }
  }, [autoAdvance, onComplete, ringtone]);

  const handleHangup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    ringtone.stop();
    setPhase('ended');

    if (autoAdvance) {
      setTimeout(() => onComplete?.(), 1200);
    }
  }, [autoAdvance, onComplete, ringtone]);

  const handleAudioEnd = useCallback(() => {
    setPhase('ended');
    if (autoAdvance) {
      setTimeout(() => onComplete?.(), 1200);
    }
  }, [autoAdvance, onComplete]);

  return (
    <>
      {/* Fullscreen overlay - iOS call style (dark mode) */}
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{
          background: callerPhoto 
            ? 'transparent'
            : 'linear-gradient(180deg, #050508 0%, #0a0a12 35%, #0d0d15 65%, #050508 100%)',
        }}
      >
        {/* Background image with blur (if photo provided) - much darker */}
        {callerPhoto && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${callerPhoto})`,
                filter: 'blur(60px) brightness(0.2) saturate(0.8)',
                transform: 'scale(1.3)',
              }}
            />
            <div className="absolute inset-0 bg-black/70" />
          </>
        )}

        {/* Inline keyframes */}
        <style>{`
          @keyframes ios-pulse {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.05); }
          }
          @keyframes waveform {
            0%, 100% { height: 4px; }
            50% { height: 24px; }
          }
        `}</style>

        {/* Hidden audio */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={handleAudioEnd}
            preload="auto"
          />
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col flex-1 items-center justify-between py-16 px-6 safe-area-inset">
          
          {/* ── RINGING PHASE ─────────────────────────────── */}
          {phase === 'ringing' && (
            <>
              {/* Top section - caller info */}
              <div className="flex flex-col items-center pt-8">
                {/* Caller photo - large */}
                <div className="relative mb-4">
                  {/* Pulse rings */}
                  <div 
                    className="absolute -inset-4 rounded-full border border-white/20"
                    style={{ animation: 'ios-pulse 2s ease-in-out infinite' }}
                  />
                  <div 
                    className="absolute -inset-8 rounded-full border border-white/10"
                    style={{ animation: 'ios-pulse 2s ease-in-out 0.5s infinite' }}
                  />
                  
                  {/* Avatar */}
                  <div
                    className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center"
                    style={{
                      backgroundColor: callerPhoto ? 'transparent' : 'rgba(142,142,147,0.3)',
                      border: '2px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {callerPhoto ? (
                      <img
                        src={callerPhoto}
                        alt={callerName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-5xl">👤</span>
                    )}
                  </div>
                </div>

                {/* Name */}
                <h1 className="text-white text-[28px] font-light tracking-tight mb-1">
                  {callerName}
                </h1>
                
                {/* Subtitle */}
                <p className="text-white/60 text-[15px] font-light">
                  {callerLabel}
                </p>
              </div>

              {/* Bottom section - actions */}
              <div className="flex flex-col items-center gap-6 w-full pb-8">
                {/* Slide to Answer */}
                <IOSSlideToAnswer onAnswer={handleAnswer} />
                
                {/* Decline button */}
                <button
                  onClick={handleDecline}
                  className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-95"
                  style={{
                    background: 'linear-gradient(180deg, #FF3B30 0%, #E0312A 100%)',
                    boxShadow: '0 4px 20px rgba(255,59,48,0.4)',
                  }}
                >
                  <PhoneOff size={28} className="text-white" strokeWidth={2} />
                </button>
                <span className="text-white/50 text-[13px] font-light -mt-3">
                  Recusar
                </span>
              </div>
            </>
          )}

          {/* ── ANSWERED PHASE ────────────────────────────── */}
          {phase === 'answered' && (
            <>
              {/* Top section */}
              <div className="flex flex-col items-center pt-8">
                {/* Avatar smaller */}
                <div
                  className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: callerPhoto ? 'transparent' : 'rgba(142,142,147,0.3)',
                    border: '2px solid rgba(52,199,89,0.5)',
                  }}
                >
                  {callerPhoto ? (
                    <img
                      src={callerPhoto}
                      alt={callerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">👤</span>
                  )}
                </div>

                <h1 className="text-white text-2xl font-light tracking-tight mb-1">
                  {callerName}
                </h1>
                
                <CallTimer isActive={true} />

                {/* Audio waveform visualization */}
                {audioUrl && (
                  <div className="flex items-center justify-center gap-1 mt-6 h-8">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 rounded-full bg-green-400"
                        style={{
                          animation: `waveform ${0.4 + Math.random() * 0.3}s ease-in-out ${i * 0.05}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom section - hangup */}
              <div className="flex flex-col items-center pb-8">
                <button
                  onClick={handleHangup}
                  className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-95"
                  style={{
                    background: 'linear-gradient(180deg, #FF3B30 0%, #E0312A 100%)',
                    boxShadow: '0 4px 20px rgba(255,59,48,0.4)',
                  }}
                >
                  <PhoneOff size={28} className="text-white" strokeWidth={2} />
                </button>
                <span className="text-white/50 text-[13px] font-light mt-2">
                  Encerrar
                </span>
              </div>
            </>
          )}

          {/* ── ENDED PHASE ───────────────────────────────── */}
          {phase === 'ended' && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: 'rgba(255,59,48,0.15)' }}
              >
                <PhoneOff size={36} className="text-red-400" />
              </div>
              
              <h2 className="text-white text-xl font-light mb-1">
                Chamada encerrada
              </h2>
              <p className="text-white/50 text-sm">{callerName}</p>

              {!autoAdvance && (
                <button
                  onClick={() => onComplete?.()}
                  className="mt-10 px-10 py-3 rounded-full text-white font-medium transition-transform active:scale-95"
                  style={{
                    background: `linear-gradient(180deg, ${theme?.primaryColor || '#7c3aed'} 0%, ${theme?.secondaryColor || theme?.primaryColor || '#6b21a8'} 100%)`,
                  }}
                >
                  Continuar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
