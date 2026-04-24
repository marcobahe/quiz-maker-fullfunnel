import { z } from 'zod';

export const checkoutSchema = z.object({
  plan: z.enum(['pro', 'business', 'advanced', 'enterprise'], {
    message: 'Plano inválido',
  }),
  annual: z.boolean().optional().default(false),
});

export const portalSchema = z.object({}).optional();
