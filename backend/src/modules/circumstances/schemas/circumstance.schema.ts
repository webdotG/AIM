import { z } from 'zod';

// Вспомогательная схема для datetime
const datetimeStringSchema = z.string().refine(val => {
  if (!val) return true;
  const date = new Date(val);
  return !isNaN(date.getTime());
}, {
  message: 'Invalid datetime format'
});

export const createCircumstanceSchema = z.object({
  body: z.object({
    timestamp: datetimeStringSchema.optional(), // По умолчанию NOW()
    
    // ПРИРОДНЫЕ (неуправляемые)
    weather: z.enum(['sunny', 'rainy', 'snowy', 'stormy', 'cloudy', 'foggy', 'windy']).optional().nullable(),
    temperature: z.number().int().min(-50).max(60).optional().nullable(), // Celsius
    moon_phase: z.enum(['new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent']).optional().nullable(),
    
    // ГЛОБАЛЬНЫЕ СОБЫТИЯ (расширяемо)
    global_event: z.string().max(500).optional().nullable(),
    
    // ПРОИЗВОЛЬНЫЕ
    notes: z.string().optional().nullable()
  })
});

export const updateCircumstanceSchema = z.object({
  body: z.object({
    timestamp: datetimeStringSchema.optional(),
    weather: z.enum(['sunny', 'rainy', 'snowy', 'stormy', 'cloudy', 'foggy', 'windy']).optional().nullable(),
    temperature: z.number().int().min(-50).max(60).optional().nullable(),
    moon_phase: z.enum(['new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent']).optional().nullable(),
    global_event: z.string().max(500).optional().nullable(),
    notes: z.string().optional().nullable()
  })
});

export const circumstanceIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
  })
});

export const getCircumstancesSchema = z.object({
  query: z.object({
    page: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : undefined)
      .optional(),
    limit: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : undefined)
      .optional(),
    from: datetimeStringSchema.optional(),
    to: datetimeStringSchema.optional(),
    weather: z.enum(['sunny', 'rainy', 'snowy', 'stormy', 'cloudy', 'foggy', 'windy']).optional(),
    moon_phase: z.enum(['new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent']).optional(),
    has_global_event: z.enum(['true', 'false'])
      .transform(val => val === 'true')
      .optional()
  })
});