'use client';

import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  addEdge,
  Handle,
  Position,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Play, CircleDot, CheckSquare, UserPlus, Trophy,
  Video, Image, Type, FileText, Music, LayoutGrid,
} from 'lucide-react';
import useQuizStore from '@/store/quizStore';
import InlineEdit from './InlineEdit';
import CustomBezierEdge from './CustomBezierEdge';
import CompositeNode, { createDefaultElement } from './CompositeNode';

// ── Helpers ──────────────────────────────────────────────────────

const PANEL_LABELS = {
  'single-choice': 'Pergunta',
  'multiple-choice': 'Pergunta',
  video: 'Vídeo',
  audio: 'Áudio',
  image: 'Imagem',
  carousel: 'Carrossel',
  text: 'Texto',
  script: 'Script',
  'lead-form': 'Lead Form',
};

// ── Legacy Node Components (backward-compat) ────────────────────

const StartNode = ({ data }) => (
  <div className="bg-success text-white px-6 py-3 rounded-xl shadow-lg border-2 border-success">
    <div className="flex items-center gap-2">
      <Play size={18} fill="white" />
      <span className="font-semibold">{data.label}</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-success !w-3 !h-3" />
  </div>
);

const QuestionNode = ({ id, data, selected }) => {
  const updateNode = useQuizStore((s) => s.updateNode);
  const Icon = data.type === 'multiple-choice' ? CheckSquare : CircleDot;

  const saveQuestion = (val) => updateNode(id, { question: val });
  const saveOption = (idx, val) => {
    const opts = [...(data.options || [])];
    opts[idx] = { ...opts[idx], text: val };
    updateNode(id, { options: opts });
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border-2 min-w-[280px] transition-all ${
        selected ? 'border-accent ring-2 ring-accent/20' : 'border-gray-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-accent !w-3 !h-3" />

      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
            <Icon size={18} className="text-accent" />
          </div>
          <span className="text-xs font-medium text-accent uppercase">
            {data.type === 'multiple-choice' ? 'Múltipla Escolha' : 'Escolha Única'}
          </span>
        </div>
        <InlineEdit
          value={data.question || 'Nova Pergunta'}
          onSave={saveQuestion}
          className="text-gray-800 font-medium"
          placeholder="Nova Pergunta"
        />
      </div>

      <div className="p-3 space-y-2">
        {(data.options || []).map((option, index) => (
          <div
            key={index}
            className="relative flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600"
          >
            <span className="w-5 h-5 bg-white border border-gray-300 rounded-full flex items-center justify-center text-xs">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="flex-1">
              <InlineEdit
                value={option.text}
                onSave={(val) => saveOption(index, val)}
                className="text-gray-600"
                placeholder="Opção…"
              />
            </span>
            {option.score > 0 && (
              <span className="text-xs text-accent font-medium">+{option.score}</span>
            )}
            <Handle
              type="source"
              position={Position.Right}
              id={`option-${index}`}
              className="!bg-accent !w-2.5 !h-2.5 !right-[-5px]"
            />
          </div>
        ))}
      </div>

      {/* General "all options" source handle */}
      <div className="px-3 py-1.5 border-t border-gray-100 text-center">
        <span className="text-[10px] text-purple-400/70 select-none">Todas as respostas</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="general"
        className="!bg-purple-400 !w-4 !h-4 !border-2 !border-white"
        title="Todas as respostas → mesmo destino"
      />
    </div>
  );
};

const LeadFormNode = ({ id, data, selected }) => {
  const updateNode = useQuizStore((s) => s.updateNode);

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border-2 min-w-[250px] transition-all ${
        selected ? 'border-accent ring-2 ring-accent/20' : 'border-gray-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-accent !w-3 !h-3" />

      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <UserPlus size={18} className="text-blue-600" />
          </div>
          <span className="text-xs font-medium text-blue-600 uppercase">Formulário Lead</span>
        </div>
        <InlineEdit
          value={data.title || 'Capture seus dados'}
          onSave={(val) => updateNode(id, { title: val })}
          className="text-gray-800 font-medium mb-3 block"
          placeholder="Título do formulário"
        />
        <div className="space-y-2">
          <div className="bg-gray-100 rounded px-3 py-2 text-sm text-gray-400">Nome</div>
          <div className="bg-gray-100 rounded px-3 py-2 text-sm text-gray-400">Email</div>
          <div className="bg-gray-100 rounded px-3 py-2 text-sm text-gray-400">Telefone</div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-accent !w-3 !h-3" />
    </div>
  );
};

const ResultNode = ({ id, data, selected }) => {
  const updateNode = useQuizStore((s) => s.updateNode);

  return (
    <div
      className={`bg-gradient-to-br from-accent to-purple-700 text-white rounded-xl shadow-lg border-2 border-accent min-w-[220px] transition-all ${
        selected ? 'ring-2 ring-accent/40' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-white !w-3 !h-3" />

      <div className="p-4 text-center">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <Trophy size={24} />
        </div>
        <InlineEdit
          value={data.title || 'Seu Resultado'}
          onSave={(val) => updateNode(id, { title: val })}
          className="font-semibold text-lg text-white"
          placeholder="Título do resultado"
        />
        <p className="text-white/70 text-sm mt-1">Exibe o resultado final</p>
      </div>
    </div>
  );
};

const MediaNode = ({ data, selected }) => {
  const icons = { video: Video, audio: Music, image: Image, carousel: LayoutGrid };
  const Icon = icons[data.mediaType] || Image;

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border-2 min-w-[200px] transition-all ${
        selected ? 'border-accent ring-2 ring-accent/20' : 'border-gray-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-accent !w-3 !h-3" />
      <div className="p-4 text-center">
        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
          <Icon size={24} className="text-orange-600" />
        </div>
        <p className="text-gray-800 font-medium capitalize">{data.mediaType || 'Mídia'}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-accent !w-3 !h-3" />
    </div>
  );
};

const ContentNode = ({ data, selected }) => {
  const Icon = data.contentType === 'script' ? FileText : Type;

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border-2 min-w-[200px] transition-all ${
        selected ? 'border-accent ring-2 ring-accent/20' : 'border-gray-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-accent !w-3 !h-3" />
      <div className="p-4 text-center">
        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-2">
          <Icon size={24} className="text-teal-600" />
        </div>
        <p className="text-gray-800 font-medium capitalize">{data.contentType || 'Conteúdo'}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-accent !w-3 !h-3" />
    </div>
  );
};

// ── Type registries (stable refs — defined at module level) ─────

const nodeTypes = {
  start: StartNode,
  'single-choice': QuestionNode,
  'multiple-choice': QuestionNode,
  'lead-form': LeadFormNode,
  result: ResultNode,
  media: MediaNode,
  content: ContentNode,
  composite: CompositeNode,
};

const edgeTypes = {
  'custom-bezier': CustomBezierEdge,
  // Map legacy types to the custom bezier so saved data also renders nicely
  smoothstep: CustomBezierEdge,
  default: CustomBezierEdge,
};

// ── Canvas ───────────────────────────────────────────────────────

export default function CanvasArea() {
  const reactFlowWrapper = useRef(null);

  const nodes = useQuizStore((s) => s.nodes);
  const edges = useQuizStore((s) => s.edges);
  const setNodes = useQuizStore((s) => s.setNodes);
  const setEdges = useQuizStore((s) => s.setEdges);
  const selectNode = useQuizStore((s) => s.selectNode);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'custom-bezier',
            animated: true,
            style: { stroke: '#7c3aed', strokeWidth: 2 },
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  // Clean connected edges when nodes are removed
  const onNodesDelete = useCallback(
    (deleted) => {
      const ids = new Set(deleted.map((n) => n.id));
      setEdges((eds) => eds.filter((e) => !ids.has(e.source) && !ids.has(e.target)));
    },
    [setEdges],
  );

  const onNodeClick = useCallback(
    (_event, node) => selectNode(node),
    [selectNode],
  );

  const onPaneClick = useCallback(() => selectNode(null), [selectNode]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left - 100,
        y: event.clientY - bounds.top - 50,
      };

      // Result stays as a standalone legacy node
      if (type === 'result') {
        setNodes((nds) => [
          ...nds,
          {
            id: `result-${Date.now()}`,
            type: 'result',
            position,
            data: { title: 'Seu Resultado' },
          },
        ]);
        return;
      }

      // Everything else → composite node with one element
      const element = createDefaultElement(type);
      const label = PANEL_LABELS[type] || type;

      setNodes((nds) => [
        ...nds,
        {
          id: `composite-${Date.now()}`,
          type: 'composite',
          position,
          data: { label, elements: [element] },
        },
      ]);
    },
    [setNodes],
  );

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodesDelete={onNodesDelete}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        deleteKeyCode={['Delete', 'Backspace']}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        defaultEdgeOptions={{
          type: 'custom-bezier',
          animated: true,
          style: { stroke: '#7c3aed', strokeWidth: 2 },
        }}
      >
        <Background color="#e5e7eb" gap={20} size={1} />
        <Controls className="!bottom-24 !left-4" />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.type === 'start') return '#10b981';
            if (n.type === 'result' || n.type === 'composite') return '#7c3aed';
            return '#6b7280';
          }}
          nodeColor={(n) => {
            if (n.type === 'start') return '#10b981';
            if (n.type === 'result') return '#7c3aed';
            if (n.type === 'composite') return '#f3f0ff';
            return '#fff';
          }}
          className="!bottom-4 !right-4"
        />
      </ReactFlow>
    </div>
  );
}
