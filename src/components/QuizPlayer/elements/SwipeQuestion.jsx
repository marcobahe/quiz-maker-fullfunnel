'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

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
      // Swiped right - Like
      triggerAnswer('right');
    } else if (dragX < -SWIPE_THRESHOLD) {
      // Swiped left - Nope
      triggerAnswer('left');
    } else {
      // Return to center
      setDragX(0);
    }
  };

  const triggerAnswer = (direction) => {
    setAnswered(true);
    setExitDirection(direction);
    
    // Animate card off screen
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
    <div className="flex flex-col items-center w-full max-w-md mx-auto select-none">
      {/* Question text */}
      <h3 
        className="text-xl font-semibold text-center mb-6 px-4"
        style={{ color: themeColors.text || '#1f2937' }}
      >
        {question}
      </h3>

      {/* Swipe indicators */}
      <div className="relative w-full flex justify-between items-center px-4 mb-4">
        {/* Left indicator */}
        <div 
          className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200"
          style={{
            backgroundColor: dragX < -30 ? '#fee2e2' : 'transparent',
            opacity: dragX < 0 ? opacity : 0.3,
            transform: `scale(${dragX < -30 ? 1.1 : 1})`,
          }}
        >
          <span className="text-2xl">{leftIcon}</span>
          <span className="font-semibold text-red-500">{leftLabel}</span>
        </div>

        {/* Right indicator */}
        <div 
          className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200"
          style={{
            backgroundColor: dragX > 30 ? '#dcfce7' : 'transparent',
            opacity: dragX > 0 ? opacity : 0.3,
            transform: `scale(${dragX > 30 ? 1.1 : 1})`,
          }}
        >
          <span className="font-semibold text-green-500">{rightLabel}</span>
          <span className="text-2xl">{rightIcon}</span>
        </div>
      </div>

      {/* Swipeable Card */}
      <div
        ref={cardRef}
        className="relative w-full aspect-[3/4] max-w-xs rounded-2xl overflow-hidden shadow-xl cursor-grab active:cursor-grabbing bg-white"
        style={cardStyle}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Image */}
        {image ? (
          <div className="absolute inset-0">
            <img
              src={image}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
            <span className="text-6xl">🎯</span>
          </div>
        )}

        {/* Swipe direction overlays */}
        <div 
          className="absolute inset-0 bg-red-500/30 flex items-center justify-center transition-opacity duration-150"
          style={{ opacity: dragX < -30 ? Math.min(Math.abs(dragX) / 150, 0.5) : 0 }}
        >
          <span className="text-6xl transform -rotate-12">{leftIcon}</span>
        </div>
        <div 
          className="absolute inset-0 bg-green-500/30 flex items-center justify-center transition-opacity duration-150"
          style={{ opacity: dragX > 30 ? Math.min(dragX / 150, 0.5) : 0 }}
        >
          <span className="text-6xl transform rotate-12">{rightIcon}</span>
        </div>

        {/* Drag hint */}
        {!answered && dragX === 0 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-600 animate-pulse">
              ← Arraste para escolher →
            </div>
          </div>
        )}
      </div>

      {/* Button alternatives */}
      <div className="flex items-center gap-6 mt-6">
        <button
          onClick={handleLeftClick}
          disabled={answered}
          className="w-14 h-14 rounded-full bg-white border-2 border-red-200 hover:border-red-400 hover:bg-red-50 flex items-center justify-center text-2xl shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {leftIcon}
        </button>
        
        <button
          onClick={handleRightClick}
          disabled={answered}
          className="w-14 h-14 rounded-full bg-white border-2 border-green-200 hover:border-green-400 hover:bg-green-50 flex items-center justify-center text-2xl shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {rightIcon}
        </button>
      </div>

      {/* Custom button labels below */}
      <div className="flex items-center justify-between w-40 mt-2">
        <span className="text-xs text-gray-400">{leftLabel}</span>
        <span className="text-xs text-gray-400">{rightLabel}</span>
      </div>
    </div>
  );
}
