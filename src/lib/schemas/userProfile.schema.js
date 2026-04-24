import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo').optional(),
  email: z.string().email('Email inválido').max(255, 'Email muito longo').optional(),
  currentPassword: z.string().min(1, 'Senha atual é obrigatória').optional(),
  newPassword: z
    .string()
    .min(8, 'A nova senha deve ter pelo menos 8 caracteres')
    .max(128, 'A nova senha deve ter no máximo 128 caracteres')
    .optional(),
  image: z.string().url('URL de imagem inválida').max(2000).optional().nullable(),
});
