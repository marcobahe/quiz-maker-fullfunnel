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
  quizId: null,
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
  
  // Actions
  setQuizId: (id) => set({ quizId: id }),
  
  setQuizName: (name) => set({ quizName: name, isSaved: false }),
  
  setQuizStatus: (status) => set({ quizStatus: status }),
  
  setNodes: (nodesOrUpdater) => {
    if (typeof nodesOrUpdater === 'function') {
      set((state) => ({ nodes: nodesOrUpdater(state.nodes), isSaved: false }));
    } else {
      set({ nodes: nodesOrUpdater, isSaved: false });
    }
  },
  
  setEdges: (edgesOrUpdater) => {
    if (typeof edgesOrUpdater === 'function') {
      set((state) => ({ edges: edgesOrUpdater(state.edges), isSaved: false }));
    } else {
      set({ edges: edgesOrUpdater, isSaved: false });
    }
  },
  
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
  
  // Reset store for new quiz
  resetQuiz: () => set({
    quizId: null,
    quizName: 'Meu Novo Quiz',
    quizStatus: 'Rascunho',
    isSaved: true,
    nodes: initialNodes,
    edges: [],
    selectedNode: null,
  }),
}));

export default useQuizStore;
