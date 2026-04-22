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
  notificationMode: z.string().optional(),
  notificationEmail: z.string().email().optional().nullable(),
  shuffleQuestions: z.boolean().optional(),
  questionTimer: z.number().int().nonnegative().optional().nullable(),
  status: z.string().optional(),
  clientUpdatedAt: z.string().datetime().optional(),
});
