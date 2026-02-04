'use client';

import { useState, useEffect, useRef } from 'react';

export default function QuestionTimer({ 
  seconds = 30, 
  onTimeout, 
  isActive = true,
  className = "",
  size = 50 
}) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const intervalRef = useRef(null);
  const onTimeoutRef = useRef(onTimeout);

  // Atualizar ref quando onTimeout muda
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  // Reset timer quando seconds muda
  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  // Timer logic
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Timer acabou
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          
          // Chamar callback após um pequeno delay
          setTimeout(() => {
            if (onTimeoutRef.current) {
              onTimeoutRef.current();
            }
          }, 100);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, seconds]);

  // Calcular progresso e cor
  const progress = (timeLeft / seconds) * 100;
  const circumference = 2 * Math.PI * (size / 2 - 4); // raio = size/2 - 4 (para dar espaço da borda)
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Determinar cor baseado no progresso
  let color = '#22c55e'; // Verde
  if (progress < 50) color = '#eab308'; // Amarelo
  if (progress < 25) color = '#ef4444'; // Vermelho

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* SVG Timer Circle */}
      <svg 
        width={size} 
        height={size} 
        className="transform -rotate-90"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 4}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="3"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 4}
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease',
          }}
        />
      </svg>

      {/* Timer number */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          fontSize: size * 0.3, // tamanho relativo ao círculo
          fontWeight: 'bold',
          color: '#ffffff',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        {timeLeft}
      </div>
    </div>
  );
}