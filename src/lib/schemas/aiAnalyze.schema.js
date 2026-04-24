import { z } from 'zod';

export const aiAnalyzeSchema = z.object({
  answers: z.array(z.any()).optional(),
  score: z.number().int().min(0).optional(),
  maxScore: z.number().int().min(0).optional(),
  leadName: z.string().max(255).optional().nullable(),
  leadEmail: z.string().email('Email inválido').max(255).optional().nullable(),
  resultTitle: z.string().max(500).optional().nullable(),
});
