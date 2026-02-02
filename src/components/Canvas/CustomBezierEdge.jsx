'use client';

import { useMemo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import useQuizStore from '@/store/quizStore';

/**
 * Determine the label to display on an edge based on its sourceHandle.
 */
function getEdgeLabel(sourceHandle) {
  if (!sourceHandle) return null;

  // "general" or "elementId-general"
  if (sourceHandle === 'general' || sourceHandle.endsWith('-general')) {
    return { text: 'Qualquer resposta', type: 'general' };
  }

  // "option-N" or "elementId-option-N"
  const optionMatch = sourceHandle.match(/option-(\d+)$/);
  if (optionMatch) {
    const idx = parseInt(optionMatch[1], 10);
    const letter = String.fromCharCode(65 + idx);
    return { text: `Opção ${letter}`, type: 'option' };
  }

  return null;
}

export default function CustomBezierEdge({
  id,
  source,
  target,
  sourceHandle,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}) {
  const setEdges = useQuizStore((s) => s.setEdges);
  const selectedNodeId = useQuizStore((s) => s.selectedNodeId);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Highlight when connected node is selected
  const isConnectedToSelected = selectedNodeId && (source === selectedNodeId || target === selectedNodeId);

  // Determine label
  const label = useMemo(() => getEdgeLabel(sourceHandle), [sourceHandle]);

  const strokeColor = isConnectedToSelected || selected ? '#5b21b6' : '#7c3aed';
  const strokeWidth = isConnectedToSelected || selected ? 3 : 2;
  const glowFilter = isConnectedToSelected
    ? 'drop-shadow(0 0 6px rgba(124, 58, 237, 0.5))'
    : 'none';

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth,
          filter: glowFilter,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan flex flex-col items-center gap-1"
        >
          {/* Delete button — visible when edge is selected */}
          {selected && (
            <button
              onClick={(evt) => {
                evt.stopPropagation();
                setEdges((eds) => eds.filter((edge) => edge.id !== id));
              }}
              className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all border-2 border-white hover:scale-110"
              title="Remover conexão"
            >
              ×
            </button>
          )}

          {/* Condition label */}
          {label && (
            <span
              className={`
                px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap shadow-sm
                ${label.type === 'general'
                  ? 'bg-purple-100 text-purple-600 border border-purple-200'
                  : 'bg-violet-50 text-violet-700 border border-violet-200'
                }
              `}
              style={{ pointerEvents: 'none' }}
            >
              {label.text}
            </span>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
