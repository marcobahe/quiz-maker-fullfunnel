import { create } from 'zustand';

const initialNodes = [
  {
    id: 'start',
    type: 'start',
    position: { x: 250, y: 50 },
    data: { label: 'Início' },
  },
];

const defaultQuizSettings = {
  theme: {
    primaryColor: '#7c3aed',
    secondaryColor: '#6d28d9',
    backgroundColor: '#0f0a1e',
    backgroundType: 'gradient',
    backgroundGradient: 'from-gray-900 via-slate-800 to-zinc-900',
    textColor: '#ffffff',
    buttonStyle: 'rounded',
    fontFamily: 'Inter',
    // Novo: configuração do fundo da página
    pageBackground: {
      type: 'gradient', // 'color' | 'gradient' | 'image' | 'pattern'
      color: '#0f0a1e',
      gradient: 'from-gray-900 via-slate-800 to-zinc-900',
      imageUrl: '',
      imageOverlay: 0.5, // 0-1
      imageFit: 'cover', // 'cover' | 'contain' | 'repeat'
      pattern: 'dots', // 'dots' | 'grid' | 'diagonal' | 'waves' | 'confetti' | 'circuit'
    },
  },
  branding: {
    logoUrl: '',
    faviconUrl: '',
    showBranding: true,
  },
  aiResultConfig: {
    enabled: false,
    provider: 'openai',
    model: 'gpt-4o-mini',
    prompt: '',
    maxTokens: 500,
    combineWithStatic: true,
  },
  tracking: {
    facebookPixelId: '',
    googleTagManagerId: '',
    googleAnalyticsId: '',
    customHeadCode: '',
    events: {
      quizStart: true,
      questionAnswered: true,
      leadCaptured: true,
      quizCompleted: true,
    },
  },
  notifications: {
    emailNotifications: false,
    notificationMode: 'instant-hot', // 'instant-hot', 'daily', 'weekly'
    notificationEmail: '', // will default to user email
  },
  behavior: {
    shuffleQuestions: false,
    questionTimer: null, // segundos por pergunta (null = sem timer)
  },
  gamification: {
    // Engajamento
    progressBar: true,
    progressStyle: 'simple', // simple | milestones | xp
    streak: true,
    streakMultiplier: 2,
    streakAfter: 3,
    streakEffect: 'fire', // fire | stars | lightning
    timer: false,
    timerSeconds: 30,
    speedBonus: 'none', // none | low | medium | high
    
    // Experiência
    confetti: true,
    sounds: true,
    soundLevel: 'medium', // subtle | medium | high
    
    // Mecânicas
    lives: false,
    livesCount: 3,
    livesAction: 'email', // email | partial | redirect
    livesRedirectUrl: '',
    
    // Social
    leaderboard: false,
    challenge: false,
    challengeText: 'Acabei de fazer este quiz e consegui {{score}} pontos! Será que você consegue superar? 🔥',
  },
};

const useQuizStore = create((set, get) => ({
  // Quiz metadata
  quizId: null,
  quizName: 'Meu Novo Quiz',
  quizStatus: 'Rascunho',
  isSaved: true,

  // Nodes and edges for canvas
  nodes: initialNodes,
  edges: [],

  // Selected node – store only ID so reads are always fresh
  selectedNodeId: null,

  // Score Ranges
  scoreRanges: [],

  // Quiz Settings (theme & branding)
  quizSettings: JSON.parse(JSON.stringify(defaultQuizSettings)),

  // Gamification
  gamificationEnabled: true,
  pointsToShow: [],

  // Properties panel open/closed
  propertiesPanelOpen: true,

  // ── Basic actions ──────────────────────────────────────────────

  setQuizId: (id) => set({ quizId: id }),
  setQuizName: (name) => set({ quizName: name, isSaved: false }),
  setQuizStatus: (status) => set({ quizStatus: status }),

  // ── Score Ranges actions ───────────────────────────────────

  setScoreRanges: (ranges) => set({ scoreRanges: ranges, isSaved: false }),

  addScoreRange: (range) =>
    set((state) => ({
      scoreRanges: [...state.scoreRanges, range],
      isSaved: false,
    })),

  updateScoreRange: (id, data) =>
    set((state) => ({
      scoreRanges: state.scoreRanges.map((r) =>
        r.id === id ? { ...r, ...data } : r,
      ),
      isSaved: false,
    })),

  removeScoreRange: (id) =>
    set((state) => ({
      scoreRanges: state.scoreRanges.filter((r) => r.id !== id),
      isSaved: false,
    })),

  // ── Quiz Settings actions ──────────────────────────────────

  setQuizSettings: (settings) => set({ quizSettings: settings, isSaved: false }),

  updateTheme: (themeUpdates) =>
    set((state) => ({
      quizSettings: {
        ...state.quizSettings,
        theme: { ...state.quizSettings.theme, ...themeUpdates },
      },
      isSaved: false,
    })),

  updateBranding: (brandingUpdates) =>
    set((state) => ({
      quizSettings: {
        ...state.quizSettings,
        branding: { ...state.quizSettings.branding, ...brandingUpdates },
      },
      isSaved: false,
    })),

  // ── AI Result Config actions ───────────────────────────────

  setAiResultConfig: (config) =>
    set((state) => ({
      quizSettings: {
        ...state.quizSettings,
        aiResultConfig: config,
      },
      isSaved: false,
    })),

  updateAiResultConfig: (updates) =>
    set((state) => ({
      quizSettings: {
        ...state.quizSettings,
        aiResultConfig: {
          ...(state.quizSettings.aiResultConfig || defaultQuizSettings.aiResultConfig),
          ...updates,
        },
      },
      isSaved: false,
    })),

  updateTracking: (updates) =>
    set((state) => ({
      quizSettings: {
        ...state.quizSettings,
        tracking: {
          ...(state.quizSettings.tracking || defaultQuizSettings.tracking),
          ...updates,
        },
      },
      isSaved: false,
    })),

  updateNotifications: (updates) =>
    set((state) => ({
      quizSettings: {
        ...state.quizSettings,
        notifications: {
          ...(state.quizSettings.notifications || defaultQuizSettings.notifications),
          ...updates,
        },
      },
      isSaved: false,
    })),

  updateBehavior: (updates) =>
    set((state) => ({
      quizSettings: {
        ...state.quizSettings,
        behavior: {
          ...(state.quizSettings.behavior || defaultQuizSettings.behavior),
          ...updates,
        },
      },
      isSaved: false,
    })),

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

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
      isSaved: false,
    })),

  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
      ),
      isSaved: false,
    })),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
      isSaved: false,
    })),

  // Accepts a node object (takes .id) or a string id, or null
  selectNode: (nodeOrId) => {
    if (!nodeOrId) return set({ selectedNodeId: null });
    const id = typeof nodeOrId === 'string' ? nodeOrId : nodeOrId.id;
    set({ selectedNodeId: id, propertiesPanelOpen: true });
  },

  // ── Composite-node element operations ──────────────────────────

  updateNodeElement: (nodeId, elementId, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const elements = (n.data.elements || []).map((el) =>
          el.id === elementId ? { ...el, ...data } : el,
        );
        return { ...n, data: { ...n.data, elements } };
      }),
      isSaved: false,
    })),

  addNodeElement: (nodeId, element) =>
    set((state) => ({
      nodes: state.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        return { ...n, data: { ...n.data, elements: [...(n.data.elements || []), element] } };
      }),
      isSaved: false,
    })),

  removeNodeElement: (nodeId, elementId) =>
    set((state) => ({
      nodes: state.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        return {
          ...n,
          data: { ...n.data, elements: (n.data.elements || []).filter((el) => el.id !== elementId) },
        };
      }),
      // Also clean up edges connected to this element's option handles
      edges: state.edges.filter((e) => !e.sourceHandle?.startsWith(`${elementId}-option-`)),
      isSaved: false,
    })),

  reorderNodeElements: (nodeId, fromIndex, toIndex) =>
    set((state) => ({
      nodes: state.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const els = [...(n.data.elements || [])];
        const [moved] = els.splice(fromIndex, 1);
        els.splice(toIndex, 0, moved);
        return { ...n, data: { ...n.data, elements: els } };
      }),
      isSaved: false,
    })),

  // ── UI toggles ─────────────────────────────────────────────────

  setPropertiesPanelOpen: (open) => set({ propertiesPanelOpen: open }),

  toggleGamification: () =>
    set((state) => ({ gamificationEnabled: !state.gamificationEnabled })),

  showPoints: (points, x, y) => {
    const id = Date.now();
    set((state) => ({
      pointsToShow: [...state.pointsToShow, { id, points, x, y }],
    }));
    setTimeout(() => {
      set((state) => ({
        pointsToShow: state.pointsToShow.filter((p) => p.id !== id),
      }));
    }, 1500);
  },

  loadQuiz: (data) => {
    const canvasData = typeof data.canvasData === 'string'
      ? JSON.parse(data.canvasData || '{}')
      : data.canvasData || {};
    const scoreRanges = typeof data.scoreRanges === 'string'
      ? JSON.parse(data.scoreRanges || '[]')
      : data.scoreRanges || [];
    const settings = typeof data.settings === 'string'
      ? JSON.parse(data.settings || '{}')
      : data.settings || {};
    const defaults = JSON.parse(JSON.stringify(defaultQuizSettings));
    set({
      quizId: data.id,
      quizName: data.name || 'Quiz',
      quizStatus: data.status === 'published' ? 'Publicado' : 'Rascunho',
      nodes: canvasData.nodes || initialNodes,
      edges: canvasData.edges || [],
      scoreRanges: Array.isArray(scoreRanges) ? scoreRanges : [],
      quizSettings: {
        theme: { ...defaults.theme, ...(settings.theme || {}) },
        branding: { ...defaults.branding, ...(settings.branding || {}) },
        aiResultConfig: { ...defaults.aiResultConfig, ...(settings.aiResultConfig || {}) },
        tracking: {
          ...defaults.tracking,
          ...(settings.tracking || {}),
          events: { ...defaults.tracking.events, ...(settings.tracking?.events || {}) },
        },
        behavior: { ...defaults.behavior, ...(settings.behavior || {}) },
      },
      isSaved: true,
    });
  },

  saveQuiz: () => set({ isSaved: true }),
  publishQuiz: () => set({ quizStatus: 'Publicado', isSaved: true }),

  resetQuiz: () =>
    set({
      quizId: null,
      quizName: 'Meu Novo Quiz',
      quizStatus: 'Rascunho',
      isSaved: true,
      nodes: initialNodes,
      edges: [],
      selectedNodeId: null,
      scoreRanges: [],
      quizSettings: JSON.parse(JSON.stringify(defaultQuizSettings)),
    }),
}));

export { defaultQuizSettings };
export default useQuizStore;
