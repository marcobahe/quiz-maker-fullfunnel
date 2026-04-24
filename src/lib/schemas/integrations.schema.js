import { z } from 'zod';

export const createIntegrationSchema = z.object({
  type: z.string().min(1, 'Tipo é obrigatório').max(100),
  name: z.string().max(200).optional(),
  config: z.record(z.any()),
  active: z.boolean().optional().default(true),
});

export const updateIntegrationSchema = z.object({
  type: z.string().min(1).max(100).optional(),
  name: z.string().max(200).optional(),
  config: z.record(z.any()).optional(),
  active: z.boolean().optional(),
});
