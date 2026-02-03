'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FONT_FAMILIES = [
  'Inter', 'Roboto', 'Poppins', 'Montserrat', 'Open Sans',
  'Lato', 'Nunito', 'Playfair Display', 'Oswald', 'Raleway',
  'Source Sans Pro', 'PT Sans', 'Ubuntu', 'Merriweather', 'Quicksand'
];

const FONT_WEIGHTS = [
  { value: '400', label: '400 Normal' },
  { value: '500', label: '500 Medium' },
  { value: '600', label: '600 Semibold' },
  { value: '700', label: '700 Bold' },
  { value: '800', label: '800 Extra Bold' }
];

export default function StyleEditor({ 
  style = {}, 
  onChange, 
  showWidth = false,
  showLineHeight = false,
  showHoverColor = false,
  showPadding = false
}) {
  const [expanded, setExpanded] = useState(true);

  const updateStyle = (updates) => {
    onChange({ ...style, ...updates });
  };

  if (!expanded) {
    return (
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">Estilo</span>
          <ChevronDown size={14} className="text-gray-400 transform rotate-180" />
        </button>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setExpanded(false)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-200"
      >
        <span className="text-sm font-medium text-gray-700">Estilo</span>
        <ChevronDown size={14} className="text-gray-400" />
      </button>
      
      <div className="p-3 space-y-3">
        {/* Font Family */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Fonte</label>
          <select
            value={style.fontFamily || 'Inter'}
            onChange={(e) => updateStyle({ fontFamily: e.target.value })}
            className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-accent focus:border-transparent bg-white"
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Font Size */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tamanho</label>
            <input
              type="number"
              value={style.fontSize || 16}
              onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) || 16 })}
              className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-accent focus:border-transparent"
              min={showLineHeight ? "10" : "12"}
              max={showLineHeight ? "72" : "48"}
            />
          </div>

          {/* Font Weight */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Peso</label>
            <select
              value={style.fontWeight || '400'}
              onChange={(e) => updateStyle({ fontWeight: e.target.value })}
              className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-accent focus:border-transparent bg-white"
            >
              {FONT_WEIGHTS.map((weight) => (
                <option key={weight.value} value={weight.value}>{weight.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Font Style Toggles (only for text, not button) */}
        {showLineHeight && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Formatação</label>
            <div className="flex gap-1">
              <button
                onClick={() => updateStyle({ 
                  fontWeight: style.fontWeight === '700' ? '400' : '700' 
                })}
                className={`px-3 py-2 text-xs font-bold border rounded transition-colors ${
                  style.fontWeight === '700' || style.fontWeight === '800'
                    ? 'bg-accent text-white border-accent'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-accent/40'
                }`}
              >
                B
              </button>
              <button
                onClick={() => updateStyle({ 
                  fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic' 
                })}
                className={`px-3 py-2 text-xs italic border rounded transition-colors ${
                  style.fontStyle === 'italic'
                    ? 'bg-accent text-white border-accent'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-accent/40'
                }`}
              >
                I
              </button>
              <button
                onClick={() => updateStyle({ 
                  textDecoration: style.textDecoration === 'underline' ? 'none' : 'underline' 
                })}
                className={`px-3 py-2 text-xs underline border rounded transition-colors ${
                  style.textDecoration === 'underline'
                    ? 'bg-accent text-white border-accent'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-accent/40'
                }`}
              >
                U
              </button>
            </div>
          </div>
        )}

        {/* Color pickers */}
        <div className="grid grid-cols-2 gap-2">
          {/* Text Color */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Cor do texto</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.textColor || '#374151'}
                onChange={(e) => updateStyle({ textColor: e.target.value })}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={style.textColor || '#374151'}
                onChange={(e) => updateStyle({ textColor: e.target.value })}
                className="flex-1 p-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-accent focus:border-transparent font-mono"
                placeholder="#374151"
              />
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Cor de fundo</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.backgroundColor || '#ffffff'}
                onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={style.backgroundColor || (showLineHeight ? 'transparent' : '#7c3aed')}
                onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                className="flex-1 p-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-accent focus:border-transparent font-mono"
                placeholder={showLineHeight ? 'transparent' : '#7c3aed'}
              />
            </div>
          </div>
        </div>

        {/* Hover Color (only for buttons) */}
        {showHoverColor && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Cor hover</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.hoverBackgroundColor || '#6d28d9'}
                onChange={(e) => updateStyle({ hoverBackgroundColor: e.target.value })}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={style.hoverBackgroundColor || '#6d28d9'}
                onChange={(e) => updateStyle({ hoverBackgroundColor: e.target.value })}
                className="flex-1 p-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-accent focus:border-transparent font-mono"
                placeholder="#6d28d9"
              />
            </div>
          </div>
        )}

        {/* Border (only for buttons) */}
        {showPadding && (
          <>
            <div className="grid grid-cols-2 gap-2">
              {/* Border Color */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cor da borda</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={style.borderColor || 'transparent'}
                    onChange={(e) => updateStyle({ borderColor: e.target.value })}
                    className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={style.borderColor || 'transparent'}
                    onChange={(e) => updateStyle({ borderColor: e.target.value })}
                    className="flex-1 p-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-accent focus:border-transparent font-mono"
                    placeholder="transparent"
                  />
                </div>
              </div>

              {/* Border Width */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Espessura</label>
                <input
                  type="number"
                  value={style.borderWidth || 0}
                  onChange={(e) => updateStyle({ borderWidth: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-accent focus:border-transparent"
                  min="0"
                  max="5"
                />
              </div>
            </div>

            {/* Border Radius */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Border radius</label>
              <input
                type="number"
                value={style.borderRadius || 8}
                onChange={(e) => updateStyle({ borderRadius: parseInt(e.target.value) || 8 })}
                className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-accent focus:border-transparent"
                min="0"
                max="50"
              />
            </div>

            {/* Padding */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Padding X</label>
                <input
                  type="number"
                  value={style.paddingX || 24}
                  onChange={(e) => updateStyle({ paddingX: parseInt(e.target.value) || 24 })}
                  className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-accent focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Padding Y</label>
                <input
                  type="number"
                  value={style.paddingY || 12}
                  onChange={(e) => updateStyle({ paddingY: parseInt(e.target.value) || 12 })}
                  className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-accent focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
          </>
        )}

        {/* Width (only for buttons) */}
        {showWidth && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Largura</label>
            <div className="flex gap-1">
              <button
                onClick={() => updateStyle({ width: 'full' })}
                className={`flex-1 py-2 text-sm font-medium rounded border transition-colors ${
                  style.width === 'full'
                    ? 'bg-accent text-white border-accent'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-accent/40'
                }`}
              >
                Full Width
              </button>
              <button
                onClick={() => updateStyle({ width: 'auto' })}
                className={`flex-1 py-2 text-sm font-medium rounded border transition-colors ${
                  style.width === 'auto'
                    ? 'bg-accent text-white border-accent'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-accent/40'
                }`}
              >
                Auto
              </button>
            </div>
          </div>
        )}

        {/* Alignment */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Alinhamento</label>
          <div className="flex gap-1">
            <button
              onClick={() => updateStyle({ alignment: 'left', textAlign: 'left' })}
              className={`flex-1 py-2 text-sm font-medium rounded border transition-colors ${
                (style.alignment === 'left' || style.textAlign === 'left')
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-accent/40'
              }`}
            >
              ←
            </button>
            <button
              onClick={() => updateStyle({ alignment: 'center', textAlign: 'center' })}
              className={`flex-1 py-2 text-sm font-medium rounded border transition-colors ${
                (style.alignment === 'center' || style.textAlign === 'center')
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-accent/40'
              }`}
            >
              ↔
            </button>
            <button
              onClick={() => updateStyle({ alignment: 'right', textAlign: 'right' })}
              className={`flex-1 py-2 text-sm font-medium rounded border transition-colors ${
                (style.alignment === 'right' || style.textAlign === 'right')
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-accent/40'
              }`}
            >
              →
            </button>
          </div>
        </div>

        {/* Line Height (only for text) */}
        {showLineHeight && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Altura da linha</label>
            <input
              type="number"
              value={style.lineHeight || 1.5}
              onChange={(e) => updateStyle({ lineHeight: parseFloat(e.target.value) || 1.5 })}
              className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-accent focus:border-transparent"
              min="1.0"
              max="3.0"
              step="0.1"
            />
          </div>
        )}
      </div>
    </div>
  );
}