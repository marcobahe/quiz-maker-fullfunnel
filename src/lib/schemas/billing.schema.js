import { z } from 'zod';

export const checkoutSchema = z.object({
  plan: z.enum(['pro', 'business', 'agency'], {
    message: 'Plano inválido',
  }),
  annual: z.boolean().optional().default(false),
});

export const portalSchema = z.object({}).optional();
