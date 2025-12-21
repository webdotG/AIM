"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCircumstancesSchema = exports.circumstanceIdSchema = exports.updateCircumstanceSchema = exports.createCircumstanceSchema = void 0;
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
exports.createCircumstanceSchema = zod_1.z.object({
    body: zod_1.z.object({
        timestamp: datetimeStringSchema.optional(), // По умолчанию NOW()
        // ПРИРОДНЫЕ (неуправляемые)
        weather: zod_1.z.enum(['sunny', 'rainy', 'snowy', 'stormy', 'cloudy', 'foggy', 'windy']).optional().nullable(),
        temperature: zod_1.z.number().int().min(-50).max(60).optional().nullable(), // Celsius
        moon_phase: zod_1.z.enum(['new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent']).optional().nullable(),
        // ГЛОБАЛЬНЫЕ СОБЫТИЯ (расширяемо)
        global_event: zod_1.z.string().max(500).optional().nullable(),
        // ПРОИЗВОЛЬНЫЕ
        notes: zod_1.z.string().optional().nullable()
    })
});
exports.updateCircumstanceSchema = zod_1.z.object({
    body: zod_1.z.object({
        timestamp: datetimeStringSchema.optional(),
        weather: zod_1.z.enum(['sunny', 'rainy', 'snowy', 'stormy', 'cloudy', 'foggy', 'windy']).optional().nullable(),
        temperature: zod_1.z.number().int().min(-50).max(60).optional().nullable(),
        moon_phase: zod_1.z.enum(['new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent']).optional().nullable(),
        global_event: zod_1.z.string().max(500).optional().nullable(),
        notes: zod_1.z.string().optional().nullable()
    })
});
exports.circumstanceIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
    })
});
exports.getCircumstancesSchema = zod_1.z.object({
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
        weather: zod_1.z.enum(['sunny', 'rainy', 'snowy', 'stormy', 'cloudy', 'foggy', 'windy']).optional(),
        moon_phase: zod_1.z.enum(['new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent']).optional(),
        has_global_event: zod_1.z.enum(['true', 'false'])
            .transform(val => val === 'true')
            .optional()
    })
});
