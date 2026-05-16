import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z.string().max(255).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  answers: z.record(z.object({
    question: z.string().max(1000).optional(),
    answer: z.string().max(1000).optional(),
    score: z.number().int().min(0).max(999).optional(),
    optionIndex: z.number().int().optional(),
    elementId: z.string().max(255).optional(),
  })).optional(),
  score: z.number().optional(),
  resultCategory: z.string().max(255).optional().nullable(),
  metadata: z.record(z.string().max(255)).optional(),
  attribution: z.string().max(500).optional().nullable(),
});
