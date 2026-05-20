import { z } from 'zod';

// ── Canvas data ───────────────────────────────────────────────
// The frontend PUT sends canvasData as JSON.stringify({ nodes, edges }).
// Object is also accepted for legacy / direct API usage.
const canvasNodeSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  data: z.object({}).passthrough().optional(),
}).passthrough();

const canvasEdgeSchema = z.object({
  id: z.string().optional(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
}).passthrough();

const canvasDataObjectSchema = z.object({
  nodes: z.array(canvasNodeSchema).optional(),
  edges: z.array(canvasEdgeSchema).optional(),
}).passthrough();

const canvasDataSchema = z.union([
  z.string(),
  canvasDataObjectSchema,
]).optional();

// ── Score ranges ──────────────────────────────────────────────
// 14 fields confirmed in ScoreRangesEditor.jsx (core + redirect)
const scoreRangeSchema = z.object({
  id: z.string(),
  min: z.number().int(),
  max: z.number().int(),
  title: z.string(),
  description: z.string(),
  image: z.string().optional(),
  ctaText: z.string().optional(),
  ctaUrl: z.string().optional(),
  redirectMode: z.enum(['none', 'auto', 'button']).optional(),
  redirectUrl: z.string().optional(),
  redirectDelay: z.number().int().optional(),
  showResultBeforeRedirect: z.boolean().optional(),
  redirectButtonText: z.string().optional(),
  redirectOpenNewTab: z.boolean().optional(),
}).passthrough();

const scoreRangesSchema = z.union([
  z.string(),
  z.array(scoreRangeSchema),
]).optional();

// ── Settings ──────────────────────────────────────────────────
// 8 top-level sections confirmed in quizStore.js defaultQuizSettings
const quizSettingsSchema = z.object({
  theme: z.object({}).passthrough().optional(),
  branding: z.object({}).passthrough().optional(),
  preloadMessage: z.object({}).passthrough().optional(),
  aiResultConfig: z.object({}).passthrough().optional(),
  tracking: z.object({}).passthrough().optional(),
  notifications: z.object({}).passthrough().optional(),
  behavior: z.object({}).passthrough().optional(),
  gamification: z.object({}).passthrough().optional(),
}).passthrough();

const settingsSchema = z.union([
  z.string(),
  quizSettingsSchema,
]).optional();

export const createQuizSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
  canvasData: canvasDataSchema,
  scoreRanges: scoreRangesSchema,
  settings: settingsSchema,
  workspaceId: z.string().optional().nullable(),
});

export const updateQuizSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
  canvasData: canvasDataSchema,
  settings: settingsSchema,
  scoreRanges: scoreRangesSchema,
  emailNotifications: z.boolean().optional(),
  notificationMode: z.enum(['instant-hot', 'daily', 'weekly']).optional(),
  notificationEmail: z.string().email().max(255).optional().nullable(),
  shuffleQuestions: z.boolean().optional(),
  questionTimer: z.number().int().nonnegative().optional().nullable(),
  status: z.enum(['draft', 'published']).optional(),
  clientUpdatedAt: z.string().datetime().optional(),
  webhookUrl: z.string().url().max(2048).optional().nullable(),
  webhookSecret: z.string().max(255).optional().nullable(),
  // Paywall fields
  paywallEnabled: z.boolean().optional(),
  paywallPrice: z.number().int().min(0).optional().nullable(),
  paywallType: z.enum(['result', 'full', 'lead']).optional().nullable(),
  paywallStripePriceId: z.string().max(255).optional().nullable(),
  paywallTitle: z.string().max(255).optional().nullable(),
  paywallDescription: z.string().max(2000).optional().nullable(),
});
