'use client';

import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import useQuizStore from '@/store/quizStore';

export default function CustomBezierEdge({
  id,
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

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? '#5b21b6' : '#7c3aed',
          strokeWidth: selected ? 3 : 2,
        }}
      />
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
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
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
