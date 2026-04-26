import { z } from 'zod';

export const deleteFilesSchema = z.object({
  fileKey: z.string().min(1).max(500).optional(),
  fileKeys: z.array(z.string().min(1).max(500)).optional(),
}).refine((d) => d.fileKey || (d.fileKeys && d.fileKeys.length > 0), {
  message: 'fileKey ou fileKeys obrigatório',
});
