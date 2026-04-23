// QuizMeBaby Brand Tokens — fonte: docs/design/quizmebaby-brand-brief.md v1.2

export const colors = {
  bgDark: "#0a0c1b",
  surfaceDark: "#1e293b",
  primary: "#6366f1",
  primaryDark: "#4f46e5",
  accent: "#F43F5E",
  gold: "#F59E0B",
  pink: "#EC4899",
  violet: "#8b5cf6",
  white: "#ffffff",
  green: "#10B981",
  textMuted: "rgba(255,255,255,0.65)",
} as const;

export const gradients = {
  hero: `linear-gradient(135deg, ${colors.primary}, ${colors.violet}, ${colors.pink})`,
  heroOverlay: `linear-gradient(180deg, rgba(10,12,27,0) 0%, rgba(10,12,27,0.85) 100%)`,
  accentGlow: `radial-gradient(ellipse at center, rgba(99,102,241,0.35) 0%, transparent 70%)`,
} as const;

export const fonts = {
  display: "'Outfit', sans-serif",
  body: "'Inter', sans-serif",
} as const;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

// Video specs
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const FPS = 30;
