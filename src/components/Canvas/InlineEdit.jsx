'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export default function InlineEdit({
  value,
  onSave,
  className = '',
  multiline = false,
  placeholder = 'Clique para editar...',
  inputClassName = '',
  renderValue = null,
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  // Sync external value when not editing
  useEffect(() => {
    if (!editing) {
      setEditValue(value);
    }
  }, [value, editing]);

  // Auto-focus and select on edit start
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const save = useCallback(() => {
    setEditing(false);
    const trimmed = (editValue ?? '').toString().trim();
    if (trimmed !== (value ?? '').toString().trim()) {
      onSave(trimmed);
    }
  }, [editValue, value, onSave]);

  const cancel = useCallback(() => {
    setEditing(false);
    setEditValue(value);
  }, [value]);

  const handleKeyDown = useCallback(
    (e) => {
      e.stopPropagation(); // prevent React Flow key handlers (delete, etc.)
      if (e.key === 'Enter' && !multiline) {
        e.preventDefault();
        save();
      }
      if (e.key === 'Enter' && multiline && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        save();
      }
      if (e.key === 'Escape') {
        cancel();
      }
    },
    [save, cancel, multiline],
  );

  if (editing) {
    const Tag = multiline ? 'textarea' : 'input';
    return (
      <Tag
        ref={inputRef}
        value={editValue ?? ''}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className={`nodrag nowheel nopan bg-white/80 backdrop-blur-sm border border-accent/40 rounded px-1.5 py-0.5 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 w-full resize-none text-inherit ${inputClassName}`}
        placeholder={placeholder}
        rows={multiline ? 3 : undefined}
      />
    );
  }

  return (
    <span
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      className={`cursor-text rounded px-0.5 -mx-0.5 transition-colors hover:bg-accent/5 inline-block ${className}`}
      title="Duplo clique para editar"
    >
      {renderValue
        ? (value ? renderValue(value) : <span className="text-gray-400 italic">{placeholder}</span>)
        : (value || <span className="text-gray-400 italic">{placeholder}</span>)}
    </span>
  );
}
