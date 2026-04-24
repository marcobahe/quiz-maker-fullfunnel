import { z } from 'zod';

export const updateAbTestSchema = z.object({
  splitPercent: z.number().int().min(0).max(100).optional(),
  winnerId: z.string().optional(),
});
