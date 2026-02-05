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
  const rotation = (dragX / SWIPE_THRESHOLD) * MAX_ROTATION;
  const opacity = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1);

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
    }, 300);
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
    setTimeout(() => triggerAnswer('left'), 100);
  };

  const handleRightClick = () => {
    if (answered) return;
    setDragX(SWIPE_THRESHOLD + 50);
    setTimeout(() => triggerAnswer('right'), 100);
  };

  // Exit animation styles
  const getExitStyle = () => {
    if (!exitDirection) return {};
    return {
      transform: `translateX(${exitDirection === 'right' ? '150%' : '-150%'}) rotate(${exitDirection === 'right' ? 30 : -30}deg)`,
      opacity: 0,
      transition: 'all 0.3s ease-out',
    };
  };

  const cardStyle = exitDirection
    ? getExitStyle()
    : {
        transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
      };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none px-2">
      {/* Question text */}
      <h3 
        className="text-xl font-bold text-center mb-5"
        style={{ color: themeColors.text || '#1f2937' }}
      >
        {question}
      </h3>

      {/* Swipeable Card - Larger, cleaner */}
      <div
        ref={cardRef}
        className="relative w-full rounded-2xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing bg-white"
        style={{
          ...cardStyle,
          aspectRatio: '4/5',
          maxWidth: '320px',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Image - Full card */}
        {image ? (
          <div className="absolute inset-0">
            <img
              src={image}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-indigo-50 to-purple-100 flex items-center justify-center">
            <span className="text-8xl opacity-50">🎯</span>
          </div>
        )}

        {/* Swipe direction overlays with labels */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-red-500/50 to-transparent flex items-center justify-start pl-6 transition-opacity duration-150"
          style={{ opacity: dragX < -30 ? Math.min(Math.abs(dragX) / 120, 0.8) : 0 }}
        >
          <div className="bg-white/95 rounded-2xl px-5 py-3 shadow-lg transform -rotate-12">
            <span className="text-3xl block text-center mb-1">{leftIcon}</span>
            <span className="font-bold text-red-500 text-sm">{leftLabel}</span>
          </div>
        </div>
        <div 
          className="absolute inset-0 bg-gradient-to-l from-green-500/50 to-transparent flex items-center justify-end pr-6 transition-opacity duration-150"
          style={{ opacity: dragX > 30 ? Math.min(dragX / 120, 0.8) : 0 }}
        >
          <div className="bg-white/95 rounded-2xl px-5 py-3 shadow-lg transform rotate-12">
            <span className="text-3xl block text-center mb-1">{rightIcon}</span>
            <span className="font-bold text-green-500 text-sm">{rightLabel}</span>
          </div>
        </div>

        {/* Drag hint - Bottom of card */}
        {!answered && dragX === 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="text-center text-white text-sm font-medium animate-pulse">
              ← Arraste para escolher →
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons - Single row with labels inside */}
      <div className="flex items-center justify-center gap-8 mt-6">
        <button
          onClick={handleLeftClick}
          disabled={answered}
          className="flex flex-col items-center gap-1 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-16 h-16 rounded-full bg-white border-3 border-red-300 hover:border-red-500 hover:bg-red-50 flex items-center justify-center text-3xl shadow-lg transition-colors">
            {leftIcon}
          </div>
          <span className="text-xs font-semibold text-red-500">{leftLabel}</span>
        </button>
        
        <button
          onClick={handleRightClick}
          disabled={answered}
          className="flex flex-col items-center gap-1 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-16 h-16 rounded-full bg-white border-3 border-green-300 hover:border-green-500 hover:bg-green-50 flex items-center justify-center text-3xl shadow-lg transition-colors">
            {rightIcon}
          </div>
          <span className="text-xs font-semibold text-green-500">{rightLabel}</span>
        </button>
      </div>
    </div>
  );
}
