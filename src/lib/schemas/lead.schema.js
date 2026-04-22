import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z.string().max(255).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  answers: z.any().optional(),
  score: z.number().optional(),
  resultCategory: z.string().max(255).optional().nullable(),
  metadata: z.record(z.any()).optional(),
  attribution: z.string().max(500).optional().nullable(),
});
