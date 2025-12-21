import { z } from 'zod';

export const createPersonSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    category: z.enum(['family', 'friends', 'acquaintances', 'strangers']),
    relationship: z.string().max(100).optional().nullable(),
    bio: z.string().optional().nullable(),
    birth_date: z.string()
      .refine(val => !val || !isNaN(Date.parse(val)), {
        message: 'Invalid date format'
      })
      .optional()
      .nullable(),
    notes: z.string().optional().nullable()
  })
});

export const updatePersonSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    category: z.enum(['family', 'friends', 'acquaintances', 'strangers']).optional(),
    relationship: z.string().max(100).optional().nullable(),
    bio: z.string().optional().nullable(),
    birth_date: z.string()
      .refine(val => !val || !isNaN(Date.parse(val)), {
        message: 'Invalid date format'
      })
      .optional()
      .nullable(),
    notes: z.string().optional().nullable()
  })
});

export const personIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
  })
});

export const getPeopleSchema = z.object({
  query: z.object({
    category: z.enum(['family', 'friends', 'acquaintances', 'strangers']).optional(),
    search: z.string().optional(),
    sort: z.enum(['name', 'mentions', 'created_at']).optional().default('name'),
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

export const mostMentionedSchema = z.object({
  query: z.object({
    limit: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : 10)
      .optional()
      .default(10),
    start_date: z.string()
      .refine(val => !val || !isNaN(Date.parse(val)), {
        message: 'Invalid date format'
      })
      .optional(),
    end_date: z.string()
      .refine(val => !val || !isNaN(Date.parse(val)), {
        message: 'Invalid date format'
      })
      .optional()
  })
});