// ============================================
// src/modules/entries/schemas/entry.schema.ts
// ============================================
import { z } from 'zod';

export const createEntrySchema = z.object({
  body: z.object({
    entry_type: z.enum(['dream', 'memory', 'thought', 'plan']),
    content: z.string().min(1, "Content is required"),
    
    // ОПЦИОНАЛЬНЫЕ СВЯЗИ
    body_state_id: z.number().int().positive().optional().nullable(),
    circumstance_id: z.number().int().positive().optional().nullable(),
    
    // ДЛЯ ПЛАНОВ
    deadline: z.string().date().optional().nullable(), // Только дата, без времени
    is_completed: z.boolean().optional().default(false),
    
    // СВЯЗАННЫЕ СУЩНОСТИ
    emotions: z.array(z.object({
      emotion_id: z.number().int().positive(),
      intensity: z.number().int().min(1).max(10)
    })).optional(),
    people: z.array(z.object({
      person_id: z.number().int().positive(),
      role: z.string().optional()
    })).optional(),
    tags: z.array(z.number().int().positive()).optional()
  })
});

export const updateEntrySchema = z.object({
  body: z.object({
    content: z.string().min(1).optional(),
    body_state_id: z.number().int().positive().optional().nullable(),
    circumstance_id: z.number().int().positive().optional().nullable(),
    deadline: z.string().date().optional().nullable(),
    is_completed: z.boolean().optional()
  })
});

export const entryIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid entry ID format")
  })
});

export const getEntriesSchema = z.object({
  query: z.object({
    type: z.enum(['dream', 'memory', 'thought', 'plan']).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    from: z.string().datetime().optional(), // Фильтр по created_at
    to: z.string().datetime().optional()
  })
});