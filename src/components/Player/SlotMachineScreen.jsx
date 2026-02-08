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
  const spinIntervals = useRef([]);

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
        // Set final random emoji
        setSlots(prev => {
          const newSlots = [...prev];
          newSlots[index] = slotEmojis[Math.floor(Math.random() * slotEmojis.length)];
          return newSlots;
        });

        // If this is the last slot to stop
        if (index === 2) {
          // Stop the slot spin sound loop
          clearInterval(slotSoundInterval);
          setTimeout(() => {
            setSpinning(false);
            checkResult();
          }, 100);
        }
      }, spinDurations[index]);
    });
  };

  const checkResult = () => {
    // Wait a tick for final slots state
    setTimeout(() => {
      setSlots(currentSlots => {
        const isJackpot = currentSlots[0] === currentSlots[1] && currentSlots[1] === currentSlots[2];
        const hasPair = currentSlots[0] === currentSlots[1] || 
                        currentSlots[1] === currentSlots[2] || 
                        currentSlots[0] === currentSlots[2];

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
        setShowResult(true);
        return currentSlots;
      });
    }, 50);
  };

  const handleContinue = () => {
    onNext?.();
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: bgColor }}
    >
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold text-white text-center mb-8"
      >
        {title}
      </motion.h1>

      {/* Slot Machine */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        {/* Machine Frame */}
        <div className="bg-gradient-to-b from-yellow-500 via-yellow-600 to-yellow-700 p-6 rounded-3xl shadow-2xl">
          {/* Top decoration */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <div className="bg-red-500 text-white px-6 py-1 rounded-full text-sm font-bold shadow-lg">
              777
            </div>
          </div>

          {/* Slots container */}
          <div className="bg-black/90 rounded-2xl p-4 flex gap-2">
            {slots.map((emoji, index) => (
              <motion.div
                key={index}
                className="w-20 h-24 md:w-24 md:h-28 bg-white rounded-xl flex items-center justify-center overflow-hidden"
                animate={spinning ? { 
                  y: [0, -5, 0, 5, 0],
                } : {}}
                transition={{ 
                  repeat: spinning ? Infinity : 0, 
                  duration: 0.1,
                }}
              >
                <span 
                  className="text-5xl md:text-6xl"
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

          {/* Decorative lights */}
          <div className="flex justify-center gap-2 mt-3">
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full"
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

        {/* Lever */}
        <motion.button
          onClick={spin}
          disabled={spinning}
          className="absolute -right-8 top-1/2 -translate-y-1/2 cursor-pointer disabled:cursor-not-allowed"
          whileHover={!spinning ? { scale: 1.1 } : {}}
          whileTap={!spinning ? { scale: 0.95 } : {}}
        >
          <div className="relative">
            {/* Lever base */}
            <div className="w-6 h-32 bg-gradient-to-b from-gray-600 to-gray-800 rounded-full" />
            {/* Lever ball */}
            <motion.div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-lg border-4 border-red-400"
              animate={spinning ? { y: [0, 40, 0] } : {}}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.button>
      </motion.div>

      {/* Result */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={`mt-8 px-8 py-4 rounded-2xl text-center ${
              result.type === 'jackpot' 
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' 
                : result.type === 'pair'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-700 text-white'
            }`}
          >
            <p className="text-2xl font-bold">{result.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
        {!showResult && !spinning && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={spin}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all"
          >
            🎰 Girar!
          </motion.button>
        )}

        {showResult && (
          <>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={spin}
              className="w-full py-3 bg-white/20 text-white font-medium rounded-xl hover:bg-white/30 transition-all"
            >
              🔄 Tentar novamente
            </motion.button>
            
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={handleContinue}
              className="w-full py-4 bg-white text-gray-900 font-bold text-lg rounded-xl shadow-lg hover:bg-gray-100 transition-all"
            >
              Continuar →
            </motion.button>
          </>
        )}
      </div>

      {/* Instruction */}
      {!spinning && !showResult && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-white/60 text-sm text-center"
        >
          Clique na alavanca ou no botão para girar!
        </motion.p>
      )}
    </div>
  );
}
