import { z } from 'zod';

export const aiGenerateSchema = z.object({
  tema: z.string().min(1, 'O tema do quiz é obrigatório').max(500),
  objetivo: z.string().max(500).optional(),
  publicoAlvo: z.string().max(500).optional(),
  siteUrl: z.string().url().max(2000).optional().nullable(),
  numPerguntas: z.number().int().min(1).max(50).optional().default(5),
  tiposPerguntas: z.array(z.string()).optional().default(['Escolha única']),
  temMetodologia: z.boolean().optional().default(false),
  metodologia: z.string().max(2000).optional(),
  categorias: z.string().max(500).optional(),
  tom: z.string().max(50).optional().default('Casual'),
  informacoesAdicionais: z.string().max(2000).optional(),
});
