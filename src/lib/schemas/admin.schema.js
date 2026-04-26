import { z } from 'zod';

export const updateUserSchema = z.object({
  plan: z.enum(['free', 'pro', 'business', 'agency']).optional(),
  role: z.enum(['user', 'admin', 'owner']).optional(),
  suspended: z.boolean().optional(),
  name: z.string().min(1).max(100).optional(),
});

export const impersonateSchema = z.object({
  userId: z.string().min(1, 'userId é obrigatório'),
});
