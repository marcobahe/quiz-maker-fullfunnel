'use client';

import { useState, useRef, useEffect } from 'react';

const EMOJI_CATEGORIES = {
  'Pessoas': ['😀','😃','😄','😁','😅','😂','🤣','😊','😇','🙂','😉','😍','🥰','😘','😋','😛','😜','🤪','😎','🤩','🥳','😏','😒','😞','😢','😭','😤','🤯','😱','🤔','🤫','🤭','🙄','😴','🤮','🤑','😈','👻','💀','👽','🤖','💩','🙈','🙉','🙊'],
  'Gestos': ['👍','👎','👏','🙌','🤝','✌️','🤞','🤟','🤘','👊','✊','👋','🖐️','✋','👆','👇','👈','👉','🫵','☝️','💪','🙏','🤲','👐'],
  'Pessoas 2': ['🙎🏻','🙎🏻‍♀️','🧑','👨','👩','👶','👴','👵','🧔','👱','👱‍♀️','🤴','👸','🦸','🦹','🧙','🧑‍💼','👨‍💻','👩‍💻','🧑‍🎓'],
  'Símbolos': ['✅','❌','⭐','🌟','💫','✨','❤️','🧡','💛','💚','💙','💜','🖤','🤍','💯','🔥','💥','💢','💤','💬','👁️','🎯','🏆','🎖️','🥇','🥈','🥉','🏅'],
  'Objetos': ['📱','💻','⌨️','🖥️','📧','📞','📸','🎥','🎬','🎵','🎶','🎮','🕹️','🎲','🃏','💰','💵','💳','📊','📈','📉','🔑','🔒','🔔','📌','📎','✏️','📝'],
  'Natureza': ['☀️','🌙','⭐','🌈','☁️','⛈️','❄️','🔥','💧','🌊','🌸','🌺','🌻','🍀','🌿','🌲','🍎','🍊','🍋','🍇','🍕','🍔','☕','🍺'],
  'Transporte': ['🚗','🚕','🚙','🏎️','🚌','🚎','🏍️','✈️','🚀','🛸','🚁','⛵','🚢','🚂','🏠','🏢','🏥','🏫','🏪','🏭'],
};

export default function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('Pessoas');
  const pickerRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleEmojiSelect = (emoji) => {
    // If the same emoji is clicked again, clear it (remove emoji feature)
    if (value === emoji) {
      onChange('');
    } else {
      onChange(emoji);
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-2xl text-center hover:border-accent/40 focus:ring-1 focus:ring-accent transition-colors cursor-pointer"
        title={value ? "Clique para trocar ou clique no mesmo emoji para remover" : "Escolher emoji"}
      >
        {value || '⭐'}
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-64 -translate-x-1/4">
          {/* Category tabs */}
          <div className="flex gap-0.5 p-1.5 border-b border-gray-100 overflow-x-auto">
            {Object.keys(EMOJI_CATEGORIES).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-[10px] px-1.5 py-1 rounded whitespace-nowrap transition-colors ${
                  category === cat ? 'bg-accent text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Emoji grid */}
          <div className="grid grid-cols-8 gap-0.5 p-2 max-h-40 overflow-y-auto">
            {EMOJI_CATEGORIES[category].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                className="w-7 h-7 flex items-center justify-center text-lg hover:bg-accent/10 rounded transition-colors"
                title={emoji === value ? "Clique novamente para remover" : "Selecionar emoji"}
              >
                {emoji}
              </button>
            ))}
          </div>
          {/* Remove emoji option */}
          {value && (
            <div className="border-t border-gray-100 p-2">
              <button
                onClick={() => { onChange(''); setOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
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