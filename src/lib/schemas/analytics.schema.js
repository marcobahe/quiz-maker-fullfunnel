import { z } from 'zod';

export const analyticsEventSchema = z.object({
  sessionId: z.string().uuid('sessionId deve ser um UUID').optional().nullable(),
  event: z.enum(
    [
      'quiz_start',
      'quiz_started',
      'quiz_complete',
      'lead_submit',
      'question_answer',
      'question_view',
    ],
    { message: 'Tipo de evento inválido' }
  ),
  nodeId: z.string().max(100).optional().nullable(),
  questionId: z.string().max(100).optional().nullable(),
  data: z.record(z.any()).optional(),
});
