'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

export default function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, openUp: false });
  const buttonRef = useRef(null);
  const pickerRef = useRef(null);

  // Calculate position when opening
  useEffect(() => {
    if (!open || !buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const pickerHeight = 435; // approximate height of emoji picker
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < pickerHeight && rect.top > pickerHeight;
    
    setPosition({
      top: openUp ? rect.top - pickerHeight - 8 : rect.bottom + 4,
      left: Math.max(8, rect.left - 100), // center-ish but don't go off screen
      openUp,
    });
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        pickerRef.current && !pickerRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on scroll
  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    window.addEventListener('scroll', handler, true);
    return () => window.removeEventListener('scroll', handler, true);
  }, [open]);

  const handleEmojiSelect = (emoji) => {
    onChange(emoji.native);
    setOpen(false);
  };

  const handleRemove = () => {
    onChange('');
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-2xl text-center hover:border-accent/40 focus:ring-1 focus:ring-accent transition-colors cursor-pointer"
        title={value ? "Clique para trocar ou remover emoji" : "Escolher emoji"}
      >
        {value || '⭐'}
      </button>
      
      {open && typeof window !== 'undefined' && createPortal(
        <div
          ref={pickerRef}
          className="fixed z-[9999]"
          style={{ top: position.top, left: position.left }}
        >
          <div className={`bg-white rounded-lg shadow-2xl border border-gray-200 ${position.openUp ? 'flex flex-col-reverse' : ''}`}>
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              locale="pt"
              theme="light"
              previewPosition="none"
              skinTonePosition="search"
              perLine={8}
              maxFrequentRows={2}
            />
            
            {/* Remove emoji option */}
            {value && (
              <div className={`bg-white p-2 ${position.openUp ? 'border-b rounded-t-lg' : 'border-t rounded-b-lg'} border-gray-200`}>
                <button
                  onClick={handleRemove}
                  className="w-full flex items-center justify-center gap-2 py-1.5 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  ❌ Remover emoji
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
