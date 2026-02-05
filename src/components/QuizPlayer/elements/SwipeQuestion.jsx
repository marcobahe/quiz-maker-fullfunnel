'use client';

import { useState, useRef } from 'react';

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
  const MAX_ROTATION = 12;

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
        transform: `translateX(${exitDirection === 'right' ? '150%' : '-150%'}) rotate(${exitDirection === 'right' ? 30 : -30}deg)`,
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
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none py-2">
      {/* Question text - larger and bolder */}
      <h3 
        className="text-2xl font-bold text-center mb-6 px-4 leading-tight"
        style={{ color: '#1e293b' }}
      >
        {question}
      </h3>

      {/* Card Container with proper spacing */}
      <div className="relative w-full px-4" style={{ maxWidth: '340px' }}>
        {/* Background cards for stack effect */}
        <div 
          className="absolute inset-x-6 -bottom-2 h-full rounded-3xl bg-gray-200/50 -z-10"
          style={{ transform: 'scale(0.95)' }}
        />
        <div 
          className="absolute inset-x-4 -bottom-1 h-full rounded-3xl bg-gray-200/30 -z-20"
          style={{ transform: 'scale(0.9)' }}
        />

        {/* Main Swipeable Card */}
        <div
          ref={cardRef}
          className="relative w-full rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing"
          style={{
            ...getCardStyle(),
            aspectRatio: '3/4',
            boxShadow: isDragging 
              ? '0 30px 60px -12px rgba(0, 0, 0, 0.4)' 
              : '0 20px 50px -12px rgba(0, 0, 0, 0.25)',
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
            <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 flex items-center justify-center">
              <div 
                className="transition-transform duration-300"
                style={{ 
                  fontSize: '8rem',
                  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))',
                  transform: isDragging ? 'scale(1.1) rotate(-5deg)' : 'scale(1)',
                }}
              >
                🎯
              </div>
            </div>
          )}

          {/* Left swipe overlay (NOPE) */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-rose-500/30 to-transparent pointer-events-none transition-opacity"
            style={{ opacity: getSwipeIndicatorOpacity('left') }}
          />

          {/* Right swipe overlay (LIKE) */}
          <div 
            className="absolute inset-0 bg-gradient-to-l from-emerald-500/30 to-transparent pointer-events-none transition-opacity"
            style={{ opacity: getSwipeIndicatorOpacity('right') }}
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
            <div className="px-6 py-3 rounded-xl border-4 border-rose-500 bg-white/95 shadow-lg">
              <span className="text-3xl font-black text-rose-500 tracking-wider">
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
            <div className="px-6 py-3 rounded-xl border-4 border-emerald-500 bg-white/95 shadow-lg">
              <span className="text-3xl font-black text-emerald-500 tracking-wider">
                {rightLabel.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Bottom gradient for hint */}
          {!answered && dragX === 0 && !isDragging && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-6 pt-16">
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-2 text-white/90 text-base font-medium bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="animate-pulse">👈</span>
                  <span>Arraste para escolher</span>
                  <span className="animate-pulse">👉</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Larger and more prominent */}
      <div className="flex items-center justify-center gap-8 mt-8">
        {/* Nope Button */}
        <button
          onClick={handleLeftClick}
          disabled={answered}
          className="group relative transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <div 
            className="w-18 h-18 rounded-full flex items-center justify-center text-3xl transition-all duration-200 border-3 shadow-lg"
            style={{
              width: '72px',
              height: '72px',
              backgroundColor: dragX < -20 ? '#fee2e2' : 'white',
              borderColor: dragX < -20 ? '#ef4444' : '#fecaca',
              borderWidth: '3px',
              boxShadow: dragX < -20 
                ? '0 0 30px rgba(239, 68, 68, 0.5), 0 8px 24px rgba(0,0,0,0.15)' 
                : '0 8px 24px rgba(0,0,0,0.12)',
            }}
          >
            <span style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))' }}>{leftIcon}</span>
          </div>
          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-sm font-semibold text-gray-500 whitespace-nowrap">
            {leftLabel}
          </span>
        </button>
        
        {/* Like Button */}
        <button
          onClick={handleRightClick}
          disabled={answered}
          className="group relative transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <div 
            className="w-18 h-18 rounded-full flex items-center justify-center text-3xl transition-all duration-200 border-3 shadow-lg"
            style={{
              width: '72px',
              height: '72px',
              backgroundColor: dragX > 20 ? '#dcfce7' : 'white',
              borderColor: dragX > 20 ? '#22c55e' : '#bbf7d0',
              borderWidth: '3px',
              boxShadow: dragX > 20 
                ? '0 0 30px rgba(34, 197, 94, 0.5), 0 8px 24px rgba(0,0,0,0.15)' 
                : '0 8px 24px rgba(0,0,0,0.12)',
            }}
          >
            <span style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))' }}>{rightIcon}</span>
          </div>
          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-sm font-semibold text-gray-500 whitespace-nowrap">
            {rightLabel}
          </span>
        </button>
      </div>
    </div>
  );
}
