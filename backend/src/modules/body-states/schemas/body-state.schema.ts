import { z } from 'zod';

// Вспомогательная схема для datetime
const datetimeStringSchema = z.string().refine(val => {
  if (!val) return true;
  const date = new Date(val);
  return !isNaN(date.getTime());
}, {
  message: 'Invalid datetime format'
});

export const createBodyStateSchema = z.object({
  body: z.object({
    timestamp: datetimeStringSchema.optional(), // По умолчанию NOW()
    
    // ПРОСТРАНСТВО (опционально)
    location_point: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180)
    }).optional().nullable(),
    location_name: z.string().max(200).optional().nullable(),
    location_address: z.string().optional().nullable(),
    location_precision: z.enum(['exact', 'approximate', 'city', 'country']).optional().nullable(),
    
    // ЗДОРОВЬЕ (HP + Energy)
    health_points: z.number().int().min(0).max(100).optional().nullable(),
    energy_points: z.number().int().min(0).max(100).optional().nullable(),
    
    // СВЯЗЬ С ОБСТОЯТЕЛЬСТВАМИ
    circumstance_id: z.number().int().positive().optional().nullable()
  })
});

export const updateBodyStateSchema = z.object({
  body: z.object({
    timestamp: datetimeStringSchema.optional(),
    location_point: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180)
    }).optional().nullable(),
    location_name: z.string().max(200).optional().nullable(),
    location_address: z.string().optional().nullable(),
    location_precision: z.enum(['exact', 'approximate', 'city', 'country']).optional().nullable(),
    health_points: z.number().int().min(0).max(100).optional().nullable(),
    energy_points: z.number().int().min(0).max(100).optional().nullable(),
    circumstance_id: z.number().int().positive().optional().nullable()
  })
});

export const bodyStateIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
  })
});

export const getBodyStatesSchema = z.object({
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
    has_location: z.enum(['true', 'false'])
      .transform(val => val === 'true')
      .optional(),
    circumstance_id: z.string()
      .regex(/^\d+$/)
      .transform(val => val ? parseInt(val, 10) : undefined)
      .optional()
  })
});