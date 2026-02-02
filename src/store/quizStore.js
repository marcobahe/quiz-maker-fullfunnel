import { create } from 'zustand';

const initialNodes = [
  {
    id: 'start',
    type: 'start',
    position: { x: 250, y: 50 },
    data: { label: 'Início' },
  },
];

const useQuizStore = create((set, get) => ({
  // Quiz metadata
  quizName: 'Meu Novo Quiz',
  quizStatus: 'Rascunho',
  isSaved: true,
  
  // Nodes and edges for canvas
  nodes: initialNodes,
  edges: [],
  
  // Selected node
  selectedNode: null,
  
  // Gamification
  gamificationEnabled: true,
  pointsToShow: [],
  
  // Quiz list for dashboard
  quizzes: [
    { id: 1, name: 'Quiz de Perfil de Investidor', createdAt: '2024-01-15', status: 'Publicado', leads: 342, conversion: 68 },
    { id: 2, name: 'Descubra seu Estilo', createdAt: '2024-01-20', status: 'Publicado', leads: 156, conversion: 45 },
    { id: 3, name: 'Quiz de Produtos', createdAt: '2024-02-01', status: 'Rascunho', leads: 0, conversion: 0 },
  ],
  
  // Actions
  setQuizName: (name) => set({ quizName: name, isSaved: false }),
  
  setNodes: (nodes) => set({ nodes, isSaved: false }),
  
  setEdges: (edges) => set({ edges, isSaved: false }),
  
  addNode: (node) => set((state) => ({ 
    nodes: [...state.nodes, node],
    isSaved: false 
  })),
  
  updateNode: (id, data) => set((state) => ({
    nodes: state.nodes.map((node) => 
      node.id === id ? { ...node, data: { ...node.data, ...data } } : node
    ),
    isSaved: false
  })),
  
  removeNode: (id) => set((state) => ({
    nodes: state.nodes.filter((node) => node.id !== id),
    edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
    selectedNode: state.selectedNode?.id === id ? null : state.selectedNode,
    isSaved: false
  })),
  
  selectNode: (node) => set({ selectedNode: node }),
  
  toggleGamification: () => set((state) => ({ 
    gamificationEnabled: !state.gamificationEnabled 
  })),
  
  showPoints: (points, x, y) => {
    const id = Date.now();
    set((state) => ({
      pointsToShow: [...state.pointsToShow, { id, points, x, y }]
    }));
    setTimeout(() => {
      set((state) => ({
        pointsToShow: state.pointsToShow.filter((p) => p.id !== id)
      }));
    }, 1500);
  },
  
  saveQuiz: () => set({ isSaved: true }),
  
  publishQuiz: () => set({ quizStatus: 'Publicado', isSaved: true }),
}));

export default useQuizStore;
