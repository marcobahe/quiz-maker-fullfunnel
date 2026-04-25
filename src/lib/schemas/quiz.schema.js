import { z } from 'zod';

export const createQuizSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
  canvasData: z.any().optional(),
  scoreRanges: z.any().optional(),
  settings: z.any().optional(),
  workspaceId: z.string().optional().nullable(),
});

export const updateQuizSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
  canvasData: z.any().optional(),
  settings: z.any().optional(),
  scoreRanges: z.any().optional(),
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
  paywallPrice: z.number().int().nonnegative().optional().nullable(),
  paywallType: z.enum(['one_time', 'subscription']).optional().nullable(),
  paywallStripePriceId: z.string().max(255).optional().nullable(),
  paywallTitle: z.string().max(255).optional().nullable(),
  paywallDescription: z.string().max(2000).optional().nullable(),
});
