import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
});

export const inviteSchema = z.object({
  email: z.string().email('Email inválido').max(255, 'Email muito longo'),
  role: z.enum(['admin', 'editor', 'viewer'], { message: 'Role inválido' }),
});
