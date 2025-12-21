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
    id: z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
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
    page: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : undefined)
      .optional(),
    limit: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : undefined)
      .optional()
  })
});

export const mostUsedSchema = z.object({
  query: z.object({
    limit: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : 10)
      .optional()
      .default(10),
    min_usage: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : 1)
      .optional()
      .default(1)
  })
});

export const unusedSchema = z.object({
  query: z.object({
    older_than_days: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : 30)
      .optional()
      .default(30)
  })
});

export const entriesByTagSchema = z.object({
  query: z.object({
    page: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : undefined)
      .optional(),
    limit: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : undefined)
      .optional(),
    entry_type: z.enum(['dream', 'memory', 'thought', 'plan', 'all'])
      .optional()
      .default('all')
  })
});

export const similarTagsSchema = z.object({
  query: z.object({
    limit: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : 5)
      .optional()
      .default(5),
    min_similarity: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : 1)
      .optional()
      .default(1)
  })
});