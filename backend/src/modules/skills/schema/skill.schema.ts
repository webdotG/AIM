import { z } from 'zod';

export const createSkillSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    category: z.string().max(50).optional().nullable(),
    description: z.string().optional().nullable(),
    icon: z.string().max(50).optional().nullable(),
    color: z.string().max(20).optional().nullable()
  })
});

export const updateSkillSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    category: z.string().max(50).optional().nullable(),
    description: z.string().optional().nullable(),
    current_level: z.number().int().min(1).max(100).optional(),
    experience_points: z.number().int().min(0).optional(),
    icon: z.string().max(50).optional().nullable(),
    color: z.string().max(20).optional().nullable()
  })
});

export const skillIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(Number)
  })
});

export const getSkillsSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sort: z.enum(['level', 'experience', 'name', 'created_at']).optional()
  })
});

// Добавление прогресса к навыку
export const addProgressSchema = z.object({
  body: z.object({
    entry_id: z.string().uuid().optional().nullable(),
    body_state_id: z.number().int().positive().optional().nullable(),
    progress_type: z.enum(['practice', 'achievement', 'lesson', 'milestone']).default('practice'),
    experience_gained: z.number().int().min(1).max(1000).default(10),
    notes: z.string().optional().nullable()
  }).refine(
    data => data.entry_id || data.body_state_id,
    { message: 'Either entry_id or body_state_id must be provided' }
  )
});