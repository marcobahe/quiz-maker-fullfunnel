'use client';

import { useState, useRef, useEffect } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

export default function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-2xl text-center hover:border-accent/40 focus:ring-1 focus:ring-accent transition-colors cursor-pointer"
        title={value ? "Clique para trocar ou remover emoji" : "Escolher emoji"}
      >
        {value || '⭐'}
      </button>
      
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50" style={{ transform: 'translateX(-50%)' }}>
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
            <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg p-2 shadow-lg">
              <button
                onClick={handleRemove}
                className="w-full flex items-center justify-center gap-2 py-1.5 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              >
                ❌ Remover emoji
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
