import { z } from 'zod';

export const aiAnalyzeSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().max(255),
    answer: z.string().max(1000),
    points: z.number().int().min(0).max(999),
  })).max(500).optional(),
  score: z.number().int().min(0).optional(),
  maxScore: z.number().int().min(0).optional(),
  leadName: z.string().max(255).optional().nullable(),
  leadEmail: z.string().email('Email inválido').max(255).optional().nullable(),
  resultTitle: z.string().max(500).optional().nullable(),
});
