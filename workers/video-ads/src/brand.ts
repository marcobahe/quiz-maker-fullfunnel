// QuizMeBaby Brand Tokens — fonte: docs/design/quizmebaby-brand-brief.md v1.2
// Brandbook confirmado por @picasso em 2026-04-23
// Fonts: install @remotion/google-fonts for Outfit + Spline Sans + Inter

export const colors = {
  bgDark: "#0a0c1b",
  surfaceDark: "#1e293b",
  bgLight: "#f0f4ff",
  surfaceLight: "#ffffff",
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
  hero: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #EC4899 100%)`,
  heroOverlay: `linear-gradient(180deg, rgba(10,12,27,0) 0%, rgba(10,12,27,0.85) 100%)`,
  accentGlow: `radial-gradient(ellipse at center, rgba(99,102,241,0.35) 0%, transparent 70%)`,
} as const;

// Glassmorphism dark — for reel overlays and glass cards
export const glass = {
  background: "rgba(0, 0, 0, 0.3)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
} as const;

// Fonts: Display/Headlines = Outfit, Body/copy = Spline Sans, UI elements = Inter
export const fonts = {
  display: "'Outfit', sans-serif",
  body: "'Spline Sans', sans-serif",
  ui: "'Inter', sans-serif",
} as const;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

// Typography scale for Reels 1080×1920 (per @picasso brandbook)
export const typescale = {
  hookHeadline: { size: 68, weight: 800, font: "display" },   // 64–72px
  subHeadline:  { size: 36, weight: 700, font: "display" },   // 36px
  body:         { size: 26, weight: 400, font: "body" },      // 22–28px
  ctaButton:    { size: 24, weight: 600, font: "display" },   // 24px
  caption:      { size: 16, weight: 500, font: "ui" },        // 16px
} as const;

// Video specs
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const FPS = 30;
