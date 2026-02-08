'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SlotMachineScreen({
  element,
  onNext,
  theme = {},
  onSound,
}) {
  const {
    title = 'Puxe a alavanca!',
    slotEmojis = ['🎰', '💎', '🎉', '🍒', '⭐', '💰', '🔥', '🎪'],
    bgColor = '#1e1b4b',
  } = element || {};

  const [spinning, setSpinning] = useState(false);
  const [slots, setSlots] = useState(['❓', '❓', '❓']);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lastWin, setLastWin] = useState(null);
  const spinIntervals = useRef([]);

  const maxAttempts = element?.maxAttempts || 1;

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      spinIntervals.current.forEach(clearInterval);
    };
  }, []);

  const spin = () => {
    if (spinning) return;
    
    setSpinning(true);
    setShowResult(false);
    setResult(null);
    setLastWin(null);

    const newAttemptCount = attempts + 1;
    setAttempts(newAttemptCount);

    // Determine win/lose upfront based on winProbability
    const winProb = element.winProbability ?? 100;
    const isWin = Math.random() * 100 < winProb;

    // Pre-determine final results
    let finalSlots;
    if (isWin) {
      // Jackpot: all three match
      const jackpotEmoji = slotEmojis[Math.floor(Math.random() * slotEmojis.length)];
      finalSlots = [jackpotEmoji, jackpotEmoji, jackpotEmoji];
    } else {
      // Lose: ensure no three-of-a-kind
      finalSlots = [];
      for (let i = 0; i < 3; i++) {
        finalSlots.push(slotEmojis[Math.floor(Math.random() * slotEmojis.length)]);
      }
      // If accidentally all match, change the last one
      if (finalSlots[0] === finalSlots[1] && finalSlots[1] === finalSlots[2]) {
        const others = slotEmojis.filter(e => e !== finalSlots[0]);
        finalSlots[2] = others.length > 0 ? others[Math.floor(Math.random() * others.length)] : '❌';
      }
    }

    // Clear any existing intervals
    spinIntervals.current.forEach(clearInterval);
    spinIntervals.current = [];

    // Play slot spin sound at intervals while spinning
    const slotSoundInterval = setInterval(() => {
      onSound?.('slotSpin');
    }, 200);
    spinIntervals.current.push(slotSoundInterval);

    // Start spinning each slot with different speeds
    const spinDurations = [1500, 2000, 2500]; // Different stop times
    const spinSpeeds = [50, 60, 70]; // Different animation speeds

    slots.forEach((_, index) => {
      let counter = 0;
      const interval = setInterval(() => {
        setSlots(prev => {
          const newSlots = [...prev];
          newSlots[index] = slotEmojis[Math.floor(Math.random() * slotEmojis.length)];
          return newSlots;
        });
        counter++;
      }, spinSpeeds[index]);

      spinIntervals.current.push(interval);

      // Stop this slot after its duration
      setTimeout(() => {
        clearInterval(interval);
        // Play stop "clunk" for each reel
        onSound?.('slotStop');
        // Set pre-determined final emoji
        setSlots(prev => {
          const newSlots = [...prev];
          newSlots[index] = finalSlots[index];
          return newSlots;
        });

        // If this is the last slot to stop
        if (index === 2) {
          // Stop the slot spin sound loop
          clearInterval(slotSoundInterval);
          setTimeout(() => {
            setSpinning(false);
            // Check result based on pre-determined outcome
            const isJackpot = finalSlots[0] === finalSlots[1] && finalSlots[1] === finalSlots[2];
            const hasPair = finalSlots[0] === finalSlots[1] || 
                            finalSlots[1] === finalSlots[2] || 
                            finalSlots[0] === finalSlots[2];

            if (isJackpot) {
              setResult({ type: 'jackpot', message: '🎉 JACKPOT! 🎉' });
              onSound?.('slotJackpot');
            } else if (hasPair) {
              setResult({ type: 'pair', message: '✨ Quase lá! ✨' });
              onSound?.('slotStop');
            } else {
              setResult({ type: 'miss', message: 'Tente novamente!' });
              onSound?.('slotLose');
            }
            setLastWin(isWin);
            setShowResult(true);
          }, 100);
        }
      }, spinDurations[index]);
    });
  };

  const handleRetry = () => {
    setShowResult(false);
    setResult(null);
    setLastWin(null);
    setSlots(['❓', '❓', '❓']);
  };

  const handleContinue = () => {
    onNext?.();
  };

  // Can retry: lost and still has attempts remaining
  const canRetry = showResult && !lastWin && attempts < maxAttempts;
  // Must advance: won, or lost with no more attempts
  const mustAdvance = showResult && (lastWin || attempts >= maxAttempts);

  return (
    <div 
      className="flex flex-col items-center justify-center w-full"
      style={{ backgroundColor: bgColor, borderRadius: '1.5rem', padding: '1.25rem 1rem' }}
    >
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-white text-center mb-4"
      >
        {title}
      </motion.h1>

      {/* Attempts counter */}
      {maxAttempts > 1 && (
        <div className="text-sm text-white/60 mb-3 font-medium">
          Tentativa {Math.min(attempts + (showResult ? 0 : 1), maxAttempts)} de {maxAttempts}
        </div>
      )}

      {/* Slot Machine - Compact */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative w-full max-w-[280px] cursor-pointer"
        onClick={!spinning && !showResult ? spin : undefined}
      >
        {/* Machine Frame - Compact */}
        <div className="bg-gradient-to-b from-yellow-500 via-yellow-600 to-yellow-700 p-3 rounded-2xl shadow-xl">
          {/* Top decoration */}
          <div className="flex justify-center mb-2">
            <div className="bg-red-500 text-white px-4 py-0.5 rounded-full text-xs font-bold shadow-md">
              777
            </div>
          </div>

          {/* Slots container - Compact */}
          <div className="bg-black/90 rounded-xl p-2.5 flex gap-1.5 justify-center">
            {slots.map((emoji, index) => (
              <motion.div
                key={index}
                className="w-16 h-18 bg-white rounded-lg flex items-center justify-center overflow-hidden"
                style={{ height: '4.5rem' }}
                animate={spinning ? { 
                  y: [0, -3, 0, 3, 0],
                } : {}}
                transition={{ 
                  repeat: spinning ? Infinity : 0, 
                  duration: 0.1,
                }}
              >
                <span 
                  className="text-4xl"
                  style={{
                    filter: spinning ? 'blur(2px)' : 'none',
                    transition: 'filter 0.2s',
                  }}
                >
                  {emoji}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Decorative lights - Compact */}
          <div className="flex justify-center gap-1.5 mt-2">
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: spinning 
                    ? ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#ec4899', '#8b5cf6', '#f97316'][i]
                    : '#6b7280',
                }}
                animate={spinning ? { 
                  opacity: [1, 0.3, 1],
                  scale: [1, 0.8, 1],
                } : {}}
                transition={{ 
                  repeat: spinning ? Infinity : 0, 
                  duration: 0.3,
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>
        </div>

        {/* Hover hint on machine */}
        {!spinning && !showResult && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              ✨ Clique para girar!
            </div>
          </div>
        )}
      </motion.div>

      {/* Result - Compact */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={`mt-4 px-6 py-2.5 rounded-xl text-center ${
              result.type === 'jackpot' 
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' 
                : result.type === 'pair'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-700 text-white'
            }`}
          >
            <p className="text-lg font-bold">{result.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions - Compact */}
      <div className="mt-4 flex flex-col gap-2 w-full max-w-[280px]">
        {!showResult && !spinning && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={spin}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-base rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all"
          >
            🎰 Girar!
          </motion.button>
        )}

        {showResult && (
          <>
            {canRetry && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleRetry}
                className="w-full py-2.5 bg-white/20 text-white font-medium rounded-xl hover:bg-white/30 transition-all text-sm"
              >
                🔄 Tentar novamente ({maxAttempts - attempts} restante{maxAttempts - attempts !== 1 ? 's' : ''})
              </motion.button>
            )}
            
            {mustAdvance && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={handleContinue}
                className="w-full py-3 bg-white text-gray-900 font-bold text-base rounded-xl shadow-lg hover:bg-gray-100 transition-all"
              >
                Continuar →
              </motion.button>
            )}
          </>
        )}
      </div>

      {/* Instruction - Compact */}
      {!spinning && !showResult && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-3 text-white/60 text-xs text-center"
        >
          Toque na máquina ou no botão para girar!
        </motion.p>
      )}
    </div>
  );
}
