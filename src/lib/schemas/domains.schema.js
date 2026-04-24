import { z } from 'zod';

export const createDomainSchema = z.object({
  domain: z
    .string()
    .min(3, 'Domínio é obrigatório')
    .max(253, 'Domínio muito longo')
    .regex(
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/,
      'Formato de domínio inválido'
    ),
  quizId: z.string().uuid().optional().nullable(),
});
