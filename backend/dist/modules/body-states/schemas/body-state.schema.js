"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBodyStatesSchema = exports.bodyStateIdSchema = exports.updateBodyStateSchema = exports.createBodyStateSchema = void 0;
const zod_1 = require("zod");
// Вспомогательная схема для datetime
const datetimeStringSchema = zod_1.z.string().refine(val => {
    if (!val)
        return true;
    const date = new Date(val);
    return !isNaN(date.getTime());
}, {
    message: 'Invalid datetime format'
});
exports.createBodyStateSchema = zod_1.z.object({
    body: zod_1.z.object({
        timestamp: datetimeStringSchema.optional(), // По умолчанию NOW()
        // ПРОСТРАНСТВО (опционально)
        location_point: zod_1.z.object({
            latitude: zod_1.z.number().min(-90).max(90),
            longitude: zod_1.z.number().min(-180).max(180)
        }).optional().nullable(),
        location_name: zod_1.z.string().max(200).optional().nullable(),
        location_address: zod_1.z.string().optional().nullable(),
        location_precision: zod_1.z.enum(['exact', 'approximate', 'city', 'country']).optional().nullable(),
        // ЗДОРОВЬЕ (HP + Energy)
        health_points: zod_1.z.number().int().min(0).max(100).optional().nullable(),
        energy_points: zod_1.z.number().int().min(0).max(100).optional().nullable(),
        // СВЯЗЬ С ОБСТОЯТЕЛЬСТВАМИ
        circumstance_id: zod_1.z.number().int().positive().optional().nullable()
    })
});
exports.updateBodyStateSchema = zod_1.z.object({
    body: zod_1.z.object({
        timestamp: datetimeStringSchema.optional(),
        location_point: zod_1.z.object({
            latitude: zod_1.z.number().min(-90).max(90),
            longitude: zod_1.z.number().min(-180).max(180)
        }).optional().nullable(),
        location_name: zod_1.z.string().max(200).optional().nullable(),
        location_address: zod_1.z.string().optional().nullable(),
        location_precision: zod_1.z.enum(['exact', 'approximate', 'city', 'country']).optional().nullable(),
        health_points: zod_1.z.number().int().min(0).max(100).optional().nullable(),
        energy_points: zod_1.z.number().int().min(0).max(100).optional().nullable(),
        circumstance_id: zod_1.z.number().int().positive().optional().nullable()
    })
});
exports.bodyStateIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
    })
});
exports.getBodyStatesSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : undefined)
            .optional(),
        limit: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : undefined)
            .optional(),
        from: datetimeStringSchema.optional(),
        to: datetimeStringSchema.optional(),
        has_location: zod_1.z.enum(['true', 'false'])
            .transform(val => val === 'true')
            .optional(),
        circumstance_id: zod_1.z.string()
            .regex(/^\d+$/)
            .transform(val => val ? parseInt(val, 10) : undefined)
            .optional()
    })
});
