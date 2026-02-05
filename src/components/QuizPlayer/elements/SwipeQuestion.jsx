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

  const SWIPE_THRESHOLD = 80;
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
    }, 400);
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
    setDragX(-SWIPE_THRESHOLD - 50);
    setTimeout(() => triggerAnswer('left'), 150);
  };

  const handleRightClick = () => {
    if (answered) return;
    setDragX(SWIPE_THRESHOLD + 50);
    setTimeout(() => triggerAnswer('right'), 150);
  };

  // Card transform style
  const getCardStyle = () => {
    if (exitDirection) {
      return {
        transform: `translateX(${exitDirection === 'right' ? '120%' : '-120%'}) rotate(${exitDirection === 'right' ? 25 : -25}deg)`,
        opacity: 0,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      };
    }
    return {
      transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
      transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xs mx-auto select-none">
      {/* Question text */}
      <h3 
        className="text-lg font-bold text-center mb-4 px-2"
        style={{ color: themeColors.text || '#1f2937' }}
      >
        {question}
      </h3>

      {/* Card Container */}
      <div className="relative w-full" style={{ maxWidth: '280px' }}>
        {/* Swipeable Card - Tinder style proportions */}
        <div
          ref={cardRef}
          className="relative w-full rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing"
          style={{
            ...getCardStyle(),
            aspectRatio: '3/4',
            boxShadow: isDragging 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.35)' 
              : '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
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
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-50 flex items-center justify-center">
              <span 
                className="transition-transform duration-200"
                style={{ 
                  fontSize: '6rem',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                  transform: isDragging ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                🎯
              </span>
            </div>
          )}

          {/* NOPE stamp overlay (left swipe) */}
          <div 
            className="absolute top-6 right-4 pointer-events-none"
            style={{ 
              opacity: dragX < -20 ? Math.min(Math.abs(dragX) / 80, 1) : 0,
              transform: `rotate(15deg) scale(${0.8 + swipeProgress * 0.2})`,
              transition: isDragging ? 'none' : 'all 0.2s ease-out',
            }}
          >
            <div 
              className="px-4 py-2 rounded-lg border-4 border-red-500"
              style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
            >
              <span className="text-2xl font-black text-red-500 tracking-wider">
                {leftLabel.toUpperCase()}
              </span>
            </div>
          </div>

          {/* LIKE stamp overlay (right swipe) */}
          <div 
            className="absolute top-6 left-4 pointer-events-none"
            style={{ 
              opacity: dragX > 20 ? Math.min(dragX / 80, 1) : 0,
              transform: `rotate(-15deg) scale(${0.8 + swipeProgress * 0.2})`,
              transition: isDragging ? 'none' : 'all 0.2s ease-out',
            }}
          >
            <div 
              className="px-4 py-2 rounded-lg border-4 border-green-500"
              style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
            >
              <span className="text-2xl font-black text-green-500 tracking-wider">
                {rightLabel.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Subtle drag hint at bottom */}
          {!answered && dragX === 0 && !isDragging && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent p-4 pt-12">
              <div className="flex items-center justify-center gap-2 text-white/90 text-sm">
                <span className="text-lg">👈</span>
                <span className="font-medium">Arraste</span>
                <span className="text-lg">👉</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Tinder style */}
      <div className="flex items-center justify-center gap-6 mt-6">
        {/* Nope Button */}
        <button
          onClick={handleLeftClick}
          disabled={answered}
          className="group relative transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-200 border-2"
            style={{
              backgroundColor: 'white',
              borderColor: dragX < -20 ? '#ef4444' : '#fecaca',
              boxShadow: dragX < -20 
                ? '0 0 20px rgba(239, 68, 68, 0.4)' 
                : '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            {leftIcon}
          </div>
        </button>
        
        {/* Like Button */}
        <button
          onClick={handleRightClick}
          disabled={answered}
          className="group relative transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-200 border-2"
            style={{
              backgroundColor: 'white',
              borderColor: dragX > 20 ? '#22c55e' : '#bbf7d0',
              boxShadow: dragX > 20 
                ? '0 0 20px rgba(34, 197, 94, 0.4)' 
                : '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            {rightIcon}
          </div>
        </button>
      </div>
    </div>
  );
}
