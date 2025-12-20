import { z } from 'zod';

export const createTagSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50).regex(/^[a-zA-Zа-яА-ЯёЁ0-9_-]+$/, 'Tag name can only contain letters, numbers, underscore and dash')
  })
});

export const updateTagSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50).regex(/^[a-zA-Zа-яА-ЯёЁ0-9_-]+$/, 'Tag name can only contain letters, numbers, underscore and dash')
  })
});

export const tagIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(Number)
  })
});

export const attachTagsSchema = z.object({
  body: z.object({
    tags: z.array(z.number().int().positive()).min(1, 'At least one tag must be provided')
  })
});

export const entryIdParamSchema = z.object({
  params: z.object({
    entryId: z.string().uuid('Invalid entry ID format')
  })
});

export const getTagsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    sort: z.enum(['name', 'usage', 'created_at']).optional().default('name'),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
  })
});
