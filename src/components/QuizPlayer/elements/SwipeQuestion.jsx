'use client';

import { useState, useRef } from 'react';

/**
 * Interactive Swipe/Tinder-style Question component.
 * Premium 3D design with smooth animations, stacked cards, and tactile buttons.
 * 
 * Design System v2.0 - QuizMeBaby
 */
export default function SwipeQuestion({
  element,
  onAnswer,
  themeColors = {},
}) {
  const {
    question = 'Você gosta disso?',
    image = '',
    leftLabel = 'Nope',
    rightLabel = 'Like',
    leftIcon = '👎',
    rightIcon = '👍',
    leftScore = 0,
    rightScore = 1,
  } = element;

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState(null);
  const [answered, setAnswered] = useState(false);
  const cardRef = useRef(null);
  const startX = useRef(0);

  const SWIPE_THRESHOLD = 100;
  const MAX_ROTATION = 15;

  // Calculate rotation based on drag
  const rotation = Math.min(Math.max((dragX / SWIPE_THRESHOLD) * MAX_ROTATION, -MAX_ROTATION), MAX_ROTATION);
  const swipeProgress = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1);

  // Handle mouse/touch start
  const handleStart = (clientX) => {
    if (answered) return;
    setIsDragging(true);
    startX.current = clientX;
  };

  // Handle mouse/touch move
  const handleMove = (clientX) => {
    if (!isDragging || answered) return;
    const diff = clientX - startX.current;
    setDragX(diff);
  };

  // Handle mouse/touch end
  const handleEnd = () => {
    if (!isDragging || answered) return;
    setIsDragging(false);

    if (dragX > SWIPE_THRESHOLD) {
      triggerAnswer('right');
    } else if (dragX < -SWIPE_THRESHOLD) {
      triggerAnswer('left');
    } else {
      setDragX(0);
    }
  };

  const triggerAnswer = (direction) => {
    setAnswered(true);
    setExitDirection(direction);
    
    setTimeout(() => {
      const score = direction === 'right' ? rightScore : leftScore;
      const label = direction === 'right' ? rightLabel : leftLabel;
      onAnswer?.({
        elementId: element.id,
        type: 'question-swipe',
        answer: direction,
        answerLabel: label,
        score: score,
      });
    }, 500);
  };

  // Mouse events
  const onMouseDown = (e) => handleStart(e.clientX);
  const onMouseMove = (e) => handleMove(e.clientX);
  const onMouseUp = () => handleEnd();
  const onMouseLeave = () => {
    if (isDragging) handleEnd();
  };

  // Touch events
  const onTouchStart = (e) => handleStart(e.touches[0].clientX);
  const onTouchMove = (e) => handleMove(e.touches[0].clientX);
  const onTouchEnd = () => handleEnd();

  // Button clicks
  const handleLeftClick = () => {
    if (answered) return;
    setDragX(-SWIPE_THRESHOLD - 80);
    setTimeout(() => triggerAnswer('left'), 200);
  };

  const handleRightClick = () => {
    if (answered) return;
    setDragX(SWIPE_THRESHOLD + 80);
    setTimeout(() => triggerAnswer('right'), 200);
  };

  // Card transform style
  const getCardStyle = () => {
    if (exitDirection) {
      return {
        transform: `translateX(${exitDirection === 'right' ? '150%' : '-150%'}) rotate(${exitDirection === 'right' ? 35 : -35}deg)`,
        opacity: 0,
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      };
    }
    return {
      transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
      transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  };

  // Dynamic colors based on swipe direction
  const getSwipeIndicatorOpacity = (direction) => {
    if (direction === 'left' && dragX < -20) {
      return Math.min(Math.abs(dragX) / 100, 1);
    }
    if (direction === 'right' && dragX > 20) {
      return Math.min(dragX / 100, 1);
    }
    return 0;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none py-4">
      {/* Question text */}
      <h3 
        className="text-2xl font-bold text-center mb-8 px-4 leading-tight font-display"
        style={{ color: '#1e293b' }}
      >
        {question}
      </h3>

      {/* Card Container */}
      <div className="relative w-full px-4" style={{ maxWidth: '340px' }}>
        {/* Background cards for premium stack effect */}
        <div 
          className="absolute inset-x-6 -bottom-3 h-full rounded-3xl -z-20"
          style={{ 
            transform: 'scale(0.92)',
            background: 'rgba(255,255,255,0.4)',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
          }}
        />
        <div 
          className="absolute inset-x-4 -bottom-1.5 h-full rounded-3xl -z-10"
          style={{ 
            transform: 'scale(0.96)',
            background: 'rgba(255,255,255,0.6)',
            boxShadow: '0 8px 20px -5px rgba(0,0,0,0.08)',
          }}
        />

        {/* Main Swipeable Card */}
        <div
          ref={cardRef}
          className="relative w-full rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing bg-white"
          style={{
            ...getCardStyle(),
            aspectRatio: '3/4',
            boxShadow: isDragging 
              ? '0 35px 70px -15px rgba(0, 0, 0, 0.35), 0 15px 30px -10px rgba(0,0,0,0.2)' 
              : '0 25px 60px -15px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0,0,0,0.1)',
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Card Background */}
          {image ? (
            <img
              src={image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
              <div 
                className="transition-all duration-300"
                style={{ 
                  fontSize: '7rem',
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))',
                  transform: isDragging ? 'scale(1.15) rotate(-8deg)' : 'scale(1)',
                }}
              >
                🎯
              </div>
            </div>
          )}

          {/* Left swipe overlay (NOPE) */}
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-200"
            style={{ 
              opacity: getSwipeIndicatorOpacity('left'),
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.35) 0%, transparent 60%)',
            }}
          />

          {/* Right swipe overlay (LIKE) */}
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-200"
            style={{ 
              opacity: getSwipeIndicatorOpacity('right'),
              background: 'linear-gradient(225deg, rgba(16, 185, 129, 0.35) 0%, transparent 60%)',
            }}
          />

          {/* NOPE stamp (left swipe) */}
          <div 
            className="absolute top-8 right-6 pointer-events-none"
            style={{ 
              opacity: getSwipeIndicatorOpacity('left'),
              transform: `rotate(20deg) scale(${0.8 + swipeProgress * 0.3})`,
              transition: isDragging ? 'none' : 'all 0.2s ease-out',
            }}
          >
            <div 
              className="px-6 py-3 rounded-xl bg-white/95 shadow-xl"
              style={{
                border: '4px solid #ef4444',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
              }}
            >
              <span className="text-3xl font-black text-rose-500 tracking-wider font-display">
                {leftLabel.toUpperCase()}
              </span>
            </div>
          </div>

          {/* LIKE stamp (right swipe) */}
          <div 
            className="absolute top-8 left-6 pointer-events-none"
            style={{ 
              opacity: getSwipeIndicatorOpacity('right'),
              transform: `rotate(-20deg) scale(${0.8 + swipeProgress * 0.3})`,
              transition: isDragging ? 'none' : 'all 0.2s ease-out',
            }}
          >
            <div 
              className="px-6 py-3 rounded-xl bg-white/95 shadow-xl"
              style={{
                border: '4px solid #10b981',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
              }}
            >
              <span className="text-3xl font-black text-emerald-500 tracking-wider font-display">
                {rightLabel.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Bottom hint overlay */}
          {!answered && dragX === 0 && !isDragging && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-6 pt-20">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-3 text-white/90 text-base font-semibold bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full">
                  <span style={{ animation: 'bounce-horizontal 1.5s ease-in-out infinite' }}>👈</span>
                  <span>Arraste para escolher</span>
                  <span style={{ animation: 'bounce-horizontal 1.5s ease-in-out infinite reverse' }}>👉</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - 3D Tactile Design */}
      <div className="flex items-center justify-center gap-10 mt-10">
        {/* Nope Button */}
        <button
          onClick={handleLeftClick}
          disabled={answered}
          className="group relative transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ transform: answered ? 'scale(1)' : 'scale(1)' }}
          onMouseEnter={(e) => !answered && (e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)')}
          onMouseLeave={(e) => !answered && (e.currentTarget.style.transform = 'scale(1)')}
          onMouseDown={(e) => !answered && (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={(e) => !answered && (e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)')}
        >
          <div 
            className="flex items-center justify-center text-4xl transition-all duration-200"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: dragX < -20 ? '#fee2e2' : 'white',
              border: `4px solid ${dragX < -20 ? '#ef4444' : '#fecaca'}`,
              boxShadow: dragX < -20 
                ? '0 0 35px rgba(239, 68, 68, 0.5), 0 8px 0 #f87171, 0 12px 20px rgba(0,0,0,0.15)' 
                : '0 6px 0 #fecaca, 0 10px 20px rgba(0,0,0,0.1)',
              transform: dragX < -20 ? 'translateY(2px)' : 'translateY(0)',
            }}
          >
            <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>{leftIcon}</span>
          </div>
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-bold text-gray-500 whitespace-nowrap uppercase tracking-wide">
            {leftLabel}
          </span>
        </button>
        
        {/* Like Button */}
        <button
          onClick={handleRightClick}
          disabled={answered}
          className="group relative transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          onMouseEnter={(e) => !answered && (e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)')}
          onMouseLeave={(e) => !answered && (e.currentTarget.style.transform = 'scale(1)')}
          onMouseDown={(e) => !answered && (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={(e) => !answered && (e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)')}
        >
          <div 
            className="flex items-center justify-center text-4xl transition-all duration-200"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: dragX > 20 ? '#dcfce7' : 'white',
              border: `4px solid ${dragX > 20 ? '#10b981' : '#bbf7d0'}`,
              boxShadow: dragX > 20 
                ? '0 0 35px rgba(16, 185, 129, 0.5), 0 8px 0 #34d399, 0 12px 20px rgba(0,0,0,0.15)' 
                : '0 6px 0 #bbf7d0, 0 10px 20px rgba(0,0,0,0.1)',
              transform: dragX > 20 ? 'translateY(2px)' : 'translateY(0)',
            }}
          >
            <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>{rightIcon}</span>
          </div>
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-bold text-gray-500 whitespace-nowrap uppercase tracking-wide">
            {rightLabel}
          </span>
        </button>
      </div>

      <style jsx>{`
        @keyframes bounce-horizontal {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-4px); }
        }
      `}</style>
    </div>
  );
}
