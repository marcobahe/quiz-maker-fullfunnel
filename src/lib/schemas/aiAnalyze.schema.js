import { z } from 'zod';

export const aiAnalyzeSchema = z.object({
  answers: z.array(z.object({
    question: z.string().max(1000).optional(),
    answer: z.string().max(1000).optional(),
    score: z.number().int().min(0).max(999).optional(),
    optionIndex: z.number().int().optional(),
    questionId: z.string().max(255).optional(),
    elementId: z.string().max(255).optional(),
  })).max(500).optional(),
  score: z.number().int().min(0).optional(),
  maxScore: z.number().int().min(0).optional(),
  leadName: z.string().max(255).optional().nullable(),
  leadEmail: z.string().email('Email inválido').max(255).optional().nullable(),
  resultTitle: z.string().max(500).optional().nullable(),
});
