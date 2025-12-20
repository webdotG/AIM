import { z } from 'zod';

// для валидации дат
const dateStringSchema = z.string().refine(val => {
  if (!val) return true; // пустые значения
  const date = new Date(val);
  return !isNaN(date.getTime()) && val.includes('T') === false; // дата без времени
}, {
  message: 'Invalid date format (expected YYYY-MM-DD)'
});

const datetimeStringSchema = z.string().refine(val => {
  if (!val) return true;
  const date = new Date(val);
  return !isNaN(date.getTime());
}, {
  message: 'Invalid datetime format'
});

export const createEntrySchema = z.object({
  body: z.object({
    entry_type: z.enum(['dream', 'memory', 'thought', 'plan']),
    content: z.string().min(1, "Content is required"),
    
    // ОПЦИОНАЛЬНЫЕ СВЯЗИ
    body_state_id: z.number().int().positive().optional().nullable(),
    circumstance_id: z.number().int().positive().optional().nullable(),
    
    // ДЛЯ ПЛАНОВ
    deadline: dateStringSchema.optional().nullable(),
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
    deadline: dateStringSchema.optional().nullable(),
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
    page: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : undefined)
      .optional(),
    limit: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : undefined)
      .optional(),
    search: z.string().optional(),
    from: datetimeStringSchema.optional(),
    to: datetimeStringSchema.optional()
  })
});